import {
    FaWifi,
    FaMicrochip,
    FaUserCircle
} from "react-icons/fa";

function Navbar() {

    return (

        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">

            <div>

                <h1 className="text-3xl font-bold text-slate-800">

                    Smart Health Dashboard

                </h1>

                <p className="text-slate-500">

                    Smart Health & Emergency Monitoring System

                </p>

            </div>

            <div className="flex items-center gap-8">

                <div className="flex items-center gap-2 text-green-600 font-semibold">

                    <FaWifi />

                    MQTT Connected

                </div>

                <div className="flex items-center gap-2 text-blue-600 font-semibold">

                    <FaMicrochip />

                    ESP32 Online

                </div>

                <div className="flex items-center gap-3">

                    <FaUserCircle
                        size={42}
                        className="text-slate-500"
                    />

                    <div>

                        <p className="font-semibold">

                            Administrator

                        </p>

                        <p className="text-green-600 text-sm">

                            Online

                        </p>

                    </div>

                </div>

            </div>

        </header>

    );

}

export default Navbar;