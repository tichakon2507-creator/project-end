import {

FaHeartbeat,

FaBell,

FaHistory,

FaCog

}

from "react-icons/fa";

function Sidebar() {

    return (

        <div className="w-72 bg-blue-700 text-white">

            <div className="text-center text-2xl font-bold py-10">

                SHEM

            </div>

            <div className="space-y-3 px-5">

                <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-blue-800">

                    <FaHeartbeat />

                    Dashboard

                </button>

                <button className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-blue-800">

                    <FaBell />

                    Alerts

                </button>

                <button className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-blue-800">

                    <FaHistory />

                    History

                </button>

                <button className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-blue-800">

                    <FaCog />

                    Settings

                </button>

            </div>

        </div>

    )

}

export default Sidebar;