import {
    FaMicrochip,
    FaCodeBranch,
    FaCalendarAlt,
    FaMemory,
    FaSdCard,
    FaClock,
} from "react-icons/fa";

const information = [
    {
        icon: <FaMicrochip />,
        title: "Board",
        value: "ESP32 DevKit V1",
    },
    {
        icon: <FaCodeBranch />,
        title: "Firmware",
        value: "v1.0.0",
    },
    {
        icon: <FaCalendarAlt />,
        title: "Build Date",
        value: "08 Aug 2026",
    },
    {
        icon: <FaMemory />,
        title: "Flash Memory",
        value: "4 MB",
    },
    {
        icon: <FaSdCard />,
        title: "Free Heap",
        value: "231 KB",
    },
    {
        icon: <FaClock />,
        title: "Uptime",
        value: "12 h 34 m",
    },
];

function DeviceInformation() {

    return (

        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6">

            <div className="mb-6">

                <h2 className="text-2xl font-bold text-slate-800">

                    Device Information

                </h2>

                <p className="text-slate-500 mt-1">

                    Hardware & Firmware Details

                </p>

            </div>

            <div className="grid grid-cols-12 gap-5">

                {information.map((item, index) => (

                    <div
                        key={index}
                        className="col-span-4 bg-slate-50 rounded-2xl p-5"
                    >

                        <div className="flex items-center gap-4">

                            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">

                                {item.icon}

                            </div>

                            <div>

                                <p className="text-sm text-slate-500">

                                    {item.title}

                                </p>

                                <h3 className="font-bold text-slate-800 mt-1">

                                    {item.value}

                                </h3>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default DeviceInformation;