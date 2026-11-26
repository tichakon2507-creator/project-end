import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    CircleCheck,
    Database,
    Download,
    Globe,
    Moon,
    RotateCcw,
    Save,
    Server,
    Trash2,
    Upload,
    Cpu,
} from "lucide-react";

import { Spinner } from "../common/Ui";
import { fetchSystemSettings, updateSystemSettings } from "../../services/api";

function SystemSettings() {
    const [config, setConfig] = useState({
        theme: "light",
        language: "English",
        timezone: "Asia/Bangkok",
        autoBackup: true,
        autoUpdate: false,
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            try {
                const res = await fetchSystemSettings();
                if (!isMounted) return;
                const raw = res?.data || {};
                const data = raw?.system_value ? JSON.parse(raw.system_value) : {};
                setConfig((prev) => ({
                    theme: data.theme || prev.theme,
                    language: data.language || prev.language,
                    timezone: data.timezone || prev.timezone,
                    autoBackup: data.auto_backup ?? data.autoBackup ?? prev.autoBackup,
                    autoUpdate: data.auto_update ?? data.autoUpdate ?? prev.autoUpdate,
                }));
            } catch (err) {
                console.error("Failed to load system settings:", err);
            }
        };
        load();
        return () => {
            isMounted = false;
        };
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConfig((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSystemSettings({
                theme: config.theme,
                language: config.language,
                timezone: config.timezone,
                auto_backup: config.autoBackup,
                auto_update: config.autoUpdate,
            });
            toast.success("System settings saved");
        } catch (err) {
            toast.error(`Failed to save system settings: ${err?.apiMessage || err.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="ui-card overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-6 sm:px-8 py-6 flex flex-wrap items-center justify-between gap-4 text-white">
                <div>
                    <h2 className="text-2xl font-bold">System Settings</h2>
                    <p className="text-slate-300 text-sm mt-1">Dashboard preferences and maintenance</p>
                </div>
                <span className="ui-badge bg-white/15 text-white border-white/25">
                    <CircleCheck size={14} /> System Ready
                </span>
            </div>

            <div className="p-6 sm:p-8 space-y-7">
                <div>
                    <h3 className="text-base font-bold text-slate-800 mb-4">Preferences</h3>
                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <label className="block mb-2 text-xs font-semibold text-slate-500 flex items-center gap-2">
                                <Moon size={14} /> Theme
                            </label>
                            <select
                                name="theme"
                                value={config.theme}
                                onChange={handleChange}
                                className="ui-dropdown ui-input px-4 py-2.5 text-sm"
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="system">System</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-xs font-semibold text-slate-500 flex items-center gap-2">
                                <Globe size={14} /> Language
                            </label>
                            <select
                                name="language"
                                value={config.language}
                                onChange={handleChange}
                                className="ui-dropdown ui-input px-4 py-2.5 text-sm"
                            >
                                <option>English</option>
                                <option>Thai</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-xs font-semibold text-slate-500 flex items-center gap-2">
                                <Server size={14} /> Time Zone
                            </label>
                            <select
                                name="timezone"
                                value={config.timezone}
                                onChange={handleChange}
                                className="ui-dropdown ui-input px-4 py-2.5 text-sm"
                            >
                                <option>Asia/Bangkok</option>
                                <option>UTC</option>
                                <option>Asia/Singapore</option>
                            </select>
                        </div>
                        <div className="flex flex-col justify-center gap-4">
                            {[
                                { name: "autoBackup", label: "Enable auto backup" },
                                { name: "autoUpdate", label: "Enable auto update" },
                            ].map((option) => (
                                <label key={option.name} className="flex items-center gap-3 text-sm text-slate-700">
                                    <input
                                        type="checkbox"
                                        name={option.name}
                                        checked={config[option.name]}
                                        onChange={handleChange}
                                        className="w-4 h-4 accent-sky-600"
                                    />
                                    {option.label}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                    <div className="rounded-2xl bg-sky-50 border border-sky-200 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Database size={18} className="text-sky-600" />
                            <h3 className="font-bold text-sm text-slate-800">Database</h3>
                        </div>
                        <div className="flex justify-between text-xs"><span className="text-slate-500">Engine</span><span className="font-semibold text-slate-700">MySQL</span></div>
                        <div className="flex justify-between text-xs mt-2"><span className="text-slate-500">Records</span><span className="font-semibold text-slate-700">Live from API</span></div>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Server size={18} className="text-emerald-600" />
                            <h3 className="font-bold text-sm text-slate-800">API Server</h3>
                        </div>
                        <div className="flex justify-between text-xs"><span className="text-slate-500">Status</span><span className="font-semibold text-emerald-600">Running</span></div>
                        <div className="flex justify-between text-xs mt-2"><span className="text-slate-500">Transport</span><span className="font-semibold text-slate-700">REST + Socket.IO</span></div>
                    </div>
                    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Cpu size={18} className="text-amber-600" />
                            <h3 className="font-bold text-sm text-slate-800">ESP32 Device</h3>
                        </div>
                        <div className="flex justify-between text-xs"><span className="text-slate-500">Transport</span><span className="font-semibold text-slate-700">MQTT</span></div>
                        <div className="flex justify-between text-xs mt-2"><span className="text-slate-500">Status</span><span className="font-semibold text-slate-700">Live telemetry</span></div>
                    </div>
                </div>

                <div>
                    <h3 className="text-base font-bold text-slate-800 mb-4">Maintenance</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Backup", icon: Download, tone: "bg-emerald-600 hover:bg-emerald-700" },
                            { label: "Restore", icon: Upload, tone: "bg-sky-600 hover:bg-sky-700" },
                            { label: "Restart", icon: RotateCcw, tone: "bg-amber-500 hover:bg-amber-600" },
                            { label: "Clear Cache", icon: Trash2, tone: "bg-rose-600 hover:bg-rose-700" },
                        ].map((action) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={action.label}
                                    type="button"
                                    className={`ui-btn ui-press flex-col gap-2 text-white py-2.5 text-sm ${action.tone}`}
                                >
                                    <Icon size={24} /> {action.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h4 className="font-semibold text-sm text-slate-800">
                            Smart Health &amp; Emergency Dashboard
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 ui-num">
                            Version 1.0.0 - React + Vite - MQTT - MySQL - ESP32
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="ui-btn ui-press bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 text-sm"
                    >
                        {saving ? <Spinner /> : <Save size={16} />}
                        {saving ? "Saving..." : "Save All Settings"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SystemSettings;
