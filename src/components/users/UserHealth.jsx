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
import { Activity } from "lucide-react";

import { ChartSkeleton, StatusDot } from "../common/Ui";

const axisTick = { fill: "#8E96B8", fontSize: 11 };
const tooltipStyle = {
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(19,22,38,0.95)",
    fontSize: 12,
    color: "#F8FAFC",
};

function isHealthy(data) {
    if (!data || data.length === 0) {
        return false;
    }
    const heartAvg = data.reduce((sum, d) => sum + (d.heart || 0), 0) / data.length;
    const spo2Avg = data.reduce((sum, d) => sum + (d.spo2 || 0), 0) / data.length;
    const tempAvg = data.reduce((sum, d) => sum + (d.temp || 0), 0) / data.length;
    return (
        heartAvg >= 70 && heartAvg <= 100 &&
        spo2Avg >= 90 &&
        tempAvg >= 36 && tempAvg <= 37.5
    );
}

function avg(data, key) {
    if (!data || data.length === 0) {
        return "N/A";
    }
    const value = data.reduce((sum, d) => sum + (d[key] || 0), 0) / data.length;
    return Number.isFinite(value) ? value.toFixed(1) : "N/A";
}

function UserHealth({ data = [], loading = false }) {
    const healthy = isHealthy(data);

    return (
        <div className="ui-card p-5 md:p-6 h-full flex flex-col min-h-[480px]">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                    <div className="ui-gradient-icon w-10 h-10 shrink-0">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Health Analytics</h2>
                        <p className="text-xs text-slate-500">Weekly health statistics</p>
                    </div>
                </div>
                <span className={`ui-badge ${healthy ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                    <StatusDot tone={healthy ? "emerald" : "amber"} staticDot={!healthy} />
                    {data.length > 0 ? (healthy ? "Healthy" : "Warning") : "No Data"}
                </span>
            </div>

            <div className="flex-1 min-h-0 w-full">
                {loading ? (
                    <ChartSkeleton />
                ) : data.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
                        <Activity size={34} strokeWidth={1.5} />
                        <p className="text-sm font-medium">No health records for this user</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.06)" vertical={false} />
                            <XAxis dataKey="day" tick={axisTick} tickLine={false} axisLine={false} />
                            <YAxis tick={axisTick} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend wrapperStyle={{ fontSize: 11, color: "#8E96B8" }} />
                            <Line type="monotone" dataKey="heart" name="Heart Rate" stroke="#22d3ee" strokeWidth={2.5} dot={false} />
                            <Line type="monotone" dataKey="spo2" name="SpO2" stroke="#a78bfa" strokeWidth={2.5} dot={false} />
                            <Line type="monotone" dataKey="temp" name="Temperature" stroke="#fbbf24" strokeWidth={2.5} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                <div className="rounded-xl bg-rose-50 p-4 text-center">
                    <p className="text-xs text-slate-500">Avg Heart Rate</p>
                    <p className="text-xl font-bold text-rose-600 mt-1.5 ui-num">{avg(data, "heart")} BPM</p>
                </div>
                <div className="rounded-xl bg-sky-50 p-4 text-center">
                    <p className="text-xs text-slate-500">Avg SpO2</p>
                    <p className="text-xl font-bold text-sky-600 mt-1.5 ui-num">{avg(data, "spo2")} %</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-4 text-center">
                    <p className="text-xs text-slate-500">Avg Temp</p>
                    <p className="text-xl font-bold text-amber-600 mt-1.5 ui-num">{avg(data, "temp")} °C</p>
                </div>
            </div>
        </div>
    );
}

export default UserHealth;
