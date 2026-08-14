import {
    FaPhoneAlt,
    FaUser,
    FaEnvelope,
    FaPlus,
} from "react-icons/fa";

const contacts = [
    {
        name: "Father",
        phone: "081-234-5678",
        email: "father@email.com",
    },
    {
        name: "Mother",
        phone: "089-123-4567",
        email: "mother@email.com",
    },
    {
        name: "Hospital",
        phone: "1669",
        email: "emergency@hospital.com",
    },
];

function EmergencyContact() {

    return (

        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 h-[420px]">

            <div className="flex justify-between items-center mb-6">

                <div>

                    <h2 className="text-2xl font-bold text-slate-800">

                        Emergency Contacts

                    </h2>

                    <p className="text-slate-500 mt-1">

                        Contact list for emergency notification

                    </p>

                </div>

                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition">

                    <FaPlus />

                    Add

                </button>

            </div>

            <div className="space-y-4">

                {contacts.map((contact, index) => (

                    <div
                        key={index}
                        className="border border-slate-200 rounded-2xl p-4 hover:bg-slate-50 transition"
                    >

                        <div className="flex justify-between items-center">

                            <div className="flex items-center gap-4">

                                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">

                                    <FaUser />

                                </div>

                                <div>

                                    <h3 className="font-bold text-slate-800">

                                        {contact.name}

                                    </h3>

                                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">

                                        <FaPhoneAlt />

                                        {contact.phone}

                                    </div>

                                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">

                                        <FaEnvelope />

                                        {contact.email}

                                    </div>

                                </div>

                            </div>

                            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition">

                                Call

                            </button>

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default EmergencyContact;