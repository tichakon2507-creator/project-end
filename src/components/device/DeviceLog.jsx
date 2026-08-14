import {
    FaCheckCircle,
    FaExclamationTriangle,
    FaInfoCircle,
    FaBug,
} from "react-icons/fa";

const logs = [
    {
        time: "14:25:32",
        type: "System",
        message: "ESP32 Boot Completed",
        level: "success",
    },
    {
        time: "14:24:51",
        type: "MQTT",
        message: "Connected to Mosquitto Broker",
        level: "success",
    },
    {
        time: "14:23:10",
        type: "WiFi",
        message: "Connected to SmartHealth WiFi",
        level: "success",
    },
    {
        time: "14:20:18",
        type: "Sensor",
        message: "Heart Rate Sensor Reading Updated",
        level: "info",
    },
    {
        time: "14:18:42",
        type: "GPS",
        message: "GPS Location Updated",
        level: "info",
    },
    {
        time: "14:15:20",
        type: "Battery",
        message: "Battery Below 20%",
        level: "warning",
    },
    {
        time: "14:12:50",
        type: "MQTT",
        message: "Reconnect Successful",
        level: "success",
    },
    {
        time: "14:10:05",
        type: "System",
        message: "Device Restarted",
        level: "info",
    },
];

function getIcon(level) {

    switch (level) {

        case "success":
            return (
                <FaCheckCircle className="text-green-600 text-xl" />
            );

        case "warning":
            return (
                <FaExclamationTriangle className="text-yellow-500 text-xl" />
            );

        case "error":
            return (
                <FaBug className="text-red-600 text-xl" />
            );

        default:
            return (
                <FaInfoCircle className="text-blue-500 text-xl" />
            );

    }

}

function getBadge(level) {

    switch (level) {

        case "success":
            return (
                <span className="px-3 py-1 rounded-xl bg-green-100 text-green-700 text-sm font-semibold">
                    SUCCESS
                </span>
            );

        case "warning":
            return (
                <span className="px-3 py-1 rounded-xl bg-yellow-100 text-yellow-700 text-sm font-semibold">
                    WARNING
                </span>
            );

        case "error":
            return (
                <span className="px-3 py-1 rounded-xl bg-red-100 text-red-700 text-sm font-semibold">
                    ERROR
                </span>
            );

        default:
            return (
                <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-700 text-sm font-semibold">
                    INFO
                </span>
            );

    }

}

function DeviceLog() {

    return (

        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6">

            <div className="flex justify-between items-center mb-6">

                <div>

                    <h2 className="text-2xl font-bold text-slate-800">

                        Device Logs

                    </h2>

                    <p className="text-slate-500 mt-1">

                        Latest System Activities

                    </p>

                </div>

                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl transition">

                    Export Logs

                </button>

            </div>

            <div className="overflow-y-auto max-h-[500px]">

                <table className="w-full">

                    <thead>

                        <tr className="border-b">

                            <th className="text-left py-4">Time</th>
                            <th className="text-left">Type</th>
                            <th className="text-left">Message</th>
                            <th className="text-left">Status</th>

                        </tr>

                    </thead>

                    <tbody>

                        {logs.map((log, index) => (

                            <tr
                                key={index}
                                className="border-b hover:bg-slate-50 transition"
                            >

                                <td className="py-5 font-medium">

                                    {log.time}

                                </td>

                                <td>

                                    {log.type}

                                </td>

                                <td>

                                    <div className="flex items-center gap-3">

                                        {getIcon(log.level)}

                                        {log.message}

                                    </div>

                                </td>

                                <td>

                                    {getBadge(log.level)}

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default DeviceLog;