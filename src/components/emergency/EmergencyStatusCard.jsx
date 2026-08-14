import { motion } from "framer-motion";

function EmergencyStatusCard({
    title,
    value,
    color,
    icon,
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
            className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 h-[180px]"
        >

            <div className="flex justify-between items-start">

                <div>

                    <p className="text-slate-500 text-sm">

                        {title}

                    </p>

                    <h2
                        className="text-4xl font-bold mt-6"
                        style={{
                            color,
                        }}
                    >

                        {value}

                    </h2>

                </div>

                <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                    style={{
                        backgroundColor: `${color}20`,
                        color,
                    }}
                >

                    {icon}

                </div>

            </div>

            <div className="mt-8">

                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">

                    <div
                        className="h-full rounded-full"
                        style={{
                            width: "90%",
                            backgroundColor: color,
                        }}
                    />

                </div>

                <p className="text-xs text-slate-400 mt-2">

                    Device Status

                </p>

            </div>

        </motion.div>

    );

}

export default EmergencyStatusCard;