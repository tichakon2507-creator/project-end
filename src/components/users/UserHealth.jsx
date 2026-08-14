import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
} from "recharts";

const data = [
    { day: "Mon", heart: 78, spo2: 98, temp: 36.6 },
    { day: "Tue", heart: 80, spo2: 99, temp: 36.7 },
    { day: "Wed", heart: 82, spo2: 98, temp: 36.8 },
    { day: "Thu", heart: 79, spo2: 99, temp: 36.7 },
    { day: "Fri", heart: 84, spo2: 97, temp: 36.9 },
    { day: "Sat", heart: 81, spo2: 98, temp: 36.8 },
    { day: "Sun", heart: 82, spo2: 98, temp: 36.8 },
];

function UserHealth() {

    return (

        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 h-[520px]">

            <div className="flex justify-between items-center mb-6">

                <div>

                    <h2 className="text-2xl font-bold text-slate-800">

                        Health Analytics

                    </h2>

                    <p className="text-slate-500 mt-1">

                        Weekly Health Statistics

                    </p>

                </div>

                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-semibold">

                    Healthy

                </div>

            </div>

            <ResponsiveContainer width="100%" height="72%">

                <LineChart data={data}>

                    <CartesianGrid
                        strokeDasharray="4 4"
                        stroke="#e5e7eb"
                    />

                    <XAxis dataKey="day" />

                    <YAxis />

                    <Tooltip />

                    <Legend />

                    <Line
                        type="monotone"
                        dataKey="heart"
                        name="Heart Rate"
                        stroke="#ef4444"
                        strokeWidth={3}
                    />

                    <Line
                        type="monotone"
                        dataKey="spo2"
                        name="SpO₂"
                        stroke="#2563eb"
                        strokeWidth={3}
                    />

                    <Line
                        type="monotone"
                        dataKey="temp"
                        name="Temperature"
                        stroke="#f59e0b"
                        strokeWidth={3}
                    />

                </LineChart>

            </ResponsiveContainer>

            <div className="grid grid-cols-3 gap-4 mt-6">

                <div className="bg-red-50 rounded-2xl p-4 text-center">

                    <p className="text-slate-500 text-sm">

                        Avg Heart Rate

                    </p>

                    <h3 className="text-2xl font-bold text-red-500 mt-2">

                        81 BPM

                    </h3>

                </div>

                <div className="bg-blue-50 rounded-2xl p-4 text-center">

                    <p className="text-slate-500 text-sm">

                        Avg SpO₂

                    </p>

                    <h3 className="text-2xl font-bold text-blue-600 mt-2">

                        98%

                    </h3>

                </div>

                <div className="bg-orange-50 rounded-2xl p-4 text-center">

                    <p className="text-slate-500 text-sm">

                        Avg Temp

                    </p>

                    <h3 className="text-2xl font-bold text-orange-500 mt-2">

                        36.8°C

                    </h3>

                </div>

            </div>

        </div>

    );

}

export default UserHealth;