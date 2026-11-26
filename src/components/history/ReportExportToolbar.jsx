import { CalendarDays, Download, FileSpreadsheet, Printer } from "lucide-react";

function ReportExportToolbar({
    devices = [],
    selectedDevice,
    onDeviceChange,
    fromDate,
    toDate,
    onFromDateChange,
    onToDateChange,
    onExportCSV,
    onExportPDF,
    recordCount = 0,
    busy = false,
}) {
    return (
        <div className="ui-card p-5 md:p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Health Report Export</h2>
                    <p className="mt-0.5 text-xs text-[var(--midnight-muted)]">
                        เลือกอุปกรณ์และช่วงวันที่เพื่อส่งออกรายงานสุขภาพ
                    </p>
                </div>
                <span className="ui-badge border-white/10 bg-white/5 text-[var(--midnight-muted)]">
                    <FileSpreadsheet size={13} /> {recordCount} records
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                    <label className="mb-2 block text-xs font-semibold text-[var(--midnight-muted)]">
                        อุปกรณ์
                    </label>
                    <select
                        value={selectedDevice}
                        onChange={(event) => onDeviceChange(event.target.value)}
                        className="ui-input px-4 py-2.5 text-sm ui-num"
                    >
                        <option value="">ทุกอุปกรณ์</option>
                        {devices.map((device) => {
                            const key = device.device_code || device.device_id;
                            return (
                                <option key={key} value={key}>
                                    {device.device_name || key} ({key})
                                </option>
                            );
                        })}
                    </select>
                </div>
                <div>
                    <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-[var(--midnight-muted)]">
                        <CalendarDays size={13} /> วันที่เริ่มต้น
                    </label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(event) => onFromDateChange(event.target.value)}
                        className="ui-input px-4 py-2.5 text-sm ui-num"
                    />
                </div>
                <div>
                    <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-[var(--midnight-muted)]">
                        <CalendarDays size={13} /> วันที่สิ้นสุด
                    </label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(event) => onToDateChange(event.target.value)}
                        className="ui-input px-4 py-2.5 text-sm ui-num"
                    />
                </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                <p className="text-xs text-[var(--midnight-muted)]">
                    CSV รองรับภาษาไทยใน Excel | PDF ใช้ผ่านการพิมพ์ของเบราว์เซอร์
                </p>
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={onExportCSV}
                        disabled={busy || recordCount === 0}
                        className="ui-btn ui-press border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white hover:bg-white/10 disabled:opacity-50"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                    <button
                        type="button"
                        onClick={onExportPDF}
                        disabled={busy || recordCount === 0}
                        className="ui-btn ui-press ui-gradient px-5 py-2.5 text-sm text-white disabled:opacity-50"
                    >
                        <Printer size={16} /> Export PDF (Print Report)
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ReportExportToolbar;
