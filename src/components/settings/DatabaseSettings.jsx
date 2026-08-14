import { useState } from "react";
import {
    FaDatabase,
    FaServer,
    FaSave,
    FaCheckCircle,
    FaTimesCircle,
    FaPlug,
    FaUser,
    FaLock,
    FaSyncAlt,
    FaHistory,
    FaShieldAlt,
} from "react-icons/fa";

function DatabaseSettings() {

    const [config, setConfig] = useState({
        host: "localhost",
        port: "3306",
        database: "smart_health",
        username: "root",
        password: "",
    });

    const [status] = useState("Connected");

    const handleChange = (e) => {

        const { name, value } = e.target;

        setConfig((prev) => ({
            ...prev,
            [name]: value,
        }));

    };

    return (

        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">

            {/* Header */}

            <div className="px-8 py-6 border-b bg-gradient-to-r from-blue-600 to-cyan-600 text-white flex justify-between items-center">

                <div>

                    <h2 className="text-3xl font-bold">

                        Database Configuration

                    </h2>

                    <p className="text-blue-100 mt-2">

                        Configure MySQL Database Connection

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

                {/* Server */}

                <div>

                    <h3 className="text-xl font-bold mb-5">

                        Server Information

                    </h3>

                    <div className="grid grid-cols-2 gap-6">

                        <div>

                            <label className="block mb-2 font-semibold">

                                Host

                            </label>

                            <div className="relative">

                                <FaServer className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                                <input
                                    name="host"
                                    value={config.host}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                />

                            </div>

                        </div>

                        <div>

                            <label className="block mb-2 font-semibold">

                                Port

                            </label>

                          <select
    name="theme"
    value={config.theme}
    onChange={handleChange}
    className="w-full px-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none"
>
    <option value="light">Light</option>
    <option value="dark">Dark</option>
    <option value="system">System</option>
</select>

                        </div>

                        <div>

                            <label className="block mb-2 font-semibold">

                                Database

                            </label>

                           <select
    name="theme"
    value={config.theme}
    onChange={handleChange}
    className="w-full px-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none"
>
    <option value="light">Light</option>
    <option value="dark">Dark</option>
    <option value="system">System</option>
</select>

                        </div>

                        <div>

                            <label className="block mb-2 font-semibold">

                                Username

                            </label>

                           <select
    name="theme"
    value={config.theme}
    onChange={handleChange}
    className="w-full px-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none"
>
    <option value="light">Light</option>
    <option value="dark">Dark</option>
    <option value="system">System</option>
</select>
                        </div>

                        <div className="col-span-2">

                            <label className="block mb-2 font-semibold">

                                Password

                            </label>

                            <select
    name="theme"
    value={config.theme}
    onChange={handleChange}
    className="w-full px-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none"
>
    <option value="light">Light</option>
    <option value="dark">Dark</option>
    <option value="system">System</option>
</select>

                        </div>

                    </div>

                </div>
                                {/* Status */}

                <div className="grid lg:grid-cols-3 gap-6">

                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6">

                        <div className="flex items-center gap-3 mb-4">

                            <FaCheckCircle className="text-2xl text-green-600" />

                            <h4 className="font-bold text-lg">

                                Connection Status

                            </h4>

                        </div>

                        <div className="space-y-3 text-sm">

                            <div className="flex justify-between">

                                <span className="text-slate-500">

                                    Status

                                </span>

                                <span className="font-semibold text-green-600">

                                    Connected

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span className="text-slate-500">

                                    Host

                                </span>

                                <span className="font-semibold">

                                    {config.host}

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span className="text-slate-500">

                                    Database

                                </span>

                                <span className="font-semibold">

                                    {config.database}

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span className="text-slate-500">

                                    Last Test

                                </span>

                                <span className="font-semibold">

                                    Just now

                                </span>

                            </div>

                        </div>

                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">

                        <div className="flex items-center gap-3 mb-4">

                            <FaHistory className="text-2xl text-blue-600" />

                            <h4 className="font-bold text-lg">

                                Database Information

                            </h4>

                        </div>

                        <div className="space-y-3 text-sm">

                            <div className="flex justify-between">

                                <span>Engine</span>

                                <span className="font-semibold">

                                    MySQL

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>Version</span>

                                <span className="font-semibold">

                                    8.0

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>Charset</span>

                                <span className="font-semibold">

                                    utf8mb4

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>Timezone</span>

                                <span className="font-semibold">

                                    Asia/Bangkok

                                </span>

                            </div>

                        </div>

                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">

                        <div className="flex items-center gap-3 mb-4">

                            <FaShieldAlt className="text-2xl text-orange-500" />

                            <h4 className="font-bold text-lg">

                                Security

                            </h4>

                        </div>

                        <div className="space-y-3 text-sm">

                            <div className="flex justify-between">

                                <span>SSL</span>

                                <span className="font-semibold">

                                    Disabled

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>Firewall</span>

                                <span className="font-semibold text-green-600">

                                    Active

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>Backup</span>

                                <span className="font-semibold">

                                    Enabled

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>Permission</span>

                                <span className="font-semibold">

                                    Read / Write

                                </span>

                            </div>

                        </div>

                    </div>

                </div>

                {/* Action */}

                <div className="border-t pt-8 flex justify-between items-center">

                    <button className="flex items-center gap-3 border border-slate-300 hover:bg-slate-100 px-6 py-3 rounded-xl transition">

                        <FaSyncAlt />

                        Test Connection

                    </button>

                    <div className="flex gap-4">

                        <button className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 transition">

                            Reset

                        </button>

                        <button className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition">

                            <FaSave />

                            Save Configuration

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default DatabaseSettings;