import {
    FaHeartbeat,
    FaMapMarkerAlt,
    FaMicrochip,
    FaExclamationTriangle,
} from "react-icons/fa";

const records = [
    {
        id: "LOG-1001",
        date: "08/08/2026",
        time: "14:20",
        category: "Health",
        detail: "Heart Rate : 82 BPM",
        status: "Normal",
    },
    {
        id: "LOG-1002",
        date: "08/08/2026",
        time: "14:15",
        category: "GPS",
        detail: "Location Updated",
        status: "Success",
    },
    {
        id: "LOG-1003",
        date: "08/08/2026",
        time: "13:58",
        category: "Emergency",
        detail: "Emergency Button Checked",
        status: "Safe",
    },
    {
        id: "LOG-1004",
        date: "08/08/2026",
        time: "13:40",
        category: "Device",
        detail: "ESP32 Connected",
        status: "Online",
    },
    {
        id: "LOG-1005",
        date: "08/08/2026",
        time: "13:12",
        category: "Health",
        detail: "Temperature : 36.8°C",
        status: "Normal",
    },
    {
        id: "LOG-1006",
        date: "08/08/2026",
        time: "12:55",
        category: "GPS",
        detail: "Speed : 12 km/h",
        status: "Moving",
    },
];

function getIcon(category) {

    switch (category) {

        case "Health":
            return <FaHeartbeat className="text-red-500" />;

        case "GPS":
            return <FaMapMarkerAlt className="text-blue-500" />;

        case "Emergency":
            return <FaExclamationTriangle className="text-yellow-500" />;

        default:
            return <FaMicrochip className="text-green-500" />;

    }

}

function getBadge(status) {

    if (status === "Normal" || status === "Success" || status === "Online") {

        return (
            <span className="px-3 py-1 rounded-xl bg-green-100 text-green-700 text-sm font-semibold">
                {status}
            </span>
        );

    }

    if (status === "Moving") {

        return (
            <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-700 text-sm font-semibold">
                {status}
            </span>
        );

    }

    return (
        <span className="px-3 py-1 rounded-xl bg-yellow-100 text-yellow-700 text-sm font-semibold">
            {status}
        </span>
    );

}

function HistoryTable() {

    return (

        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6">

            <div className="flex justify-between items-center mb-6">

                <div>

                    <h2 className="text-2xl font-bold text-slate-800">

                        All History Records

                    </h2>

                    <p className="text-slate-500 mt-1">

                        System logs and activity records

                    </p>

                </div>

                <span className="text-slate-500">

                    {records.length} Records

                </span>

            </div>

            <div className="overflow-x-auto">

                <table className="w-full">

                    <thead>

                        <tr className="border-b">

                            <th className="text-left py-4">ID</th>
                            <th className="text-left">Date</th>
                            <th className="text-left">Time</th>
                            <th className="text-left">Category</th>
                            <th className="text-left">Detail</th>
                            <th className="text-left">Status</th>

                        </tr>

                    </thead>

                    <tbody>

                        {records.map((item) => (

                            <tr
                                key={item.id}
                                className="border-b hover:bg-slate-50 transition"
                            >

                                <td className="py-5 font-semibold">

                                    {item.id}

                                </td>

                                <td>{item.date}</td>

                                <td>{item.time}</td>

                                <td>

                                    <div className="flex items-center gap-2">

                                        {getIcon(item.category)}

                                        {item.category}

                                    </div>

                                </td>

                                <td>{item.detail}</td>

                                <td>{getBadge(item.status)}</td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default HistoryTable;