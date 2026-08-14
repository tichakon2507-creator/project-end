import ProfileSettings from "../components/settings/ProfileSettings";
import MQTTSettings from "../components/settings/MQTTSettings";
import DatabaseSettings from "../components/settings/DatabaseSettings";
import GoogleMapSettings from "../components/settings/GoogleMapSettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import SystemSettings from "../components/settings/SystemSettings";

function Settings() {

    return (

        <div className="space-y-8">

            <ProfileSettings />

            <MQTTSettings />

            <DatabaseSettings />

            <GoogleMapSettings />

            <NotificationSettings />

            <SystemSettings />

        </div>

    );

}

export default Settings;