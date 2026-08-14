import {
    FaMicrochip,
    FaBatteryThreeQuarters,
    FaWifi,
    FaServer,
} from "react-icons/fa";

const overview = [
    {
        title: "ESP32",
        value: "Online",
        color: "#22c55e",
        icon: <FaMicrochip />,
    },
    {
        title: "Battery",
        value: "91%",
        color: "#10b981",
        icon: <FaBatteryThreeQuarters />,
    },
    {
        title: "WiFi",
        value: "-54 dBm",
        color: "#2563eb",
        icon: <FaWifi />,
    },
    {
        title: "MQTT",
        value: "Connected",
        color: "#f59e0b",
        icon: <FaServer />,
    },
];

function DeviceOverview() {

    return (

        <div className="grid grid-cols-12 gap-6">

            {overview.map((item, index) => (

                <div
                    key={index}
                    className="col-span-3"
                >

                    <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 h-[180px]">

                        <div className="flex justify-between items-start">

                            <div>

                                <p className="text-slate-500 text-sm">

                                    {item.title}

                                </p>

                                <h2
                                    className="text-4xl font-bold mt-6"
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

                        <div className="mt-8">

                            <div className="h-2 rounded-full bg-slate-200 overflow-hidden">

                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: "92%",
                                        backgroundColor: item.color,
                                    }}
                                />

                            </div>

                        </div>

                    </div>

                </div>

            ))}

        </div>

    );

}

export default DeviceOverview;