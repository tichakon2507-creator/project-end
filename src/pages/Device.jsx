import { useEffect, useState } from "react";
import {
    Battery,
    Cpu,
    Database,
    Radio,
    Server,
    TriangleAlert,
    Wifi,
    XCircle,
} from "lucide-react";

import DeviceOverview from "../components/device/DeviceOverview";
import SensorStatus from "../components/device/SensorStatus";
import NetworkStatus from "../components/device/NetworkStatus";
import DeviceInformation from "../components/device/DeviceInformation";
import PatientProfileForm from "../components/device/PatientProfileForm";
import DeviceLog from "../components/device/DeviceLog";
import { StatusDot } from "../components/common/Ui";

import { useFlash, useRealtime } from "../hooks/useRealtime";
import { useApiStatus } from "../hooks/useApiStatus";
import { fetchDevices, fetchHealthLatest, fetchHealthHistory } from "../services/api";

function Device() {
    const [devices, setDevices] = useState([]);
    const [device, setDevice] = useState(null);
    const [health, setHealth] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const realtime = useRealtime();
    const apiStatus = useApiStatus();
    const flash = useFlash(realtime.lastUpdated);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [devicesRes, healthRes, historyRes] = await Promise.all([
                    fetchDevices(),
                    fetchHealthLatest(),
                    fetchHealthHistory({ limit: 20 }),
                ]);

                if (!isMounted) return;

                const list = Array.isArray(devicesRes?.data) ? devicesRes.data : [];
                setDevices(list);
                setDevice(list[0] || null);
                setHealth(healthRes?.data || null);

                const history = Array.isArray(historyRes?.data) ? historyRes.data : [];
                setLogs(
                    history.map((h, index) => ({
                        time: h.recorded_at ? new Date(h.recorded_at).toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                        }) : "—",
                        type: index % 2 === 0 ? "System" : "Sensor",
                        message: h.heart_rate != null
                            ? `Health record received (HR ${h.heart_rate})`
                            : h.spo2 != null
                                ? `Health record received (SpO2 ${h.spo2})`
                                : "Health record received",
                        level: "info",
                    }))
                );
            } catch (err) {
                console.error("Failed to load device data:", err);
                if (isMounted) {
                    setError(err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    const onlineCount = devices.filter((d) => (d?.status || "").toLowerCase() === "online").length;

    const handleExportLogs = () => {
        if (logs.length === 0) {
            return;
        }
        const header = ["Time", "Type", "Message", "Status"];
        const rows = logs.map((log) => [log.time, log.type, log.message, log.level]);
        const csv = `\uFEFF${[header, ...rows]
            .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
            .join("\r\n")}`;
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = `device-logs-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const overviewData = [
        {
            title: "ESP32",
            value: onlineCount > 0 ? "Online" : devices.length > 0 ? "Offline" : "N/A",
            color: onlineCount > 0 ? "#059669" : "#e11d48",
            icon: <Cpu size={24} />,
        },
        {
            title: "Battery",
            value: health?.battery_level != null ? `${health.battery_level}%` : device?.battery_level != null ? `${device.battery_level}%` : "N/A",
            color: "#10b981",
            icon: <Battery size={24} />,
        },
        {
            title: "WiFi",
            value: device?.wifi != null ? device.wifi : "N/A",
            color: "#2563eb",
            icon: <Wifi size={24} />,
        },
        {
            title: "MQTT",
            value: realtime.connected || apiStatus === "connected" ? "Connected" : "Disconnected",
            color: "#f59e0b",
            icon: <Server size={24} />,
        },
    ];

    const sensorData = [
        {
            name: "Heart Rate Sensor",
            value: health?.heart_rate != null ? `${health.heart_rate} BPM` : "N/A",
            status: health?.heart_rate != null ? "Online" : "Offline",
            icon: "heart",
        },
        {
            name: "Temperature Sensor",
            value: health?.temperature != null ? `${health.temperature} °C` : "N/A",
            status: health?.temperature != null ? "Online" : "Offline",
            icon: "temp",
        },
        {
            name: "SpO2 Sensor",
            value: health?.spo2 != null ? `${health.spo2} %` : "N/A",
            status: health?.spo2 != null ? "Online" : "Offline",
            icon: "oxygen",
        },
        {
            name: "GPS Module",
            value: device?.status ? `${device.status}` : "N/A",
            status: device?.status || "Offline",
            icon: "gps",
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Devices</h1>
                    <p className="text-sm text-slate-500 mt-1">IoT hardware health and connectivity</p>
                </div>
                <span className={`ui-badge ${realtime.connected ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                    <StatusDot tone={realtime.connected ? "emerald" : "rose"} />
                    {realtime.connected ? "Device live" : "Reconnecting"}
                </span>
            </div>

            {error && !loading && (
                <div className="ui-card p-5 flex items-center gap-3 bg-rose-50/60 border-rose-200 text-rose-700">
                    <XCircle size={20} />
                    <span className="text-sm font-semibold">Failed to load device data from the server.</span>
                </div>
            )}

            {!error && !loading && devices.length === 0 && (
                <div className="ui-card p-5 flex items-center gap-3 bg-amber-50/60 border-amber-200 text-amber-700">
                    <TriangleAlert size={20} />
                    <span className="text-sm font-medium">No device found. Waiting for device connection...</span>
                </div>
            )}

            <div className={flash ? "ui-flash rounded-3xl" : ""}>
                <DeviceOverview data={overviewData} loading={loading} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                <SensorStatus data={sensorData} loading={loading} health={health} />
                <NetworkStatus
                    esp32Online={onlineCount > 0}
                    mqttStatus={realtime.connected ? "Connected" : apiStatus === "connected" ? "Connected" : "Disconnected"}
                    databaseStatus={apiStatus}
                    wifiStatus={device?.wifi != null ? device.wifi : "N/A"}
                    lastSync={device?.last_seen ? new Date(device.last_seen).toLocaleString("th-TH") : "Just now"}
                />
            </div>

            <DeviceInformation device={device} loading={loading} />
            <PatientProfileForm device={device} devices={devices} />
            <DeviceLog
                logs={logs}
                loading={loading}
                onExport={handleExportLogs}
                emptyMessage="No activity records yet. Waiting for device data..."
            />

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5"><Radio size={12} /> Socket.IO: {realtime.connected ? "Connected" : "Disconnected"}</span>
                <span className="flex items-center gap-1.5"><Database size={12} /> API: {apiStatus === "connected" ? "Connected" : "Disconnected"}</span>
            </div>
        </div>
    );
}

export default Device;
