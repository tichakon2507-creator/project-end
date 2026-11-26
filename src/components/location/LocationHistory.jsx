import { CircleCheck, Clock, MapPin, Route } from "lucide-react";

import { RowsSkeleton } from "../common/Ui";

function LocationHistory({ rows = [], loading = false, emptyMessage = "No location history found." }) {
    return (
        <div className="ui-card p-5 md:p-6 h-full">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                    <Route size={20} />
                </div>
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Location History</h2>
                    <p className="text-xs text-slate-500">Recent GPS records</p>
                </div>
            </div>

            {loading ? (
                <RowsSkeleton count={4} columns={3} />
            ) : rows.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm font-medium">{emptyMessage}</div>
            ) : (
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2">
                    {rows.map((item, index) => (
                        <div
                            key={item.id || index}
                            className="rounded-xl border border-slate-200 p-3.5 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 ui-timer">
                                        <Clock size={12} />
                                        <span className="font-semibold text-slate-700">{item.date}</span>
                                        <span>{item.time}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-slate-700 ui-num mt-2">
                                        <MapPin size={14} className="text-rose-500" />
                                        {item.latitude}, {item.longitude}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 ui-num mt-1">
                                        <Route size={13} className="text-sky-500" />
                                        Speed: {item.speed}
                                    </div>
                                </div>
                                <span className="ui-badge bg-emerald-50 text-emerald-700 border-emerald-200">
                                    <CircleCheck size={13} />
                                    {item.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default LocationHistory;
