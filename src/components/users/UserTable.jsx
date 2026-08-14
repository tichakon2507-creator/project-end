import {
    FaHeartbeat,
    FaUserShield,
    FaCircle,
    FaEdit,
    FaTrash,
} from "react-icons/fa";

const users = [
    {
        id: "U001",
        name: "John Smith",
        role: "Patient",
        age: 28,
        gender: "Male",
        heart: "82 BPM",
        status: "Online",
    },
    {
        id: "U002",
        name: "Emily Johnson",
        role: "Patient",
        age: 32,
        gender: "Female",
        heart: "79 BPM",
        status: "Offline",
    },
    {
        id: "U003",
        name: "Michael Brown",
        role: "Caregiver",
        age: 40,
        gender: "Male",
        heart: "-",
        status: "Online",
    },
    {
        id: "U004",
        name: "Sarah Wilson",
        role: "Patient",
        age: 24,
        gender: "Female",
        heart: "88 BPM",
        status: "Online",
    },
    {
        id: "U005",
        name: "David Miller",
        role: "Administrator",
        age: 36,
        gender: "Male",
        heart: "-",
        status: "Online",
    },
];

function UserTable() {

    return (

        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6">

            <div className="flex justify-between items-center mb-6">

                <div>

                    <h2 className="text-2xl font-bold text-slate-800">

                        User List

                    </h2>

                    <p className="text-slate-500 mt-1">

                        Registered users in the system

                    </p>

                </div>

                <span className="text-slate-500">

                    {users.length} Users

                </span>

            </div>

            <div className="overflow-x-auto">

                <table className="w-full">

                    <thead>

                        <tr className="border-b">

                            <th className="text-left py-4">ID</th>
                            <th className="text-left">Name</th>
                            <th className="text-left">Role</th>
                            <th className="text-left">Age</th>
                            <th className="text-left">Heart</th>
                            <th className="text-left">Status</th>
                            <th className="text-center">Action</th>

                        </tr>

                    </thead>

                    <tbody>

                        {users.map((user) => (

                            <tr
                                key={user.id}
                                className="border-b hover:bg-slate-50 transition"
                            >

                                <td className="py-5 font-semibold">

                                    {user.id}

                                </td>

                                <td>

                                    {user.name}

                                </td>

                                <td>

                                    <div className="flex items-center gap-2">

                                        {user.role === "Patient" ? (
                                            <FaHeartbeat className="text-red-500" />
                                        ) : (
                                            <FaUserShield className="text-blue-500" />
                                        )}

                                        {user.role}

                                    </div>

                                </td>

                                <td>

                                    {user.age}

                                </td>

                                <td>

                                    {user.heart}

                                </td>

                                <td>

                                    {user.status === "Online" ? (

                                        <span className="inline-flex items-center gap-2 text-green-600 font-semibold">

                                            <FaCircle className="text-xs" />

                                            Online

                                        </span>

                                    ) : (

                                        <span className="inline-flex items-center gap-2 text-slate-500 font-semibold">

                                            <FaCircle className="text-xs" />

                                            Offline

                                        </span>

                                    )}

                                </td>

                                <td>

                                    <div className="flex justify-center gap-3">

                                        <button className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition">

                                            <FaEdit className="mx-auto" />

                                        </button>

                                        <button className="w-10 h-10 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition">

                                            <FaTrash className="mx-auto" />

                                        </button>

                                    </div>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default UserTable;