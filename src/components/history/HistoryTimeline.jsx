import {
    FaHeartbeat,
    FaMapMarkerAlt,
    FaExclamationTriangle,
    FaMicrochip,
} from "react-icons/fa";

const timeline = [
    {
        time: "14:20",
        title: "Heart Rate Updated",
        description: "Heart Rate changed to 82 BPM",
        color: "bg-red-500",
        icon: <FaHeartbeat />,
    },
    {
        time: "14:15",
        title: "GPS Updated",
        description: "Device location refreshed",
        color: "bg-blue-500",
        icon: <FaMapMarkerAlt />,
    },
    {
        time: "13:58",
        title: "Emergency Button Checked",
        description: "No emergency detected",
        color: "bg-yellow-500",
        icon: <FaExclamationTriangle />,
    },
    {
        time: "13:40",
        title: "Device Connected",
        description: "ESP32 connected to MQTT Broker",
        color: "bg-green-500",
        icon: <FaMicrochip />,
    },
];

function HistoryTimeline() {

    return (

        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6">

            <div className="mb-6">

                <h2 className="text-2xl font-bold text-slate-800">

                    Activity Timeline

                </h2>

                <p className="text-slate-500 mt-1">

                    Latest system activities

                </p>

            </div>

            <div className="relative">

                <div className="absolute left-6 top-0 bottom-0 w-1 bg-slate-200 rounded-full"></div>

                <div className="space-y-8">

                    {timeline.map((item, index) => (

                        <div
                            key={index}
                            className="relative flex items-start gap-6"
                        >

                            <div
                                className={`w-12 h-12 rounded-full ${item.color} text-white flex items-center justify-center z-10 shadow-lg`}
                            >
                                {item.icon}
                            </div>

                            <div className="flex-1 bg-slate-50 rounded-2xl p-5">

                                <div className="flex justify-between items-center">

                                    <h3 className="font-bold text-lg text-slate-800">

                                        {item.title}

                                    </h3>

                                    <span className="text-sm text-slate-500">

                                        {item.time}

                                    </span>

                                </div>

                                <p className="text-slate-600 mt-2">

                                    {item.description}

                                </p>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </div>

    );

}

export default HistoryTimeline;