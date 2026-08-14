import LiveMap from "../components/location/LiveMap";
import GPSCard from "../components/location/GPSCard";
import RouteInfo from "../components/location/RouteInfo";
import LocationHistory from "../components/location/LocationHistory";

function Location() {

    return (

        <div className="space-y-8">

            {/* GPS */}

            <div className="grid grid-cols-12 gap-6">

                <div className="col-span-3">

                    <GPSCard
                        title="Latitude"
                        value="18.7883"
                        color="#2563eb"
                    />

                </div>

                <div className="col-span-3">

                    <GPSCard
                        title="Longitude"
                        value="98.9853"
                        color="#16a34a"
                    />

                </div>

                <div className="col-span-3">

                    <GPSCard
                        title="Speed"
                        value="12 km/h"
                        color="#f59e0b"
                    />

                </div>

                <div className="col-span-3">

                    <GPSCard
                        title="Accuracy"
                        value="3 m"
                        color="#ef4444"
                    />

                </div>

            </div>

            <LiveMap />

            <div className="grid grid-cols-12 gap-6">

                <div className="col-span-4">

                    <RouteInfo />

                </div>

                <div className="col-span-8">

                    <LocationHistory />

                </div>

            </div>

        </div>

    );

}

export default Location;