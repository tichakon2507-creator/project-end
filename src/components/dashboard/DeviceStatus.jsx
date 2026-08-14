import {
    FaMicrochip,
    FaWifi,
    FaServer,
    FaDatabase,
    FaBatteryThreeQuarters,
} from "react-icons/fa";

import useMQTT from "../../hooks/useMQTT";
import { TOPICS } from "../../constants/topics";

function DeviceStatus() {

    const battery = useMQTT(TOPICS.BATTERY, "88");

    return (

        <div className="bg-white rounded-3xl shadow-md border border-slate-200 h-full overflow-hidden">

            <div className="px-6 pt-2 pb-4">

                <h2 className="text-3xl font-bold text-slate-800">
                    Device Status
                </h2>

            </div>

            <div className="space-y-1">

                {/* ESP32 */}
                <div className="flex items-center gap-4 px-5 py-3 bg-slate-50 rounded-2xl">

                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">

                        <FaMicrochip
                            size={23}
                            className="text-blue-600"
                        />

                    </div>

                    <div className="flex-1">

                        <p className="font-bold text-lg text-slate-800">
                            ESP32
                        </p>

                        <p className="text-slate-500">
                            Device Status
                        </p>

                    </div>

                    <span className="font-bold text-green-600 text-lg">
                        Online
                    </span>

                </div>

                {/* WiFi */}
                <div className="flex items-center gap-4 px-5 py-3 bg-slate-50 rounded-2xl">

                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">

                        <FaWifi
                            size={23}
                            className="text-blue-600"
                        />

                    </div>

                    <div className="flex-1">

                        <p className="font-bold text-lg text-slate-800">
                            WiFi
                        </p>

                        <p className="text-slate-500">
                            Device Status
                        </p>

                    </div>

                    <span className="font-bold text-blue-600 text-lg">
                        -54 dBm
                    </span>

                </div>

                {/* MQTT */}
                <div className="flex items-center gap-4 px-5 py-3 bg-slate-50 rounded-2xl">

                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">

                        <FaServer
                            size={23}
                            className="text-blue-600"
                        />

                    </div>

                    <div className="flex-1">

                        <p className="font-bold text-lg text-slate-800">
                            MQTT
                        </p>

                        <p className="text-slate-500">
                            Device Status
                        </p>

                    </div>

                    <span className="font-bold text-green-600 text-lg">
                        Connected
                    </span>

                </div>

                {/* Database */}
                <div className="flex items-center gap-4 px-5 py-3 bg-slate-50 rounded-2xl">

                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">

                        <FaDatabase
                            size={23}
                            className="text-blue-600"
                        />

                    </div>

                    <div className="flex-1">

                        <p className="font-bold text-lg text-slate-800">
                            Database
                        </p>

                        <p className="text-slate-500">
                            Device Status
                        </p>

                    </div>

                    <span className="font-bold text-green-600 text-lg">
                        Connected
                    </span>

                </div>

                {/* Battery */}
                <div className="flex items-center gap-4 px-5 py-3 bg-slate-50 rounded-2xl">

                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">

                        <FaBatteryThreeQuarters
                            size={23}
                            className="text-blue-600"
                        />

                    </div>

                    <div className="flex-1">

                        <p className="font-bold text-lg text-slate-800">
                            Battery
                        </p>

                        <p className="text-slate-500">
                            Device Status
                        </p>

                    </div>

                    <span className="font-bold text-green-600 text-lg">
                        {battery}%
                    </span>

                </div>

            </div>

        </div>

    );
}

export default DeviceStatus;