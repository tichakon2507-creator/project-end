import { useEffect, useState } from "react";
import {
    CircleCheck,
    CircleX,
    Database,
    History,
    Lock,
    Plug,
    RefreshCw,
    Save,
    Server,
    ShieldCheck,
    UserRound,
} from "lucide-react";

import { FIELD_INPUT_CLASS, IconField, Spinner } from "../common/Ui";
import { useApiStatus } from "../../hooks/useApiStatus";
import { fetchSystemSettings, updateSystemSettings, testDatabaseConnection } from "../../services/api";

function DatabaseSettings() {
    const apiStatus = useApiStatus();

    const [config, setConfig] = useState({
        host: "localhost",
        port: "3306",
        database: "smart_health",
        username: "root",
        password: "",
    });

    const [lastTest, setLastTest] = useState(null);
    const [testing, setTesting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [savedAt, setSavedAt] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            try {
                const res = await fetchSystemSettings();
                if (!isMounted) return;
                const raw = res?.data || {};
                const data = raw?.system_value ? JSON.parse(raw.system_value) : {};
                setConfig((prev) => ({
                    ...prev,
                    host: data.db_host || data.host || prev.host,
                    port: data.db_port || data.port || prev.port,
                    database: data.db_name || data.database || prev.database,
                    username: data.db_user || data.username || prev.username,
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
        const { name, value } = e.target;
        setConfig((prev) => ({ ...prev, [name]: value }));
        setSaveError(null);
    };

    const handleTest = async () => {
        setTesting(true);
        try {
            await testDatabaseConnection();
            setLastTest(new Date().toLocaleString("th-TH"));
        } catch (err) {
            console.error("Database test failed:", err);
        } finally {
            setTesting(false);
        }
    };

    const handleSave = async () => {
        setSaveError(null);
        setSaving(true);
        try {
            await updateSystemSettings({
                db_host: config.host,
                db_port: config.port,
                db_name: config.database,
                db_user: config.username,
            });
            setSavedAt(new Date().toLocaleString("th-TH"));
        } catch (err) {
            console.error("Failed to save database settings:", err);
            setSaveError(err?.apiMessage || err.message || "Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const statusOk = apiStatus === "connected";
    const fields = [
        { name: "host", label: "Host", icon: Server },
        { name: "port", label: "Port", icon: Plug },
        { name: "database", label: "Database", icon: Database },
        { name: "username", label: "Username", icon: UserRound },
    ];

    return (
        <div className="ui-card overflow-hidden">
            <div className="bg-gradient-to-r from-sky-600 to-cyan-600 px-6 sm:px-8 py-6 flex flex-wrap items-center justify-between gap-4 text-white">
                <div>
                    <h2 className="text-2xl font-bold">Database Configuration</h2>
                    <p className="text-sky-100 text-sm mt-1">Configure the MySQL database connection</p>
                </div>
                <span className={`ui-badge ${statusOk ? "bg-white/15 text-white border-white/25" : "bg-rose-500 text-white border-rose-400"}`}>
                    {statusOk ? <CircleCheck size={14} /> : <CircleX size={14} />}
                    {statusOk ? "Connected" : "Disconnected"}
                </span>
            </div>

            <div className="p-6 sm:p-8 space-y-7">
                <div>
                    <h3 className="text-base font-bold text-slate-800 mb-4">Server Information</h3>
                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                        {fields.map((field) => {
                            const Icon = field.icon;
                            return (
                                <div key={field.name}>
                                    <label className="block mb-2 text-xs font-semibold text-slate-500">
                                        {field.label}
                                    </label>
                                    <IconField icon={Icon}>
                                        <input
                                            name={field.name}
                                            value={config[field.name]}
                                            onChange={handleChange}
                                            className={`${FIELD_INPUT_CLASS} ${field.name === "port" ? "ui-num" : ""}`}
                                        />
                                    </IconField>
                                </div>
                            );
                        })}
                        <div className="md:col-span-2">
                            <label className="block mb-2 text-xs font-semibold text-slate-500">Password</label>
                            <IconField icon={Lock}>
                                <input
                                    type="password"
                                    name="password"
                                    value={config.password}
                                    onChange={handleChange}
                                    placeholder="Leave blank to keep unchanged"
                                    className={FIELD_INPUT_CLASS}
                                />
                            </IconField>
                        </div>
                    </div>
                </div>

                {saveError && (
                    <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 p-4 text-sm font-semibold">
                        Failed to save settings: {saveError}
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <CircleCheck size={18} className="text-emerald-600" />
                            <h4 className="font-bold text-sm text-slate-800">Connection Status</h4>
                        </div>
                        <div className="space-y-2.5 text-xs">
                            <div className="flex justify-between"><span className="text-slate-500">Status</span><span className={`font-semibold ${statusOk ? "text-emerald-600" : "text-rose-600"}`}>{statusOk ? "Connected" : "Disconnected"}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Host</span><span className="font-semibold text-slate-700">{config.host}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Database</span><span className="font-semibold text-slate-700">{config.database}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Last Test</span><span className="font-semibold text-slate-700 ui-timer">{lastTest || "—"}</span></div>
                        </div>
                    </div>
                    <div className="rounded-2xl bg-sky-50 border border-sky-200 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <History size={18} className="text-sky-600" />
                            <h4 className="font-bold text-sm text-slate-800">Database Information</h4>
                        </div>
                        <div className="space-y-2.5 text-xs">
                            <div className="flex justify-between"><span className="text-slate-500">Engine</span><span className="font-semibold text-slate-700">MySQL</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Charset</span><span className="font-semibold text-slate-700">utf8mb4</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Timezone</span><span className="font-semibold text-slate-700">Asia/Bangkok</span></div>
                        </div>
                    </div>
                    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldCheck size={18} className="text-amber-600" />
                            <h4 className="font-bold text-sm text-slate-800">Security</h4>
                        </div>
                        <div className="space-y-2.5 text-xs">
                            <div className="flex justify-between"><span className="text-slate-500">Credentials</span><span className="font-semibold text-emerald-600">Configured</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">API Access</span><span className="font-semibold text-slate-700">Restricted</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">SSL</span><span className="font-semibold text-slate-700">Server dependent</span></div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-6 flex flex-wrap items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={handleTest}
                        disabled={testing}
                        className="ui-btn ui-press border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 px-5 py-2.5 text-sm"
                    >
                        {testing ? <Spinner /> : <RefreshCw size={16} />}
                        {testing ? "Testing..." : "Test Connection"}
                    </button>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs text-slate-500 ui-timer">
                            {savedAt ? `Saved at ${savedAt}` : "Unsaved changes"}
                        </span>
                        <button
                            type="button"
                            onClick={() => setConfig({ host: "localhost", port: "3306", database: "smart_health", username: "root", password: "" })}
                            className="ui-btn ui-press border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 px-5 py-2.5 text-sm"
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="ui-btn ui-press bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 text-sm"
                        >
                            {saving ? <Spinner /> : <Save size={16} />}
                            {saving ? "Saving..." : "Save Configuration"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DatabaseSettings;
