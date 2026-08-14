import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaBirthdayCake,
    FaVenusMars,
    FaMapMarkerAlt,
    FaHeartbeat,
} from "react-icons/fa";

function UserProfile() {

    return (

        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 h-[520px]">

            <div className="flex flex-col items-center">

                <img
                    src="https://ui-avatars.com/api/?name=John+Smith&background=2563eb&color=fff&size=256"
                    alt="Profile"
                    className="w-28 h-28 rounded-full shadow"
                />

                <h2 className="text-2xl font-bold mt-5">

                    John Smith

                </h2>

                <p className="text-slate-500">

                    Patient

                </p>

            </div>

            <div className="mt-8 space-y-5">

                <div className="flex items-center gap-4">

                    <FaUser className="text-blue-600" />

                    <span>U001</span>

                </div>

                <div className="flex items-center gap-4">

                    <FaEnvelope className="text-blue-600" />

                    <span>john@email.com</span>

                </div>

                <div className="flex items-center gap-4">

                    <FaPhone className="text-green-600" />

                    <span>081-234-5678</span>

                </div>

                <div className="flex items-center gap-4">

                    <FaBirthdayCake className="text-pink-600" />

                    <span>28 Years</span>

                </div>

                <div className="flex items-center gap-4">

                    <FaVenusMars className="text-purple-600" />

                    <span>Male</span>

                </div>

                <div className="flex items-center gap-4">

                    <FaMapMarkerAlt className="text-red-500" />

                    <span>Chiang Mai</span>

                </div>

                <div className="flex items-center gap-4">

                    <FaHeartbeat className="text-red-500" />

                    <span>Heart Rate : 82 BPM</span>

                </div>

            </div>

            <button className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl transition">

                Edit Profile

            </button>

        </div>

    );

}

export default UserProfile;