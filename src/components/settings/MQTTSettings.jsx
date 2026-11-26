import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    ArrowLeftRight,
    CheckCircle2,
    CircleX,
    Cloud,
    HardDrive,
    Lock,
    Plug,
    RefreshCw,
    Save,
    Server,
    UserRound,
} from "lucide-react";

import { FIELD_INPUT_CLASS, IconField, Spinner, StatusDot } from "../common/Ui";
import { useRealtime } from "../../hooks/useRealtime";
import {
    fetchMQTTSettings,
    reconnectMQTTSettings,
    updateMQTTSettings,
} from "../../services/api";

const PRESETS = [
    { id: "cloud", label: "Cloud Broker", detail: "broker.emqx.io:1883", host: "broker.emqx.io", port: 1883, icon: Cloud },
    { id: "local", label: "Local Broker", detail: "127.0.0.1:1883 - Mosquitto", host: "127.0.0.1", port: 1883, icon: HardDrive },
];

const EMPTY_CONFIG = {
    host: "broker.emqx.io",
    port: 1883,
    client_id: "",
    username: "",
    password: "",
    auto_connect: 1,
    auto_reconnect: 1,
};

function statusTone(status) {
    if (status === "Connected") return "emerald";
    if (status === "Reconnecting") return "amber";
    return "rose";
}

function MQTTSettings() {
    const realtime = useRealtime();
    const [config, setConfig] = useState({ ...EMPTY_CONFIG });
    const [loadedStatus, setLoadedStatus] = useState("Disconnected");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);

    const liveStatus = realtime.mqttStatus?.status || loadedStatus;
    const activePreset = PRESETS.find(
        (preset) => preset.host === config.host && Number(preset.port) === Number(config.port)
    );

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            try {
                setLoading(true);
                const res = await fetchMQTTSettings();
                if (!isMounted) return;
                if (res?.data) {
                    setConfig({
                        host: res.data.host || EMPTY_CONFIG.host,
                        port: res.data.port || EMPTY_CONFIG.port,
                        client_id: res.data.client_id || "",
                        username: res.data.username || "",
                        password: "",
                        auto_connect: res.data.auto_connect === undefined ? 1 : res.data.auto_connect,
                        auto_reconnect: res.data.auto_reconnect === undefined ? 1 : res.data.auto_reconnect,
                    });
                }
                if (res?.status?.status) setLoadedStatus(res.status.status);
            } catch (err) {
                console.error("Failed to load MQTT settings:", err);
                toast.error("ไม่สามารถโหลดการตั้งค่า MQTT ได้");
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        load();
        return () => { isMounted = false; };
    }, []);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setConfig((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
        }));
    };

    const applyConfig = async (nextConfig) => {
        setSaving(true);
        try {
            const res = await updateMQTTSettings(nextConfig);
            if (res?.data) {
                setConfig({
                    host: res.data.host,
                    port: res.data.port,
                    client_id: res.data.client_id || "",
                    username: res.data.username || "",
                    password: "",
                    auto_connect: res.data.auto_connect,
                    auto_reconnect: res.data.auto_reconnect,
                });
            }
            const nextStatus = res?.mqtt?.status || "Reconnecting";
            setLoadedStatus(nextStatus);
            toast.success(`เชื่อมต่อ MQTT ใหม่: ${nextConfig.host}:${nextConfig.port}`);
        } catch (err) {
            console.error("Failed to save MQTT settings:", err);
            toast.error(`บันทึกไม่สำเร็จ: ${err?.apiMessage || err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleSave = () => applyConfig({
        ...config,
        port: Number(config.port),
    });

    const handlePreset = (preset) => {
        if (saving || loading) return;
        const nextConfig = { ...config, host: preset.host, port: preset.port, auto_connect: 1 };
        setConfig(nextConfig);
        applyConfig({ ...nextConfig, port: Number(nextConfig.port) });
    };

    const handleTest = async () => {
        setTesting(true);
        try {
            const res = await reconnectMQTTSettings();
            const nextStatus = res?.data?.status || "Disconnected";
            setLoadedStatus(nextStatus);
            toast.success(`สถานะ MQTT: ${nextStatus}`);
        } catch (err) {
            console.error("Failed to reconnect MQTT:", err);
            toast.error(`เชื่อมต่อใหม่ไม่สำเร็จ: ${err?.apiMessage || err.message}`);
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="ui-card overflow-hidden">
            <div className="ui-gradient px-6 sm:px-8 py-6 flex flex-wrap items-center justify-between gap-4 text-white">
                <div>
                    <h2 className="text-2xl font-bold">MQTT Configuration</h2>
                    <p className="text-white/80 text-sm mt-1">Broker connection settings and quick failover</p>
                </div>
                <span className={`ui-badge ${liveStatus === "Connected" ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30" : liveStatus === "Reconnecting" ? "bg-amber-500/15 text-amber-300 border-amber-400/30" : "bg-rose-500/15 text-rose-300 border-rose-400/30"}`}>
                    {liveStatus === "Connected" ? <CheckCircle2 size={14} /> : liveStatus === "Reconnecting" ? <RefreshCw size={14} /> : <CircleX size={14} />}
                    {liveStatus}
                </span>
            </div>

            <div className="p-6 sm:p-8 space-y-7">
                <div>
                    <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
                        <ArrowLeftRight size={17} className="text-[var(--midnight-cyan)]" />
                        Quick Preset Switch
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {PRESETS.map((preset) => {
                            const Icon = preset.icon;
                            const isActive = activePreset?.id === preset.id;
                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => handlePreset(preset)}
                                    disabled={saving || loading}
                                    className={`ui-btn ui-press flex-col items-start gap-2 rounded-2xl border p-5 text-left disabled:opacity-50 ${
                                        isActive
                                            ? "border-violet-400/40 bg-violet-500/15"
                                            : "border-white/10 bg-white/5 hover:bg-white/10"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                                        <Icon size={18} className="text-[var(--midnight-cyan)]" />
                                        {preset.label}
                                        {isActive && <CheckCircle2 size={15} className="ml-auto text-emerald-300" />}
                                    </div>
                                    <p className="text-xs text-[var(--midnight-muted)] ui-num">{preset.detail}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <h3 className="mb-4 text-base font-bold text-white">Broker Information</h3>
                    <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2">
                        {[
                            { name: "host", label: "Broker Host", icon: Server },
                            { name: "port", label: "Port", icon: Plug, numeric: true },
                            { name: "client_id", label: "Client ID", icon: UserRound },
                            { name: "username", label: "Username", icon: UserRound },
                        ].map((field) => {
                            const Icon = field.icon;
                            return (
                                <div key={field.name}>
                                    <label className="mb-2 block text-xs font-semibold text-[var(--midnight-muted)]">
                                        {field.label}
                                    </label>
                                    <IconField icon={Icon}>
                                        <input
                                            name={field.name}
                                            value={config[field.name]}
                                            onChange={handleChange}
                                            className={`${FIELD_INPUT_CLASS} ${field.numeric ? "ui-num" : ""}`}
                                            disabled={loading || saving}
                                        />
                                    </IconField>
                                </div>
                            );
                        })}
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-xs font-semibold text-[var(--midnight-muted)]">
                                Password
                            </label>
                            <IconField icon={Lock}>
                                <input
                                    type="password"
                                    name="password"
                                    value={config.password}
                                    onChange={handleChange}
                                    placeholder="เว้นว่างไว้เพื่อใช้รหัสผ่านเดิม"
                                    className={FIELD_INPUT_CLASS}
                                    disabled={loading || saving}
                                />
                            </IconField>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <CheckCircle2 size={18} className="text-emerald-300" />
                            <h3 className="text-sm font-bold text-white">Broker Status</h3>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-[var(--midnight-muted)]">Status</span>
                            <span className={`flex items-center gap-1.5 font-semibold ${liveStatus === "Connected" ? "text-emerald-300" : liveStatus === "Reconnecting" ? "text-amber-300" : "text-rose-300"}`}>
                                <StatusDot tone={statusTone(liveStatus)} staticDot />
                                {liveStatus}
                            </span>
                        </div>
                        <div className="mt-2 flex justify-between text-xs">
                            <span className="text-[var(--midnight-muted)]">Protocol</span>
                            <span className="font-semibold text-white">MQTT / TCP</span>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <ArrowLeftRight size={18} className="text-[var(--midnight-cyan)]" />
                            <h3 className="text-sm font-bold text-white">Connection</h3>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-[var(--midnight-muted)]">Host</span>
                            <span className="font-semibold text-white ui-num">{config.host}</span>
                        </div>
                        <div className="mt-2 flex justify-between text-xs">
                            <span className="text-[var(--midnight-muted)]">Port</span>
                            <span className="font-semibold text-white ui-num">{config.port}</span>
                        </div>
                        <div className="mt-2 flex justify-between text-xs">
                            <span className="text-[var(--midnight-muted)]">Preset</span>
                            <span className="font-semibold text-white">{activePreset?.label || "Custom"}</span>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <Server size={18} className="text-violet-300" />
                            <h3 className="text-sm font-bold text-white">Reconnect</h3>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-[var(--midnight-muted)]">Auto connect</span>
                            <span className="font-semibold text-white">{config.auto_connect ? "Enabled" : "Disabled"}</span>
                        </div>
                        <div className="mt-2 flex justify-between text-xs">
                            <span className="text-[var(--midnight-muted)]">Auto reconnect</span>
                            <span className="font-semibold text-white">{config.auto_reconnect ? "Enabled" : "Disabled"}</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                    <h3 className="mb-4 text-sm font-bold text-white">Connection Options</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <label className="flex items-center gap-3 text-sm text-white">
                            <input
                                type="checkbox"
                                name="auto_connect"
                                checked={Boolean(config.auto_connect)}
                                onChange={handleChange}
                                className="h-4 w-4 accent-violet-500"
                            />
                            Auto connect on startup
                        </label>
                        <label className="flex items-center gap-3 text-sm text-white">
                            <input
                                type="checkbox"
                                name="auto_reconnect"
                                checked={Boolean(config.auto_reconnect)}
                                onChange={handleChange}
                                className="h-4 w-4 accent-violet-500"
                            />
                            Auto reconnect
                        </label>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
                    <button
                        type="button"
                        onClick={handleTest}
                        disabled={testing || saving}
                        className="ui-btn ui-press border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white hover:bg-white/10"
                    >
                        {testing ? <Spinner /> : <RefreshCw size={16} />}
                        {testing ? "Reconnecting..." : "Test Connection"}
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="ui-btn ui-press ui-gradient px-5 py-2.5 text-sm text-white disabled:opacity-50"
                    >
                        {saving ? <Spinner /> : <Save size={16} />}
                        {saving ? "Saving..." : "Save Configuration"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MQTTSettings;
