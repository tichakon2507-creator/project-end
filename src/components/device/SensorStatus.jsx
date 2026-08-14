import {
    FaHeartbeat,
    FaTemperatureHigh,
    FaTint,
    FaLungs,
    FaMapMarkerAlt,
    FaCheckCircle,
} from "react-icons/fa";

const sensors = [
    {
        name: "Heart Rate Sensor",
        value: "82 BPM",
        status: "Online",
        color: "text-red-500",
        bg: "bg-red-100",
        icon: <FaHeartbeat />,
    },
    {
        name: "Temperature Sensor",
        value: "36.8 °C",
        status: "Online",
        color: "text-orange-500",
        bg: "bg-orange-100",
        icon: <FaTemperatureHigh />,
    },
    {
        name: "SpO₂ Sensor",
        value: "98 %",
        status: "Online",
        color: "text-blue-500",
        bg: "bg-blue-100",
        icon: <FaLungs />,
    },
    {
        name: "Blood Pressure",
        value: "120 / 80",
        status: "Online",
        color: "text-pink-500",
        bg: "bg-pink-100",
        icon: <FaTint />,
    },
    {
        name: "GPS Module",
        value: "18.7883, 98.9853",
        status: "Online",
        color: "text-green-600",
        bg: "bg-green-100",
        icon: <FaMapMarkerAlt />,
    },
];

function SensorStatus() {

    return (

        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 h-[520px]">

            <div className="mb-6">

                <h2 className="text-2xl font-bold text-slate-800">

                    Sensor Status

                </h2>

                <p className="text-slate-500 mt-1">

                    Realtime Sensor Information

                </p>

            </div>

            <div className="space-y-4">

                {sensors.map((sensor, index) => (

                    <div
                        key={index}
                        className="flex justify-between items-center bg-slate-50 rounded-2xl p-4"
                    >

                        <div className="flex items-center gap-4">

                            <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${sensor.bg} ${sensor.color}`}
                            >

                                {sensor.icon}

                            </div>

                            <div>

                                <h3 className="font-semibold text-slate-800">

                                    {sensor.name}

                                </h3>

                                <p className="text-sm text-slate-500">

                                    {sensor.value}

                                </p>

                            </div>

                        </div>

                        <div className="flex items-center gap-2 text-green-600 font-semibold">

                            <FaCheckCircle />

                            {sensor.status}

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default SensorStatus;