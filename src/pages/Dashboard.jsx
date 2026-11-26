import { useEffect, useMemo, useRef, useState } from "react";
import {
    Battery,
    CircleCheck,
    Clock,
    Cpu,
    Heart,
    MapPin,
    ShieldCheck,
    Thermometer,
    TriangleAlert,
    Wifi,
    WifiOff,
    Wind,
    X,
    XCircle,
} from "lucide-react";

import HealthCard from "../components/cards/HealthCard";
import HealthChart from "../components/charts/HealthChart";
import DeviceStatus from "../components/dashboard/DeviceStatus";
import EmergencyCard from "../components/dashboard/EmergencyCard";
import AlertTable from "../components/dashboard/AlertTable";
import GoogleMap from "../components/map/GoogleMap";
import { StatSkeleton, StatusDot } from "../components/common/Ui";

import useMQTT from "../hooks/useMQTT";
import { useApiStatus } from "../hooks/useApiStatus";
import { useFlash, useRealtime } from "../hooks/useRealtime";
import { TOPICS } from "../constants/topics";
import { firstDefined, formatDateTime, formatTime, isHealthyRecord } from "../utils/format";
import {
    fetchDashboardOverview,
    fetchEmergencyHistory,
    fetchHealthHistory,
    fetchDeviceProfile,
    updateEmergencyStatus,
} from "../services/api";

const EVENT_DETAILS = {
    FALL_DETECTED: "ตรวจพบเหตุการณ์ผู้ป่วยล้ม",
    HIGH_TEMP: "ตรวจพบอุณหภูมิร่างกายสูงผิดปกติ (มากกว่า 38.5 องศาเซลเซียส)",
    ABNORMAL_HR: "ตรวจพบอัตราการเต้นของหัวใจผิดปกติ (ต่ำกว่า 45 หรือมากกว่า 120 bpm)",
    LOW_SPO2: "ตรวจพบระดับออกซิเจนในเลือดต่ำกว่าเกณฑ์ (น้อยกว่า 92%)",
    SOS_BUTTON: "ผู้ป่วยกดปุ่มขอความช่วยเหลือฉุกเฉิน",
};

function describeEvent(type, description) {
    const normalized = String(type || "").trim().toUpperCase();
    const base = EVENT_DETAILS[normalized] || `เหตุฉุกเฉินจากอุปกรณ์ (${normalized || "ไม่ระบุ"})`;
    const extra = String(description || "").trim();
    if (extra === "" || extra === normalized || extra.includes(base)) {
        return base;
    }
    return `${base} | ${extra}`;
}

function pickNumber(...values) {
    for (const value of values) {
        if (value === null || value === undefined || value === "") {
            continue;
        }
        const number = Number(value);
        if (Number.isFinite(number)) {
            return number;
        }
    }
    return null;
}

function SummaryTile({ icon: Icon, label, value, tone = "default" }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="ui-gradient-icon w-10 h-10 shrink-0">
                <Icon size={19} />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--midnight-muted)]">
                    {label}
                </p>
                <p
                    className={`text-2xl font-bold ui-num truncate ${
                        tone === "gradient" ? "ui-gradient-text" : "text-white"
                    }`}
                >
                    {value}
                </p>
            </div>
        </div>
    );
}

function VitalTile({ icon: Icon, label, value, unit }) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
            <div className="flex items-center gap-2 text-[var(--midnight-muted)]">
                <Icon size={15} />
                <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
            </div>
            <p className="mt-2 text-xl font-bold text-white ui-num">
                {value} <span className="text-xs font-medium text-[var(--midnight-muted)]">{unit}</span>
            </p>
        </div>
    );
}

function CriticalCard({ extremes, alertCount }) {
    const items = [
        { label: "Peak Heart Rate", value: extremes.maxHeart, unit: "BPM", icon: Heart },
        { label: "Lowest SpO2", value: extremes.minSpo2, unit: "%", icon: Wind },
        { label: "Peak Temperature", value: extremes.maxTemp, unit: "°C", icon: Thermometer },
    ];

    return (
        <div className="ui-card-hover p-5 md:p-6 h-full">
            <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Critical Values</h2>
                    <p className="text-xs text-[var(--midnight-muted)] mt-0.5">
                        Highest and lowest readings from stored history
                    </p>
                </div>
                <span
                    className={`ui-badge ${
                        alertCount > 0
                            ? "bg-rose-500/15 text-rose-300 border-rose-400/25"
                            : "bg-emerald-500/15 text-emerald-300 border-emerald-400/25"
                    }`}
                >
                    <StatusDot tone={alertCount > 0 ? "rose" : "emerald"} />
                    {alertCount > 0 ? `${alertCount} active` : "No active alert"}
                </span>
            </div>

            <div className="space-y-3">
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={item.label}
                            className="flex items-center gap-3 rounded-xl bg-white/5 p-3.5"
                        >
                            <div className="ui-gradient-icon w-10 h-10 shrink-0">
                                <Icon size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-[var(--midnight-muted)]">{item.label}</p>
                                <p className="text-lg font-bold text-white ui-num mt-0.5">
                                    {item.value} <span className="text-xs font-medium text-[var(--midnight-muted)]">{item.unit}</span>
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function EmergencyFocusModal({
    caseItem,
    heart,
    temperature,
    spo2,
    battery,
    mapCenter,
    patient,
    onClose,
    onResolve,
    resolving,
    resolveError,
}) {
    const profile = patient || {};
    const profileRows = [
        { label: "ชื่อผู้ป่วย", value: profile.patient_name || "-" },
        { label: "อายุ", value: profile.patient_age == null ? "-" : `${profile.patient_age} ปี` },
        { label: "กรุ๊ปเลือด", value: profile.blood_type || "-" },
        { label: "โรคประจำตัว", value: profile.medical_conditions || "-" },
        { label: "ประวัติแพ้ยา", value: profile.drug_allergies || "-" },
        { label: "ผู้ติดต่อฉุกเฉิน", value: profile.emergency_contact_name || "-" },
        { label: "เบอร์ติดต่อฉุกเฉิน", value: profile.emergency_contact_phone || "-" },
    ];
    const caseId = caseItem?.id ?? caseItem?.emergency_id ?? "-";
    const deviceLabel = [caseItem?.device_name, caseItem?.device_id].filter(Boolean).join(" / ") || "-";
    const patientName = caseItem?.user_name || "-";
    const occurredAt = caseItem?.detected_at || caseItem?.created_at || null;
    const coordinates = mapCenter
        ? `${mapCenter.lat.toFixed(6)}, ${mapCenter.lng.toFixed(6)}`
        : "-";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="w-full max-w-4xl rounded-2xl border border-white/15 bg-[#131626]/95 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.75)] backdrop-blur-xl sm:p-6"
                style={{ animation: "ui-modal-in 280ms cubic-bezier(0.16, 1, 0.3, 1)" }}
                role="dialog"
                aria-modal="true"
                aria-label="รายละเอียดเหตุฉุกเฉิน"
            >
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-rose-400/40 bg-rose-500/15 text-rose-300">
                            <TriangleAlert size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">แจ้งเตือนเหตุฉุกเฉิน</h2>
                            <p className="mt-0.5 text-xs text-[var(--midnight-muted)]">
                                รหัสอ้างอิงเคส (Case ID): <span className="ui-num">{String(caseId)}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="ui-badge bg-rose-500/15 text-rose-300 border-rose-400/25">
                            <StatusDot tone="rose" /> Active
                        </span>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="ปิดหน้าต่าง"
                            className="ui-btn ui-press h-9 w-9 border border-white/10 bg-white/5 text-white hover:bg-white/10"
                        >
                            <X size={17} />
                        </button>
                    </div>
                </div>

                <div className="mt-5 rounded-xl border border-rose-400/25 bg-rose-500/10 p-4">
                    <p className="text-sm font-semibold text-rose-200">
                        {describeEvent(caseItem?.event_type, caseItem?.description)}
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-[var(--midnight-muted)] sm:grid-cols-2">
                        <p className="min-w-0 break-words">อุปกรณ์: <span className="text-white">{deviceLabel}</span></p>
                        <p className="min-w-0 break-words">ผู้ป่วย: <span className="text-white">{patientName}</span></p>
                        <p className="flex flex-wrap items-center gap-1.5">
                            <Clock size={12} /> เวลาเกิดเหตุ: <span className="text-white ui-timer">{formatDateTime(occurredAt)}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                            <MapPin size={12} /> พิกัด: <span className="text-white ui-num">{coordinates}</span>
                        </p>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <VitalTile icon={Heart} label="Heart Rate" value={heart} unit="bpm" />
                    <VitalTile icon={Thermometer} label="Temperature" value={temperature} unit="°C" />
                    <VitalTile icon={Wind} label="SpO2" value={spo2} unit="%" />
                    <VitalTile icon={Battery} label="Battery" value={battery} unit="%" />
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                        <ShieldCheck size={16} className="text-[var(--midnight-cyan)]" />
                        ข้อมูลประจำตัวผู้ป่วย
                    </h3>
                    <div className="grid grid-cols-1 gap-2 text-xs text-[var(--midnight-muted)] sm:grid-cols-2">
                        {profileRows.map((row) => (
                            <p key={row.label} className="min-w-0 break-words">
                                {row.label}: <span className="font-medium text-white">{row.value}</span>
                            </p>
                        ))}
                    </div>
                </div>

                <div className="mt-4 h-[280px] overflow-hidden rounded-xl border border-white/10">
                    {mapCenter ? (
                        <GoogleMap
                            title="ตำแหน่งปัจจุบันของผู้ป่วย"
                            subtitle="พิกัดล่าสุดจากอุปกรณ์"
                            center={mapCenter}
                            markers={[{ lat: mapCenter.lat, lng: mapCenter.lng, title: "ตำแหน่งผู้ป่วย" }]}
                            zoom={16}
                            height={280}
                        />
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-3 bg-[var(--midnight-surface-2)] text-center">
                            <MapPin size={28} strokeWidth={1.5} className="text-[var(--midnight-muted)]" />
                            <p className="text-sm font-medium text-[var(--midnight-muted)]">
                                ยังไม่มีข้อมูลตำแหน่งจากอุปกรณ์
                            </p>
                        </div>
                    )}
                </div>

                {resolveError && (
                    <p className="mt-3 text-sm font-semibold text-rose-300">{resolveError}</p>
                )}

                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="ui-btn ui-press border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white hover:bg-white/10"
                    >
                        ปิดหน้าต่าง
                    </button>
                    <button
                        type="button"
                        disabled={resolving || caseId === "-"}
                        onClick={onResolve}
                        className="ui-btn ui-press bg-rose-600 px-5 py-2.5 text-sm text-white hover:bg-rose-700 disabled:opacity-50"
                    >
                        {resolving ? (
                            "กำลังปิดเคส..."
                        ) : (
                            <><CircleCheck size={16} /> รับทราบและปิดเคส</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Dashboard() {
    const heartMQTT = useMQTT(TOPICS.HEART);
    const tempMQTT = useMQTT(TOPICS.TEMP);
    const spo2MQTT = useMQTT(TOPICS.SPO2);
    const batteryMQTT = useMQTT(TOPICS.BATTERY);

    const realtime = useRealtime();
    const apiStatus = useApiStatus();
    const flash = useFlash(realtime.lastUpdated);

    const [overview, setOverview] = useState(null);
    const [healthHistory, setHealthHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(false);
    const [focusCase, setFocusCase] = useState(null);
    const [patientProfile, setPatientProfile] = useState(null);
    const [dismissedCaseIds, setDismissedCaseIds] = useState(() => new Set());
    const [resolving, setResolving] = useState(false);
    const [resolveError, setResolveError] = useState("");

    const queryAppliedRef = useRef(false);
    const initialActiveAppliedRef = useRef(false);
    const lastSocketCaseRef = useRef(null);
    const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
    const caseParam = searchParams.get("case");
    const deviceParam = searchParams.get("device");

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setApiError(false);

                const [overviewRes, historyRes] = await Promise.all([
                    fetchDashboardOverview(),
                    fetchHealthHistory({ limit: 50 }),
                ]);

                if (isMounted) {
                    setOverview(overviewRes?.data || null);
                    setHealthHistory(
                        Array.isArray(historyRes?.data) ? historyRes.data : []
                    );
                }
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
                if (isMounted) {
                    setApiError(true);
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

    const devices = overview?.devices || { total: 0, online: 0, offline: 0 };
    const latestHealth = overview?.latest_health || null;
    const activeEmergencies = useMemo(
        () => overview?.emergency?.events || [],
        [overview]
    );
    const latestLocation = overview?.latest_location || null;

    const heart = firstDefined(
        heartMQTT,
        realtime.health?.heart_rate,
        latestHealth?.heart_rate
    );
    const spo2 = firstDefined(
        spo2MQTT,
        realtime.health?.spo2,
        latestHealth?.spo2
    );
    const temperature = firstDefined(
        tempMQTT,
        realtime.health?.temperature,
        latestHealth?.temperature
    );
    const battery = firstDefined(
        batteryMQTT,
        realtime.health?.battery_level,
        latestHealth?.battery_level
    );

    const hasHealth = realtime.health != null || latestHealth != null;
    const hasLocation = realtime.location?.latitude != null || latestLocation != null;
    const hasDevices = devices.total > 0;

    useEffect(() => {
        if (loading || queryAppliedRef.current) {
            return undefined;
        }
        if (!caseParam && !deviceParam) {
            return undefined;
        }
        queryAppliedRef.current = true;

        let isMounted = true;
        const resolveCase = async () => {
            let match = activeEmergencies.find((item) => {
                if (caseParam) {
                    return String(item.id) === String(caseParam);
                }
                return String(item.device_id) === String(deviceParam);
            });
            if (!match) {
                try {
                    const params = deviceParam
                        ? { device_id: deviceParam, limit: 100 }
                        : { limit: 100 };
                    const res = await fetchEmergencyHistory(params);
                    const list = Array.isArray(res?.data) ? res.data : [];
                    match = list.find((item) => String(item.id) === String(caseParam))
                        || list.find((item) => String(item.device_id) === String(deviceParam))
                        || null;
                } catch (error) {
                    console.error("Failed to load requested emergency case:", error);
                }
            }
            if (!isMounted) {
                return;
            }
            setFocusCase(
                match || {
                    id: caseParam || null,
                    device_id: deviceParam || null,
                    event_type: "",
                    description: "",
                    latitude: null,
                    longitude: null,
                    status: "active",
                }
            );
        };
        resolveCase();
        return () => {
            isMounted = false;
        };
    }, [loading, caseParam, deviceParam, activeEmergencies]);

    useEffect(() => {
        if (loading || initialActiveAppliedRef.current || caseParam || deviceParam) {
            return;
        }
        if (activeEmergencies.length === 0) {
            return;
        }
        initialActiveAppliedRef.current = true;
        setFocusCase(activeEmergencies[0]);
    }, [loading, caseParam, deviceParam, activeEmergencies]);

    useEffect(() => {
        const socketEmergency = realtime.emergency?.emergency;
        if (!socketEmergency) {
            return;
        }
        const status = String(socketEmergency.status || "").toLowerCase();
        if (status === "resolved") {
            return;
        }
        const id = socketEmergency.emergency_id ?? socketEmergency.id ?? null;
        const key = id !== null
            ? String(id)
            : `${socketEmergency.device_id || ""}-${socketEmergency.created_at || socketEmergency.detected_at || ""}`;
        if (lastSocketCaseRef.current === key) {
            return;
        }
        lastSocketCaseRef.current = key;
        if (dismissedCaseIds.has(key)) {
            return;
        }
        setResolveError("");
        setFocusCase(socketEmergency);
    }, [realtime.emergency, dismissedCaseIds]);

    const focusCaseId = focusCase?.id ?? focusCase?.emergency_id ?? null;
    const focusDeviceKey = focusCase?.device_code || focusCase?.device_id || null;

    useEffect(() => {
        let isMounted = true;
        if (!focusDeviceKey) {
            setPatientProfile(null);
            return () => { isMounted = false; };
        }
        setPatientProfile(null);
        fetchDeviceProfile(focusDeviceKey)
            .then((res) => {
                if (isMounted) setPatientProfile(res?.data || null);
            })
            .catch((error) => {
                console.error("Failed to load patient profile for emergency:", error);
                if (isMounted) setPatientProfile(null);
            });
        return () => { isMounted = false; };
    }, [focusDeviceKey]);

    const focusMapCenter = useMemo(() => {
        const lat = pickNumber(focusCase?.latitude, realtime.location?.latitude, latestLocation?.latitude);
        const lng = pickNumber(focusCase?.longitude, realtime.location?.longitude, latestLocation?.longitude);
        return lat !== null && lng !== null ? { lat, lng } : null;
    }, [focusCase, realtime.location, latestLocation]);

    const closeFocus = () => {
        if (focusCaseId !== null) {
            setDismissedCaseIds((prev) => new Set(prev).add(String(focusCaseId)));
        }
        setResolveError("");
        setFocusCase(null);
    };

    const handleResolve = async () => {
        if (focusCaseId === null || resolving) {
            return;
        }
        setResolving(true);
        setResolveError("");
        try {
            await updateEmergencyStatus(focusCaseId, { status: "resolved" });
            setDismissedCaseIds((prev) => new Set(prev).add(String(focusCaseId)));
            setFocusCase(null);
            const res = await fetchDashboardOverview();
            setOverview(res?.data || null);
        } catch (error) {
            console.error("Failed to resolve emergency case:", error);
            setResolveError("ไม่สามารถปิดเคสได้ กรุณาลองใหม่อีกครั้ง");
        } finally {
            setResolving(false);
        }
    };

    const chartData = useMemo(
        () =>
            healthHistory
                .slice(-20)
                .reverse()
                .map((record) => ({
                    time: formatTime(record.recorded_at),
                    heart: record.heart_rate ?? null,
                    spo2: record.spo2 ?? null,
                })),
        [healthHistory]
    );

    const extremes = useMemo(() => {
        const value = (record, key) => {
            const raw = record?.[key];
            const number = Number(raw);
            return raw !== null && raw !== undefined && Number.isFinite(number)
                ? number
                : null;
        };
        let maxHeart = null;
        let minSpo2 = null;
        let maxTemp = null;
        healthHistory.forEach((record) => {
            const h = value(record, "heart_rate");
            const s = value(record, "spo2");
            const t = value(record, "temperature");
            if (h !== null && (maxHeart === null || h > maxHeart)) maxHeart = h;
            if (s !== null && (minSpo2 === null || s < minSpo2)) minSpo2 = s;
            if (t !== null && (maxTemp === null || t > maxTemp)) maxTemp = t;
        });
        return {
            maxHeart: maxHeart ?? "—",
            minSpo2: minSpo2 ?? "—",
            maxTemp: maxTemp ?? "—",
        };
    }, [healthHistory]);

    const socketAlerts = useMemo(() => {
        const alerts = [];
        if (realtime.emergency?.emergency) {
            const e = realtime.emergency.emergency;
            alerts.push({
                id: e.emergency_id || e.id,
                type: e.event_type || e.emergency_type || "EMERGENCY",
                time: e.detected_at || e.created_at || realtime.lastUpdated,
                status: "ACTIVE",
                severity: "emergency",
                location: e.latitude != null && e.longitude != null
                    ? `${Number(e.latitude).toFixed(4)}, ${Number(e.longitude).toFixed(4)}`
                    : "N/A",
            });
        }
        if (realtime.health) {
            alerts.push({
                id: realtime.health.record_id,
                type: "Health Update",
                time: realtime.health.recorded_at || realtime.lastUpdated,
                status: "Normal",
                location: "N/A",
            });
        }
        return alerts;
    }, [realtime]);

    const allAlerts = useMemo(() => {
        const list = [
            ...socketAlerts,
            ...activeEmergencies.map((event) => ({
                id: event.id,
                type: event.event_type || "EMERGENCY",
                time: event.created_at,
                status: event.status || "ACTIVE",
                severity: event.status === "resolved" ? "info" : "emergency",
                location:
                    event.latitude != null && event.longitude != null
                        ? `${Number(event.latitude).toFixed(4)}, ${Number(event.longitude).toFixed(4)}`
                        : "N/A",
            })),
        ];
        const seen = new Set();
        return list.filter((alert) => {
            const key = alert.id || `${alert.type}-${alert.time}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }, [socketAlerts, activeEmergencies]);

    const healthy = hasHealth ? isHealthyRecord(latestHealth || realtime.health) : false;
    const vitalStatus = hasHealth ? (healthy ? "Healthy" : "Warning") : "No Data";

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Overview</h1>
                    <p className="text-sm text-[var(--midnight-muted)] mt-1">
                        Live status of devices, vitals and emergency events
                    </p>
                </div>
                <span className="ui-status-pill">
                    <StatusDot tone={realtime.connected ? "emerald" : "rose"} />
                    {realtime.connected ? "Live telemetry" : "Reconnecting"}
                </span>
            </div>

            <div className="ui-card p-4 sm:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <SummaryTile icon={Cpu} label="Devices Total" value={devices.total} tone="gradient" />
                    <SummaryTile icon={Wifi} label="Online" value={devices.online} />
                    <SummaryTile icon={WifiOff} label="Offline" value={devices.offline} />
                    <SummaryTile
                        icon={ShieldCheck}
                        label="System Status"
                        value={activeEmergencies.length > 0 ? "ALERT" : "SAFE"}
                    />
                </div>
            </div>

            {apiError && !loading && (
                <div className="ui-card p-5 flex items-center gap-3 bg-rose-500/10 border-rose-400/25 text-rose-300">
                    <XCircle size={20} />
                    <span className="text-sm font-semibold">Failed to load dashboard data from the server.</span>
                </div>
            )}

            {loading ? (
                <div className="space-y-6">
                    <StatSkeleton count={4} />
                    <div className="ui-card p-6"><div className="ui-skeleton h-72 w-full rounded-xl" /></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6">
                        <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                            <HealthCard
                                title="Heart Rate"
                                value={heart}
                                unit="BPM"
                                icon={<Heart size={24} />}
                                status={vitalStatus}
                                percent={heart === "--" ? 0 : (Number(heart) / 180) * 100}
                                caption="Scale 0 - 180 BPM"
                                flash={flash}
                            />
                            <HealthCard
                                title="Temperature"
                                value={temperature}
                                unit="°C"
                                icon={<Thermometer size={24} />}
                                status={vitalStatus}
                                percent={temperature === "--" ? 0 : (Number(temperature) / 42) * 100}
                                caption="Scale 0 - 42 °C"
                                flash={flash}
                            />
                            <HealthCard
                                title="SpO2"
                                value={spo2}
                                unit="%"
                                icon={<Wind size={24} />}
                                status={vitalStatus}
                                percent={spo2 === "--" ? 0 : Number(spo2)}
                                caption="Scale 0 - 100 %"
                                flash={flash}
                            />
                            <HealthCard
                                title="Battery"
                                value={battery}
                                unit="%"
                                icon={<Battery size={24} />}
                                status="Charging"
                                percent={battery === "--" ? 0 : Number(battery)}
                                caption="Scale 0 - 100 %"
                                flash={flash}
                            />
                        </div>

                        <div className="xl:col-span-5 grid grid-cols-1 gap-4 md:gap-6">
                            <CriticalCard extremes={extremes} alertCount={activeEmergencies.length} />
                            <AlertTable alerts={allAlerts} title="Live Stream" subtitle="Latest device and emergency events" />
                        </div>
                    </div>

                    {!apiError && !hasDevices && !hasHealth && !hasLocation && (
                        <div className="ui-card p-8 text-center text-[var(--midnight-muted)] text-sm font-medium">
                            No device data available yet. Waiting for device connection...
                        </div>
                    )}

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6">
                        <div className="xl:col-span-8 h-[420px]">
                            <HealthChart data={chartData} />
                        </div>
                        <div className="xl:col-span-4">
                            <DeviceStatus
                                deviceName={latestHealth?.device_name || "—"}
                                esp32Online={devices.online > 0}
                                mqttStatus={realtime.connected ? "Connected" : "Disconnected"}
                                databaseStatus={apiStatus === "connected" ? "Connected" : "Disconnected"}
                                battery={battery}
                                lastUpdate={latestHealth?.recorded_at || latestLocation?.recorded_at || null}
                                flash={flash}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6">
                        <div className="xl:col-span-8 h-[440px]">
                            {latestLocation ? (
                                <GoogleMap
                                    title="Current Location"
                                    subtitle="Live device position"
                                    center={{
                                        lat: Number(latestLocation.latitude),
                                        lng: Number(latestLocation.longitude),
                                    }}
                                    zoom={16}
                                    height={340}
                                />
                            ) : (
                                <div className="ui-card h-full flex flex-col items-center justify-center gap-3">
                                    <div className="ui-gradient-icon w-14 h-14">
                                        <MapPin size={26} />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Location Map</h2>
                                    <p className="text-sm text-[var(--midnight-muted)]">No location data available yet</p>
                                </div>
                            )}
                        </div>
                        <div className="xl:col-span-4">
                            <EmergencyCard
                                activeCount={activeEmergencies.length}
                                status={activeEmergencies.length > 0 ? "ALERT" : "SAFE"}
                                lastAlertAt={activeEmergencies[0]?.created_at || latestHealth?.recorded_at || null}
                                location={
                                    latestLocation
                                        ? `${Number(latestLocation.latitude).toFixed(4)}, ${Number(latestLocation.longitude).toFixed(4)}`
                                        : "N/A"
                                }
                                lastUpdate={latestHealth?.recorded_at || latestLocation?.recorded_at || null}
                                flash={flash}
                            />
                        </div>
                    </div>
                </>
            )}

            {focusCase && (
                <EmergencyFocusModal
                    caseItem={focusCase}
                    heart={heart}
                    temperature={temperature}
                    spo2={spo2}
                    battery={battery}
                    mapCenter={focusMapCenter}
                    patient={patientProfile}
                    onClose={closeFocus}
                    onResolve={handleResolve}
                    resolving={resolving}
                    resolveError={resolveError}
                />
            )}
        </div>
    );
}

export default Dashboard;
