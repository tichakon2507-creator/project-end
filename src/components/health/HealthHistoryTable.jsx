import {
    FaCheckCircle,
    FaExclamationTriangle,
} from "react-icons/fa";

const history = [
    {
        date: "08/08/2026",
        time: "08:30",
        heart: "82 BPM",
        spo2: "98%",
        temp: "36.8°C",
        status: "Healthy",
    },
    {
        date: "07/08/2026",
        time: "17:15",
        heart: "84 BPM",
        spo2: "99%",
        temp: "36.9°C",
        status: "Healthy",
    },
    {
        date: "06/08/2026",
        time: "13:40",
        heart: "96 BPM",
        spo2: "95%",
        temp: "37.4°C",
        status: "Warning",
    },
    {
        date: "05/08/2026",
        time: "09:20",
        heart: "79 BPM",
        spo2: "98%",
        temp: "36.6°C",
        status: "Healthy",
    },
    {
        date: "04/08/2026",
        time: "18:10",
        heart: "81 BPM",
        spo2: "97%",
        temp: "36.7°C",
        status: "Healthy",
    },
];

function HealthHistoryTable() {

    return (

        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6">

            <div className="flex justify-between items-center mb-6">

                <div>

                    <h2 className="text-2xl font-bold text-slate-800">

                        Health History

                    </h2>

                    <p className="text-slate-500 mt-1">

                        Daily Health Records

                    </p>

                </div>

                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl transition">

                    Export

                </button>

            </div>

            <div className="overflow-x-auto">

                <table className="w-full">

                    <thead>

                        <tr className="border-b">

                            <th className="text-left py-4">Date</th>
                            <th className="text-left">Time</th>
                            <th className="text-left">Heart</th>
                            <th className="text-left">SpO₂</th>
                            <th className="text-left">Temp</th>
                            <th className="text-left">Status</th>

                        </tr>

                    </thead>

                    <tbody>

                        {history.map((item, index) => (

                            <tr
                                key={index}
                                className="border-b hover:bg-slate-50 transition"
                            >

                                <td className="py-5 font-medium">

                                    {item.date}

                                </td>

                                <td>

                                    {item.time}

                                </td>

                                <td>

                                    {item.heart}

                                </td>

                                <td>

                                    {item.spo2}

                                </td>

                                <td>

                                    {item.temp}

                                </td>

                                <td>

                                    {item.status === "Healthy" ? (

                                        <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-xl">

                                            <FaCheckCircle />

                                            Healthy

                                        </span>

                                    ) : (

                                        <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-xl">

                                            <FaExclamationTriangle />

                                            Warning

                                        </span>

                                    )}

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default HealthHistoryTable;
