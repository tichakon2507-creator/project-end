import {
    FaRoute,
    FaClock,
    FaRoad,
    FaLocationArrow,
    FaFlagCheckered,
} from "react-icons/fa";

const route = [
    {
        title: "Start",
        value: "Chiang Mai University",
        icon: <FaLocationArrow />,
        color: "bg-blue-100 text-blue-600",
    },
    {
        title: "Current",
        value: "Nimmanhaemin Road",
        icon: <FaRoute />,
        color: "bg-green-100 text-green-600",
    },
    {
        title: "Destination",
        value: "Maharaj Hospital",
        icon: <FaFlagCheckered />,
        color: "bg-red-100 text-red-600",
    },
];

function RouteInfo() {

    return (

        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 h-[420px]">

            <div className="mb-6">

                <h2 className="text-2xl font-bold text-slate-800">

                    Route Information

                </h2>

                <p className="text-slate-500 mt-1">

                    Current Navigation Details

                </p>

            </div>

            <div className="space-y-4">

                {route.map((item, index) => (

                    <div
                        key={index}
                        className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4"
                    >

                        <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${item.color}`}
                        >
                            {item.icon}
                        </div>

                        <div>

                            <p className="text-sm text-slate-500">

                                {item.title}

                            </p>

                            <p className="font-semibold text-slate-800">

                                {item.value}

                            </p>

                        </div>

                    </div>

                ))}

            </div>

            <div className="border-t mt-6 pt-6 space-y-4">

                <div className="flex justify-between">

                    <div className="flex items-center gap-2">

                        <FaRoad className="text-slate-500" />

                        <span>Total Distance</span>

                    </div>

                    <span className="font-bold">

                        12.4 km

                    </span>

                </div>

                <div className="flex justify-between">

                    <div className="flex items-center gap-2">

                        <FaClock className="text-slate-500" />

                        <span>Estimated Time</span>

                    </div>

                    <span className="font-bold">

                        18 min

                    </span>

                </div>

                <div className="flex justify-between">

                    <span>GPS Status</span>

                    <span className="text-green-600 font-bold">

                        Connected

                    </span>

                </div>

            </div>

        </div>

    );

}

export default RouteInfo;