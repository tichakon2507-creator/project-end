import {
    APIProvider,
    Map,
    AdvancedMarker,
} from "@vis.gl/react-google-maps";

const center = {
    lat: 18.7883,
    lng: 98.9853,
};

function GoogleMap() {
    return (
        <div className="bg-white rounded-3xl shadow-md p-6 h-[420px]">

            <div className="flex justify-between mb-5">

                <div>

                    <h2 className="text-2xl font-bold">

                        GPS Tracking

                    </h2>

                    <p className="text-slate-500">

                        Current Device Location

                    </p>

                </div>

                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">

                    LIVE

                </span>

            </div>

            <div className="w-full h-[320px] rounded-2xl overflow-hidden">

                <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAP_API}>

                    <Map
                        defaultCenter={center}
                        defaultZoom={15}
                        mapId="smart-health-map"
                        gestureHandling="greedy"
                    >

                        <AdvancedMarker position={center} />

                    </Map>

                </APIProvider>

            </div>

        </div>
    );
}

export default GoogleMap;