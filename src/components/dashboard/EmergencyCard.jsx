import { Bell, Clock, MapPin, PhoneCall, ShieldCheck } from "lucide-react";

import { StatusDot } from "../common/Ui";
import { formatDateTime } from "../../utils/format";

function EmergencyCard({
    activeCount = 0,
    status = "SAFE",
    lastAlertAt = null,
    location = "N/A",
    lastUpdate = null,
    flash = false,
}) {
    const isActive = status === "ALERT" || activeCount > 0;

    return (
        <div className={`ui-card p-5 md:p-6 h-full ${flash ? "ui-flash" : ""}`}>
            <div className="flex items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                    <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isActive ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                        }`}
                    >
                        <ShieldCheck size={20} />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Emergency Status</h2>
                </div>
                <span
                    className={`ui-badge ${
                        isActive
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                >
                    <StatusDot tone={isActive ? "rose" : "emerald"} />
                    {isActive ? `ALERT (${activeCount})` : "SAFE"}
                </span>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm text-slate-500">
                        <ShieldCheck size={16} className={isActive ? "text-rose-500" : "text-emerald-600"} />
                        Current Status
                    </span>
                    <span className={`text-sm font-semibold ${isActive ? "text-rose-600" : "text-emerald-600"}`}>
                        {isActive ? "ALERT" : "Normal"}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm text-slate-500">
                        <Bell size={16} className="text-amber-500" /> Last Alert
                    </span>
                    <span className="text-xs text-slate-600 ui-timer">
                        {lastAlertAt ? formatDateTime(lastAlertAt) : "None"}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin size={16} className="text-sky-600" /> Current Location
                    </span>
                    <span className="text-xs text-slate-700 ui-num">{location}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock size={16} className="text-violet-500" /> Last Update
                    </span>
                    <span className="text-xs text-slate-600 ui-timer">
                        {lastUpdate ? formatDateTime(lastUpdate) : "—"}
                    </span>
                </div>
            </div>

            <button
                type="button"
                className={`ui-btn ui-press w-full mt-6 py-2.5 text-white ${
                    isActive ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
            >
                <PhoneCall size={17} />
                {isActive ? "Emergency Call (Active)" : "Emergency Call"}
            </button>
        </div>
    );
}

export default EmergencyCard;
