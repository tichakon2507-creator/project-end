import {
    FaHeartbeat,
    FaExclamationTriangle,
    FaMapMarkerAlt,
    FaMicrochip,
} from "react-icons/fa";

const statistics = [
    {
        title: "Health Records",
        value: "1,248",
        color: "#ef4444",
        icon: <FaHeartbeat />,
    },
    {
        title: "Emergency Alerts",
        value: "18",
        color: "#f59e0b",
        icon: <FaExclamationTriangle />,
    },
    {
        title: "GPS Records",
        value: "5,621",
        color: "#2563eb",
        icon: <FaMapMarkerAlt />,
    },
    {
        title: "Device Logs",
        value: "8,945",
        color: "#10b981",
        icon: <FaMicrochip />,
    },
];

function HistoryStatistics() {

    return (

        <>

            {statistics.map((item, index) => (

                <div
                    key={index}
                    className="col-span-3"
                >

                    <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 h-[170px]">

                        <div className="flex justify-between items-start">

                            <div>

                                <p className="text-slate-500 text-sm">

                                    {item.title}

                                </p>

                                <h2
                                    className="text-5xl font-bold mt-5"
                                    style={{
                                        color: item.color,
                                    }}
                                >

                                    {item.value}

                                </h2>

                            </div>

                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                                style={{
                                    backgroundColor: `${item.color}20`,
                                    color: item.color,
                                }}
                            >

                                {item.icon}

                            </div>

                        </div>

                        <div className="mt-6">

                            <div className="h-2 rounded-full bg-slate-200 overflow-hidden">

                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: "80%",
                                        backgroundColor: item.color,
                                    }}
                                />

                            </div>

                        </div>

                    </div>

                </div>

            ))}

        </>

    );

}

export default HistoryStatistics;