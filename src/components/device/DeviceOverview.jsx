import { Skeleton } from "../common/Ui";

function DeviceOverview({ data = [], loading = false }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            {data.map((item, index) => (
                <div key={index} className="ui-card-hover p-5 md:p-6 h-full">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-slate-500 truncate">{item.title}</p>
                            {loading ? (
                                <Skeleton className="h-9 w-20 mt-4" />
                            ) : (
                                    <h2 className="ui-gradient-text text-2xl sm:text-3xl font-bold ui-num mt-4 break-words leading-tight">
                                        {item.value}
                                    </h2>
                            )}
                        </div>
                        <div className="ui-gradient-icon w-12 h-12 shrink-0 text-xl">
                            {item.icon}
                        </div>
                    </div>
                </div>
            ))}

            {loading && data.length === 0 && (
                <div className="col-span-full ui-card p-8 text-center text-slate-400 text-sm font-medium">
                    Loading device data...
                </div>
            )}
            {!loading && data.length === 0 && (
                <div className="col-span-full ui-card p-8 text-center text-slate-400 text-sm font-medium">
                    No device data available yet
                </div>
            )}
        </div>
    );
}

export default DeviceOverview;
