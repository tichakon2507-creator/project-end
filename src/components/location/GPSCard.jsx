import { Navigation, Radio } from "lucide-react";

import { formatDateTime } from "../../utils/format";

function GPSCard({ title, value, lastUpdate = null, flash = false }) {
    return (
        <div className={`ui-card-hover p-5 md:p-6 h-full ${flash ? "ui-flash" : ""}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-[var(--midnight-muted)] truncate">{title}</p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white ui-num mt-4 break-all leading-tight">
                        {value}
                    </h2>
                </div>
                <div className="ui-gradient-icon w-12 h-12 shrink-0">
                    <Navigation size={22} />
                </div>
            </div>
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="ui-track flex-1">
                    <div className="ui-gradient-bar w-full" />
                </div>
                <span className="flex items-center gap-1.5 text-[10px] text-[var(--midnight-muted)] ui-timer whitespace-nowrap">
                    <Radio size={11} />
                    {lastUpdate ? formatDateTime(lastUpdate) : "Live GPS"}
                </span>
            </div>
        </div>
    );
}

export default GPSCard;
