import { useEffect, useState } from "react";

import {
    FaHeart,
    FaLungs,
    FaTemperatureHigh,
    FaBatteryThreeQuarters,
    FaHeartbeat,
    FaChartLine,
} from "react-icons/fa";

import useMQTT from "../hooks/useMQTT";
import { TOPICS } from "../constants/topics";

function Health() {

    // ==============================
    // MQTT REAL-TIME DATA
    // ==============================

    const heartMQTT = useMQTT(TOPICS.HEART, "--");
    const tempMQTT = useMQTT(TOPICS.TEMP, "--");
    const spo2MQTT = useMQTT(TOPICS.SPO2, "--");
    const batteryMQTT = useMQTT(TOPICS.BATTERY, "--");


    // ==============================
    // MYSQL DATA
    // ==============================

    const [latestData, setLatestData] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {

        const fetchHealthData = async () => {

            try {

                const response = await fetch(
                    "http://localhost:5000/api/health/latest"
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch health data");
                }

                const result = await response.json();

                console.log("Health API:", result);

                if (result.success) {

                    setLatestData(result.data);

                }

            } catch (error) {

                console.error(
                    "Failed to fetch health data:",
                    error
                );

            } finally {

                setLoading(false);

            }

        };


        fetchHealthData();

    }, []);


    // ==============================
    // DISPLAY VALUES
    // MQTT FIRST
    // MYSQL FALLBACK
    // ==============================

    const heart =
        heartMQTT !== "--"
            ? heartMQTT
            : latestData?.heart_rate ?? "--";


    const temp =
        tempMQTT !== "--"
            ? tempMQTT
            : latestData?.temperature ?? "--";


    const spo2 =
        spo2MQTT !== "--"
            ? spo2MQTT
            : latestData?.spo2 ?? "--";


    const battery =
        batteryMQTT !== "--"
            ? batteryMQTT
            : latestData?.battery_level ?? "--";


    // ==============================
    // LAST UPDATE
    // ==============================

    const lastUpdate = latestData?.recorded_at
        ? new Date(latestData.recorded_at).toLocaleString("th-TH")
        : "-";


    return (

        <div className="space-y-6">

            {/* ==============================
                PAGE HEADER
            ============================== */}

            <div>

                <h1 className="text-3xl font-bold text-slate-800">
                    Health Monitoring
                </h1>

                <p className="text-slate-500 mt-1">
                    Real-time health monitoring and vital signs
                </p>

            </div>


            {/* ==============================
                REAL-TIME STATUS
            ============================== */}

            <div className="flex items-center gap-3">

                <div className="w-3 h-3 rounded-full bg-green-500"></div>

                <span className="font-semibold text-green-600">
                    Real-time Monitoring
                </span>

            </div>


            {/* ==============================
                HEALTH CARDS
            ============================== */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">


                {/* HEART RATE */}

                <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6">

                    <div className="flex justify-between items-start">

                        <div>

                            <p className="text-slate-500 font-medium">
                                Heart Rate
                            </p>

                            <div className="flex items-end gap-2 mt-3">

                                <span className="text-4xl font-bold text-red-500">
                                    {heart}
                                </span>

                                <span className="text-slate-500 mb-1">
                                    BPM
                                </span>

                            </div>

                        </div>

                        <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">

                            <FaHeart
                                size={28}
                                className="text-red-500"
                            />

                        </div>

                    </div>

                    <div className="mt-5 flex items-center gap-2">

                        <FaHeartbeat className="text-green-500" />

                        <span className="font-semibold text-green-600">
                            Normal
                        </span>

                    </div>

                </div>


                {/* SPO2 */}

                <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6">

                    <div className="flex justify-between items-start">

                        <div>

                            <p className="text-slate-500 font-medium">
                                Blood Oxygen
                            </p>

                            <div className="flex items-end gap-2 mt-3">

                                <span className="text-4xl font-bold text-blue-600">
                                    {spo2}
                                </span>

                                <span className="text-slate-500 mb-1">
                                    %
                                </span>

                            </div>

                        </div>

                        <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">

                            <FaLungs
                                size={28}
                                className="text-blue-600"
                            />

                        </div>

                    </div>

                    <div className="mt-5 flex items-center gap-2">

                        <span className="font-semibold text-green-600">
                            Excellent
                        </span>

                    </div>

                </div>


                {/* TEMPERATURE */}

                <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6">

                    <div className="flex justify-between items-start">

                        <div>

                            <p className="text-slate-500 font-medium">
                                Body Temperature
                            </p>

                            <div className="flex items-end gap-2 mt-3">

                                <span className="text-4xl font-bold text-orange-500">
                                    {temp}
                                </span>

                                <span className="text-slate-500 mb-1">
                                    °C
                                </span>

                            </div>

                        </div>

                        <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">

                            <FaTemperatureHigh
                                size={28}
                                className="text-orange-500"
                            />

                        </div>

                    </div>

                    <div className="mt-5">

                        <span className="font-semibold text-green-600">
                            Normal
                        </span>

                    </div>

                </div>


                {/* BATTERY */}

                <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6">

                    <div className="flex justify-between items-start">

                        <div>

                            <p className="text-slate-500 font-medium">
                                Device Battery
                            </p>

                            <div className="flex items-end gap-2 mt-3">

                                <span className="text-4xl font-bold text-emerald-500">
                                    {battery}
                                </span>

                                <span className="text-slate-500 mb-1">
                                    %
                                </span>

                            </div>

                        </div>

                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">

                            <FaBatteryThreeQuarters
                                size={28}
                                className="text-emerald-500"
                            />

                        </div>

                    </div>

                    <div className="mt-5">

                        <span className="font-semibold text-green-600">
                            Device Active
                        </span>

                    </div>

                </div>

            </div>


            {/* ==============================
                CURRENT HEALTH SUMMARY
            ============================== */}

            <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6">

                <div className="flex items-center gap-3 mb-6">

                    <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">

                        <FaChartLine
                            className="text-blue-600"
                            size={21}
                        />

                    </div>

                    <div>

                        <h2 className="text-2xl font-bold text-slate-800">
                            Current Health Summary
                        </h2>

                        <p className="text-slate-500">
                            Latest health data from Smart Health Device
                        </p>

                    </div>

                </div>


                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                    <div className="bg-slate-50 rounded-2xl p-5">

                        <p className="text-slate-500">
                            Heart Rate
                        </p>

                        <p className="text-2xl font-bold mt-2">
                            {heart} BPM
                        </p>

                    </div>


                    <div className="bg-slate-50 rounded-2xl p-5">

                        <p className="text-slate-500">
                            SpO₂
                        </p>

                        <p className="text-2xl font-bold mt-2">
                            {spo2} %
                        </p>

                    </div>


                    <div className="bg-slate-50 rounded-2xl p-5">

                        <p className="text-slate-500">
                            Temperature
                        </p>

                        <p className="text-2xl font-bold mt-2">
                            {temp} °C
                        </p>

                    </div>


                    <div className="bg-slate-50 rounded-2xl p-5">

                        <p className="text-slate-500">
                            Battery
                        </p>

                        <p className="text-2xl font-bold mt-2">
                            {battery} %
                        </p>

                    </div>

                </div>

            </div>


            {/* ==============================
                DATABASE INFORMATION
            ============================== */}

            <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6">

                <h2 className="text-xl font-bold text-slate-800">
                    Database Record
                </h2>

                <p className="text-slate-500 mt-1">
                    Latest health record stored in MySQL
                </p>


                {loading ? (

                    <div className="mt-5 text-slate-500">
                        Loading database record...
                    </div>

                ) : latestData ? (

                    <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">

                        <div>

                            <p className="text-sm text-slate-500">
                                Record ID
                            </p>

                            <p className="font-bold mt-1">
                                #{latestData.record_id}
                            </p>

                        </div>


                        <div>

                            <p className="text-sm text-slate-500">
                                Device ID
                            </p>

                            <p className="font-bold mt-1">
                                #{latestData.device_id}
                            </p>

                        </div>


                        <div>

                            <p className="text-sm text-slate-500">
                                User ID
                            </p>

                            <p className="font-bold mt-1">
                                #{latestData.user_id}
                            </p>

                        </div>


                        <div>

                            <p className="text-sm text-slate-500">
                                Last Update
                            </p>

                            <p className="font-bold mt-1">
                                {lastUpdate}
                            </p>

                        </div>

                    </div>

                ) : (

                    <div className="mt-5 text-red-500">
                        No database record found.
                    </div>

                )}

            </div>

        </div>

    );

}

export default Health;