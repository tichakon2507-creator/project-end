import { FaMapMarkedAlt } from "react-icons/fa";

function EmergencyMap() {

    return (

        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 h-[500px]">

            <div className="flex justify-between items-center mb-6">

                <div>

                    <h2 className="text-2xl font-bold text-slate-800">

                        Live GPS Tracking

                    </h2>

                    <p className="text-slate-500 mt-1">

                        Current Device Location

                    </p>

                </div>

                <div className="bg-blue-100 text-blue-600 px-4 py-2 rounded-xl font-semibold">

                    LIVE

                </div>

            </div>

            <div className="h-[390px] rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center">

                <FaMapMarkedAlt
                    className="text-slate-400"
                    size={80}
                />

                <h3 className="text-2xl font-bold text-slate-700 mt-6">

                    Google Maps

                </h3>

                <p className="text-slate-500 mt-2">

                    Google Maps API will be integrated later

                </p>

                <div className="mt-8 text-center">

                    <p className="text-sm text-slate-500">

                        Latitude

                    </p>

                    <p className="font-bold">

                        18.7883

                    </p>

                    <p className="text-sm text-slate-500 mt-4">

                        Longitude

                    </p>

                    <p className="font-bold">

                        98.9853

                    </p>

                </div>

            </div>

        </div>

    );

}

export default EmergencyMap;