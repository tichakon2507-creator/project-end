import { useEffect, useMemo, useState } from "react";
import {
    Bell,
    Clock,
    MapPin,
    Radio,
    TriangleAlert,
    XCircle,
} from "lucide-react";

import { RowsSkeleton, StatusDot } from "../components/common/Ui";
import { useFlash, useRealtime } from "../hooks/useRealtime";
import { useApiStatus } from "../hooks/useApiStatus";
import { fetchActiveEmergencies, fetchEmergencyHistory } from "../services/api";
import { formatDateTime } from "../utils/format";

function AlertItem({ alert }) {
    const isEmergency = alert.severity === "emergency";

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 last:border-0">
            <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${isEmergency ? "bg-rose-50 text-rose-600" : "bg-sky-50 text-sky-600"}`}>
                    {isEmergency ? <TriangleAlert size={19} /> : <Bell size={19} />}
                </div>
                <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-800">{alert.type}</p>
                    <p className="flex items-center gap-1.5 text-xs text-slate-500 ui-timer mt-0.5">
                        <Clock size={12} /> {formatDateTime(alert.time)}
                    </p>
                    {alert.location && alert.location !== "N/A" && (
                        <p className="flex items-center gap-1.5 text-[11px] text-slate-400 ui-num mt-0.5">
                            <MapPin size={12} /> {alert.location}
                        </p>
                    )}
                </div>
            </div>
            <span className={`ui-badge ${isEmergency ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                <StatusDot tone={isEmergency ? "rose" : "emerald"} staticDot />
                {alert.status}
            </span>
        </div>
    );
}

function Alerts() {
    const [active, setActive] = useState([]);
    const [history, setHistory] = useState([]);
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
                const [activeRes, historyRes] = await Promise.all([
                    fetchActiveEmergencies(),
                    fetchEmergencyHistory({ limit: 50 }),
                ]);
                if (isMounted) {
                    setActive(Array.isArray(activeRes?.data) ? activeRes.data : []);
                    setHistory(Array.isArray(historyRes?.data) ? historyRes.data : []);
                }
            } catch (err) {
                console.error("Failed to load alerts:", err);
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

    const socketAlerts = useMemo(() => {
        const list = [];
        if (realtime.emergency?.emergency) {
            const e = realtime.emergency.emergency;
            list.push({
                id: e.emergency_id,
                type: e.event_type || "EMERGENCY",
                time: e.detected_at || e.created_at || realtime.lastUpdated,
                status: "ACTIVE",
                location:
                    e.latitude != null && e.longitude != null
                        ? `${Number(e.latitude).toFixed(4)}, ${Number(e.longitude).toFixed(4)}`
                        : "N/A",
                severity: "emergency",
            });
        }
        return list;
    }, [realtime]);

    const activeAlerts = useMemo(
        () =>
            active.map((event) => ({
                id: event.id,
                type: event.event_type || "EMERGENCY",
                time: event.created_at,
                status: event.status || "ACTIVE",
                location:
                    event.latitude != null && event.longitude != null
                        ? `${Number(event.latitude).toFixed(4)}, ${Number(event.longitude).toFixed(4)}`
                        : "N/A",
                severity: "emergency",
            })),
        [active]
    );

    const alerts = useMemo(() => {
        const seen = new Set();
        const list = [];
        [...socketAlerts, ...activeAlerts].forEach((alert) => {
            const key = alert.id || `${alert.type}-${alert.time}`;
            if (seen.has(key)) {
                return;
            }
            seen.add(key);
            list.push(alert);
        });
        return list;
    }, [socketAlerts, activeAlerts]);

    const historyAlerts = useMemo(
        () =>
            history.map((event) => ({
                id: `history-${event.id}`,
                type: event.event_type || "EMERGENCY",
                time: event.created_at,
                status: event.status || "Resolved",
                location:
                    event.latitude != null && event.longitude != null
                        ? `${Number(event.latitude).toFixed(4)}, ${Number(event.longitude).toFixed(4)}`
                        : "N/A",
                severity: event.status === "active" ? "emergency" : "info",
            })),
        [history]
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Alerts</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Real-time emergency notifications and event history
                    </p>
                </div>
                <span className="ui-badge bg-white text-slate-600 border-slate-200 shadow-sm">
                    <Radio size={13} />
                    {apiStatus === "connected" ? "API Connected" : "API Disconnected"}
                </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <span className={`ui-badge ${realtime.connected ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                    <StatusDot tone={realtime.connected ? "emerald" : "rose"} />
                    {realtime.connected ? "Live Alerts" : "Live Alerts Disconnected"}
                </span>
            </div>

            {error && !loading && (
                <div className="ui-card p-5 flex items-center gap-3 bg-rose-50/60 border-rose-200 text-rose-700">
                    <XCircle size={20} />
                    <span className="text-sm font-semibold">Failed to load alerts from the server.</span>
                </div>
            )}

            {loading ? (
                <div className="ui-card p-5 md:p-6">
                    <RowsSkeleton count={4} columns={3} />
                </div>
            ) : (
                <>
                    <div className={`ui-card p-5 md:p-6 ${flash ? "ui-flash" : ""}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                <Bell size={20} />
                            </div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Active Alerts</h2>
                            <span className="ui-badge bg-slate-100 text-slate-600 border-slate-200 ui-num ml-auto">
                                {alerts.length}
                            </span>
                        </div>
                        {alerts.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm font-medium">
                                No active alerts
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {alerts.map((alert) => (
                                    <AlertItem key={alert.id} alert={alert} />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="ui-card p-5 md:p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                                <Clock size={20} />
                            </div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Alert History</h2>
                            <span className="ui-badge bg-slate-100 text-slate-600 border-slate-200 ui-num ml-auto">
                                {historyAlerts.length}
                            </span>
                        </div>
                        {historyAlerts.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm font-medium">
                                No alert history found
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {historyAlerts.map((alert) => (
                                    <AlertItem key={alert.id} alert={alert} />
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default Alerts;
