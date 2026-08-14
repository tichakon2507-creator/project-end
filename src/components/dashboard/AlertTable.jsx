import {
    FaExclamationTriangle,
    FaCheckCircle,
    FaClock,
} from "react-icons/fa";

const alerts = [
    {
        time: "12:30",
        type: "Heart Rate",
        status: "Normal",
        icon: <FaCheckCircle className="text-green-600" />,
    },
    {
        time: "11:45",
        type: "Temperature",
        status: "Normal",
        icon: <FaCheckCircle className="text-green-600" />,
    },
    {
        time: "10:20",
        type: "Emergency Button",
        status: "No Alert",
        icon: <FaExclamationTriangle className="text-orange-500" />,
    },
    {
        time: "09:15",
        type: "GPS Update",
        status: "Success",
        icon: <FaClock className="text-blue-500" />,
    },
];

function AlertTable() {
    return (
        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6">

            <div className="flex justify-between items-center mb-6">

                <h2 className="text-2xl font-bold text-slate-800">

                    Recent Activity

                </h2>

                <button className="text-blue-600 font-semibold">

                    View All

                </button>

            </div>

            <div className="space-y-4">

                {alerts.map((item, index) => (

                    <div
                        key={index}
                        className="flex items-center justify-between border-b border-slate-100 pb-4"
                    >

                        <div className="flex items-center gap-4">

                            <div className="text-2xl">

                                {item.icon}

                            </div>

                            <div>

                                <p className="font-semibold">

                                    {item.type}

                                </p>

                                <p className="text-slate-500 text-sm">

                                    {item.time}

                                </p>

                            </div>

                        </div>

                        <span className="font-semibold text-slate-700">

                            {item.status}

                        </span>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default AlertTable;