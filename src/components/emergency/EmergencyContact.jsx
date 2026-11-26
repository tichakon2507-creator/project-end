import { Mail, Phone, UserRound } from "lucide-react";

const contacts = [];

function EmergencyContact() {
    return (
        <div className="ui-card p-5 md:p-6 h-full">
            <div className="mb-5 flex items-center gap-3">
                <div className="ui-gradient-icon w-10 h-10 shrink-0">
                    <Phone size={20} />
                </div>
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Emergency Contacts</h2>
                    <p className="text-xs leading-relaxed text-[var(--midnight-muted)]">
                        Contact list for emergency notification
                    </p>
                </div>
            </div>

            {contacts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/15 bg-white/5 px-4 py-8 text-center text-sm text-[var(--midnight-muted)]">
                    No emergency contacts configured
                </div>
            ) : (
                <div className="space-y-3">
                    {contacts.map((contact, index) => (
                        <div
                            key={index}
                            className="rounded-xl border border-white/10 bg-white/5 p-3.5 hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="ui-gradient-icon w-10 h-10 shrink-0">
                                        <UserRound size={19} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-sm text-white">{contact.name}</h3>
                                        <p className="flex items-center gap-1.5 text-xs text-[var(--midnight-muted)] ui-num mt-0.5">
                                            <Phone size={12} /> {contact.phone}
                                        </p>
                                        <p className="flex items-center gap-1.5 text-xs text-[var(--midnight-muted)] mt-0.5 truncate">
                                            <Mail size={12} /> {contact.email}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="ui-btn ui-press ui-gradient text-white px-3.5 py-2 text-xs"
                                >
                                    <Phone size={14} /> Call
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default EmergencyContact;
