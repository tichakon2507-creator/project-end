import HealthCard from "../components/cards/HealthCard";

function Dashboard() {
    return (

        <div>

            <div className="grid grid-cols-4 gap-6">

                <HealthCard
                    title="Heart Rate"
                    value="82"
                    unit="BPM"
                    color="#ef4444"
                />

                <HealthCard
                    title="SpO₂"
                    value="98"
                    unit="%"
                    color="#2563eb"
                />

                <HealthCard
                    title="Temperature"
                    value="36.8"
                    unit="°C"
                    color="#f59e0b"
                />

                <HealthCard
                    title="Battery"
                    value="91"
                    unit="%"
                    color="#10b981"
                />

            </div>

        </div>

    );
}

export default Dashboard;