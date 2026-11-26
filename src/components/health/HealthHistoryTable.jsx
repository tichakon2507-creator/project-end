import { CircleCheck, Clock, TriangleAlert } from "lucide-react";

import { RowsSkeleton } from "../common/Ui";

function HealthHistoryTable({ records = [], loading = false, emptyMessage = "No health records found." }) {
    return (
        <div className="ui-card p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Clock size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Health History</h2>
                        <p className="text-xs text-slate-500">Stored vital sign records</p>
                    </div>
                </div>
                <span className="ui-badge bg-slate-100 text-slate-600 border-slate-200 ui-num">
                    {records.length} records
                </span>
            </div>

            {loading ? (
                <RowsSkeleton count={5} columns={6} />
            ) : records.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm font-medium">
                    {emptyMessage}
                </div>
            ) : (
                <div className="overflow-x-auto -mx-2 px-2">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-wide text-slate-500">
                                <th className="py-3 pr-4">Date</th>
                                <th className="py-3 pr-4">Time</th>
                                <th className="py-3 pr-4">Heart</th>
                                <th className="py-3 pr-4">SpO2</th>
                                <th className="py-3 pr-4">Temp</th>
                                <th className="py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((record, index) => (
                                <tr
                                    key={index}
                                    className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors"
                                >
                                    <td className="py-3.5 pr-4 font-medium text-slate-700 ui-num">{record.date}</td>
                                    <td className="py-3.5 pr-4 text-slate-600 ui-timer">{record.time}</td>
                                    <td className="py-3.5 pr-4 text-slate-700 ui-num">{record.heart}</td>
                                    <td className="py-3.5 pr-4 text-slate-700 ui-num">{record.spo2}</td>
                                    <td className="py-3.5 pr-4 text-slate-700 ui-num">{record.temp}</td>
                                    <td className="py-3.5">
                                        <span
                                            className={`ui-badge ${
                                                record.status === "Healthy"
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                            }`}
                                        >
                                            {record.status === "Healthy" ? <CircleCheck size={13} /> : <TriangleAlert size={13} />}
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default HealthHistoryTable;
