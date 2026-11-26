import { useEffect, useMemo, useState } from "react";
import { Activity, Database, Radio, TriangleAlert, XCircle } from "lucide-react";

import LiveMap from "../components/location/LiveMap";
import GPSCard from "../components/location/GPSCard";
import RouteInfo from "../components/location/RouteInfo";
import LocationHistory from "../components/location/LocationHistory";
import { StatSkeleton, StatusDot } from "../components/common/Ui";

import { useFlash, useRealtime } from "../hooks/useRealtime";
import { useApiStatus } from "../hooks/useApiStatus";
import { fetchLatestLocations, fetchLocationHistory } from "../services/api";
import { formatCoordinates, formatDateTime, formatTime } from "../utils/format";

function Location() {
    const [locations, setLocations] = useState([]);
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
                const [locationsRes, historyRes] = await Promise.all([
                    fetchLatestLocations(),
                    fetchLocationHistory({ limit: 100 }),
                ]);
                if (isMounted) {
                    setLocations(Array.isArray(locationsRes?.data) ? locationsRes.data : []);
                    setHistory(Array.isArray(historyRes?.data) ? historyRes.data : []);
                }
            } catch (err) {
                console.error("Failed to load location data:", err);
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

    const socketLocation = realtime.location;

    const latest = useMemo(() => {
        if (socketLocation && socketLocation.latitude != null && socketLocation.longitude != null) {
            return socketLocation;
        }
        return locations[0] || null;
    }, [socketLocation, locations]);

    const hasLocation = latest != null;

    const historyRows = useMemo(
        () =>
            history
                .slice()
                .reverse()
                .map((record) => ({
                    id: record.id,
                    date: formatDateTime(record.recorded_at),
                    time: formatTime(record.recorded_at),
                    latitude: record.latitude,
                    longitude: record.longitude,
                    speed: "N/A",
                    status: "Moving",
                })),
        [history]
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">GPS Tracking</h1>
                    <p className="text-sm text-slate-500 mt-1">Live location of the monitored device</p>
                </div>
                <span className="flex flex-wrap items-center gap-2">
                    <span className={`ui-badge ${realtime.connected ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                        <StatusDot tone={realtime.connected ? "emerald" : "rose"} />
                        Socket.IO
                    </span>
                    <span className={`ui-badge ${apiStatus === "connected" ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                        <Database size={12} /> API
                    </span>
                </span>
            </div>

            {loading ? (
                <StatSkeleton count={4} />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                    <GPSCard
                        title="Latitude"
                        value={hasLocation ? Number(latest.latitude).toFixed(4) : "N/A"}
                        color="#2563eb"
                        lastUpdate={latest?.recorded_at || null}
                        flash={flash}
                    />
                    <GPSCard
                        title="Longitude"
                        value={hasLocation ? Number(latest.longitude).toFixed(4) : "N/A"}
                        color="#16a34a"
                        lastUpdate={latest?.recorded_at || null}
                        flash={flash}
                    />
                    <GPSCard title="Speed" value="N/A" color="#f59e0b" flash={flash} />
                    <GPSCard title="Accuracy" value="N/A" color="#e11d48" flash={flash} />
                </div>
            )}

            {error && !loading && (
                <div className="ui-card p-5 flex items-center gap-3 bg-rose-50/60 border-rose-200 text-rose-700">
                    <XCircle size={20} />
                    <span className="text-sm font-semibold">Failed to load location data from the server.</span>
                </div>
            )}

            {!error && !loading && !hasLocation && (
                <div className="ui-card p-5 flex items-center gap-3 bg-amber-50/60 border-amber-200 text-amber-700">
                    <TriangleAlert size={20} />
                    <span className="text-sm font-medium">No location data available yet. Waiting for GPS signal...</span>
                </div>
            )}

            <LiveMap
                center={
                    hasLocation
                        ? { lat: Number(latest.latitude), lng: Number(latest.longitude) }
                        : null
                }
                history={historyRows}
            />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6">
                <div className="xl:col-span-4">
                    <RouteInfo
                        current={hasLocation ? formatCoordinates(latest.latitude, latest.longitude) : "N/A"}
                        updated={latest?.recorded_at ? formatDateTime(latest.recorded_at) : "N/A"}
                    />
                </div>
                <div className="xl:col-span-8">
                    <LocationHistory rows={historyRows} loading={loading} emptyMessage="No location history found." />
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5"><Radio size={12} /> Socket.IO: {realtime.connected ? "Connected" : "Disconnected"}</span>
                <span className="flex items-center gap-1.5"><Activity size={12} /> API: {apiStatus === "connected" ? "Connected" : "Disconnected"}</span>
            </div>
        </div>
    );
}

export default Location;
