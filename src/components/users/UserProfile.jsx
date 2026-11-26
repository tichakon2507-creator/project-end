import {
    Cake,
    HeartPulse,
    Mail,
    MapPin,
    Phone,
    UserRound,
    Users,
} from "lucide-react";

import { Skeleton, StatusDot } from "../common/Ui";
import { formatDateTime } from "../../utils/format";

function UserProfile({ user = null, loading = false }) {
    if (loading || !user) {
        return (
            <div className="ui-card p-5 md:p-6 h-full">
                <div className="flex flex-col items-center gap-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
                <div className="mt-8 space-y-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="h-4 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    const online = (user.status || "Online").toLowerCase() === "online";
    const details = [
        { icon: UserRound, value: user.id ?? user.user_id ?? "N/A" },
        { icon: Mail, value: user.email || "N/A" },
        { icon: Phone, value: user.phone || "N/A" },
        { icon: Cake, value: user.age != null ? `${user.age} Years` : "N/A" },
        { icon: Users, value: user.gender || "N/A" },
        { icon: MapPin, value: user.address || user.location || "N/A" },
        { icon: HeartPulse, value: `Heart Rate: ${user.heart_rate != null ? `${user.heart_rate} BPM` : "N/A"}` },
    ];

    return (
        <div className="ui-card p-5 md:p-6 h-full">
            <div className="flex flex-col items-center text-center">
                <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username || "User")}&background=2563eb&color=fff&size=256`}
                    alt="Profile"
                    className="w-24 h-24 rounded-full shadow-md ring-4 ring-sky-50"
                />
                <h2 className="text-xl font-bold text-slate-900 mt-4">
                    {user.name || user.username || "N/A"}
                </h2>
                <p className="text-sm text-slate-500">{user.role || "—"}</p>
                <span className={`ui-badge mt-2 ${online ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                    <StatusDot tone={online ? "emerald" : "slate"} staticDot={!online} />
                    {user.status || "Online"}
                </span>
            </div>

            <div className="mt-6 space-y-3">
                {details.map((detail, index) => {
                    const Icon = detail.icon;
                    return (
                        <div
                            key={index}
                            className="flex items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-2.5"
                        >
                            <Icon size={16} className="text-sky-600 shrink-0" />
                            <span className="text-sm text-slate-700 ui-num break-words">{detail.value}</span>
                        </div>
                    );
                })}
                <div className="flex items-center gap-3 px-1 pt-1 text-[11px] text-slate-400 ui-timer">
                    <UserRound size={14} />
                    <span>
                        {user.created_at ? `Member since ${formatDateTime(user.created_at)}` : "N/A"}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default UserProfile;
