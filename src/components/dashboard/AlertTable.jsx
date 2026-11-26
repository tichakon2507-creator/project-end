import { Bell, CheckCircle2, Clock, TriangleAlert } from "lucide-react";

import { RowsSkeleton, StatusDot } from "../common/Ui";
import { formatTime } from "../../utils/format";

const AlertTable = ({ alerts = [], emptyMessage = "No recent activity", loading = false, title = "Recent Activity", subtitle = "Latest device and emergency events" }) => {
    return (
        <div className="ui-card p-5 md:p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                    <div className="ui-gradient-icon w-10 h-10 shrink-0">
                        <Bell size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
                        <p className="text-xs text-[var(--midnight-muted)]">{subtitle}</p>
                    </div>
                </div>
                <span className="ui-badge ui-num">
                    {alerts.length} alerts
                </span>
            </div>

            {loading ? (
                <RowsSkeleton count={4} columns={3} />
            ) : alerts.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm font-medium">
                    {emptyMessage}
                </div>
            ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
                    {alerts.map((alert, index) => {
                        const emergency = alert.severity === "emergency" || String(alert.status).toUpperCase() === "ACTIVE";
                        return (
                            <div
                                key={alert.id || `${alert.type}-${index}`}
                                className="flex items-center justify-between gap-4 rounded-xl bg-white/5 p-3"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div
                                        className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${
                                            emergency ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                                        }`}
                                    >
                                        {emergency ? <TriangleAlert size={17} /> : <CheckCircle2 size={17} />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm text-slate-800 truncate">{alert.type}</p>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 ui-timer">
                                            <Clock size={12} />
                                            {formatTime(alert.time)}
                                        </div>
                                        {alert.location && alert.location !== "N/A" && (
                                            <p className="text-[11px] text-slate-400 ui-num mt-0.5">{alert.location}</p>
                                        )}
                                    </div>
                                </div>
                                <span className={`ui-badge shrink-0 ${emergency ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                                    <StatusDot tone={emergency ? "rose" : "emerald"} staticDot />
                                    {alert.status}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AlertTable;
