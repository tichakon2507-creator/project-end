import { Skeleton } from "../common/Ui";

function HealthOverviewCard({ title, value, unit, icon, flash = false, loading = false }) {
    return (
        <div className={`ui-card-hover p-5 h-full ${flash ? "ui-flash" : ""}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-[var(--midnight-muted)] truncate">{title}</p>
                    {loading ? (
                        <Skeleton className="h-10 w-20 mt-4" />
                    ) : (
                        <h2 className="ui-gradient-text text-3xl sm:text-4xl font-bold ui-num mt-4 leading-none">
                            {value}
                        </h2>
                    )}
                    <p className="text-xs text-[var(--midnight-muted)] mt-2">{unit}</p>
                </div>
                <div className="ui-gradient-icon w-12 h-12 shrink-0 text-xl">
                    {icon}
                </div>
            </div>
            <div className="mt-5 pt-4 border-t border-white/10">
                <div className="ui-track">
                    <div className="ui-gradient-bar w-full" />
                </div>
                <p className="text-[11px] text-[var(--midnight-muted)] mt-2">Live range</p>
            </div>
        </div>
    );
}

export default HealthOverviewCard;
