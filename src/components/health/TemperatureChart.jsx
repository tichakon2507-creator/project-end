import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Thermometer } from "lucide-react";

const axisTick = { fill: "#8E96B8", fontSize: 11 };
const tooltipStyle = {
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(19,22,38,0.95)",
    fontSize: 12,
    color: "#F8FAFC",
};

function TemperatureChart({ data = [] }) {
    return (
        <div className="ui-card p-5 md:p-6 h-full min-h-[320px] flex flex-col">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                    <div className="ui-gradient-icon w-10 h-10 shrink-0">
                        <Thermometer size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-white">Temperature Trend</h2>
                        <p className="text-xs text-[var(--midnight-muted)]">Body temperature records</p>
                    </div>
                </div>
            </div>
            <div className="flex-1 min-h-0 w-full">
                {data.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-3 text-[var(--midnight-muted)]">
                        <Thermometer size={34} strokeWidth={1.5} />
                        <p className="text-sm font-medium">Waiting for temperature records</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                            <defs>
                                <linearGradient id="temperatureFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.06)" vertical={false} />
                            <XAxis dataKey="time" tick={axisTick} tickLine={false} axisLine={false} minTickGap={24} />
                            <YAxis tick={axisTick} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Area type="monotone" dataKey="temp" name="Temperature" stroke="#a78bfa" fill="url(#temperatureFill)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

export default TemperatureChart;
