import { useEffect, useMemo, useState } from "react";
import {
    Activity,
    Battery,
    CalendarDays,
    Download,
    Filter,
    Heart,
    Wind,
    RefreshCw,
    Thermometer,
    TrendingUp,
    XCircle,
} from "lucide-react";

import useMQTT from "../hooks/useMQTT";
import { useFlash, useRealtime } from "../hooks/useRealtime";
import { TOPICS } from "../constants/topics";
import HealthHistoryTable from "../components/health/HealthHistoryTable";
import { FIELD_INPUT_CLASS, IconField, Skeleton, StatusDot } from "../components/common/Ui";
import { firstDefined, formatDateTime, toDateTimeParts, isHealthyRecord } from "../utils/format";
import { fetchHealthLatest, fetchHealthHistory } from "../services/api";

function VitalCard({ title, value, unit, icon: Icon, status, flash, loading, percent = 0 }) {
    const width = Math.max(0, Math.min(100, Number(percent) || 0));

    return (
        <div className={`ui-card-hover p-5 md:p-6 ${flash ? "ui-flash" : ""}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--midnight-muted)]">{title}</p>
                    <div className="flex items-end gap-2 mt-3">
                        {loading ? (
                            <Skeleton className="h-10 w-20" />
                        ) : (
                            <span className="ui-gradient-text text-4xl font-bold ui-num">{value}</span>
                        )}
                        <span className="text-[var(--midnight-muted)] mb-1 text-sm">{unit}</span>
                    </div>
                </div>
                <div className="ui-gradient-icon w-12 h-12 shrink-0">
                    <Icon size={24} />
                </div>
            </div>
            <div className="mt-5 ui-track">
                <div className="ui-gradient-bar" style={{ width: `${width}%` }} />
            </div>
            <div className="mt-4">
                <span className="ui-badge bg-emerald-500/15 text-emerald-300 border-emerald-400/25">
                    <StatusDot tone="emerald" staticDot /> {status}
                </span>
            </div>
        </div>
    );
}

function Health() {
    const heartMQTT = useMQTT(TOPICS.HEART, "--");
    const tempMQTT = useMQTT(TOPICS.TEMP, "--");
    const spo2MQTT = useMQTT(TOPICS.SPO2, "--");
    const batteryMQTT = useMQTT(TOPICS.BATTERY, "--");

    const realtime = useRealtime();
    const flash = useFlash(realtime.lastUpdated);

    const [latest, setLatest] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [range, setRange] = useState("all");

    useEffect(() => {
        let isMounted = true;

        const run = async () => {
            const params = {};
            if (fromDate) {
                params.from = fromDate;
            }
            if (toDate) {
                params.to = toDate;
            }
            try {
                setLoading(true);
                setError(null);
                const [latestRes, historyRes] = await Promise.all([
                    fetchHealthLatest(),
                    fetchHealthHistory({ limit: 100, ...params }),
                ]);
                if (isMounted) {
                    setLatest(latestRes?.data || null);
                    setHistory(Array.isArray(historyRes?.data) ? historyRes.data : []);
                }
            } catch (err) {
                console.error("Failed to fetch health data:", err);
                if (isMounted) {
                    setError(err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        run();

        return () => {
            isMounted = false;
        };
    }, [fromDate, toDate, refreshKey]);

    const applyRange = (next) => {
        setRange(next);
        const today = new Date();
        if (next === "all") {
            setFromDate("");
            setToDate("");
            return;
        }
        const start = new Date(today);
        if (next === "7d") {
            start.setDate(start.getDate() - 6);
        } else if (next === "30d") {
            start.setDate(start.getDate() - 29);
        }
        setFromDate(start.toISOString().slice(0, 10));
        setToDate(today.toISOString().slice(0, 10));
    };

    const hasData = latest != null || realtime.health != null || heartMQTT != null;

    const heart = firstDefined(heartMQTT, realtime.health?.heart_rate, latest?.heart_rate);
    const temp = firstDefined(tempMQTT, realtime.health?.temperature, latest?.temperature);
    const spo2 = firstDefined(spo2MQTT, realtime.health?.spo2, latest?.spo2);
    const battery = firstDefined(batteryMQTT, realtime.health?.battery_level, latest?.battery_level);

    const lastUpdate = firstDefined(latest?.recorded_at, realtime.health?.recorded_at);

    const historyRows = useMemo(
        () =>
            history.map((record) => {
                const { date, time } = toDateTimeParts(record.recorded_at);
                return {
                    date,
                    time,
                    heart: record.heart_rate != null ? `${record.heart_rate} BPM` : "N/A",
                    spo2: record.spo2 != null ? `${record.spo2}%` : "N/A",
                    temp: record.temperature != null ? `${record.temperature}°C` : "N/A",
                    status: isHealthyRecord(record) ? "Healthy" : "Warning",
                };
            }),
        [history]
    );

    const handleExport = () => {
        if (history.length === 0) {
            return;
        }
        const blob = new Blob([JSON.stringify(history, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `health-history-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Health Monitoring</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Real-time health monitoring and vital signs
                    </p>
                </div>
                <span className={`ui-badge ${realtime.connected ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                    <StatusDot tone={realtime.connected ? "emerald" : "rose"} />
                    {realtime.connected ? "Real-time Monitoring" : "Monitoring Disconnected"}
                </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-[var(--midnight-muted)] ui-timer">
                    {lastUpdate ? `Last Update: ${formatDateTime(lastUpdate)}` : "No data yet"}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                    {[
                        { key: "all", label: "All" },
                        { key: "today", label: "Today" },
                        { key: "7d", label: "7 Days" },
                        { key: "30d", label: "30 Days" },
                    ].map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => applyRange(item.key)}
                            className={`ui-pill ${range === item.key ? "ui-pill-active" : ""}`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && !loading && (
                <div className="ui-card p-5 flex items-center gap-3 bg-rose-50/60 border-rose-200 text-rose-700">
                    <XCircle size={20} />
                    <span className="text-sm font-semibold">Failed to fetch health data from the server.</span>
                </div>
            )}

            <div className="ui-card p-5 md:p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                        <Filter size={20} />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">History Filter</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-2">From Date</label>
                        <IconField icon={CalendarDays}>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className={`${FIELD_INPUT_CLASS} ui-num`}
                            />
                        </IconField>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-2">To Date</label>
                        <IconField icon={CalendarDays}>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className={`${FIELD_INPUT_CLASS} ui-num`}
                            />
                        </IconField>
                    </div>
                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={() => setRefreshKey((key) => key + 1)}
                            disabled={loading}
                            className="ui-btn ui-press w-full bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 text-sm"
                        >
                            <RefreshCw size={16} className={loading ? "ui-spinner" : ""} />
                            {loading ? "Loading" : "Apply Filter"}
                        </button>
                    </div>
                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={handleExport}
                            disabled={history.length === 0}
                            className="ui-btn ui-press w-full bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 text-sm"
                        >
                            <Download size={16} /> Export
                        </button>
                    </div>
                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={() => {
                                setRange("all");
                                setFromDate("");
                                setToDate("");
                            }}
                            className="ui-btn ui-press w-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-3 text-sm"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                <VitalCard
                    title="Heart Rate"
                    value={heart}
                    unit="BPM"
                    icon={Heart}
                    status={hasData ? "Normal" : "No Data"}
                    percent={heart === "--" ? 0 : (Number(heart) / 180) * 100}
                    flash={flash}
                    loading={loading}
                />
                <VitalCard
                    title="Blood Oxygen"
                    value={spo2}
                    unit="%"
                    icon={Wind}
                    status={hasData ? "Excellent" : "No Data"}
                    percent={spo2 === "--" ? 0 : Number(spo2)}
                    flash={flash}
                    loading={loading}
                />
                <VitalCard
                    title="Body Temperature"
                    value={temp}
                    unit="°C"
                    icon={Thermometer}
                    status={hasData ? "Normal" : "No Data"}
                    percent={temp === "--" ? 0 : (Number(temp) / 42) * 100}
                    flash={flash}
                    loading={loading}
                />
                <VitalCard
                    title="Device Battery"
                    value={battery}
                    unit="%"
                    icon={Battery}
                    status={hasData ? "Device Active" : "No Data"}
                    percent={battery === "--" ? 0 : Number(battery)}
                    flash={flash}
                    loading={loading}
                />
            </div>

            <div className="ui-card p-5 md:p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Current Health Summary</h2>
                        <p className="text-xs text-slate-500">Latest health data from Smart Health Device</p>
                    </div>
                </div>

                {!hasData && !loading && (
                    <div className="text-slate-400 text-center py-4 text-sm">No health data available yet.</div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Heart Rate", value: heart, unit: "BPM" },
                        { label: "SpO2", value: spo2, unit: "%" },
                        { label: "Temperature", value: temp, unit: "°C" },
                        { label: "Battery", value: battery, unit: "%" },
                    ].map((item) => (
                        <div key={item.label} className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">{item.label}</p>
                            {loading ? (
                                <Skeleton className="h-7 w-20 mt-2" />
                            ) : (
                                <p className="text-xl font-bold text-slate-800 mt-2 ui-num">
                                    {item.value} <span className="text-xs font-medium text-slate-500">{item.unit}</span>
                                </p>
                            )}
                            <p className="text-[11px] text-slate-400 mt-1 ui-timer">
                                {lastUpdate ? formatDateTime(lastUpdate) : "N/A"}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="ui-card p-5 md:p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Database Record</h2>
                        <p className="text-xs text-slate-500">Latest health record stored in MySQL</p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="space-y-2">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                        ))}
                    </div>
                ) : !latest ? (
                    <div className="text-slate-400 text-sm">No database record found.</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-xs text-slate-500">Record ID</p>
                            <p className="font-bold mt-1 ui-num">#{latest.record_id ?? latest.id ?? "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Device ID</p>
                            <p className="font-bold mt-1 ui-num">#{latest.device_id ?? "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">User ID</p>
                            <p className="font-bold mt-1 ui-num">#{latest.user_id ?? "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Last Update</p>
                            <p className="font-bold mt-1 text-sm ui-timer">{formatDateTime(lastUpdate)}</p>
                        </div>
                    </div>
                )}
            </div>

            <HealthHistoryTable
                records={historyRows}
                loading={loading}
                emptyMessage={fromDate || toDate ? "No health records found in the selected date range." : "No health records found."}
            />
        </div>
    );
}

export default Health;
