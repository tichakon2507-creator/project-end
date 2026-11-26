import { MapPinned } from "lucide-react";

import { StatusDot } from "../common/Ui";
import GoogleMap from "../map/GoogleMap";

function EmergencyMap({ center = null, markers = [] }) {
    return (
        <div className="ui-card p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                        <MapPinned size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Live GPS Tracking</h2>
                        <p className="text-xs text-slate-500">Current device location</p>
                    </div>
                </div>
                <span className="ui-badge bg-sky-50 text-sky-700 border-sky-200">
                    <StatusDot />
                    Live
                </span>
            </div>

            {center ? (
                <div className="h-[360px] sm:h-[420px]">
                    <GoogleMap
                        title="GPS Tracking"
                        subtitle="Live device position"
                        center={center}
                        markers={markers}
                        height={360}
                    />
                </div>
            ) : (
                <div className="h-[300px] sm:h-[360px] flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-center px-4">
                    <div className="w-14 h-14 rounded-2xl bg-white text-slate-400 flex items-center justify-center shadow-sm">
                        <MapPinned size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mt-5">No Location Available</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-sm">
                        Location data will appear when the device reports GPS
                    </p>
                    <div className="mt-6 flex gap-8">
                        <div>
                            <p className="text-xs text-slate-500">Latitude</p>
                            <p className="font-bold text-slate-700 ui-num mt-1">N/A</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Longitude</p>
                            <p className="font-bold text-slate-700 ui-num mt-1">N/A</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EmergencyMap;
