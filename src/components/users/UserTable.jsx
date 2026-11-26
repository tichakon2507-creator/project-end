import { HeartPulse, Pencil, ShieldCheck, Trash2, Users } from "lucide-react";

import { RowsSkeleton, Spinner, StatusDot } from "../common/Ui";

function UserTable({
    users = [],
    loading = false,
    selectedUserId = "",
    updatingId = null,
    onSelect = () => {},
    onUpdateStatus = async () => {},
}) {
    return (
        <div className="ui-card p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                        <Users size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">User List</h2>
                        <p className="text-xs text-slate-500">Registered users in the system</p>
                    </div>
                </div>
                <span className="ui-badge bg-slate-100 text-slate-600 border-slate-200 ui-num">
                    {users.length} Users
                </span>
            </div>

            {loading ? (
                <RowsSkeleton count={5} columns={7} />
            ) : users.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm font-medium">
                    No users found in the database yet.
                </div>
            ) : (
                <div className="overflow-x-auto -mx-2 px-2">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-wide text-slate-500">
                                <th className="py-3 pr-4">ID</th>
                                <th className="py-3 pr-4">Name</th>
                                <th className="py-3 pr-4">Role</th>
                                <th className="py-3 pr-4">Age</th>
                                <th className="py-3 pr-4">Heart</th>
                                <th className="py-3 pr-4">Status</th>
                                <th className="py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => {
                                const id = user.id ?? user.user_id ?? "";
                                const isSelected = id && id === selectedUserId;
                                const online = (user.status || "").toLowerCase() === "online";
                                const updating = updatingId === id;
                                return (
                                    <tr
                                        key={id || index}
                                        onClick={() => id && onSelect(id)}
                                        className={`border-b border-slate-100 hover:bg-slate-50/70 transition-colors cursor-pointer ${
                                            isSelected ? "bg-sky-50/50" : ""
                                        }`}
                                    >
                                        <td className="py-3.5 pr-4 font-semibold text-slate-700 ui-num">{id}</td>
                                        <td className="py-3.5 pr-4 text-slate-800">{user.name || user.username || "N/A"}</td>
                                        <td className="py-3.5 pr-4">
                                            <span className="flex items-center gap-2 text-slate-700">
                                                {(user.role || "").toLowerCase() === "patient"
                                                    ? <HeartPulse size={15} className="text-rose-500" />
                                                    : <ShieldCheck size={15} className="text-sky-500" />}
                                                {user.role || "—"}
                                            </span>
                                        </td>
                                        <td className="py-3.5 pr-4 text-slate-600 ui-num">
                                            {user.age != null ? user.age : "N/A"}
                                        </td>
                                        <td className="py-3.5 pr-4 text-slate-600 ui-num">
                                            {user.heart != null ? user.heart : (user.heart_rate != null ? `${user.heart_rate} BPM` : "N/A")}
                                        </td>
                                        <td className="py-3.5 pr-4">
                                            <span className={`ui-badge ${online ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                                                <StatusDot tone={online ? "emerald" : "slate"} staticDot />
                                                {user.status || "Offline"}
                                            </span>
                                        </td>
                                        <td className="py-3.5 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    type="button"
                                                    aria-label="View user profile"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (id) onSelect(id);
                                                    }}
                                                    className={`ui-btn ui-press w-9 h-9 ${isSelected ? "bg-sky-600 text-white" : "bg-sky-50 text-sky-600 hover:bg-sky-100"}`}
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    aria-label="Set user offline"
                                                    disabled={isSelected || updating}
                                                    title="Manage user status via API"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onUpdateStatus(id, "offline");
                                                    }}
                                                    className="ui-btn ui-press w-9 h-9 bg-rose-50 text-rose-600 hover:bg-rose-100"
                                                >
                                                    {updating ? <Spinner className="w-4 h-4" /> : <Trash2 size={15} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default UserTable;
