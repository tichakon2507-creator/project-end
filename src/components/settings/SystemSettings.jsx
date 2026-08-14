import { useState } from "react";
import {
    FaSave,
    FaDownload,
    FaUpload,
    FaRedo,
    FaTrash,
    FaMoon,
    FaGlobe,
    FaClock,
    FaDatabase,
    FaCheckCircle,
    FaServer,
    FaMicrochip,
} from "react-icons/fa";

function SystemSettings() {

    const [config, setConfig] = useState({

        theme: "light",
        language: "English",
        timezone: "Asia/Bangkok",
        autoBackup: true,
        autoUpdate: false,

    });

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

            <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-8 py-6 flex justify-between items-center text-white">

                <div>

                    <h2 className="text-3xl font-bold">

                        System Settings

                    </h2>

                    <p className="text-slate-300 mt-2">

                        Configure dashboard preferences and maintenance

                    </p>

                </div>

                <div className="bg-green-500 rounded-2xl px-5 py-3 flex items-center gap-3">

                    <FaCheckCircle />

                    System Ready

                </div>

            </div>

            <div className="p-8 space-y-8">

                {/* Preferences */}

                <div>

                    <h3 className="text-xl font-bold mb-5">

                        Preferences

                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">

                        <div>

                            <label className="block mb-2 font-semibold">

                                Theme

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

                                Language

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

                                Time Zone

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

                        <div className="flex flex-col justify-center gap-5">

                            <label className="flex items-center gap-3">

                                <input
                                    type="checkbox"
                                    name="autoBackup"
                                    checked={config.autoBackup}
                                    onChange={handleChange}
                                    className="w-5 h-5"
                                />

                                Enable Auto Backup

                            </label>

                            <label className="flex items-center gap-3">

                                <input
                                    type="checkbox"
                                    name="autoUpdate"
                                    checked={config.autoUpdate}
                                    onChange={handleChange}
                                    className="w-5 h-5"
                                />

                                Enable Auto Update

                            </label>

                        </div>

                    </div>

                </div>
                                {/* System Status */}

                <div className="grid lg:grid-cols-3 gap-6">

                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">

                        <div className="flex items-center gap-3 mb-5">

                            <FaDatabase className="text-2xl text-blue-600" />

                            <h3 className="font-bold text-lg">

                                Database

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

                                <span>Engine</span>

                                <span className="font-semibold">

                                    MySQL 8.0

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>Latency</span>

                                <span className="font-semibold">

                                    12 ms

                                </span>

                            </div>

                        </div>

                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6">

                        <div className="flex items-center gap-3 mb-5">

                            <FaServer className="text-2xl text-green-600" />

                            <h3 className="font-bold text-lg">

                                API Server

                            </h3>

                        </div>

                        <div className="space-y-3 text-sm">

                            <div className="flex justify-between">

                                <span>Status</span>

                                <span className="font-semibold text-green-600">

                                    Running

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>Version</span>

                                <span className="font-semibold">

                                    v1.0.0

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>Response</span>

                                <span className="font-semibold">

                                    24 ms

                                </span>

                            </div>

                        </div>

                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">

                        <div className="flex items-center gap-3 mb-5">

                            <FaMicrochip className="text-2xl text-orange-500" />

                            <h3 className="font-bold text-lg">

                                ESP32 Device

                            </h3>

                        </div>

                        <div className="space-y-3 text-sm">

                            <div className="flex justify-between">

                                <span>Status</span>

                                <span className="font-semibold text-green-600">

                                    Online

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>MQTT</span>

                                <span className="font-semibold">

                                    Connected

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>Firmware</span>

                                <span className="font-semibold">

                                    1.0.0

                                </span>

                            </div>

                        </div>

                    </div>

                </div>

                {/* Maintenance */}

                <div>

                    <h3 className="text-xl font-bold mb-5">

                        Maintenance

                    </h3>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">

                        <button className="flex flex-col items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl py-6 transition">

                            <FaDownload size={28} />

                            <span>Backup</span>

                        </button>

                        <button className="flex flex-col items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-6 transition">

                            <FaUpload size={28} />

                            <span>Restore</span>

                        </button>

                        <button className="flex flex-col items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-6 transition">

                            <FaRedo size={28} />

                            <span>Restart</span>

                        </button>

                        <button className="flex flex-col items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl py-6 transition">

                            <FaTrash size={28} />

                            <span>Clear Cache</span>

                        </button>

                    </div>

                </div>

                {/* Footer */}

                <div className="border-t pt-8 flex justify-between items-center">

                    <div>

                        <h4 className="font-semibold">

                            Smart Health & Emergency Dashboard

                        </h4>

                        <p className="text-sm text-slate-500 mt-1">

                            Version 1.0.0 • React + Vite • MQTT • MySQL • ESP32

                        </p>

                    </div>

                    <button className="flex items-center gap-3 bg-slate-800 hover:bg-black text-white px-8 py-3 rounded-xl transition">

                        <FaSave />

                        Save All Settings

                    </button>

                </div>

            </div>

        </div>

    );

}

export default SystemSettings;