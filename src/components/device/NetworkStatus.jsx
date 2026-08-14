import {
    FaWifi,
    FaServer,
    FaCloud,
    FaDatabase,
    FaExchangeAlt,
    FaSignal,
} from "react-icons/fa";

const network = [
    {
        title: "WiFi Status",
        value: "Connected",
        detail: "SSID : SmartHealth",
        icon: <FaWifi />,
        color: "text-blue-600",
        bg: "bg-blue-100",
    },
    {
        title: "MQTT Broker",
        value: "Connected",
        detail: "Broker : Mosquitto",
        icon: <FaServer />,
        color: "text-green-600",
        bg: "bg-green-100",
    },
    {
        title: "Cloud",
        value: "Online",
        detail: "Cloud Sync Enabled",
        icon: <FaCloud />,
        color: "text-cyan-600",
        bg: "bg-cyan-100",
    },
    {
        title: "Database",
        value: "Connected",
        detail: "MySQL Database",
        icon: <FaDatabase />,
        color: "text-orange-600",
        bg: "bg-orange-100",
    },
];

function NetworkStatus() {

    return (

        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 h-[520px]">

            <div className="mb-6">

                <h2 className="text-2xl font-bold text-slate-800">

                    Network Status

                </h2>

                <p className="text-slate-500 mt-1">

                    Communication & Connectivity

                </p>

            </div>

            <div className="space-y-4">

                {network.map((item, index) => (

                    <div
                        key={index}
                        className="bg-slate-50 rounded-2xl p-4"
                    >

                        <div className="flex justify-between items-center">

                            <div className="flex items-center gap-4">

                                <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${item.bg} ${item.color}`}
                                >

                                    {item.icon}

                                </div>

                                <div>

                                    <h3 className="font-semibold text-slate-800">

                                        {item.title}

                                    </h3>

                                    <p className="text-sm text-slate-500">

                                        {item.detail}

                                    </p>

                                </div>

                            </div>

                            <span className={`font-bold ${item.color}`}>

                                {item.value}

                            </span>

                        </div>

                    </div>

                ))}

            </div>

            <div className="border-t mt-6 pt-6 space-y-4">

                <div className="flex justify-between">

                    <div className="flex items-center gap-2">

                        <FaSignal className="text-slate-500" />

                        <span>WiFi Signal</span>

                    </div>

                    <span className="font-bold">

                        -54 dBm

                    </span>

                </div>

                <div className="flex justify-between">

                    <div className="flex items-center gap-2">

                        <FaExchangeAlt className="text-slate-500" />

                        <span>Data Transfer</span>

                    </div>

                    <span className="font-bold text-green-600">

                        2.3 MB/s

                    </span>

                </div>

                <div className="flex justify-between">

                    <span>Last Sync</span>

                    <span className="font-bold">

                        Just now

                    </span>

                </div>

            </div>

        </div>

    );

}

export default NetworkStatus;
