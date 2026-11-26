import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    ChevronDown,
    CircleCheck,
    Compass,
    Crosshair,
    Globe,
    KeyRound,
    Map,
    MapPinned,
    Navigation,
    Save,
    Satellite,
} from "lucide-react";

import { FIELD_INPUT_CLASS, IconField, Spinner } from "../common/Ui";
import { fetchSystemSettings, updateSystemSettings } from "../../services/api";

function GoogleMapSettings() {
    const [config, setConfig] = useState({
        apiKey: "",
        latitude: "",
        longitude: "",
        zoom: "15",
        mapType: "roadmap",
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
                    apiKey: data.google_map_api_key || data.apiKey || prev.apiKey,
                    latitude: data.default_lat || data.latitude || prev.latitude,
                    longitude: data.default_lng || data.longitude || prev.longitude,
                    zoom: data.default_zoom || data.zoom || prev.zoom,
                    mapType: data.map_type || data.mapType || prev.mapType,
                }));
            } catch (err) {
                console.error("Failed to load map settings:", err);
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
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSystemSettings({
                google_map_api_key: config.apiKey,
                default_lat: config.latitude,
                default_lng: config.longitude,
                default_zoom: config.zoom,
                map_type: config.mapType,
            });
            toast.success("Map settings saved");
        } catch (err) {
            toast.error(`Failed to save map settings: ${err?.apiMessage || err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const fields = [
        { name: "apiKey", label: "Google Maps API Key", icon: KeyRound, type: "password", full: true, numeric: false, placeholder: "API key" },
        { name: "latitude", label: "Latitude", icon: Globe, numeric: true },
        { name: "longitude", label: "Longitude", icon: Crosshair, numeric: true },
        { name: "zoom", label: "Default Zoom", icon: Map, numeric: true },
    ];

    return (
        <div className="ui-card overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-600 to-sky-600 px-6 sm:px-8 py-6 flex flex-wrap items-center justify-between gap-4 text-white">
                <div>
                    <h2 className="text-2xl font-bold">Google Maps Configuration</h2>
                    <p className="text-cyan-100 text-sm mt-1">Configure map provider and default GPS view</p>
                </div>
                <span className="ui-badge bg-white/15 text-white border-white/25">
                    <CircleCheck size={14} /> Ready
                </span>
            </div>

            <div className="p-6 sm:p-8 space-y-7">
                <div>
                    <h3 className="text-base font-bold text-slate-800 mb-4">Maps Configuration</h3>
                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                        {fields.map((field) => {
                            const Icon = field.icon;
                            return (
                                <div key={field.name} className={field.full ? "md:col-span-2" : ""}>
                                    <label className="block mb-2 text-xs font-semibold text-slate-500">{field.label}</label>
                                    <IconField icon={Icon}>
                                        <input
                                            type={field.type || "text"}
                                            name={field.name}
                                            value={config[field.name]}
                                            onChange={handleChange}
                                            className={`${FIELD_INPUT_CLASS} ${field.numeric ? "ui-num" : ""}`}
                                        />
                                    </IconField>
                                </div>
                            );
                        })}
                        <div>
                            <label className="block mb-2 text-xs font-semibold text-slate-500">Map Type</label>
                            <IconField icon={Map}>
                                <select
                                    name="mapType"
                                    value={config.mapType}
                                    onChange={handleChange}
                                    className={`${FIELD_INPUT_CLASS} appearance-none`}
                                >
                                    <option value="roadmap">Roadmap</option>
                                    <option value="satellite">Satellite</option>
                                    <option value="hybrid">Hybrid</option>
                                    <option value="terrain">Terrain</option>
                                </select>
                                <ChevronDown
                                    size={16}
                                    className="shrink-0 text-[var(--midnight-muted)]"
                                    aria-hidden="true"
                                />
                            </IconField>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
                    <div className="lg:col-span-2 rounded-2xl bg-slate-50 border border-dashed border-slate-300 h-[280px] flex flex-col items-center justify-center text-center px-4">
                        <div className="w-14 h-14 rounded-2xl bg-white text-cyan-500 flex items-center justify-center shadow-sm">
                            <MapPinned size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mt-4">Map Preview</h3>
                        <p className="text-sm text-slate-500 mt-1">Use the live map pages to preview the configured provider</p>
                        <div className="mt-6 flex gap-4">
                            <div className="rounded-xl bg-white border border-slate-200 px-4 py-2.5 shadow-sm">
                                <p className="text-[11px] text-slate-500">Latitude</p>
                                <p className="font-bold text-sm text-slate-700 ui-num mt-0.5">{config.latitude}</p>
                            </div>
                            <div className="rounded-xl bg-white border border-slate-200 px-4 py-2.5 shadow-sm">
                                <p className="text-[11px] text-slate-500">Longitude</p>
                                <p className="font-bold text-sm text-slate-700 ui-num mt-0.5">{config.longitude}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Navigation size={17} className="text-emerald-600" />
                                <h3 className="font-bold text-sm text-slate-800">GPS Status</h3>
                            </div>
                            <div className="flex justify-between text-xs"><span className="text-slate-500">Source</span><span className="font-semibold text-slate-700">Device GPS</span></div>
                            <div className="flex justify-between text-xs mt-2"><span className="text-slate-500">Coordinates</span><span className="font-semibold text-slate-700 ui-num">Configured</span></div>
                        </div>
                        <div className="rounded-2xl bg-sky-50 border border-sky-200 p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Satellite size={17} className="text-sky-600" />
                                <h3 className="font-bold text-sm text-slate-800">Maps Information</h3>
                            </div>
                            <div className="flex justify-between text-xs"><span className="text-slate-500">Provider</span><span className="font-semibold text-slate-700">Google / OSM</span></div>
                            <div className="flex justify-between text-xs mt-2"><span className="text-slate-500">Zoom</span><span className="font-semibold text-slate-700 ui-num">{config.zoom}</span></div>
                            <div className="flex justify-between text-xs mt-2"><span className="text-slate-500">Type</span><span className="font-semibold text-slate-700 capitalize">{config.mapType}</span></div>
                        </div>
                        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Compass size={17} className="text-amber-600" />
                                <h3 className="font-bold text-sm text-slate-800">Default Location</h3>
                            </div>
                            <p className="text-xs text-[var(--midnight-muted)]">Coordinates are read from the saved system settings.</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-6 flex flex-wrap items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={() => setConfig({ apiKey: "", latitude: "", longitude: "", zoom: "15", mapType: "roadmap" })}
                        className="ui-btn ui-press border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 px-5 py-2.5 text-sm"
                    >
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="ui-btn ui-press bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 text-sm"
                    >
                        {saving ? <Spinner /> : <Save size={16} />}
                        {saving ? "Saving..." : "Save Configuration"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GoogleMapSettings;
