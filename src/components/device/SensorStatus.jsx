import { CircleCheck, Cpu, Gauge, MapPin, Thermometer, Wind } from "lucide-react";

import { RowsSkeleton } from "../common/Ui";
import { formatDateTime } from "../../utils/format";

const iconConfig = {
    heart: { Icon: Gauge, color: "text-rose-600", bg: "bg-rose-50" },
    temp: { Icon: Thermometer, color: "text-amber-600", bg: "bg-amber-50" },
    oxygen: { Icon: Wind, color: "text-sky-600", bg: "bg-sky-50" },
    gps: { Icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-50" },
};

function SensorStatus({ data = [], loading = false, health = null }) {
    return (
        <div className="ui-card p-5 md:p-6 h-full">
            <div className="mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Sensor Status</h2>
                <p className="text-xs text-slate-500 mt-0.5">Real-time sensor information</p>
            </div>

            {loading ? (
                <RowsSkeleton count={4} columns={2} />
            ) : data.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm font-medium">
                    No sensor data available yet. Waiting for device connection...
                </div>
            ) : (
                <div className="space-y-3">
                    {data.map((sensor, index) => {
                        const { Icon, color, bg } = iconConfig[sensor.icon] || {
                            Icon: Cpu,
                            color: "text-slate-500",
                            bg: "bg-slate-100",
                        };
                        const online = sensor.status === "Online";
                        return (
                            <div
                                key={index}
                                className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3.5"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${bg} ${color}`}>
                                        <Icon size={19} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-sm text-slate-800">{sensor.name}</h3>
                                        <p className="text-xs text-slate-500 ui-num">{sensor.value}</p>
                                    </div>
                                </div>
                                <span className={`ui-badge shrink-0 ${online ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                                    <CircleCheck size={13} />
                                    {sensor.status}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {health?.recorded_at && (
                <p className="text-[11px] text-slate-400 mt-4 ui-timer">
                    Last update: {formatDateTime(health.recorded_at)}
                </p>
            )}
        </div>
    );
}

export default SensorStatus;
