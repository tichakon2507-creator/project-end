import { Skeleton, StatusDot } from "../common/Ui";

function HealthCard({
    title,
    value,
    unit,
    icon,
    status = "Normal",
    percent = 0,
    caption = "",
    flash = false,
    loading = false,
}) {
    const normal = String(status).toLowerCase() === "healthy" || String(status).toLowerCase() === "charging";
    const width = Math.max(0, Math.min(100, Number(percent) || 0));

    return (
        <div className={`ui-card-hover p-5 md:p-6 h-full ${flash ? "ui-flash" : ""}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-[var(--midnight-muted)] truncate">
                        {title}
                    </p>
                    {loading ? (
                        <Skeleton className="h-11 w-24 mt-4" />
                    ) : (
                        <h2 className="ui-gradient-text text-4xl sm:text-5xl font-bold ui-num mt-4 leading-none">
                            {value}
                        </h2>
                    )}
                    <p className="text-sm text-[var(--midnight-muted)] mt-2">{unit}</p>
                </div>
                <div className="ui-gradient-icon w-14 h-14 shrink-0 text-2xl">
                    {icon}
                </div>
            </div>

            <div className="mt-6">
                <div className="ui-track">
                    <div className="ui-gradient-bar" style={{ width: `${width}%` }} />
                </div>
                <div className="flex items-center justify-between gap-3 mt-2">
                    <span className="text-[11px] text-[var(--midnight-muted)]">{caption}</span>
                    <span className={`ui-badge ${
                        normal
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/25"
                            : "bg-amber-500/15 text-amber-300 border-amber-400/25"
                    }`}>
                        {status}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1.5 mt-3 text-[11px] font-semibold text-emerald-300">
                <StatusDot /> Live
            </div>
        </div>
    );
}

export default HealthCard;
