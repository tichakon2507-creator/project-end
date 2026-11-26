import {
    Activity,
    CircleUserRound,
    Cpu,
    HeartPulse,
    History,
    LayoutDashboard,
    LogOut,
    MapPinned,
    Settings,
    ShieldCheck,
    X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { StatusDot } from "../common/Ui";
import { useApiStatus } from "../../hooks/useApiStatus";
import { useRealtime } from "../../hooks/useRealtime";
import { useAuth } from "../../context/authStore";

const menus = [
    { title: "แดชบอร์ด", path: "/", icon: LayoutDashboard },
    { title: "สุขภาพ", path: "/health", icon: HeartPulse },
    { title: "แจ้งเตือนฉุกเฉิน", path: "/emergency", icon: ShieldCheck },
    { title: "ตำแหน่งผู้ป่วย", path: "/location", icon: MapPinned },
    { title: "อุปกรณ์ของฉัน", path: "/device", icon: Cpu },
    { title: "ประวัติและรายงาน", path: "/history", icon: History },
    { title: "ตั้งค่าผู้ใช้", path: "/settings", icon: Settings },
];

function Sidebar({ open = false, onClose = () => {} }) {
    const apiStatus = useApiStatus();
    const { connected: socketConnected } = useRealtime();
    const { user, logout } = useAuth();
    const online = apiStatus === "connected" && socketConnected;
    const displayName = user?.name || user?.username || "ผู้ใช้งาน";
    const displayRole = String(user?.role || "user").toUpperCase();

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 w-72 flex flex-col bg-[#0d0f1d] text-white shadow-2xl transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
                open ? "translate-x-0" : "-translate-x-full"
            }`}
        >
            <div className="flex items-center justify-between gap-3 px-6 py-7 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="ui-gradient-icon w-11 h-11">
                        <Activity size={24} strokeWidth={2.2} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight ui-num">SHEM</h1>
                        <p className="text-[11px] text-[var(--midnight-muted)] mt-0.5">
                            Smart Health &amp; Emergency
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={onClose}
                    className="ui-btn ui-press w-9 h-9 text-slate-300 hover:text-white hover:bg-white/10 lg:hidden"
                >
                    <X size={18} />
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-5 py-5 space-y-1">
                <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--midnight-muted)]">
                    Monitoring
                </p>
                {menus.map((menu) => {
                    const Icon = menu.icon;
                    return (
                        <NavLink
                            key={menu.path}
                            to={menu.path}
                            end={menu.path === "/"}
                            className={({ isActive }) =>
                                `ui-nav-item ui-press text-sm rounded-full px-4 py-1.5 ${
                                    isActive
                                        ? "ui-nav-active bg-white/10 text-white font-medium"
                                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                                }`
                            }
                        >
                            <Icon size={19} strokeWidth={2} />
                            <span className="flex-1">{menu.title}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="px-5 py-5 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-xs text-[var(--midnight-muted)]">
                        <Cpu size={14} /> Device
                    </span>
                    <span className="ui-status-pill">
                        <StatusDot tone={socketConnected ? "emerald" : "rose"} />
                        {socketConnected ? "Online" : "Offline"}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-xs text-[var(--midnight-muted)]">
                        <Activity size={14} /> API / MQTT
                    </span>
                    <span className="ui-status-pill">
                        <StatusDot tone={online ? "emerald" : "rose"} />
                        {online ? "Connected" : "Disconnected"}
                    </span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="ui-gradient-icon h-9 w-9 shrink-0">
                        <CircleUserRound size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white" title={displayName}>
                            {displayName}
                        </p>
                        <p className="text-[11px] text-[var(--midnight-muted)]">{displayRole}</p>
                    </div>
                    <button
                        type="button"
                        onClick={logout}
                        title="ออกจากระบบ"
                        aria-label="ออกจากระบบ"
                        className="ui-btn ui-press h-8 w-8 text-[var(--midnight-muted)] hover:bg-rose-500/15 hover:text-rose-200"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--midnight-muted)] pt-1 border-t border-white/5">
                    <span>Version</span>
                    <span className="ui-num">v1.0.0</span>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
