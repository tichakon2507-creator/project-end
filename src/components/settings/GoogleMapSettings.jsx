import { useState } from "react";
import {
    FaMapMarkedAlt,
    FaKey,
    FaGlobeAsia,
    FaCrosshairs,
    FaSave,
    FaMap,
    FaCheckCircle,
    FaLocationArrow,
    FaSatellite,
    FaCompass,
} from "react-icons/fa";

function GoogleMapSettings() {

    const [config, setConfig] = useState({

        apiKey: "",
        latitude: "18.788343",
        longitude: "98.985300",
        zoom: "15",
        mapType: "roadmap",

    });

    const handleChange = (e) => {

        const { name, value } = e.target;

        setConfig((prev) => ({
            ...prev,
            [name]: value,
        }));

    };

    return (

        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">

            {/* Header */}

            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-8 py-6 flex justify-between items-center text-white">

                <div>

                    <h2 className="text-3xl font-bold">

                        Google Maps Configuration

                    </h2>

                    <p className="text-cyan-100 mt-2">

                        Configure Google Maps API & GPS Settings

                    </p>

                </div>

                <div className="bg-green-500 rounded-2xl px-5 py-3 flex items-center gap-3">

                    <FaCheckCircle />

                    Ready

                </div>

            </div>

            <div className="p-8 space-y-8">

                <div>

                    <h3 className="text-xl font-bold mb-5">

                        Maps Configuration

                    </h3>

                    <div className="grid grid-cols-2 gap-6">

                        <div className="col-span-2">

                            <label className="block mb-2 font-semibold">

                                Google Maps API Key

                            </label>

                            <div className="relative">

                                <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>

                                <input
                                    type="password"
                                    name="apiKey"
                                    value={config.apiKey}
                                    onChange={handleChange}
                                    placeholder="AIzaSy..."
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
                                />

                            </div>

                        </div>

                        <div>

                            <label className="block mb-2 font-semibold">

                                Latitude

                            </label>

                            <div className="relative">

                                <FaGlobeAsia className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>

                                <input
                                    name="latitude"
                                    value={config.latitude}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
                                />

                            </div>

                        </div>

                        <div>

                            <label className="block mb-2 font-semibold">

                                Longitude

                            </label>

                            <div className="relative">

                                <FaCrosshairs className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>

                                <input
                                    name="longitude"
                                    value={config.longitude}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
                                />

                            </div>

                        </div>

                        <div>

                            <label className="block mb-2 font-semibold">

                                Default Zoom

                            </label>

                            <input
                                name="zoom"
                                value={config.zoom}
                                onChange={handleChange}
                                className="w-full px-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
                            />

                        </div>

                        <div>

                            <label className="block mb-2 font-semibold">

                                Map Type

                            </label>

                            <div className="relative">

                                <FaMap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>

                                <select
                                    name="mapType"
                                    value={config.mapType}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
                                >

                                    <option value="roadmap">Roadmap</option>
                                    <option value="satellite">Satellite</option>
                                    <option value="hybrid">Hybrid</option>
                                    <option value="terrain">Terrain</option>

                                </select>

                            </div>

                        </div>

                    </div>

                </div>
                                {/* Preview & Information */}

                <div className="grid lg:grid-cols-3 gap-6">

                    {/* Preview */}

                    <div className="lg:col-span-2 bg-slate-50 rounded-2xl border border-dashed border-slate-300 h-[320px] flex flex-col items-center justify-center">

                        <FaMapMarkedAlt
                            size={70}
                            className="text-cyan-500"
                        />

                        <h3 className="text-2xl font-bold mt-5">

                            Google Maps Preview

                        </h3>

                        <p className="text-slate-500 mt-2">

                            Live map preview will appear after API integration

                        </p>

                        <div className="mt-8 flex gap-4">

                            <div className="bg-white rounded-xl shadow-sm border px-5 py-3">

                                <p className="text-sm text-slate-500">

                                    Latitude

                                </p>

                                <h4 className="font-bold">

                                    {config.latitude}

                                </h4>

                            </div>

                            <div className="bg-white rounded-xl shadow-sm border px-5 py-3">

                                <p className="text-sm text-slate-500">

                                    Longitude

                                </p>

                                <h4 className="font-bold">

                                    {config.longitude}

                                </h4>

                            </div>

                        </div>

                    </div>

                    {/* Status */}

                    <div className="space-y-6">

                        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">

                            <div className="flex items-center gap-3 mb-4">

                                <FaLocationArrow className="text-green-600 text-2xl"/>

                                <h3 className="font-bold">

                                    GPS Status

                                </h3>

                            </div>

                            <div className="space-y-3">

                                <div className="flex justify-between">

                                    <span>Signal</span>

                                    <span className="font-semibold text-green-600">

                                        Excellent

                                    </span>

                                </div>

                                <div className="flex justify-between">

                                    <span>Satellites</span>

                                    <span className="font-semibold">

                                        14

                                    </span>

                                </div>

                                <div className="flex justify-between">

                                    <span>Accuracy</span>

                                    <span className="font-semibold">

                                        ±3 m

                                    </span>

                                </div>

                            </div>

                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">

                            <div className="flex items-center gap-3 mb-4">

                                <FaSatellite className="text-blue-600 text-2xl"/>

                                <h3 className="font-bold">

                                    Maps Information

                                </h3>

                            </div>

                            <div className="space-y-3">

                                <div className="flex justify-between">

                                    <span>Provider</span>

                                    <span className="font-semibold">

                                        Google Maps

                                    </span>

                                </div>

                                <div className="flex justify-between">

                                    <span>Zoom</span>

                                    <span className="font-semibold">

                                        {config.zoom}

                                    </span>

                                </div>

                                <div className="flex justify-between">

                                    <span>Type</span>

                                    <span className="font-semibold capitalize">

                                        {config.mapType}

                                    </span>

                                </div>

                            </div>

                        </div>

                        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">

                            <div className="flex items-center gap-3 mb-4">

                                <FaCompass className="text-orange-500 text-2xl"/>

                                <h3 className="font-bold">

                                    Default Location

                                </h3>

                            </div>

                            <p className="text-sm text-slate-600 leading-7">

                                Chiang Mai, Thailand

                            </p>

                            <p className="text-xs text-slate-400 mt-2">

                                Used when GPS signal is unavailable.

                            </p>

                        </div>

                    </div>

                </div>

                {/* Action */}

                <div className="border-t pt-8 flex justify-between items-center">

                    <button className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 transition">

                        Reset

                    </button>

                    <div className="flex gap-4">

                        <button className="px-6 py-3 rounded-xl border border-cyan-500 text-cyan-600 hover:bg-cyan-50 transition">

                            Test API Key

                        </button>

                        <button className="flex items-center gap-3 bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-xl transition">

                            <FaSave />

                            Save Configuration

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default GoogleMapSettings;