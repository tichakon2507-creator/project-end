import { MapPinned, Radio } from "lucide-react";

import { StatusDot } from "../common/Ui";
import GoogleMap from "../map/GoogleMap";

function LiveMap({ center = null, history = [] }) {
    return (
        <div className="ui-card p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                        <MapPinned size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Live GPS Tracking</h2>
                        <p className="text-xs text-slate-500">Real-time device location</p>
                    </div>
                </div>
                <span className="ui-badge bg-emerald-500/15 text-emerald-300 border-emerald-400/25">
                    <StatusDot tone="emerald" /> <Radio size={12} /> Live
                </span>
            </div>

            {center ? (
                <div className="h-[360px] sm:h-[480px]">
                    <GoogleMap
                        title="GPS Tracking"
                        subtitle="Live tracking of the device"
                        center={center}
                        markers={history.slice(0, 20)}
                        height={380}
                    />
                </div>
            ) : (
                <div className="h-[360px] sm:h-[480px] rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-16 h-16 rounded-2xl bg-white text-sky-500 flex items-center justify-center shadow-sm">
                        <MapPinned size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-700 mt-6">Waiting for GPS signal</h2>
                    <p className="text-sm text-slate-500 mt-2 max-w-sm">
                        Live tracking will be displayed here when location data arrives
                    </p>
                    <div className="mt-8 flex gap-8">
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

export default LiveMap;
