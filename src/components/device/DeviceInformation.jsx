import {
    Battery,
    CalendarDays,
    Clock,
    Cpu,
    GitBranch,
    HardDrive,
} from "lucide-react";

import { Skeleton } from "../common/Ui";

function DeviceInformation({ device = null, loading = false }) {
    const d = device || {};
    const information = [
        { icon: Cpu, title: "Device ID", value: d.device_id || d.id || "N/A" },
        { icon: GitBranch, title: "Device Name", value: d.device_name || "N/A" },
        {
            icon: CalendarDays,
            title: "Created At",
            value: d.created_at ? new Date(d.created_at).toLocaleDateString("th-TH") : "—",
        },
        {
            icon: Battery,
            title: "Battery Level",
            value: d.battery_level != null ? `${d.battery_level}%` : "N/A",
        },
        { icon: HardDrive, title: "Status", value: d.status || "Unknown" },
        {
            icon: Clock,
            title: "Last Seen",
            value: d.last_seen ? new Date(d.last_seen).toLocaleString("th-TH") : "—",
        },
    ];

    return (
        <div className="ui-card p-5 md:p-6">
            <div className="mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Device Information</h2>
                <p className="text-xs text-slate-500 mt-0.5">Hardware and firmware details</p>
            </div>

            {loading && !device ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="rounded-xl bg-slate-50 p-4 flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {information.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={index}
                                className={`rounded-xl bg-slate-50 p-4 ${
                                    index === information.length - 1 ? "sm:col-span-2 xl:col-span-4" : ""
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 shrink-0 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                                        <Icon size={19} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-slate-500">{item.title}</p>
                                        <h3 className="font-semibold text-sm text-slate-800 mt-0.5 ui-num break-words">
                                            {item.value}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default DeviceInformation;
