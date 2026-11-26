import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Clock, MapPin, RefreshCw, ServerCrash, ShieldAlert, WifiOff } from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import ServerStatus from "../components/layout/ServerStatus";
import Modal from "../components/common/Modal";

import { useApiStatus } from "../hooks/useApiStatus";
import { useRealtime } from "../hooks/useRealtime";
import { formatCoordinates, formatDateTime } from "../utils/format";

function MainLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [offlineOpen, setOfflineOpen] = useState(false);
    const [alertEvent, setAlertEvent] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const previousStatus = useRef("checking");
    const lastAlertEvent = useRef(null);

    const { status: apiStatus, refresh } = useApiStatus({ withRefresh: true });
    const realtime = useRealtime();

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (apiStatus === "disconnected" && previousStatus.current !== "disconnected") {
            setOfflineOpen(true);
        }
        previousStatus.current = apiStatus;
    }, [apiStatus]);

    const socketEvent = realtime.emergency?.emergency || null;

    useEffect(() => {
        if (!socketEvent) {
            return;
        }
        if (lastAlertEvent.current === socketEvent) {
            return;
        }
        lastAlertEvent.current = socketEvent;
        setAlertEvent({ ...socketEvent });
    }, [socketEvent]);

    const alertLocation =
        alertEvent?.latitude != null && alertEvent?.longitude != null
            ? formatCoordinates(alertEvent.latitude, alertEvent.longitude)
            : null;
    const alertTime =
        alertEvent?.detected_at ||
        alertEvent?.created_at ||
        realtime.lastUpdated;

    return (
        <div className="flex min-h-screen bg-[var(--midnight-bg)] text-[var(--midnight-ink)]">
            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-[#05060c]/70 backdrop-blur-sm ui-dropdown lg:hidden"
                />
            )}

            <div className="flex-1 min-w-0 flex flex-col">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <ServerStatus />
                <main className="flex-1 min-w-0 overflow-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>

            <Modal
                open={Boolean(alertEvent)}
                onClose={() => setAlertEvent(null)}
                icon={ShieldAlert}
                iconTone="rose"
                title="Emergency Alert"
                description="An emergency event was received from the device."
                actions={[
                    {
                        label: "View Emergency",
                        icon: ShieldAlert,
                        onClick: () => {
                            navigate("/emergency");
                            setAlertEvent(null);
                        },
                    },
                    { label: "Dismiss", onClick: () => setAlertEvent(null) },
                ]}
            >
                <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-[var(--midnight-muted)]">Event</span>
                        <span className="font-semibold text-white">
                            {alertEvent?.event_type || alertEvent?.emergency_type || "EMERGENCY"}
                        </span>
                    </div>
                    {alertTime && (
                        <div className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-1.5 text-[var(--midnight-muted)]">
                                <Clock size={13} /> Time
                            </span>
                            <span className="font-semibold text-white ui-timer">
                                {formatDateTime(alertTime)}
                            </span>
                        </div>
                    )}
                    {alertLocation && (
                        <div className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-1.5 text-[var(--midnight-muted)]">
                                <MapPin size={13} /> Location
                            </span>
                            <span className="font-semibold text-white ui-num">
                                {alertLocation}
                            </span>
                        </div>
                    )}
                    {alertEvent?.description && (
                        <p className="border-t border-white/10 pt-3 text-sm text-[var(--midnight-muted)]">
                            {alertEvent.description}
                        </p>
                    )}
                </div>
            </Modal>

            <Modal
                open={offlineOpen}
                onClose={() => setOfflineOpen(false)}
                icon={apiStatus === "disconnected" ? WifiOff : ServerCrash}
                iconTone="rose"
                title="Server Connection Lost"
                description="The dashboard cannot reach the API server. Data shown on screen may be out of date."
                actions={[
                    {
                        label: "Retry Connection",
                        icon: RefreshCw,
                        onClick: () => {
                            refresh();
                            setOfflineOpen(false);
                        },
                    },
                    { label: "Dismiss", onClick: () => setOfflineOpen(false) },
                ]}
            >
                <p className="text-xs text-[var(--midnight-muted)] ui-timer">
                    Connection state: {apiStatus}
                </p>
            </Modal>
        </div>
    );
}

export default MainLayout;
