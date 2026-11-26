import { Activity, Cpu, MapPin, TriangleAlert } from "lucide-react";

import { Skeleton } from "../common/Ui";

const icons = [Activity, TriangleAlert, MapPin, Cpu];
function HistoryStatistics({ stats = [], loading = false }) {
    return (
        <>
            {stats.map((item, index) => {
                const Icon = icons[index % icons.length];
                return (
                    <div key={index} className="col-span-12 sm:col-span-6 xl:col-span-3">
                        <div className="ui-card-hover p-5 md:p-6 h-full">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm text-slate-500 truncate">{item.title}</p>
                                    {loading ? (
                                        <Skeleton className="h-10 w-20 mt-4" />
                                    ) : (
                                        <h2 className="ui-gradient-text text-4xl font-bold ui-num mt-4 leading-none">
                                            {item.value}
                                        </h2>
                                    )}
                                </div>
                                <div className="ui-gradient-icon w-12 h-12 shrink-0">
                                    <Icon size={22} />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {!loading && stats.length === 0 && (
                <div className="col-span-12 text-center py-8 text-slate-400 text-sm font-medium">
                    No statistics available yet
                </div>
            )}
        </>
    );
}

export default HistoryStatistics;
