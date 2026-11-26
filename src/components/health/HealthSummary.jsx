import { Activity } from "lucide-react";

function HealthSummary({ items = [] }) {
    return (
        <div className="ui-card p-5 md:p-6 h-full">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-5">Today's Summary</h2>
            {items.length === 0 ? (
                <div className="h-[300px] flex flex-col items-center justify-center gap-3 text-slate-400">
                    <Activity size={34} strokeWidth={1.5} />
                    <p className="text-sm font-medium">No summary data available yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((item, index) => {
                        const Icon = item.icon || Activity;
                        return (
                            <div
                                key={index}
                                className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3.5"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="ui-gradient-icon w-10 h-10 shrink-0">
                                        <Icon size={19} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-slate-500">{item.title}</p>
                                        <p className="font-semibold text-sm text-slate-800 ui-num">
                                            {item.value ?? "N/A"}
                                        </p>
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

export default HealthSummary;
