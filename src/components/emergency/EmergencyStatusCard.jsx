import { StatusDot } from "../common/Ui";

function EmergencyStatusCard({ title, value, icon: Icon, active = false, flash = false }) {
    return (
        <div className={`ui-card-hover p-5 md:p-6 h-full ${flash ? "ui-flash" : ""}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-[var(--midnight-muted)] truncate">{title}</p>
                    <h2 className="ui-gradient-text text-2xl sm:text-3xl font-bold ui-num mt-4 break-words leading-tight">
                        {value}
                    </h2>
                </div>
                <div className="ui-gradient-icon w-12 h-12 shrink-0 text-xl">
                    <Icon size={22} />
                </div>
            </div>
            <div className="mt-5 pt-4 border-t border-white/10">
                <span className={`ui-badge ${
                    active
                        ? "bg-rose-500/15 text-rose-300 border-rose-400/25"
                        : "bg-white/5 text-[var(--midnight-muted)] border-white/10"
                }`}>
                    <StatusDot tone={active ? "rose" : "slate"} staticDot={!active} />
                    {active ? "Active" : "Standby"}
                </span>
            </div>
        </div>
    );
}

export default EmergencyStatusCard;
