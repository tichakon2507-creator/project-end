import {
    FaSearch,
    FaFilter,
    FaCalendarAlt,
    FaDownload,
} from "react-icons/fa";

function HistoryFilter() {

    return (

        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6">

            <div className="grid grid-cols-12 gap-4 items-end">

                <div className="col-span-3">

                    <label className="block text-sm font-semibold text-slate-600 mb-2">

                        Search

                    </label>

                    <div className="relative">

                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>

                </div>

                <div className="col-span-2">

                    <label className="block text-sm font-semibold text-slate-600 mb-2">

                        Category

                    </label>

                    <div className="relative">

                        <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                        <select className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">

                            <option>All</option>
                            <option>Health</option>
                            <option>Emergency</option>
                            <option>GPS</option>
                            <option>Device</option>

                        </select>

                    </div>

                </div>

                <div className="col-span-2">

                    <label className="block text-sm font-semibold text-slate-600 mb-2">

                        From

                    </label>

                    <div className="relative">

                        <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                        <input
                            type="date"
                            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl"
                        />

                    </div>

                </div>

                <div className="col-span-2">

                    <label className="block text-sm font-semibold text-slate-600 mb-2">

                        To

                    </label>

                    <div className="relative">

                        <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                        <input
                            type="date"
                            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl"
                        />

                    </div>

                </div>

                <div className="col-span-3">

                    <button className="w-full flex justify-center items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition">

                        <FaDownload />

                        Export History

                    </button>

                </div>

            </div>

        </div>

    );

}

export default HistoryFilter;