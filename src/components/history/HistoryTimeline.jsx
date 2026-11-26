import { TriangleAlert } from "lucide-react";

import { RowsSkeleton } from "../common/Ui";

function HistoryTimeline({ items = [], loading = false, emptyMessage = "No activity events recorded yet." }) {
    return (
        <div className="ui-card p-5 md:p-6">
            <div className="mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Activity Timeline</h2>
                <p className="text-xs text-slate-500 mt-0.5">Latest system activities</p>
            </div>

            {loading ? (
                <RowsSkeleton count={3} columns={2} />
            ) : items.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm font-medium">{emptyMessage}</div>
            ) : (
                <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200" />
                    <div className="space-y-5">
                        {items.map((item) => (
                            <div key={item.index} className="relative flex items-start gap-4">
                                <div className="w-10 h-10 shrink-0 rounded-full bg-rose-500 text-white flex items-center justify-center z-10 shadow-lg shadow-rose-500/20">
                                    <TriangleAlert size={17} />
                                </div>
                                <div className="flex-1 min-w-0 rounded-xl bg-slate-50 p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h3 className="font-bold text-sm text-slate-800">{item.title}</h3>
                                        <span className="text-xs text-slate-500 ui-timer">{item.time}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1.5">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default HistoryTimeline;
