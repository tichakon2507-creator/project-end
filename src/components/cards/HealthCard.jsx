import { motion } from "framer-motion";
import {
    FaArrowTrendUp,
    FaArrowTrendDown,
} from "react-icons/fa6";

function HealthCard({
    title,
    value,
    unit,
    color,
    icon,
    status = "Normal",
    trend = "up",
}) {
    return (
        <motion.div
            whileHover={{
                y: -5,
                scale: 1.02,
            }}
            transition={{
                duration: 0.25,
            }}
            className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 h-[180px]"
        >
            <div className="flex justify-between">

                <div>

                    <p className="text-slate-500 text-sm font-medium">
                        {title}
                    </p>

                    <h2
                        className="text-5xl font-bold mt-5"
                        style={{ color }}
                    >
                        {value}
                    </h2>

                    <p className="text-slate-500 text-lg mt-2">
                        {unit}
                    </p>

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

            <div className="flex justify-between items-center mt-8">

                <span className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-semibold">

                    {status}

                </span>

                <div
                    className={`flex items-center gap-2 font-bold ${
                        trend === "up"
                            ? "text-green-600"
                            : "text-red-500"
                    }`}
                >
                    {trend === "up"
                        ? <FaArrowTrendUp />
                        : <FaArrowTrendDown />}

                    {trend === "up"
                        ? "+2.3%"
                        : "-1.1%"}
                </div>

            </div>

        </motion.div>
    );
}

export default HealthCard;