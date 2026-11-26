import { Battery, Cloud, Cpu, Database, Wifi } from "lucide-react";

import { StatusDot } from "../common/Ui";
import { formatDateTime } from "../../utils/format";

function StatusItem({ iconBg, Icon, title, value, ok }) {
    return (
        <div className="flex items-center justify-between gap-3 bg-slate-50 rounded-xl p-3.5">
            <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${iconBg}`}>
                    <Icon size={19} />
                </div>
                <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-800">{title}</p>
                    <p className="text-[11px] text-slate-500">Module</p>
                </div>
            </div>
            <span className={`flex items-center gap-1.5 text-sm font-semibold ui-num ${ok ? "text-emerald-600" : "text-slate-500"}`}>
                <StatusDot tone={ok ? "emerald" : "slate"} staticDot />
                {value}
            </span>
        </div>
    );
}

function EmergencyDevice({ device = null, health = null, apiStatus = "disconnected" }) {
    const battery = device?.battery_level != null ? `${device.battery_level}%` : "N/A";
    const lastSeen = device?.last_seen || null;
    const online = Boolean(device);

    return (
        <div className="ui-card p-5 md:p-6 h-full">
            <div className="mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Device Status</h2>
                <p className="text-xs text-slate-500 mt-1">Smart Emergency Module</p>
            </div>

            <div className="space-y-3">
                <StatusItem iconBg="bg-emerald-50 text-emerald-600" Icon={Cpu} title="ESP32" value={device ? device.status : "Offline"} ok={online} />
                <StatusItem iconBg="bg-sky-50 text-sky-600" Icon={Wifi} title="WiFi" value="N/A" ok={false} />
                <StatusItem iconBg="bg-emerald-50 text-emerald-600" Icon={Battery} title="Battery" value={battery} ok={device?.battery_level != null} />
                <StatusItem iconBg="bg-cyan-50 text-cyan-600" Icon={Cloud} title="Cloud" value={apiStatus === "connected" ? "Online" : "Offline"} ok={apiStatus === "connected"} />
                <StatusItem iconBg="bg-amber-50 text-amber-600" Icon={Database} title="Database" value={apiStatus === "connected" ? "Connected" : "Disconnected"} ok={apiStatus === "connected"} />
            </div>

            {lastSeen && (
                <div className="mt-5 pt-4 border-t border-slate-100 text-[11px] text-slate-400 ui-timer">
                    Last Seen: {formatDateTime(lastSeen)}
                    {health?.recorded_at && ` · Heart Rate: ${health.heart_rate}`}
                </div>
            )}
        </div>
    );
}

export default EmergencyDevice;
