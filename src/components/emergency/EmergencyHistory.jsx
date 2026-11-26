import { CircleCheck, Clock, MapPin, TriangleAlert } from "lucide-react";

import { RowsSkeleton } from "../common/Ui";
import { formatDateTime, formatTime } from "../../utils/format";

const badges = {
    normal: { className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CircleCheck },
    warning: { className: "bg-amber-50 text-amber-700 border-amber-200", icon: TriangleAlert },
    danger: { className: "bg-rose-50 text-rose-700 border-rose-200", icon: TriangleAlert },
};

function EmergencyHistory({ rows = [], loading = false, emptyMessage = "No emergency events recorded yet." }) {
    return (
        <div className="ui-card p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                        <Clock size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Emergency History</h2>
                        <p className="text-xs text-slate-500">Recent emergency events</p>
                    </div>
                </div>
                <span className="ui-badge bg-slate-100 text-slate-600 border-slate-200 ui-num">
                    {rows.length} events
                </span>
            </div>

            {loading ? (
                <RowsSkeleton count={4} columns={4} />
            ) : rows.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm font-medium">{emptyMessage}</div>
            ) : (
                <div className="overflow-x-auto -mx-2 px-2">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-wide text-slate-500">
                                <th className="py-3 pr-4">Date</th>
                                <th className="py-3 pr-4">Time</th>
                                <th className="py-3 pr-4">Location</th>
                                <th className="py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => {
                                const badge = badges[row.level] || badges.warning;
                                const BadgeIcon = badge.icon;
                                return (
                                    <tr
                                        key={row.id}
                                        className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors"
                                    >
                                        <td className="py-3.5 pr-4 font-medium text-slate-700 ui-timer">
                                            {formatDateTime(row.date)}
                                        </td>
                                        <td className="py-3.5 pr-4 text-slate-600 ui-timer">
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={13} className="text-slate-400" />
                                                {formatTime(row.time)}
                                            </span>
                                        </td>
                                        <td className="py-3.5 pr-4 text-slate-600 ui-num">
                                            <span className="flex items-center gap-1.5">
                                                <MapPin size={13} className="text-rose-500" />
                                                {row.location}
                                            </span>
                                        </td>
                                        <td className="py-3.5">
                                            <span className={`ui-badge ${badge.className}`}>
                                                <BadgeIcon size={13} />
                                                {row.status || "Resolved"}
                                            </span>
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

export default EmergencyHistory;
