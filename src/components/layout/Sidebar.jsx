import {
    FaHeartbeat,
    FaBell,
    FaMapMarkedAlt,
    FaHistory,
    FaMicrochip,
    FaUsers,
    FaCog
} from "react-icons/fa";

import { NavLink } from "react-router-dom";

const menus = [

    {
        title:"Dashboard",
        path:"/",
        icon:<FaHeartbeat/>
    },

    {
        title:"Health",
        path:"/health",
        icon:<FaHeartbeat/>
    },

    {
        title:"Emergency",
        path:"/emergency",
        icon:<FaBell/>
    },

    {
        title:"GPS Tracking",
        path:"/location",
        icon:<FaMapMarkedAlt/>
    },

    {
        title:"History",
        path:"/history",
        icon:<FaHistory/>
    },

    {
        title:"Device",
        path:"/device",
        icon:<FaMicrochip/>
    },

    {
        title:"Users",
        path:"/users",
        icon:<FaUsers/>
    },

    {
        title:"Settings",
        path:"/settings",
        icon:<FaCog/>
    }

];

function Sidebar(){

    return(

        <aside className="w-72 bg-slate-900 text-white flex flex-col">

            <div className="p-8">

                <h1 className="text-4xl font-bold">

                    SHEM

                </h1>

                <p className="text-slate-400 mt-2">

                    Smart Health & Emergency

                </p>

            </div>

            <nav className="px-4 flex-1">

                {

                    menus.map(menu=>(

                        <NavLink

                            key={menu.path}

                            to={menu.path}

                            className={({isActive})=>

                                `flex items-center gap-4 px-5 py-4 rounded-xl mb-2 transition
                                ${isActive
                                    ? "bg-blue-600"
                                    : "hover:bg-slate-800"
                                }`
                            }

                        >

                            {menu.icon}

                            {menu.title}

                        </NavLink>

                    ))

                }

            </nav>

            <div className="p-5 border-t border-slate-700">

                <p>

                    Device

                    <span className="float-right text-green-400">

                        ● Online

                    </span>

                </p>

                <p className="mt-2">

                    MQTT

                    <span className="float-right text-green-400">

                        Connected

                    </span>

                </p>

                <p className="mt-2">

                    Version

                    <span className="float-right">

                        v1.0.0

                    </span>

                </p>

            </div>

        </aside>

    );

}

export default Sidebar;