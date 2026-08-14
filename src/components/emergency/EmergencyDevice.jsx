import {
    FaMicrochip,
    FaWifi,
    FaBatteryThreeQuarters,
    FaBluetooth,
    FaDatabase,
    FaCloud,
} from "react-icons/fa";

const devices = [
    {
        title: "ESP32",
        value: "Online",
        color: "text-green-600",
        bg: "bg-green-100",
        icon: <FaMicrochip />,
    },
    {
        title: "WiFi",
        value: "-54 dBm",
        color: "text-blue-600",
        bg: "bg-blue-100",
        icon: <FaWifi />,
    },
    {
        title: "Battery",
        value: "91%",
        color: "text-emerald-600",
        bg: "bg-emerald-100",
        icon: <FaBatteryThreeQuarters />,
    },
    {
        title: "Bluetooth",
        value: "Connected",
        color: "text-cyan-600",
        bg: "bg-cyan-100",
        icon: <FaBluetooth />,
    },
    {
        title: "Database",
        value: "Connected",
        color: "text-orange-600",
        bg: "bg-orange-100",
        icon: <FaDatabase />,
    },
    {
        title: "Cloud",
        value: "Online",
        color: "text-purple-600",
        bg: "bg-purple-100",
        icon: <FaCloud />,
    },
];

function EmergencyDevice() {

    return (

        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 h-[420px]">

            <div className="mb-6">

                <h2 className="text-2xl font-bold text-slate-800">

                    Device Status

                </h2>

                <p className="text-slate-500 mt-1">

                    Smart Emergency Module

                </p>

            </div>

            <div className="space-y-4">

                {devices.map((item, index) => (

                    <div
                        key={index}
                        className="flex justify-between items-center bg-slate-50 rounded-2xl p-4"
                    >

                        <div className="flex items-center gap-4">

                            <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${item.bg} ${item.color}`}
                            >

                                {item.icon}

                            </div>

                            <div>

                                <p className="font-semibold text-slate-800">

                                    {item.title}

                                </p>

                                <p className="text-sm text-slate-500">

                                    Module

                                </p>

                            </div>

                        </div>

                        <span className={`font-bold ${item.color}`}>

                            {item.value}

                        </span>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default EmergencyDevice;