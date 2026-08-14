import { motion } from "framer-motion";
import { FaLocationArrow } from "react-icons/fa";

function GPSCard({
    title,
    value,
    color,
}) {

    return (

        <motion.div
            whileHover={{
                y: -6,
                scale: 1.02,
            }}
            transition={{
                duration: 0.25,
            }}
            className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 h-[170px]"
        >

            <div className="flex justify-between items-start">

                <div>

                    <p className="text-slate-500 text-sm">

                        {title}

                    </p>

                    <h2
                        className="text-3xl font-bold mt-5 break-all"
                        style={{
                            color,
                        }}
                    >

                        {value}

                    </h2>

                </div>

                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                    style={{
                        backgroundColor: `${color}20`,
                        color,
                    }}
                >

                    <FaLocationArrow />

                </div>

            </div>

            <div className="mt-6">

                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">

                    <div
                        className="h-full rounded-full"
                        style={{
                            width: "100%",
                            backgroundColor: color,
                        }}
                    />

                </div>

                <p className="text-xs text-slate-400 mt-2">

                    GPS Live Data

                </p>

            </div>

        </motion.div>

    );

}

export default GPSCard;