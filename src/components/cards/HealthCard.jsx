function HealthCard({ title, value, unit, color }) {
    return (
        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">

            <p className="text-gray-500 text-sm">
                {title}
            </p>

            <h2
                className="text-4xl font-bold mt-4"
                style={{ color }}
            >
                {value}
            </h2>

            <p className="text-gray-400 mt-2">
                {unit}
            </p>

        </div>
    );
}

export default HealthCard;