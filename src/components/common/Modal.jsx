import { useEffect } from "react";
import { X } from "lucide-react";

import { Spinner } from "./Ui";

export default function Modal({
    open = false,
    onClose = () => {},
    icon: Icon = null,
    iconTone = "violet",
    title = "",
    description = "",
    children = null,
    actions = [],
}) {
    useEffect(() => {
        if (!open) {
            return undefined;
        }
        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    const iconClass =
        iconTone === "rose"
            ? "ui-modal-icon !border-rose-400/40 !bg-rose-500/15 !text-rose-300"
            : iconTone === "emerald"
                ? "ui-modal-icon !border-emerald-400/40 !bg-emerald-500/15 !text-emerald-300"
                : iconTone === "amber"
                    ? "ui-modal-icon !border-amber-400/40 !bg-amber-500/15 !text-amber-300"
                    : "ui-modal-icon";

    return (
        <div
            className="ui-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="ui-modal w-full max-w-md rounded-2xl border border-white/15 bg-[#131626]/95 shadow-[0_24px_60px_rgba(0,0,0,0.75)] backdrop-blur-xl"
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="ปิดหน้าต่าง"
                    className="ui-btn ui-press absolute right-4 top-4 h-9 w-9 border border-white/10 bg-white/5 text-[var(--midnight-muted)] hover:bg-white/10 hover:text-white"
                >
                    <X size={17} />
                </button>

                <div className="flex items-start gap-4 pr-10">
                    {Icon ? (
                        <div className={iconClass}>
                            <Icon size={22} strokeWidth={1.8} />
                        </div>
                    ) : null}
                    <div className="min-w-0">
                        {title ? (
                            <h2 className="text-xl font-bold leading-relaxed text-white">
                                {title}
                            </h2>
                        ) : null}
                        {description ? (
                            <p className="mt-1.5 text-sm leading-relaxed text-[var(--midnight-muted)]">
                                {description}
                            </p>
                        ) : null}
                    </div>
                </div>

                {children ? (
                    <div className="mt-5 text-left text-sm leading-relaxed text-[var(--midnight-muted)]">
                        {children}
                    </div>
                ) : null}

                {actions.length > 0 ? (
                    <div className="ui-modal-actions mt-6 border-t border-white/10 pt-4">
                        {actions.map((action, index) => {
                            const isPrimary = action.primary ?? index === 0;
                            return (
                                <button
                                    key={action.label || index}
                                    type="button"
                                    disabled={action.disabled}
                                    onClick={action.onClick}
                                    className={`ui-modal-button ${
                                        action.danger ? "ui-modal-button-danger" : ""
                                    } ${isPrimary && !action.danger ? "ui-gradient text-white" : ""}`}
                                >
                                    {action.loading ? <Spinner className="h-4 w-4" /> : null}
                                    {action.icon && !action.loading ? (
                                        <action.icon size={16} />
                                    ) : null}
                                    {action.label}
                                </button>
                            );
                        })}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
