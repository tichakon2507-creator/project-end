import { Cpu, HeartPulse, MapPin, TriangleAlert } from "lucide-react";

import { RowsSkeleton } from "../common/Ui";

function getIcon(category) {
    switch (category) {
        case "Health":
            return <HeartPulse className="text-rose-500" size={16} />;
        case "GPS":
            return <MapPin className="text-sky-500" size={16} />;
        case "Emergency":
            return <TriangleAlert className="text-amber-500" size={16} />;
        default:
            return <Cpu className="text-emerald-500" size={16} />;
    }
}

function getBadge(status) {
    const ok = ["Normal", "Success", "Online"].includes(status);
    const moving = status === "Moving";

    return (
        <span
            className={`ui-badge ${
                ok
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : moving
                        ? "bg-sky-50 text-sky-700 border-sky-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
        >
            {status}
        </span>
    );
}

function HistoryTable({ records = [], loading = false, emptyMessage = "No records found." }) {
    return (
        <div className="ui-card p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                        <Cpu size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">All History Records</h2>
                        <p className="text-xs text-slate-500">System logs and activity records</p>
                    </div>
                </div>
                <span className="ui-badge bg-slate-100 text-slate-600 border-slate-200 ui-num">
                    {records.length} Records
                </span>
            </div>

            {loading ? (
                <RowsSkeleton count={5} columns={6} />
            ) : records.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm font-medium">{emptyMessage}</div>
            ) : (
                <div className="overflow-x-auto -mx-2 px-2">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-wide text-slate-500">
                                <th className="py-3 pr-4">ID</th>
                                <th className="py-3 pr-4">Date</th>
                                <th className="py-3 pr-4">Time</th>
                                <th className="py-3 pr-4">Category</th>
                                <th className="py-3 pr-4">Detail</th>
                                <th className="py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors"
                                >
                                    <td className="py-3.5 pr-4 font-semibold text-slate-700 ui-num">{item.id}</td>
                                    <td className="py-3.5 pr-4 text-slate-600 ui-num">{item.date}</td>
                                    <td className="py-3.5 pr-4 text-slate-600 ui-timer">{item.time}</td>
                                    <td className="py-3.5 pr-4">
                                        <span className="flex items-center gap-2 text-slate-700">
                                            {getIcon(item.category)} {item.category}
                                        </span>
                                    </td>
                                    <td className="py-3.5 pr-4 text-slate-600">{item.detail}</td>
                                    <td className="py-3.5">{getBadge(item.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default HistoryTable;
