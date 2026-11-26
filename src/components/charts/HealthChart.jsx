import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Activity, ChartNoAxesCombined } from "lucide-react";

import { ChartSkeleton, StatusDot } from "../common/Ui";

const axisTick = { fill: "#8E96B8", fontSize: 11 };
const tooltipStyle = {
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(19,22,38,0.95)",
    boxShadow: "0 10px 30px -12px rgba(0,0,0,0.8)",
    fontSize: 12,
    color: "#F8FAFC",
};

function HealthChart({ data = [], loading = false }) {
    return (
        <div className="ui-card p-5 md:p-6 flex flex-col h-full min-h-[360px]">
            <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                    <div className="ui-gradient-icon w-10 h-10 shrink-0">
                        <ChartNoAxesCombined size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-white">
                            Health Analytics
                        </h2>
                        <p className="text-xs sm:text-sm text-[var(--midnight-muted)]">
                            Recent heart rate and oxygen saturation trend
                        </p>
                    </div>
                </div>
                <span className="ui-badge bg-cyan-500/15 text-cyan-300 border-cyan-400/25">
                    <StatusDot tone="emerald" />
                    Live
                </span>
            </div>

            <div className="flex-1 min-h-0 w-full">
                {loading ? (
                    <ChartSkeleton />
                ) : data.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-3 text-[var(--midnight-muted)]">
                        <Activity size={36} strokeWidth={1.5} />
                        <p className="text-sm font-medium">Waiting for health records</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.06)" vertical={false} />
                            <XAxis
                                dataKey="time"
                                tick={axisTick}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={24}
                            />
                            <YAxis
                                tick={axisTick}
                                tickLine={false}
                                axisLine={false}
                                domain={["auto", "auto"]}
                            />
                            <Tooltip
                                contentStyle={tooltipStyle}
                                labelStyle={{ color: "#8E96B8" }}
                                itemStyle={{ color: "#F8FAFC" }}
                            />
                            <Legend wrapperStyle={{ fontSize: 11, color: "#8E96B8" }} />
                            <Line
                                type="monotone"
                                dataKey="heart"
                                name="Heart Rate"
                                stroke="#22d3ee"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, fill: "#22d3ee", stroke: "#0A0B14", strokeWidth: 2 }}
                                connectNulls
                                isAnimationActive
                            />
                            <Line
                                type="monotone"
                                dataKey="spo2"
                                name="SpO2"
                                stroke="#a78bfa"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, fill: "#a78bfa", stroke: "#0A0B14", strokeWidth: 2 }}
                                connectNulls
                                isAnimationActive
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

export default HealthChart;
