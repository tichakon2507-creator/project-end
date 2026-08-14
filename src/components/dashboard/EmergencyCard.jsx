import {
    FaShieldAlt,
    FaMapMarkerAlt,
    FaBell,
    FaClock,
} from "react-icons/fa";

function EmergencyCard() {
    return (
        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 h-[420px]">

            <div className="flex justify-between items-center mb-6">

                <h2 className="text-2xl font-bold text-slate-800">
                    Emergency Status
                </h2>

                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-semibold">
                    SAFE
                </span>

            </div>

            <div className="space-y-5">

                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                        <FaShieldAlt className="text-green-600 text-xl" />

                        <span className="font-medium">
                            Current Status
                        </span>

                    </div>

                    <span className="font-bold text-green-600">
                        Normal
                    </span>

                </div>

                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                        <FaBell className="text-red-500 text-xl" />

                        <span className="font-medium">
                            Last Alert
                        </span>

                    </div>

                    <span className="text-slate-500">
                        None
                    </span>

                </div>

                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                        <FaMapMarkerAlt className="text-blue-600 text-xl" />

                        <span className="font-medium">
                            Current Location
                        </span>

                    </div>

                    <span className="text-slate-700">
                        Chiang Mai
                    </span>

                </div>

                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                        <FaClock className="text-orange-500 text-xl" />

                        <span className="font-medium">
                            Last Update
                        </span>

                    </div>

                    <span className="text-slate-700">
                        Just now
                    </span>

                </div>

            </div>

            <button className="w-full mt-8 bg-red-500 hover:bg-red-600 transition text-white py-4 rounded-2xl font-bold text-lg">

                Emergency Call

            </button>

        </div>
    );
}

export default EmergencyCard;