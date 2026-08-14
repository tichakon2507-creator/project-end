import DeviceOverview from "../components/device/DeviceOverview";
import SensorStatus from "../components/device/SensorStatus";
import NetworkStatus from "../components/device/NetworkStatus";
import DeviceInformation from "../components/device/DeviceInformation";
import DeviceLog from "../components/device/DeviceLog";

function Device() {

    return (

        <div className="space-y-8">

            <DeviceOverview />

            <div className="grid grid-cols-12 gap-6">

                <div className="col-span-6">

                    <SensorStatus />

                </div>

                <div className="col-span-6">

                    <NetworkStatus />

                </div>

            </div>

            <DeviceInformation />

            <DeviceLog />

        </div>

    );

}

export default Device;