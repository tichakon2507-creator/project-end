import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
    Battery,
    CircleCheck,
    Clock,
    MapPinned,
    Radio,
    ShieldAlert,
    TriangleAlert,
    XCircle,
} from "lucide-react";

import EmergencyStatusCard from "../components/emergency/EmergencyStatusCard";
import EmergencyMap from "../components/emergency/EmergencyMap";
import EmergencyContact from "../components/emergency/EmergencyContact";
import EmergencyDevice from "../components/emergency/EmergencyDevice";
import EmergencyHistory from "../components/emergency/EmergencyHistory";
import { Modal, RowsSkeleton, Spinner, StatusDot } from "../components/common/Ui";

import { useFlash, useRealtime } from "../hooks/useRealtime";
import { useApiStatus } from "../hooks/useApiStatus";
import {
    fetchActiveEmergencies,
    fetchEmergencyHistory,
    fetchDevices,
    fetchLatestLocations,
    fetchHealthLatest,
    updateEmergencyStatus,
} from "../services/api";
import { formatDateTime, formatCoordinates } from "../utils/format";

function Emergency() {
    const [activeEvents, setActiveEvents] = useState([]);
    const [history, setHistory] = useState([]);
    const [devices, setDevices] = useState([]);
    const [latestLocations, setLatestLocations] = useState([]);
    const [healthLatest, setHealthLatest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [resolvingId, setResolvingId] = useState(null);
    const [confirmEvent, setConfirmEvent] = useState(null);

    const realtime = useRealtime();
    const apiStatus = useApiStatus();
    const flash = useFlash(realtime.lastUpdated);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [eventsRes, historyRes, devicesRes, locationsRes, healthRes] =
                    await Promise.all([
                        fetchActiveEmergencies(),
                        fetchEmergencyHistory({ limit: 50 }),
                        fetchDevices(),
                        fetchLatestLocations(),
                        fetchHealthLatest(),
                    ]);

                if (isMounted) {
                    setActiveEvents(Array.isArray(eventsRes?.data) ? eventsRes.data : []);
                    setHistory(Array.isArray(historyRes?.data) ? historyRes.data : []);
                    setDevices(Array.isArray(devicesRes?.data) ? devicesRes.data : []);
                    setLatestLocations(Array.isArray(locationsRes?.data) ? locationsRes.data : []);
                    setHealthLatest(healthRes?.data || null);
                }
            } catch (err) {
                console.error("Failed to load emergency data:", err);
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

    const socketEvent = realtime.emergency?.emergency || null;

    const allActive = useMemo(() => {
        const list = [...activeEvents];
        if (socketEvent) {
            const existing = list.some((e) => e.id === socketEvent.emergency_id);
            if (!existing) {
                list.unshift({
                    id: socketEvent.emergency_id,
                    device_id: socketEvent.device_id,
                    event_type: socketEvent.event_type || socketEvent.emergency_type || "EMERGENCY",
                    description: socketEvent.description || "",
                    latitude: socketEvent.latitude,
                    longitude: socketEvent.longitude,
                    status: "ACTIVE",
                    created_at: socketEvent.detected_at || socketEvent.created_at,
                    device_name: socketEvent.device_name || null,
                    user_name: null,
                    user_username: null,
                });
            }
        }
        return list;
    }, [activeEvents, socketEvent]);

    const latestLocation = latestLocations[0] || null;

    const mapCenter = useMemo(() => {
        if (latestLocation) {
            return { lat: Number(latestLocation.latitude), lng: Number(latestLocation.longitude) };
        }
        return null;
    }, [latestLocation]);

    const mapMarkers = useMemo(() => {
        const markers = [];
        if (mapCenter) {
            markers.push({ ...mapCenter, title: "Device" });
        }
        allActive.forEach((event) => {
            if (event.latitude != null && event.longitude != null) {
                markers.push({
                    lat: Number(event.latitude),
                    lng: Number(event.longitude),
                    title: event.event_type || "EMERGENCY",
                });
            }
        });
        return markers;
    }, [mapCenter, allActive]);

    const historyRows = useMemo(
        () =>
            history.map((event) => ({
                id: event.id,
                date: event.created_at,
                time: event.created_at,
                location:
                    event.latitude != null && event.longitude != null
                        ? formatCoordinates(event.latitude, event.longitude)
                        : "N/A",
                status: event.status,
                level:
                    event.status === "resolved"
                        ? "normal"
                        : event.event_type === "SOS"
                            ? "danger"
                            : "warning",
            })),
        [history]
    );

    const handleResolve = async (eventId) => {
        setResolvingId(eventId);
        try {
            await updateEmergencyStatus(eventId, { status: "resolved" });
            setActiveEvents((prev) => prev.filter((event) => event.id !== eventId));
            toast.success("Emergency event resolved");
        } catch (err) {
            toast.error(`Failed to resolve event: ${err?.apiMessage || err.message}`);
        } finally {
            setResolvingId(null);
        }
    };

    const alert = allActive.length > 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Emergency</h1>
                    <p className="text-sm text-slate-500 mt-1">Real-time emergency alerts and history</p>
                </div>
                <span className={`ui-badge ${alert ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                    <StatusDot tone={alert ? "rose" : "emerald"} />
                    {alert ? "Active Emergency" : "All Clear"}
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                <EmergencyStatusCard
                    title="Emergency Status"
                    value={alert ? "ALERT" : "SAFE"}
                    color={alert ? "#e11d48" : "#059669"}
                    icon={alert ? TriangleAlert : ShieldAlert}
                    active={alert}
                    flash={flash}
                />
                <EmergencyStatusCard
                    title="Location"
                    value={mapCenter ? formatCoordinates(mapCenter.lat, mapCenter.lng) : "N/A"}
                    color="#2563eb"
                    icon={MapPinned}
                    flash={flash}
                />
                <EmergencyStatusCard title="Signal" value="N/A" color="#f59e0b" icon={Radio} />
                <EmergencyStatusCard
                    title="Battery"
                    value={healthLatest?.battery_level != null ? `${healthLatest.battery_level}%` : "N/A"}
                    color="#10b981"
                    icon={Battery}
                    flash={flash}
                />
            </div>

            {error && !loading && (
                <div className="ui-card p-5 flex items-center gap-3 bg-rose-50/60 border-rose-200 text-rose-700">
                    <XCircle size={20} />
                    <span className="text-sm font-semibold">Failed to load emergency data from the server.</span>
                </div>
            )}

            {loading ? (
                <div className="ui-card p-5 md:p-6">
                    <div className="ui-skeleton h-6 w-56 mb-5 rounded" />
                    <RowsSkeleton count={3} columns={3} />
                </div>
            ) : (
                <>
                    {allActive.length > 0 && (
                        <EmergencyActiveEvents
                            events={allActive}
                            resolvingId={resolvingId}
                            onResolve={setConfirmEvent}
                        />
                    )}

                    <EmergencyMap center={mapCenter} markers={mapMarkers} />

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                        <EmergencyContact />
                        <EmergencyDevice device={devices[0] || null} health={healthLatest} apiStatus={apiStatus} />
                    </div>

                    <EmergencyHistory rows={historyRows} loading={loading} />
                </>
            )}

            <Modal
                open={Boolean(confirmEvent)}
                onClose={() => setConfirmEvent(null)}
                icon={CircleCheck}
                iconTone="emerald"
                title="Resolve Emergency Event"
                description={`Mark event ${confirmEvent?.event_type || "EMERGENCY"} as resolved? This update will be sent to the server.`}
                actions={[
                    {
                        label: resolvingId ? "Resolving..." : "Confirm Resolve",
                        icon: CircleCheck,
                        loading: resolvingId === confirmEvent?.id,
                        disabled: resolvingId != null,
                        onClick: async () => {
                            const id = confirmEvent?.id;
                            if (id == null) return;
                            await handleResolve(id);
                            setConfirmEvent(null);
                        },
                    },
                    { label: "Cancel", onClick: () => setConfirmEvent(null) },
                ]}
            />
        </div>
    );
}

function EmergencyActiveEvents({ events, resolvingId, onResolve }) {
    return (
        <div className={`ui-card p-5 md:p-6 ${events.length > 0 ? "border-rose-200" : ""}`}>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <TriangleAlert size={20} />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Active Emergency Events</h2>
                <span className="ui-badge bg-rose-50 text-rose-700 border-rose-200 ui-num">
                    {events.length}
                </span>
            </div>
            <div className="space-y-3">
                {events.map((event) => (
                    <div
                        key={event.id}
                        className="rounded-xl border border-rose-200 bg-rose-50/50 p-4"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="min-w-0">
                                <p className="font-bold text-rose-700">{event.event_type}</p>
                                {event.description && (
                                    <p className="text-sm text-slate-600 mt-0.5">{event.description}</p>
                                )}
                                <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5 ui-timer">
                                    <Clock size={12} />
                                    {formatDateTime(event.created_at)}
                                </p>
                                {event.device_name && (
                                    <p className="text-xs text-slate-500 mt-1">{event.device_name}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="ui-badge bg-rose-100 text-rose-700 border-rose-200 uppercase">
                                    {event.status}
                                </span>
                                <button
                                    type="button"
                                    disabled={resolvingId === event.id}
                                    onClick={() => onResolve(event.id)}
                                    className="ui-btn ui-press bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 text-sm"
                                >
                                    {resolvingId === event.id ? (
                                        <><Spinner /> Resolving...</>
                                    ) : (
                                        <><CircleCheck size={16} /> Resolve</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Emergency;
