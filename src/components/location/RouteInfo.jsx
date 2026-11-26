import { Clock, Flag, MapPinned, Navigation, Route } from "lucide-react";

import { formatDateTime } from "../../utils/format";

function RouteInfo({ current = "N/A", updated = null }) {
    const hasData = current && current !== "N/A";

    return (
        <div className="ui-card p-5 md:p-6 h-full">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Route size={20} />
                </div>
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Route Information</h2>
                    <p className="text-xs text-slate-500">Current navigation details</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Navigation size={19} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-slate-500">Current Position</p>
                        <p className="font-semibold text-sm text-slate-800 ui-num break-all mt-0.5">
                            {hasData ? current : "N/A"}
                        </p>
                    </div>
                </div>
                {!hasData && (
                    <div className="text-center py-6 text-slate-400 text-sm font-medium">
                        No GPS data available yet
                    </div>
                )}
            </div>

            <div className="border-t border-slate-100 mt-6 pt-5 space-y-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 text-slate-500">
                        <Clock size={15} /> Last Updated
                    </span>
                    <span className="font-semibold text-slate-800 text-xs ui-timer">
                        {updated ? formatDateTime(updated) : "—"}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 text-slate-500">
                        <MapPinned size={15} /> Route Source
                    </span>
                    <span className="text-xs text-slate-600">Live GPS Tracking</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 text-slate-500">
                        <Flag size={15} /> Status
                    </span>
                    <span className="text-xs font-semibold text-emerald-600">Active</span>
                </div>
            </div>
        </div>
    );
}

export default RouteInfo;
