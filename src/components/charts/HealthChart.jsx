import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const data = [
    { time: "08:00", heart: 72 },
    { time: "09:00", heart: 75 },
    { time: "10:00", heart: 78 },
    { time: "11:00", heart: 80 },
    { time: "12:00", heart: 82 },
    { time: "13:00", heart: 79 },
    { time: "14:00", heart: 84 },
    { time: "15:00", heart: 81 },
];

function HealthChart() {
    return (
        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 h-[500px]">

            <div className="flex justify-between items-center mb-6">

                <div>

                    <h2 className="text-2xl font-bold text-slate-800">
                        Health Analytics
                    </h2>

                    <p className="text-slate-500 mt-1">
                        Realtime Heart Rate Monitoring
                    </p>

                </div>

                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-semibold">
                    Live
                </div>

            </div>

            <ResponsiveContainer width="100%" height="82%">

                <LineChart data={data}>

                    <CartesianGrid
                        strokeDasharray="4 4"
                        stroke="#e5e7eb"
                    />

                    <XAxis
                        dataKey="time"
                        tick={{ fill: "#64748b" }}
                    />

                    <YAxis
                        tick={{ fill: "#64748b" }}
                    />

                    <Tooltip />

                    <Line
                        type="monotone"
                        dataKey="heart"
                        stroke="#ef4444"
                        strokeWidth={4}
                        dot={{
                            r: 5,
                        }}
                        activeDot={{
                            r: 8,
                        }}
                    />

                </LineChart>

            </ResponsiveContainer>

        </div>
    );
}

export default HealthChart;