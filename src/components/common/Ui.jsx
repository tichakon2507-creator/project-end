export { default as Modal } from "./Modal";

export const FIELD_INPUT_CLASS = "ui-field-input";

export function IconField({ icon: Icon, children, className = "" }) {
    return (
        <div className={`ui-input-shell ${className}`}>
            {Icon ? (
                <Icon
                    size={17}
                    className="shrink-0 text-[var(--midnight-muted)]"
                    aria-hidden="true"
                />
            ) : null}
            {children}
        </div>
    );
}

export function Spinner({ className = "w-4 h-4" }) {
    return (
        <svg
            className={`ui-spinner ${className}`}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="3"
                opacity="0.25"
            />
            <path
                d="M21 12a9 9 0 0 0-9-9"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    );
}

const dotTones = {
    emerald: { ping: "bg-emerald-400", core: "bg-emerald-500" },
    rose: { ping: "bg-rose-400", core: "bg-rose-500" },
    amber: { ping: "bg-amber-400", core: "bg-amber-500" },
    sky: { ping: "bg-sky-400", core: "bg-sky-500" },
    slate: { ping: "bg-slate-300", core: "bg-slate-400" },
};

export function StatusDot({ tone = "emerald", staticDot = false, className = "" }) {
    const colors = dotTones[tone] || dotTones.slate;
    if (staticDot) {
        return (
            <span
                className={`inline-block w-2 h-2 rounded-full shrink-0 ${colors.core} ${className}`}
            />
        );
    }
    return (
        <span className={`ui-live-dot ${className}`} aria-hidden="true">
            <span className={colors.ping} />
            <span className={colors.core} />
        </span>
    );
}

export function Skeleton({ className = "", ...props }) {
    return <div className={`ui-skeleton ${className}`} aria-hidden="true" {...props} />;
}

export function SkeletonText({ width = "w-24" }) {
    return <Skeleton className={`h-3 ${width}`} />;
}

export function StatSkeleton({ count = 4 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="ui-card ui-lift p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3 flex-1">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-9 w-28" />
                        </div>
                        <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                    </div>
                    <Skeleton className="h-2 w-full mt-6" />
                </div>
            ))}
        </div>
    );
}

export function RowsSkeleton({ count = 5, columns = 4 }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, row) => (
                <div
                    key={row}
                    className="grid gap-4 items-center py-3 border-b border-slate-100"
                    style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                >
                    {Array.from({ length: columns }).map((_, column) => (
                        <Skeleton key={column} className="h-3 w-full" />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="flex items-end gap-2 h-56 w-full px-2 pt-8">
            {[35, 58, 44, 72, 52, 84, 64, 90, 70, 78, 60, 86].map((height, index) => (
                <Skeleton
                    key={index}
                    className="flex-1 rounded-t-md"
                    style={{ height: `${height}%` }}
                />
            ))}
        </div>
    );
}
