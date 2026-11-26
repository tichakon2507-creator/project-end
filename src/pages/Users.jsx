import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, TriangleAlert, XCircle } from "lucide-react";

import UserOverview from "../components/users/UserOverview";
import UserFilter from "../components/users/UserFilter";
import UserTable from "../components/users/UserTable";
import UserProfile from "../components/users/UserProfile";
import UserHealth from "../components/users/UserHealth";

import { Modal } from "../components/common/Ui";
import { fetchUsers, fetchUserProfile, updateUser } from "../services/api";
import { toDateTimeParts } from "../utils/format";

function Users() {
    const [users, setUsers] = useState([]);
    const [profileUserId, setProfileUserId] = useState("");
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("All Users");
    const [statusFilter, setStatusFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [healthRows, setHealthRows] = useState([]);
    const [updatingId, setUpdatingId] = useState(null);
    const [confirmUser, setConfirmUser] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                const usersRes = await fetchUsers();
                const list = Array.isArray(usersRes?.data) ? usersRes.data : [];
                if (!isMounted) return;
                setUsers(list);
                if (list.length > 0 && !profileUserId) {
                    const firstId = list[0].id ?? list[0].user_id;
                    setProfileUserId(firstId);
                }
            } catch (err) {
                console.error("Failed to load users:", err);
                if (isMounted) {
                    setError(err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadData();
        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadProfile = async () => {
            if (!profileUserId) {
                setProfile(null);
                return;
            }
            try {
                setProfileLoading(true);
                const res = await fetchUserProfile(profileUserId);
                if (isMounted) {
                    setProfile(res?.data || null);
                    const health = res?.data?.health || res?.data?.health_records || [];
                    setHealthRows(
                        Array.isArray(health)
                            ? health.map((r, i) => ({
                                day: toDateTimeParts(r.recorded_at || r.created_at).date,
                                heart: r.heart_rate != null ? r.heart_rate : undefined,
                                spo2: r.spo2 != null ? r.spo2 : undefined,
                                temp: r.temperature != null ? r.temperature : undefined,
                                key: i,
                            }))
                            : []
                    );
                }
            } catch (err) {
                console.error("Failed to load user profile:", err);
                if (isMounted) {
                    setProfile(null);
                }
            } finally {
                if (isMounted) {
                    setProfileLoading(false);
                }
            }
        };

        loadProfile();
        return () => {
            isMounted = false;
        };
    }, [profileUserId]);

    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const name = `${u.name || ""} ${u.username || ""}`.toLowerCase();
            const matchesSearch = name.includes(search.toLowerCase());
            const matchesRole = roleFilter === "All Users" || (u.role || "").toLowerCase() === roleFilter.toLowerCase();
            const matchesStatus = statusFilter === "All" || (u.status || "Online") === statusFilter;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, search, roleFilter, statusFilter]);

    const overviewStats = useMemo(() => {
        const total = users.length;
        const online = users.filter((u) => (u.status || "Online").toLowerCase() === "online").length;
        const patients = users.filter((u) => (u.role || "").toLowerCase() === "patient").length;
        const caregivers = users.filter((u) => (u.role || "").toLowerCase() === "caregiver").length;
        return [
            { title: "Total Users", value: total.toLocaleString("th-TH"), color: "#2563eb", icon: "users" },
            { title: "Online Users", value: online.toLocaleString("th-TH"), color: "#22c55e", icon: "check" },
            { title: "Patients", value: patients.toLocaleString("th-TH"), color: "#ef4444", icon: "heart" },
            { title: "Caregivers", value: caregivers.toLocaleString("th-TH"), color: "#7c3aed", icon: "shield" },
        ];
    }, [users]);

    const handleExportUsers = () => {
        if (filteredUsers.length === 0) {
            return;
        }
        const header = ["ID", "Name", "Username", "Email", "Role", "Status", "Age"];
        const rows = filteredUsers.map((user) => [
            user.id ?? user.user_id ?? "",
            user.name || "",
            user.username || "",
            user.email || "",
            user.role || "",
            user.status || "",
            user.age ?? "",
        ]);
        const csv = `\uFEFF${[header, ...rows]
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
            .join("\r\n")}`;
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleUpdateStatus = async (id, status) => {
        setUpdatingId(id);
        try {
            await updateUser(id, { status });
            setUsers((prev) => prev.map((u) => (u.id === id || u.user_id === id ? { ...u, status } : u)));
        } catch (err) {
            console.error("Failed to update user status:", err);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Users</h1>
                <p className="text-sm text-slate-500 mt-1">Manage users and view their health records</p>
            </div>

            {error && !loading && (
                <div className="ui-card p-5 flex items-center gap-3 bg-rose-50/60 border-rose-200 text-rose-700">
                    <XCircle size={20} />
                    <span className="text-sm font-semibold">Failed to load users from the server.</span>
                </div>
            )}

            {!error && !loading && users.length === 0 && (
                <div className="ui-card p-5 flex items-center gap-3 bg-amber-50/60 border-amber-200 text-amber-700">
                    <TriangleAlert size={20} />
                    <span className="text-sm font-medium">No users found in the database yet.</span>
                </div>
            )}

            <UserOverview stats={overviewStats} loading={loading} />

            <UserFilter
                search={search}
                roleFilter={roleFilter}
                statusFilter={statusFilter}
                onSearchChange={setSearch}
                onRoleChange={setRoleFilter}
                onStatusChange={setStatusFilter}
                onExport={handleExportUsers}
            />

            <UserTable
                users={filteredUsers}
                loading={loading}
                selectedUserId={profileUserId}
                updatingId={updatingId}
                onSelect={(id) => setProfileUserId(id)}
                onUpdateStatus={(id, status) => setConfirmUser({ id, status })}
            />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6">
                <div className="xl:col-span-4">
                    <UserProfile user={profile} loading={profileLoading || (!profile && Boolean(profileUserId))} />
                </div>
                <div className="xl:col-span-8">
                    <UserHealth data={healthRows} loading={profileLoading} />
                </div>
            </div>

            <Modal
                open={Boolean(confirmUser)}
                onClose={() => setConfirmUser(null)}
                icon={ShieldCheck}
                iconTone="amber"
                title="Update User Status"
                description={`Set status to ${confirmUser?.status || "offline"} for this user? This update will be sent to the server.`}
                actions={[
                    {
                        label: updatingId ? "Updating..." : "Confirm Update",
                        icon: ShieldCheck,
                        loading: updatingId === confirmUser?.id,
                        disabled: updatingId != null,
                        onClick: async () => {
                            if (!confirmUser) return;
                            await handleUpdateStatus(confirmUser.id, confirmUser.status);
                            setConfirmUser(null);
                        },
                    },
                    { label: "Cancel", onClick: () => setConfirmUser(null) },
                ]}
            />
        </div>
    );
}

export default Users;
