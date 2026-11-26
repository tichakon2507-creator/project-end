import { CircleUserRound, Cpu, LogOut, Menu, Radio } from "lucide-react";

import { StatusDot } from "../common/Ui";
import { useApiStatus } from "../../hooks/useApiStatus";
import { useRealtime } from "../../hooks/useRealtime";
import { useAuth } from "../../context/authStore";

function Navbar({ onMenuClick = () => {} }) {
    const apiStatus = useApiStatus();
    const { connected: socketConnected } = useRealtime();
    const { user, logout } = useAuth();
    const apiOnline = apiStatus === "connected";
    const displayName = user?.name || user?.username || "ผู้ใช้งาน";
    const displayRole = String(user?.role || "user").toUpperCase();

    return (
        <header className="sticky top-0 z-20 h-20 bg-[#0a0b14]/85 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 min-w-0">
                <button
                    type="button"
                    aria-label="Open navigation"
                    onClick={onMenuClick}
                    className="ui-btn ui-press w-10 h-10 shrink-0 text-[var(--midnight-muted)] bg-white/5 hover:bg-white/10"
                >
                    <Menu size={20} />
                </button>
                <div className="min-w-0">
                    <h1 className="text-lg sm:text-2xl font-bold text-white truncate">
                        Smart Health Dashboard
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--midnight-muted)] truncate">
                        Smart Health &amp; Emergency Monitoring System
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                <span className="ui-status-pill">
                    <StatusDot tone={apiOnline ? "emerald" : "rose"} />
                    <span className="hidden sm:inline">API Connected</span>
                    <span className="sm:hidden">API</span>
                </span>
                <span className="ui-status-pill">
                    <StatusDot tone={socketConnected ? "emerald" : "rose"} />
                    <Cpu size={13} />
                    <span className="hidden sm:inline">Real-Time</span>
                    <span className="sm:hidden">Socket</span>
                </span>

                <div className="hidden md:flex items-center gap-3 pl-3 border-l border-white/10">
                    <div className="ui-gradient-icon w-10 h-10">
                        <CircleUserRound size={24} />
                    </div>
                    <div className="min-w-0">
                        <p className="max-w-[150px] truncate text-sm font-semibold text-white" title={displayName}>
                            {displayName}
                        </p>
                        <p className="text-xs text-emerald-300 flex items-center gap-1.5">
                            <Radio size={11} /> {displayRole}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={logout}
                        title="ออกจากระบบ"
                        aria-label="ออกจากระบบ"
                        className="ui-btn ui-press h-9 w-9 border border-white/10 bg-white/5 text-[var(--midnight-muted)] hover:bg-rose-500/15 hover:text-rose-200"
                    >
                        <LogOut size={17} />
                    </button>
                </div>

                <button
                    type="button"
                    onClick={logout}
                    title="ออกจากระบบ"
                    aria-label="ออกจากระบบ"
                    className="ui-btn ui-press h-10 w-10 text-[var(--midnight-muted)] hover:bg-rose-500/15 hover:text-rose-200 md:hidden"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </header>
    );
}

export default Navbar;
