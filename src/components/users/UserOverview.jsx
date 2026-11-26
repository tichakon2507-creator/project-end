import { HeartPulse, ShieldCheck, UserCheck, Users } from "lucide-react";

import { Skeleton } from "../common/Ui";

const icons = {
    users: Users,
    check: UserCheck,
    heart: HeartPulse,
    shield: ShieldCheck,
};

function UserOverview({ stats = [], loading = false }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            {stats.map((item, index) => {
                const Icon = icons[item.icon] || Users;
                return (
                    <div key={index} className="ui-card-hover p-5 md:p-6 h-full">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-[var(--midnight-muted)] truncate">{item.title}</p>
                                {loading ? (
                                    <Skeleton className="h-10 w-20 mt-4" />
                                ) : (
                                    <h2 className="ui-gradient-text text-4xl font-bold ui-num mt-4 leading-none">
                                        {item.value}
                                    </h2>
                                )}
                            </div>
                            <div className="ui-gradient-icon w-12 h-12 shrink-0">
                                <Icon size={22} />
                            </div>
                        </div>
                    </div>
                );
            })}
            {!loading && stats.length === 0 && (
                <div className="col-span-full ui-card p-8 text-center text-[var(--midnight-muted)] text-sm font-medium">
                    No user data available yet
                </div>
            )}
        </div>
    );
}

export default UserOverview;
