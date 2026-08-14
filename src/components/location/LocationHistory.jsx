import {
    FaMapMarkerAlt,
    FaClock,
    FaRoute,
    FaCheckCircle,
} from "react-icons/fa";

const history = [
    {
        date: "08/08/2026",
        time: "08:15",
        latitude: "18.7883",
        longitude: "98.9853",
        speed: "12 km/h",
        status: "Moving",
    },
    {
        date: "08/08/2026",
        time: "08:08",
        latitude: "18.7879",
        longitude: "98.9848",
        speed: "8 km/h",
        status: "Moving",
    },
    {
        date: "08/08/2026",
        time: "08:01",
        latitude: "18.7875",
        longitude: "98.9842",
        speed: "0 km/h",
        status: "Stopped",
    },
    {
        date: "07/08/2026",
        time: "18:40",
        latitude: "18.7850",
        longitude: "98.9818",
        speed: "15 km/h",
        status: "Moving",
    },
    {
        date: "07/08/2026",
        time: "18:10",
        latitude: "18.7822",
        longitude: "98.9795",
        speed: "5 km/h",
        status: "Moving",
    },
];

function LocationHistory() {

    return (

        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 h-[420px]">

            <div className="flex justify-between items-center mb-6">

                <div>

                    <h2 className="text-2xl font-bold text-slate-800">

                        Location History

                    </h2>

                    <p className="text-slate-500 mt-1">

                        Recent GPS Records

                    </p>

                </div>

                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl transition">

                    Export

                </button>

            </div>

            <div className="overflow-y-auto h-[300px] pr-2">

                <div className="space-y-4">

                    {history.map((item, index) => (

                        <div
                            key={index}
                            className="border border-slate-200 rounded-2xl p-4 hover:bg-slate-50 transition"
                        >

                            <div className="flex justify-between items-start">

                                <div>

                                    <div className="flex items-center gap-2">

                                        <FaClock className="text-slate-400" />

                                        <span className="font-semibold">

                                            {item.date}

                                        </span>

                                        <span className="text-slate-500">

                                            {item.time}

                                        </span>

                                    </div>

                                    <div className="mt-4 flex items-center gap-2">

                                        <FaMapMarkerAlt className="text-red-500" />

                                        <span>

                                            {item.latitude}, {item.longitude}

                                        </span>

                                    </div>

                                    <div className="mt-2 flex items-center gap-2">

                                        <FaRoute className="text-blue-500" />

                                        <span>

                                            Speed : {item.speed}

                                        </span>

                                    </div>

                                </div>

                                <div>

                                    {item.status === "Moving" ? (

                                        <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-xl">

                                            <FaCheckCircle />

                                            Moving

                                        </span>

                                    ) : (

                                        <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-2 rounded-xl">

                                            <FaCheckCircle />

                                            Stopped

                                        </span>

                                    )}

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </div>

    );

}

export default LocationHistory;