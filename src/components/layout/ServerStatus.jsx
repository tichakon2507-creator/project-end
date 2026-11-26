import { useEffect, useState } from "react";
import { Database, Radio, Server, Wifi } from "lucide-react";

import { StatusDot } from "../common/Ui";
import { useApiStatus } from "../../hooks/useApiStatus";
import { useRealtime } from "../../hooks/useRealtime";
import mqttClient from "../../services/mqtt";

function useMqttStatus() {
    const [connected, setConnected] = useState(Boolean(mqttClient?.connected));

    useEffect(() => {
        if (!mqttClient) {
            return undefined;
        }
        const onConnect = () => setConnected(true);
        const onDisconnect = () => setConnected(false);
        mqttClient.on("connect", onConnect);
        mqttClient.on("reconnect", onDisconnect);
        mqttClient.on("close", onDisconnect);
        mqttClient.on("offline", onDisconnect);
        mqttClient.on("error", onDisconnect);
        return () => {
            mqttClient.off("connect", onConnect);
            mqttClient.off("reconnect", onDisconnect);
            mqttClient.off("close", onDisconnect);
            mqttClient.off("offline", onDisconnect);
            mqttClient.off("error", onDisconnect);
        };
    }, []);

    return connected;
}

function StatusBadge({ icon: Icon, label, state }) {
    const connected = state === "connected";
    const checking = state === "checking";

    return (
        <span className="ui-status-pill">
            <Icon size={13} />
            <StatusDot
                tone={connected ? "emerald" : checking ? "amber" : "rose"}
                staticDot={checking}
            />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(" ")[0]}</span>
            <span
                className={`font-semibold ${
                    connected ? "text-emerald-300" : checking ? "text-amber-300" : "text-rose-300"
                }`}
            >
                {connected ? "OK" : checking ? "..." : "Down"}
            </span>
        </span>
    );
}

function ServerStatus() {
    const apiStatus = useApiStatus();
    const { connected: socketConnected } = useRealtime();
    const mqttConnected = useMqttStatus();

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center gap-2 sm:gap-3 bg-[#131626]/60 border-b border-white/10">
            <StatusBadge
                icon={Database}
                label="API Server"
                state={apiStatus === "checking" ? "checking" : apiStatus}
            />
            <StatusBadge
                icon={Radio}
                label="Socket.IO"
                state={socketConnected ? "connected" : "disconnected"}
            />
            <StatusBadge
                icon={Wifi}
                label="MQTT Broker"
                state={mqttConnected ? "connected" : "disconnected"}
            />
            <span className="ml-auto hidden md:flex items-center gap-1.5 text-[11px] text-slate-400">
                <Server size={12} />
                <span className="ui-num">Live telemetry</span>
            </span>
        </div>
    );
}

export default ServerStatus;
