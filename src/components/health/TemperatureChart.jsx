import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

const data = [
    { time: "08:00", temp: 36.3 },
    { time: "09:00", temp: 36.4 },
    { time: "10:00", temp: 36.5 },
    { time: "11:00", temp: 36.6 },
    { time: "12:00", temp: 36.7 },
    { time: "13:00", temp: 36.8 },
    { time: "14:00", temp: 36.9 },
    { time: "15:00", temp: 36.8 },
    { time: "16:00", temp: 36.7 },
];

function TemperatureChart() {

    return (

        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 h-[400px]">

            <div className="flex justify-between items-center mb-6">

                <div>

                    <h2 className="text-2xl font-bold">

                        Temperature Trend

                    </h2>

                    <p className="text-slate-500">

                        Body Temperature Throughout The Day

                    </p>

                </div>

                <span className="bg-orange-100 text-orange-600 px-4 py-2 rounded-xl font-semibold">

                    36.8 °C

                </span>

            </div>

            <ResponsiveContainer width="100%" height="82%">

                <AreaChart data={data}>

                    <CartesianGrid strokeDasharray="5 5" />

                    <XAxis dataKey="time" />

                    <YAxis domain={[35.5, 37.5]} />

                    <Tooltip />

                    <Area
                        type="monotone"
                        dataKey="temp"
                        stroke="#f59e0b"
                        fill="#fde68a"
                        strokeWidth={4}
                    />

                </AreaChart>

            </ResponsiveContainer>

        </div>

    );

}

export default TemperatureChart;