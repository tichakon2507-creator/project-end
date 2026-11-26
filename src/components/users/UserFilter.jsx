import { Download, Search, UserRound } from "lucide-react";

import { FIELD_INPUT_CLASS, IconField } from "../common/Ui";

const roles = ["All Users", "Patient", "Caregiver", "Administrator"];
const statuses = ["All", "Online", "Offline"];

function UserFilter({
    search = "",
    roleFilter = "All Users",
    statusFilter = "All",
    onSearchChange = () => {},
    onRoleChange = () => {},
    onStatusChange = () => {},
    onExport = () => {},
}) {
    return (
        <div className="ui-card p-5 md:p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 gap-4 items-end">
                <div className="xl:col-span-6">
                    <label className="block text-xs font-semibold text-[var(--midnight-muted)] mb-2">Search User</label>
                    <IconField icon={Search}>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Search by name or username..."
                            className={FIELD_INPUT_CLASS}
                        />
                    </IconField>
                </div>
                <div className="xl:col-span-6 flex justify-end">
                    <button
                        type="button"
                        onClick={onExport}
                        className="ui-btn ui-press ui-gradient text-white px-5 py-2.5 text-sm"
                    >
                        <Download size={16} /> Export Users
                    </button>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <UserRound size={15} className="text-[var(--midnight-muted)]" />
                    <div className="flex flex-wrap gap-2">
                        {roles.map((role) => (
                            <button
                                key={role}
                                type="button"
                                onClick={() => onRoleChange(role)}
                                className={`ui-pill ${roleFilter === role ? "ui-pill-active" : ""}`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => (
                        <button
                            key={status}
                            type="button"
                            onClick={() => onStatusChange(status)}
                            className={`ui-pill ${statusFilter === status ? "ui-pill-active" : ""}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default UserFilter;
