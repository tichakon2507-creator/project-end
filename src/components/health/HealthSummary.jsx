import {
    FaHeart,
    FaLungs,
    FaTemperatureHigh,
    FaWeight,
    FaWalking,
    FaBed,
} from "react-icons/fa";

const summary = [
    {
        title: "Heart Rate",
        value: "82 BPM",
        icon: <FaHeart />,
        color: "text-red-500",
        bg: "bg-red-100",
    },
    {
        title: "SpO₂",
        value: "98 %",
        icon: <FaLungs />,
        color: "text-blue-500",
        bg: "bg-blue-100",
    },
    {
        title: "Temperature",
        value: "36.8 °C",
        icon: <FaTemperatureHigh />,
        color: "text-orange-500",
        bg: "bg-orange-100",
    },
    {
        title: "Weight",
        value: "65 kg",
        icon: <FaWeight />,
        color: "text-green-600",
        bg: "bg-green-100",
    },
    {
        title: "Steps",
        value: "6,532",
        icon: <FaWalking />,
        color: "text-indigo-600",
        bg: "bg-indigo-100",
    },
    {
        title: "Sleep",
        value: "7.5 hrs",
        icon: <FaBed />,
        color: "text-purple-600",
        bg: "bg-purple-100",
    },
];

function HealthSummary() {

    return (

        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 h-[400px]">

            <h2 className="text-2xl font-bold text-slate-800 mb-6">

                Today's Summary

            </h2>

            <div className="space-y-4">

                {summary.map((item, index) => (

                    <div
                        key={index}
                        className="flex items-center justify-between bg-slate-50 rounded-2xl p-4"
                    >

                        <div className="flex items-center gap-4">

                            <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${item.bg} ${item.color}`}
                            >
                                {item.icon}
                            </div>

                            <div>

                                <p className="text-slate-500 text-sm">

                                    {item.title}

                                </p>

                                <p className="font-bold text-slate-800">

                                    {item.value}

                                </p>

                            </div>

                        </div>

                        <div className="w-3 h-3 rounded-full bg-green-500"></div>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default HealthSummary;