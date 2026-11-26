import { Battery, Cpu, Database, Server, Wifi } from "lucide-react";

import { StatusDot } from "../common/Ui";
import { formatDateTime } from "../../utils/format";

function isLowBattery(battery) {
    const value = Number(battery);
    return Number.isFinite(value) && value <= 20;
}

function StatusRow({ iconBg, iconColor, Icon, title, value, ok }) {
    return (
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
            <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
                <Icon size={19} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-800">{title}</p>
                <p className="text-[11px] text-slate-500">Device Status</p>
            </div>
            <span className={`flex items-center gap-1.5 text-sm font-semibold ui-num ${ok ? "text-emerald-600" : "text-rose-500"}`}>
                <StatusDot tone={ok ? "emerald" : "rose"} staticDot />
                {value}
            </span>
        </div>
    );
}

function DeviceStatus({
    deviceName = "—",
    esp32Online = false,
    mqttStatus = "Disconnected",
    databaseStatus = "Disconnected",
    battery = "N/A",
    lastUpdate = null,
    flash = false,
}) {
    return (
        <div className={`ui-card p-5 md:p-6 h-full ${flash ? "ui-flash" : ""}`}>
            <div className="mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Device Status</h2>
                {deviceName && deviceName !== "—" && (
                    <p className="text-xs text-slate-500 mt-1">{deviceName}</p>
                )}
            </div>

            <div className="space-y-2">
                <StatusRow
                    iconBg="bg-sky-50"
                    iconColor="text-sky-600"
                    Icon={Cpu}
                    title="ESP32"
                    value={esp32Online ? "Online" : "Offline"}
                    ok={esp32Online}
                />
                <StatusRow
                    iconBg="bg-sky-50"
                    iconColor="text-sky-600"
                    Icon={Wifi}
                    title="WiFi"
                    value="N/A"
                    ok={false}
                />
                <StatusRow
                    iconBg="bg-sky-50"
                    iconColor="text-sky-600"
                    Icon={Server}
                    title="MQTT"
                    value={mqttStatus}
                    ok={mqttStatus === "Connected"}
                />
                <StatusRow
                    iconBg="bg-sky-50"
                    iconColor="text-sky-600"
                    Icon={Database}
                    title="Database"
                    value={databaseStatus}
                    ok={databaseStatus === "Connected"}
                />
                <StatusRow
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-600"
                    Icon={Battery}
                    title="Battery"
                    value={`${battery}%`}
                    ok={!isLowBattery(battery)}
                />
            </div>

            <div className="mt-4 text-center text-[11px] text-slate-400 ui-timer">
                Last Update: {lastUpdate ? formatDateTime(lastUpdate) : "—"}
            </div>
        </div>
    );
}

export default DeviceStatus;
