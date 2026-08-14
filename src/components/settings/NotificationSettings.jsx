import { useState } from "react";
import {
    FaBell,
    FaLine,
    FaTelegram,
    FaEnvelope,
    FaSave,
    FaCheckCircle,
    FaTimesCircle,
    FaPaperPlane,
    FaShieldAlt,
} from "react-icons/fa";

function NotificationSettings() {

    const [config, setConfig] = useState({

        lineToken: "",
        telegramToken: "",
        telegramChatId: "",
        email: "",

        enableLine: true,
        enableTelegram: false,
        enableEmail: false,

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

            <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-6 flex justify-between items-center text-white">

                <div>

                    <h2 className="text-3xl font-bold">

                        Notification Settings

                    </h2>

                    <p className="text-violet-100 mt-2">

                        Configure notification services for Smart Health

                    </p>

                </div>

                <div className="bg-green-500 px-5 py-3 rounded-2xl flex items-center gap-3">

                    <FaCheckCircle />

                    Ready

                </div>

            </div>

            <div className="p-8 space-y-8">
                                {/* Notification Status */}

                <div className="grid lg:grid-cols-3 gap-6">

                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6">

                        <div className="flex items-center gap-3 mb-4">

                            <FaLine className="text-2xl text-green-600" />

                            <h3 className="font-bold text-lg">

                                LINE Status

                            </h3>

                        </div>

                        <div className="space-y-3 text-sm">

                            <div className="flex justify-between">

                                <span>Status</span>

                                <span className="font-semibold text-green-600">

                                    Enabled

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>Connection</span>

                                <span className="font-semibold">

                                    Connected

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>Last Message</span>

                                <span className="font-semibold">

                                    2 min ago

                                </span>

                            </div>

                        </div>

                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">

                        <div className="flex items-center gap-3 mb-4">

                            <FaTelegram className="text-2xl text-blue-600" />

                            <h3 className="font-bold text-lg">

                                Telegram Status

                            </h3>

                        </div>

                        <div className="space-y-3 text-sm">

                            <div className="flex justify-between">

                                <span>Status</span>

                                <span className="font-semibold text-slate-500">

                                    Disabled

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>Bot</span>

                                <span className="font-semibold">

                                    Offline

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>Chat ID</span>

                                <span className="font-semibold">

                                    -

                                </span>

                            </div>

                        </div>

                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6">

                        <div className="flex items-center gap-3 mb-4">

                            <FaEnvelope className="text-2xl text-red-500" />

                            <h3 className="font-bold text-lg">

                                Email Status

                            </h3>

                        </div>

                        <div className="space-y-3 text-sm">

                            <div className="flex justify-between">

                                <span>Status</span>

                                <span className="font-semibold text-slate-500">

                                    Disabled

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>SMTP</span>

                                <span className="font-semibold">

                                    Not Configured

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span>Last Email</span>

                                <span className="font-semibold">

                                    -

                                </span>

                            </div>

                        </div>

                    </div>

                </div>

                {/* Actions */}

                <div className="border-t pt-8 flex justify-between items-center">

                    <button className="flex items-center gap-3 border border-slate-300 hover:bg-slate-100 px-6 py-3 rounded-xl transition">

                        <FaPaperPlane />

                        Send Test Notification

                    </button>

                    <div className="flex gap-4">

                        <button className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 transition">

                            Reset

                        </button>

                        <button className="flex items-center gap-3 bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-xl transition">

                            <FaSave />

                            Save Configuration

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default NotificationSettings;
