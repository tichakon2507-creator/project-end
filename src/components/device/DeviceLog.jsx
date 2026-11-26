import { Bug, CircleCheck, Download, Info, TriangleAlert } from "lucide-react";

import { RowsSkeleton } from "../common/Ui";

function getIcon(level) {
    switch (level) {
        case "success":
            return <CircleCheck className="text-emerald-600" size={18} />;
        case "warning":
            return <TriangleAlert className="text-amber-500" size={18} />;
        case "error":
            return <Bug className="text-rose-600" size={18} />;
        default:
            return <Info className="text-sky-500" size={18} />;
    }
}

function getBadge(level) {
    const styles = {
        success: "bg-emerald-50 text-emerald-700 border-emerald-200",
        warning: "bg-amber-50 text-amber-700 border-amber-200",
        error: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return (
        <span className={`ui-badge ${styles[level] || "bg-sky-50 text-sky-700 border-sky-200"}`}>
            {level || "info"}
        </span>
    );
}

function DeviceLog({ logs = [], loading = false, onExport = () => {}, emptyMessage = "No activity records yet. Waiting for device data..." }) {
    return (
        <div className="ui-card p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                        <Info size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Device Logs</h2>
                        <p className="text-xs text-slate-500">Latest system activities</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onExport}
                    disabled={logs.length === 0}
                    className="ui-btn ui-press bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 text-sm disabled:opacity-50"
                >
                    <Download size={15} /> Export Logs
                </button>
            </div>

            {loading ? (
                <RowsSkeleton count={5} columns={4} />
            ) : (
                <div className="overflow-x-auto -mx-2 px-2 max-h-[460px] overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-wide text-slate-500">
                                <th className="py-3 pr-4">Time</th>
                                <th className="py-3 pr-4">Type</th>
                                <th className="py-3 pr-4">Message</th>
                                <th className="py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-slate-400 text-sm font-medium">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log, index) => (
                                    <tr
                                        key={index}
                                        className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors"
                                    >
                                        <td className="py-3.5 pr-4 font-medium text-slate-700 ui-timer">{log.time}</td>
                                        <td className="py-3.5 pr-4 text-slate-600">{log.type}</td>
                                        <td className="py-3.5 pr-4">
                                            <span className="flex items-center gap-2.5 text-slate-700">
                                                {getIcon(log.level)} {log.message}
                                            </span>
                                        </td>
                                        <td className="py-3.5">{getBadge(log.level)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default DeviceLog;
