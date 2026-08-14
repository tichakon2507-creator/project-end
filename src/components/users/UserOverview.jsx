import {
    FaUsers,
    FaUserCheck,
    FaHeartbeat,
    FaUserShield,
} from "react-icons/fa";

const overview = [
    {
        title: "Total Users",
        value: "156",
        color: "#2563eb",
        icon: <FaUsers />,
    },
    {
        title: "Online Users",
        value: "48",
        color: "#22c55e",
        icon: <FaUserCheck />,
    },
    {
        title: "Patients",
        value: "121",
        color: "#ef4444",
        icon: <FaHeartbeat />,
    },
    {
        title: "Caregivers",
        value: "35",
        color: "#7c3aed",
        icon: <FaUserShield />,
    },
];

function UserOverview() {

    return (

        <div className="grid grid-cols-12 gap-6">

            {overview.map((item, index) => (

                <div
                    key={index}
                    className="col-span-3"
                >

                    <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 h-[180px]">

                        <div className="flex justify-between items-start">

                            <div>

                                <p className="text-slate-500 text-sm">

                                    {item.title}

                                </p>

                                <h2
                                    className="text-5xl font-bold mt-6"
                                    style={{
                                        color: item.color,
                                    }}
                                >

                                    {item.value}

                                </h2>

                            </div>

                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                                style={{
                                    backgroundColor: `${item.color}20`,
                                    color: item.color,
                                }}
                            >

                                {item.icon}

                            </div>

                        </div>

                        <div className="mt-8">

                            <div className="h-2 rounded-full bg-slate-200 overflow-hidden">

                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: "85%",
                                        backgroundColor: item.color,
                                    }}
                                />

                            </div>

                        </div>

                    </div>

                </div>

            ))}

        </div>

    );

}

export default UserOverview;