import { Cloud, Database, RefreshCw, Server, Signal, Wifi } from "lucide-react";

import { StatusDot } from "../common/Ui";

function NetworkStatus({
    esp32Online = false,
    mqttStatus = "Disconnected",
    databaseStatus = "Disconnected",
    wifiStatus = "N/A",
    lastSync = "—",
}) {
    const databaseOk = databaseStatus === "connected" || databaseStatus === "Connected";
    const mqttOk = mqttStatus === "Connected";
    const network = [
        {
            title: "WiFi Status",
            value: wifiStatus,
            detail: "Wireless interface",
            icon: Wifi,
            ok: wifiStatus !== "N/A",
        },
        {
            title: "MQTT Broker",
            value: mqttStatus,
            detail: "Telemetry channel",
            icon: Server,
            ok: mqttOk,
        },
        {
            title: "Cloud",
            value: databaseStatus,
            detail: "Cloud sync",
            icon: Cloud,
            ok: databaseOk,
        },
        {
            title: "Database",
            value: databaseStatus,
            detail: "MySQL Database",
            icon: Database,
            ok: databaseOk,
        },
    ];

    return (
        <div className="ui-card p-5 md:p-6 h-full">
            <div className="mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Network Status</h2>
                <p className="text-xs text-slate-500 mt-0.5">Communication and connectivity</p>
            </div>

            <div className="space-y-3">
                {network.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div key={item.title} className="rounded-xl bg-slate-50 p-3.5">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${item.ok ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-500"}`}>
                                        <Icon size={19} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-sm text-slate-800">{item.title}</h3>
                                        <p className="text-[11px] text-slate-500">{item.detail}</p>
                                    </div>
                                </div>
                                <span className={`flex items-center gap-1.5 text-xs font-semibold ${item.ok ? "text-emerald-600" : "text-slate-500"}`}>
                                    <StatusDot tone={item.ok ? "emerald" : "slate"} staticDot />
                                    {item.value}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="border-t border-slate-100 mt-6 pt-5 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-slate-500">
                        <Signal size={15} /> ESP32 Signal
                    </span>
                    <span className={`flex items-center gap-1.5 font-semibold ${esp32Online ? "text-emerald-600" : "text-rose-500"}`}>
                        <StatusDot tone={esp32Online ? "emerald" : "rose"} staticDot />
                        {esp32Online ? "Online" : "Offline"}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-slate-500">
                        <RefreshCw size={15} /> Last Sync
                    </span>
                    <span className="font-semibold text-slate-700 text-xs ui-timer">{lastSync}</span>
                </div>
            </div>
        </div>
    );
}

export default NetworkStatus;
