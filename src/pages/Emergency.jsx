import EmergencyStatusCard from "../components/emergency/EmergencyStatusCard";
import EmergencyMap from "../components/emergency/EmergencyMap";
import EmergencyContact from "../components/emergency/EmergencyContact";
import EmergencyDevice from "../components/emergency/EmergencyDevice";
import EmergencyHistory from "../components/emergency/EmergencyHistory";

import {
    FaExclamationTriangle,
    FaMapMarkerAlt,
    FaSignal,
    FaBatteryThreeQuarters,
} from "react-icons/fa";

function Emergency() {

    return (

        <div className="space-y-8">

            <div>

                <h1 className="text-4xl font-bold text-slate-800">

                    

                </h1>

                <p className="text-slate-500 mt-2">

                   

                </p>

            </div>

            {/* Top Cards */}

            <div className="grid grid-cols-12 gap-6">

                <div className="col-span-3">

                    <EmergencyStatusCard
                        title="Emergency"
                        value="SAFE"
                        color="#22c55e"
                        icon={<FaExclamationTriangle />}
                    />

                </div>

                <div className="col-span-3">

                    <EmergencyStatusCard
                        title="Location"
                        value="GPS ON"
                        color="#2563eb"
                        icon={<FaMapMarkerAlt />}
                    />

                </div>

                <div className="col-span-3">

                    <EmergencyStatusCard
                        title="Signal"
                        value="-54 dBm"
                        color="#f59e0b"
                        icon={<FaSignal />}
                    />

                </div>

                <div className="col-span-3">

                    <EmergencyStatusCard
                        title="Battery"
                        value="91%"
                        color="#10b981"
                        icon={<FaBatteryThreeQuarters />}
                    />

                </div>

            </div>

            {/* Map */}

            <EmergencyMap />

            {/* Contact */}

            <div className="grid grid-cols-12 gap-6">

                <div className="col-span-6">

                    <EmergencyContact />

                </div>

                <div className="col-span-6">

                    <EmergencyDevice />

                </div>

            </div>

            {/* History */}

            <EmergencyHistory />

        </div>

    );

}

export default Emergency;