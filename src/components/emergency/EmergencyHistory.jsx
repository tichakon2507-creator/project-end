import {
    FaCheckCircle,
    FaExclamationTriangle,
    FaMapMarkerAlt,
    FaClock,
} from "react-icons/fa";

const history = [
    {
        date: "08/08/2026",
        time: "13:40",
        location: "Chiang Mai",
        status: "SAFE",
        level: "normal",
    },
    {
        date: "07/08/2026",
        time: "21:12",
        location: "Chiang Mai",
        status: "SOS Triggered",
        level: "danger",
    },
    {
        date: "06/08/2026",
        time: "09:45",
        location: "Chiang Mai",
        status: "SAFE",
        level: "normal",
    },
    {
        date: "05/08/2026",
        time: "17:30",
        location: "Chiang Mai",
        status: "Low Battery",
        level: "warning",
    },
    {
        date: "04/08/2026",
        time: "08:10",
        location: "Chiang Mai",
        status: "SAFE",
        level: "normal",
    },
];

function EmergencyHistory() {

    return (

        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6">

            <div className="flex justify-between items-center mb-6">

                <div>

                    <h2 className="text-2xl font-bold text-slate-800">

                        Emergency History

                    </h2>

                    <p className="text-slate-500 mt-1">

                        Recent Emergency Events

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
                            <th className="text-left">Location</th>
                            <th className="text-left">Status</th>

                        </tr>

                    </thead>

                    <tbody>

                        {history.map((item, index) => (

                            <tr
                                key={index}
                                className="border-b hover:bg-slate-50 transition"
                            >

                                <td className="py-5">

                                    {item.date}

                                </td>

                                <td>

                                    <div className="flex items-center gap-2">

                                        <FaClock className="text-slate-400" />

                                        {item.time}

                                    </div>

                                </td>

                                <td>

                                    <div className="flex items-center gap-2">

                                        <FaMapMarkerAlt className="text-red-500" />

                                        {item.location}

                                    </div>

                                </td>

                                <td>

                                    {item.level === "normal" && (

                                        <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-xl">

                                            <FaCheckCircle />

                                            {item.status}

                                        </span>

                                    )}

                                    {item.level === "warning" && (

                                        <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-xl">

                                            <FaExclamationTriangle />

                                            {item.status}

                                        </span>

                                    )}

                                    {item.level === "danger" && (

                                        <span className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-xl">

                                            <FaExclamationTriangle />

                                            {item.status}

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

export default EmergencyHistory;