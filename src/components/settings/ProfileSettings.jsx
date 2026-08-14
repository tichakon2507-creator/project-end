import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaSave,
    FaCamera,
    FaCheckCircle,
    FaShieldAlt,
    FaUserShield,
    FaCalendarAlt,
} from "react-icons/fa";

function ProfileSettings() {

    return (

        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">

            {/* Header */}

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 flex justify-between items-center text-white">

                <div>

                    <h2 className="text-3xl font-bold">

                        Profile Settings

                    </h2>

                    <p className="text-blue-100 mt-2">

                        Manage administrator profile information

                    </p>

                </div>

                <div className="bg-green-500 px-5 py-3 rounded-2xl flex items-center gap-3">

                    <FaCheckCircle />

                    Active

                </div>

            </div>

            <div className="p-8">

                <div className="grid lg:grid-cols-12 gap-8">

                    {/* Avatar */}

                    <div className="lg:col-span-3">

                        <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 text-center">

                            <img
                                src="https://ui-avatars.com/api/?name=Administrator&background=2563eb&color=fff&size=256"
                                alt="profile"
                                className="w-40 h-40 rounded-full mx-auto shadow-lg"
                            />

                            <h3 className="mt-5 text-xl font-bold">

                                Administrator

                            </h3>

                            <p className="text-slate-500 mt-2">

                                Smart Health System

                            </p>

                            <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 flex justify-center items-center gap-3 transition">

                                <FaCamera />

                                Change Photo

                            </button>

                        </div>

                    </div>

                    {/* Form */}

                    <div className="lg:col-span-9">

                        <div className="grid md:grid-cols-2 gap-6">

                            <div>

                                <label className="font-semibold mb-2 block">

                                    Full Name

                                </label>

                                <div className="relative">

                                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>

                                    <input
                                        type="text"
                                        defaultValue="Administrator"
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />

                                </div>

                            </div>

                            <div>

                                <label className="font-semibold mb-2 block">

                                    Email

                                </label>

                                <div className="relative">

                                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>

                                    <input
                                        type="email"
                                        defaultValue="admin@smarthealth.com"
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />

                                </div>

                            </div>

                            <div>

                                <label className="font-semibold mb-2 block">

                                    Phone

                                </label>

                                <div className="relative">

                                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>

                                    <input
                                        type="text"
                                        defaultValue="0812345678"
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />

                                </div>

                            </div>

                            <div>

                                <label className="font-semibold mb-2 block">

                                    Address

                                </label>

                                <div className="relative">

                                    <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>

                                    <input
                                        type="text"
                                        defaultValue="Chiang Mai, Thailand"
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />

                                </div>

                            </div>

                            <div>

                                <label className="font-semibold mb-2 block">

                                    Role

                                </label>

                                <div className="relative">

                                    <FaUserShield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>

                                    <input
                                        value="System Administrator"
                                        readOnly
                                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-100 border border-slate-300"
                                    />

                                </div>

                            </div>

                            <div>

                                <label className="font-semibold mb-2 block">

                                    Member Since

                                </label>

                                <div className="relative">

                                    <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>

                                    <input
                                        value="January 2026"
                                        readOnly
                                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-100 border border-slate-300"
                                    />

                                </div>

                            </div>

                            <div className="md:col-span-2">

                                <label className="font-semibold mb-2 block">

                                    About

                                </label>

                                <textarea
                                    rows="5"
                                    defaultValue="Administrator responsible for monitoring the Smart Health & Emergency Dashboard system."
                                    className="w-full rounded-xl border border-slate-300 p-5 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                                />

                            </div>

                        </div>
                                                {/* Profile Information */}

                        <div className="grid lg:grid-cols-3 gap-6 mt-8">

                            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">

                                <div className="flex items-center gap-3 mb-4">

                                    <FaCheckCircle className="text-2xl text-green-600"/>

                                    <h3 className="font-bold">

                                        Account Status

                                    </h3>

                                </div>

                                <div className="space-y-3 text-sm">

                                    <div className="flex justify-between">

                                        <span>Status</span>

                                        <span className="font-semibold text-green-600">

                                            Active

                                        </span>

                                    </div>

                                    <div className="flex justify-between">

                                        <span>Role</span>

                                        <span className="font-semibold">

                                            Administrator

                                        </span>

                                    </div>

                                    <div className="flex justify-between">

                                        <span>Permission</span>

                                        <span className="font-semibold">

                                            Full Access

                                        </span>

                                    </div>

                                </div>

                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">

                                <div className="flex items-center gap-3 mb-4">

                                    <FaShieldAlt className="text-2xl text-blue-600"/>

                                    <h3 className="font-bold">

                                        Security

                                    </h3>

                                </div>

                                <div className="space-y-3 text-sm">

                                    <div className="flex justify-between">

                                        <span>Password</span>

                                        <span className="font-semibold">

                                            Protected

                                        </span>

                                    </div>

                                    <div className="flex justify-between">

                                        <span>2FA</span>

                                        <span className="font-semibold">

                                            Disabled

                                        </span>

                                    </div>

                                    <div className="flex justify-between">

                                        <span>Session</span>

                                        <span className="font-semibold text-green-600">

                                            Online

                                        </span>

                                    </div>

                                </div>

                            </div>

                            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">

                                <div className="flex items-center gap-3 mb-4">

                                    <FaCalendarAlt className="text-2xl text-orange-500"/>

                                    <h3 className="font-bold">

                                        Activity

                                    </h3>

                                </div>

                                <div className="space-y-3 text-sm">

                                    <div className="flex justify-between">

                                        <span>Last Login</span>

                                        <span className="font-semibold">

                                            Today

                                        </span>

                                    </div>

                                    <div className="flex justify-between">

                                        <span>Login Time</span>

                                        <span className="font-semibold">

                                            09:42 AM

                                        </span>

                                    </div>

                                    <div className="flex justify-between">

                                        <span>Location</span>

                                        <span className="font-semibold">

                                            Chiang Mai

                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* Buttons */}

                        <div className="border-t mt-8 pt-8 flex justify-between items-center">

                            <button className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 transition">

                                Reset

                            </button>

                            <button className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition">

                                <FaSave />

                                Save Changes

                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default ProfileSettings;