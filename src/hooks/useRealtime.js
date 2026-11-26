import { useEffect, useState } from "react";
import { getSocket } from "../services/socket";

export const REALTIME_EVENTS = {
    HEALTH_UPDATE: "health:update",
    LOCATION_UPDATE: "location:update",
    EMERGENCY_ALERT: "emergency:alert",
    DEVICE_STATUS: "device:status",
    MQTT_STATUS: "mqtt:status",
};

export function useRealtime() {
    const [realtime, setRealtime] = useState({
        connected: false,
        health: null,
        location: null,
        emergency: null,
        deviceStatus: null,
        mqttStatus: null,
        lastUpdated: null,
    });

    useEffect(() => {
        const socket = getSocket();

        const applyUpdate = (patch) => {
            setRealtime((prev) => ({
                ...prev,
                connected: true,
                lastUpdated: new Date().toISOString(),
                ...patch,
            }));
        };

        const onConnect = () => setRealtime((prev) => ({ ...prev, connected: true }));
        const onDisconnect = () => setRealtime((prev) => ({ ...prev, connected: false }));
        const onHealthUpdate = (payload) => applyUpdate({ health: payload || null });
        const onLocationUpdate = (payload) => applyUpdate({ location: payload || null });
        const onEmergencyAlert = (payload) => applyUpdate({ emergency: payload || null });
        const onDeviceStatus = (payload) => applyUpdate({ deviceStatus: payload || null });
        const onMQTTStatus = (payload) => applyUpdate({ mqttStatus: payload || null });

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on(REALTIME_EVENTS.HEALTH_UPDATE, onHealthUpdate);
        socket.on(REALTIME_EVENTS.LOCATION_UPDATE, onLocationUpdate);
        socket.on(REALTIME_EVENTS.EMERGENCY_ALERT, onEmergencyAlert);
        socket.on(REALTIME_EVENTS.DEVICE_STATUS, onDeviceStatus);
        socket.on(REALTIME_EVENTS.MQTT_STATUS, onMQTTStatus);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off(REALTIME_EVENTS.HEALTH_UPDATE, onHealthUpdate);
            socket.off(REALTIME_EVENTS.LOCATION_UPDATE, onLocationUpdate);
            socket.off(REALTIME_EVENTS.EMERGENCY_ALERT, onEmergencyAlert);
            socket.off(REALTIME_EVENTS.DEVICE_STATUS, onDeviceStatus);
            socket.off(REALTIME_EVENTS.MQTT_STATUS, onMQTTStatus);
        };
    }, []);

    return realtime;
}

export function useFlash(value, duration = 1400) {
    const [flashing, setFlashing] = useState(false);

    useEffect(() => {
        if (value === null || value === undefined || value === "") {
            return undefined;
        }
        setFlashing(true);
        const timer = setTimeout(() => setFlashing(false), duration);
        return () => clearTimeout(timer);
    }, [value, duration]);

    return flashing;
}
