import { useState } from "react";
import {
    FaServer,
    FaPlug,
    FaUser,
    FaLock,
    FaSave,
    FaCheckCircle,
    FaTimesCircle,
    FaExchangeAlt,
    FaWifi,
    FaCloud,
    FaSyncAlt,
} from "react-icons/fa";

function MQTTSettings() {

    const [config, setConfig] = useState({
        host: "ws://localhost",
        port: "9001",
        clientId: "smart-health-dashboard",
        username: "",
        password: "",
        autoConnect: true,
        reconnect: true,
    });

    const [status] = useState("Connected");

    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;

        setConfig((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

    };

    return (

        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">

            {/* Header */}

            <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-6 flex justify-between items-center text-white">

                <div>

                    <h2 className="text-3xl font-bold">

                        MQTT Configuration

                    </h2>

                    <p className="text-green-100 mt-2">

                        Configure MQTT Broker Connection

                    </p>

                </div>

                {

                    status === "Connected"

                        ?

                        <div className="bg-green-500 px-5 py-3 rounded-2xl flex items-center gap-3">

                            <FaCheckCircle />

                            Connected

                        </div>

                        :

                        <div className="bg-red-500 px-5 py-3 rounded-2xl flex items-center gap-3">

                            <FaTimesCircle />

                            Disconnected

                        </div>

                }

            </div>

            <div className="p-8 space-y-8">

                <div>

                    <h3 className="text-xl font-bold mb-5">

                        Broker Information

                    </h3>

                    <div className="grid grid-cols-2 gap-6">

                        <div>

                            <label className="block mb-2 font-semibold">

                                Broker Host

                            </label>

                            <div className="relative">

                                <FaServer className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>

                                <input
                                    name="host"
                                    value={config.host}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-500 outline-none"
                                />

                            </div>

                        </div>

                        <div>

                            <label className="block mb-2 font-semibold">

                                Port

                            </label>

                            <div className="relative">

                                <FaPlug className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>

                                <input
                                    name="port"
                                    value={config.port}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-500 outline-none"
                                />

                            </div>

                        </div>

                        <div>

                            <label className="block mb-2 font-semibold">

                                Client ID

                            </label>

                            <div className="relative">

                                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>

                                <input
                                    name="clientId"
                                    value={config.clientId}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-500 outline-none"
                                />

                            </div>

                        </div>

                        <div>

                            <label className="block mb-2 font-semibold">

                                Username

                            </label>

                            <div className="relative">

                                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>

                                <input
                                    name="username"
                                    value={config.username}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-500 outline-none"
                                />

                            </div>

                        </div>

                        <div className="col-span-2">

                            <label className="block mb-2 font-semibold">

                                Password

                            </label>

                            <div className="relative">

                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>

                                <input
                                    type="password"
                                    name="password"
                                    value={config.password}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-500 outline-none"
                                />

                            </div>

                        </div>

                    </div>

                </div>
                                {/* Status Cards */}

                <div className="grid lg:grid-cols-3 gap-6">

                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6">

                        <div className="flex items-center gap-3 mb-4">

                            <FaCheckCircle className="text-2xl text-green-600" />

                            <h3 className="font-bold text-lg">

                                Broker Status

                            </h3>

                        </div>

                        <div className="space-y-3 text-sm">

                            <div className="flex justify-between">

                                <span>Status</span>

                                <span className="font-semibold text-green-600">

                                    Connected

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>Protocol</span>

                                <span className="font-semibold">

                                    WebSocket

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>Broker</span>

                                <span className="font-semibold">

                                    Mosquitto

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>Last Ping</span>

                                <span className="font-semibold">

                                    1 sec ago

                                </span>

                            </div>

                        </div>

                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">

                        <div className="flex items-center gap-3 mb-4">

                            <FaExchangeAlt className="text-2xl text-blue-600" />

                            <h3 className="font-bold text-lg">

                                Traffic

                            </h3>

                        </div>

                        <div className="space-y-3 text-sm">

                            <div className="flex justify-between">

                                <span>Published</span>

                                <span className="font-semibold">

                                    1,254

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>Subscribed</span>

                                <span className="font-semibold">

                                    865

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>QoS</span>

                                <span className="font-semibold">

                                    Level 1

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>Reconnect</span>

                                <span className="font-semibold">

                                    Enabled

                                </span>

                            </div>

                        </div>

                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">

                        <div className="flex items-center gap-3 mb-4">

                            <FaWifi className="text-2xl text-orange-500" />

                            <h3 className="font-bold text-lg">

                                Network

                            </h3>

                        </div>

                        <div className="space-y-3 text-sm">

                            <div className="flex justify-between">

                                <span>Latency</span>

                                <span className="font-semibold">

                                    18 ms

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>Signal</span>

                                <span className="font-semibold">

                                    Excellent

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>SSL</span>

                                <span className="font-semibold">

                                    Disabled

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>Cloud</span>

                                <span className="font-semibold text-green-600">

                                    Online

                                </span>

                            </div>

                        </div>

                    </div>

                </div>

                {/* Options */}

                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">

                    <h3 className="text-lg font-bold mb-5">

                        Connection Options

                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">

                        <label className="flex items-center gap-3">

                            <input
                                type="checkbox"
                                name="autoConnect"
                                checked={config.autoConnect}
                                onChange={handleChange}
                                className="w-5 h-5"
                            />

                            <span>Auto Connect on Startup</span>

                        </label>

                        <label className="flex items-center gap-3">

                            <input
                                type="checkbox"
                                name="reconnect"
                                checked={config.reconnect}
                                onChange={handleChange}
                                className="w-5 h-5"
                            />

                            <span>Auto Reconnect</span>

                        </label>

                    </div>

                </div>

                {/* Actions */}

                <div className="border-t pt-8 flex justify-between items-center">

                    <button className="flex items-center gap-3 border border-slate-300 hover:bg-slate-100 px-6 py-3 rounded-xl transition">

                        <FaSyncAlt />

                        Test Connection

                    </button>

                    <div className="flex gap-4">

                        <button className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 transition">

                            Reset

                        </button>

                        <button className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl transition">

                            <FaSave />

                            Save Configuration

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default MQTTSettings;