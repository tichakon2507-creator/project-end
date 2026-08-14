import {
    FaMapMarkedAlt,
    FaCrosshairs,
    FaLocationArrow,
    FaExpand,
} from "react-icons/fa";

function LiveMap() {

    return (

        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 h-[600px]">

            <div className="flex justify-between items-center mb-6">

                <div>

                    <h2 className="text-2xl font-bold text-slate-800">

                        Live GPS Tracking

                    </h2>

                    <p className="text-slate-500 mt-1">

                        Real-time Device Location

                    </p>

                </div>

                <div className="flex gap-3">

                    <button className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">

                        <FaCrosshairs />

                    </button>

                    <button className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">

                        <FaLocationArrow />

                    </button>

                    <button className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">

                        <FaExpand />

                    </button>

                </div>

            </div>

            <div className="h-[500px] rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center">

                <FaMapMarkedAlt
                    size={90}
                    className="text-slate-400"
                />

                <h2 className="text-3xl font-bold text-slate-700 mt-8">

                    Google Maps

                </h2>

                <p className="text-slate-500 mt-3">

                    Live Tracking will be displayed here

                </p>

                <div className="grid grid-cols-2 gap-8 mt-10">

                    <div className="text-center">

                        <p className="text-slate-500">

                            Latitude

                        </p>

                        <h3 className="font-bold text-xl mt-2">

                            18.7883

                        </h3>

                    </div>

                    <div className="text-center">

                        <p className="text-slate-500">

                            Longitude

                        </p>

                        <h3 className="font-bold text-xl mt-2">

                            98.9853

                        </h3>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default LiveMap;