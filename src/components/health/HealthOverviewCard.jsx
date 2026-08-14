import { motion } from "framer-motion";

function HealthOverviewCard({
    title,
    value,
    unit,
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
            className="bg-white rounded-3xl shadow-md border border-slate-200 p-5 h-[180px]"
        >

            <div className="flex justify-between items-start">

                <div>

                    <p className="text-slate-500 text-sm">

                        {title}

                    </p>

                    <h2
                        className="text-4xl font-bold mt-5"
                        style={{ color }}
                    >

                        {value}

                    </h2>

                    <p className="text-slate-500 mt-2">

                        {unit}

                    </p>

                </div>

                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                    style={{
                        backgroundColor: `${color}20`,
                        color,
                    }}
                >

                    {icon}

                </div>

            </div>

            <div className="mt-6">

                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">

                    <div
                        className="h-full rounded-full"
                        style={{
                            width: "82%",
                            backgroundColor: color,
                        }}
                    />

                </div>

                <p className="text-xs text-slate-400 mt-2">

                    Healthy Range

                </p>

            </div>

        </motion.div>

    );

}

export default HealthOverviewCard;