import {
    FaSearch,
    FaFilter,
    FaUserTag,
    FaDownload,
} from "react-icons/fa";

function UserFilter() {

    return (

        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6">

            <div className="grid grid-cols-12 gap-4 items-end">

                <div className="col-span-4">

                    <label className="block text-sm font-semibold text-slate-600 mb-2">

                        Search User

                    </label>

                    <div className="relative">

                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                        <input
                            type="text"
                            placeholder="Search by name, ID or email..."
                            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>

                </div>

                <div className="col-span-3">

                    <label className="block text-sm font-semibold text-slate-600 mb-2">

                        Role

                    </label>

                    <div className="relative">

                        <FaUserTag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                        <select className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">

                            <option>All Users</option>
                            <option>Patient</option>
                            <option>Caregiver</option>
                            <option>Administrator</option>

                        </select>

                    </div>

                </div>

                <div className="col-span-2">

                    <label className="block text-sm font-semibold text-slate-600 mb-2">

                        Status

                    </label>

                    <div className="relative">

                        <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                        <select className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">

                            <option>All</option>
                            <option>Online</option>
                            <option>Offline</option>

                        </select>

                    </div>

                </div>

                <div className="col-span-3">

                    <button className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition">

                        <FaDownload />

                        Export Users

                    </button>

                </div>

            </div>

        </div>

    );

}

export default UserFilter;