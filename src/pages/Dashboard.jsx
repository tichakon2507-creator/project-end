import { useEffect, useState } from "react";

import HealthCard from "../components/cards/HealthCard";
import HealthChart from "../components/charts/HealthChart";
import DeviceStatus from "../components/dashboard/DeviceStatus";
import EmergencyCard from "../components/dashboard/EmergencyCard";
import AlertTable from "../components/dashboard/AlertTable";

import useMQTT from "../hooks/useMQTT";
import { TOPICS } from "../constants/topics";

import {
    FaHeart,
    FaTemperatureHigh,
    FaBatteryThreeQuarters,
    FaLungs,
} from "react-icons/fa";


function Dashboard() {

    // =========================================================
    // MQTT
    // =========================================================
    // ไม่มีค่าเริ่มต้นจาก MQTT
    // ถ้ายังไม่มีข้อมูล MQTT จะได้ null
    // =========================================================

    const heartMQTT = useMQTT(TOPICS.HEART);
const tempMQTT = useMQTT(TOPICS.TEMP);
const spo2MQTT = useMQTT(TOPICS.SPO2);
const batteryMQTT = useMQTT(TOPICS.BATTERY);


    // =========================================================
    // Database / Backend Data
    // =========================================================

    const [healthData, setHealthData] = useState({

        heart_rate: null,
        spo2: null,
        temperature: null,
        battery_level: null,
        recorded_at: null,

    });


    // =========================================================
    // API Loading
    // =========================================================

    const [loading, setLoading] = useState(true);


    // =========================================================
    // API Error
    // =========================================================

    const [apiError, setApiError] = useState(false);


    // =========================================================
    // Fetch Latest Health Data
    // =========================================================

    useEffect(() => {

        let isMounted = true;


        const fetchHealthData = async () => {

            try {

                setLoading(true);

                setApiError(false);


                const response = await fetch(
                    "http://localhost:5000/api/health/latest"
                );


                if (!response.ok) {

                    throw new Error(
                        `HTTP Error: ${response.status}`
                    );

                }


                const result = await response.json();


                if (
                    isMounted &&
                    result.success &&
                    result.data
                ) {

                    setHealthData({

                        heart_rate:
                            result.data.heart_rate,

                        spo2:
                            result.data.spo2,

                        temperature:
                            result.data.temperature,

                        battery_level:
                            result.data.battery_level,

                        recorded_at:
                            result.data.recorded_at,

                    });

                }

            } catch (error) {

                console.error(
                    "Failed to fetch health data:",
                    error
                );


                if (isMounted) {

                    setApiError(true);

                }

            } finally {

                if (isMounted) {

                    setLoading(false);

                }

            }

        };


        fetchHealthData();


        return () => {

            isMounted = false;

        };

    }, []);


    // =========================================================
    // MQTT / Database Fallback
    // =========================================================
    //
    // Priority:
    //
    // 1. MQTT
    // 2. MySQL
    // 3. "--"
    //
    // =========================================================

    const heart =
        heartMQTT !== null &&
        heartMQTT !== undefined &&
        heartMQTT !== ""
            ? heartMQTT
            : healthData.heart_rate ?? "--";


    const temp =
        tempMQTT !== null &&
        tempMQTT !== undefined &&
        tempMQTT !== ""
            ? tempMQTT
            : healthData.temperature ?? "--";


    const spo2 =
        spo2MQTT !== null &&
        spo2MQTT !== undefined &&
        spo2MQTT !== ""
            ? spo2MQTT
            : healthData.spo2 ?? "--";


    const battery =
        batteryMQTT !== null &&
        batteryMQTT !== undefined &&
        batteryMQTT !== ""
            ? batteryMQTT
            : healthData.battery_level ?? "--";


    // =========================================================
    // Render
    // =========================================================

    return (

        <div className="space-y-8">


            {/* =====================================================
                Health Cards
            ===================================================== */}

            <div className="grid grid-cols-12 gap-6">


                {/* Heart Rate */}

                <div className="col-span-3">

                    <HealthCard

                        title="Heart Rate"

                        value={heart}

                        unit="BPM"

                        color="#ef4444"

                        icon={<FaHeart />}

                        status="Normal"

                        trend="up"

                    />

                </div>


                {/* SpO2 */}

                <div className="col-span-3">

                    <HealthCard

                        title="SpO₂"

                        value={spo2}

                        unit="%"

                        color="#2563eb"

                        icon={<FaLungs />}

                        status="Excellent"

                        trend="up"

                    />

                </div>


                {/* Temperature */}

                <div className="col-span-3">

                    <HealthCard

                        title="Temperature"

                        value={temp}

                        unit="°C"

                        color="#f59e0b"

                        icon={<FaTemperatureHigh />}

                        status="Normal"

                        trend="up"

                    />

                </div>


                {/* Battery */}

                <div className="col-span-3">

                    <HealthCard

                        title="Battery"

                        value={battery}

                        unit="%"

                        color="#10b981"

                        icon={<FaBatteryThreeQuarters />}

                        status="Charging"

                        trend="down"

                    />

                </div>

            </div>


            {/* =====================================================
                Chart + Device Status
            ===================================================== */}

            <div className="grid grid-cols-12 gap-6">


                <div className="col-span-8">

                    <HealthChart />

                </div>


                <div className="col-span-4">

                    <DeviceStatus />

                </div>

            </div>


            {/* =====================================================
                Google Maps + Emergency
            ===================================================== */}

            <div className="grid grid-cols-12 gap-6">


                <div className="col-span-8 bg-white rounded-3xl shadow-md border border-slate-200 h-[420px] flex items-center justify-center">

                    <div className="text-center">

                        <h2 className="text-3xl font-bold">

                            Google Maps

                        </h2>

                        <p className="text-slate-500 mt-2">

                            Coming Soon

                        </p>

                    </div>

                </div>


                <div className="col-span-4">

                    <EmergencyCard />

                </div>

            </div>


            {/* =====================================================
                Recent Activity
            ===================================================== */}

            <AlertTable />


        </div>

    );

}


export default Dashboard;