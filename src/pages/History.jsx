import { useEffect, useMemo, useState } from "react";
import { Activity, Database, Radio, TriangleAlert, XCircle } from "lucide-react";

import HistoryStatistics from "../components/history/HistoryStatistics";
import HistoryFilter from "../components/history/HistoryFilter";
import HistoryTimeline from "../components/history/HistoryTimeline";
import HistoryTable from "../components/history/HistoryTable";
import ReportExportToolbar from "../components/history/ReportExportToolbar";
import MedicalReport from "../components/history/MedicalReport";
import { StatusDot, Spinner } from "../components/common/Ui";
import { classifyRecord } from "../utils/thresholds";

import { useFlash, useRealtime } from "../hooks/useRealtime";
import { useApiStatus } from "../hooks/useApiStatus";
import {
    fetchDevices,
    fetchDeviceProfile,
    fetchHealthHistory,
    fetchEmergencyHistory,
    fetchLatestLocations,
    fetchThresholds,
} from "../services/api";
import { formatDateTime, formatTime, toDateTimeParts } from "../utils/format";

function csvCell(value) {
    return `"${String(value === null || value === undefined ? "" : value).replace(/"/g, '""')}"`;
}

function inDateRange(value, fromDate, toDate) {
    if (!fromDate && !toDate) return true;
    const time = new Date(value).getTime();
    if (!Number.isFinite(time)) return false;
    if (fromDate && time < new Date(`${fromDate}T00:00:00`).getTime()) return false;
    if (toDate && time > new Date(`${toDate}T23:59:59`).getTime()) return false;
    return true;
}

function History() {
    const [healthRecords, setHealthRecords] = useState([]);
    const [emergencyEvents, setEmergencyEvents] = useState([]);
    const [locationRecords, setLocationRecords] = useState([]);
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selectedDevice, setSelectedDevice] = useState("");
    const [reportData, setReportData] = useState({ records: [], emergencies: [], patient: {}, thresholds: null });
    const [reportBusy, setReportBusy] = useState(false);
    const [printReport, setPrintReport] = useState(null);

    const realtime = useRealtime();
    const apiStatus = useApiStatus();
    const flash = useFlash(realtime.lastUpdated);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [healthRes, emergencyRes, locationRes, devicesRes] = await Promise.all([
                    fetchHealthHistory({ limit: 100 }),
                    fetchEmergencyHistory({ limit: 50 }),
                    fetchLatestLocations(),
                    fetchDevices(),
                ]);
                if (isMounted) {
                    setHealthRecords(Array.isArray(healthRes?.data) ? healthRes.data : []);
                    setEmergencyEvents(Array.isArray(emergencyRes?.data) ? emergencyRes.data : []);
                    setLocationRecords(Array.isArray(locationRes?.data) ? locationRes.data : []);
                    setDevices(Array.isArray(devicesRes?.data) ? devicesRes.data : []);
                }
            } catch (err) {
                console.error("Failed to load history data:", err);
                if (isMounted) {
                    setError(err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadData();
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;
        const loadReportData = async () => {
            try {
                setReportBusy(true);
                const params = { limit: 1000 };
                if (selectedDevice) params.device_id = selectedDevice;
                if (fromDate) params.start_date = fromDate;
                if (toDate) params.end_date = toDate;

                const [healthRes, emergencyRes, thresholdRes, profileRes] = await Promise.all([
                    fetchHealthHistory(params),
                    fetchEmergencyHistory({ device_id: selectedDevice || undefined, limit: 1000 }),
                    fetchThresholds(),
                    selectedDevice
                        ? fetchDeviceProfile(selectedDevice).catch(() => null)
                        : Promise.resolve(null),
                ]);

                const records = Array.isArray(healthRes?.data) ? healthRes.data : [];
                const emergencies = (Array.isArray(emergencyRes?.data) ? emergencyRes.data : [])
                    .filter((event) => inDateRange(event.created_at || event.detected_at, fromDate, toDate));
                const fallbackDevice = devices.find((device) =>
                    (device.device_code || device.device_id) === selectedDevice
                ) || null;
                const patient = (profileRes?.data && Object.keys(profileRes.data).length > 0)
                    ? profileRes.data
                    : fallbackDevice || {};

                if (isMounted) {
                    setReportData({
                        records,
                        emergencies,
                        patient,
                        thresholds: thresholdRes?.data || null,
                    });
                }
            } catch (err) {
                console.error("Failed to load report data:", err);
            } finally {
                if (isMounted) setReportBusy(false);
            }
        };
        loadReportData();
        return () => { isMounted = false; };
    }, [selectedDevice, fromDate, toDate, devices]);

    const stats = useMemo(() => ([
        {
            title: "Health Records",
            value: healthRecords.length > 0 ? healthRecords.length.toLocaleString("th-TH") : "0",
            color: "#ef4444",
        },
        {
            title: "Emergency Alerts",
            value: emergencyEvents.length > 0 ? emergencyEvents.length.toLocaleString("th-TH") : "0",
            color: "#f59e0b",
        },
        {
            title: "GPS Records",
            value: locationRecords.length > 0 ? locationRecords.length.toLocaleString("th-TH") : "0",
            color: "#2563eb",
        },
        {
            title: "Device Logs",
            value: healthRecords.length > 0 ? healthRecords.length.toLocaleString("th-TH") : "0",
            color: "#10b981",
        },
    ]), [healthRecords.length, emergencyEvents.length, locationRecords.length]);

    const healthRows = useMemo(
        () =>
            healthRecords.map((record) => {
                const { date, time } = toDateTimeParts(record.recorded_at);
                return {
                    id: record.record_id ?? record.id,
                    date,
                    time,
                    timestamp: record.recorded_at,
                    category: "Health",
                    detail: `Heart Rate : ${record.heart_rate != null ? record.heart_rate : "N/A"} BPM`,
                    status: record.heart_rate != null ? "Normal" : "Safe",
                };
            }),
        [healthRecords]
    );

    const locationRows = useMemo(
        () =>
            locationRecords.slice(0, 20).map((record) => ({
                id: record.id,
                date: formatDateTime(record.recorded_at),
                time: formatTime(record.recorded_at),
                timestamp: record.recorded_at,
                category: "GPS",
                detail: "Location Updated",
                status: "Moving",
            })),
        [locationRecords]
    );

    const emergencyRows = useMemo(
        () =>
            emergencyEvents.map((event) => ({
                id: event.id,
                date: formatDateTime(event.created_at),
                time: formatTime(event.created_at),
                timestamp: event.created_at,
                category: "Emergency",
                detail: event.event_type || "EMERGENCY",
                status: event.status || "ACTIVE",
            })),
        [emergencyEvents]
    );

    const filteredRows = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return [...locationRows, ...healthRows, ...emergencyRows]
            .filter((row) => {
                const matchesCategory = category === "All" || row.category === category;
                const matchesSearch =
                    !keyword ||
                    `${row.id} ${row.category} ${row.detail} ${row.status}`
                        .toLowerCase()
                        .includes(keyword);
                const rowTime = new Date(row.timestamp);
                const matchesFrom = !fromDate || (Number.isFinite(rowTime.getTime()) && rowTime >= new Date(fromDate));
                const matchesTo = !toDate || (Number.isFinite(rowTime.getTime()) && rowTime <= new Date(`${toDate}T23:59:59`));
                return matchesCategory && matchesSearch && matchesFrom && matchesTo;
            })
            .sort((a, b) => b.date.localeCompare(a.date));
    }, [locationRows, healthRows, emergencyRows, search, category, fromDate, toDate]);

    const handleExport = () => {
        if (filteredRows.length === 0) {
            return;
        }
        const blob = new Blob([JSON.stringify(filteredRows, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `history-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleExportCSV = () => {
        const records = reportData.records;
        if (records.length === 0) return;
        const patient = reportData.patient || {};
        const profile = [
            patient.patient_name,
            patient.patient_age == null ? "" : `${patient.patient_age} ปี`,
            patient.blood_type,
            patient.medical_conditions,
            patient.drug_allergies,
            patient.emergency_contact_name,
            patient.emergency_contact_phone,
        ];
        const header = [
            "รหัสอุปกรณ์",
            "ชื่ออุปกรณ์",
            "ชื่อผู้ป่วย",
            "อายุ",
            "กรุ๊ปเลือด",
            "โรคประจำตัว",
            "ประวัติแพ้ยา",
            "ผู้ติดต่อฉุกเฉิน",
            "เบอร์ติดต่อฉุกเฉิน",
            "วันที่-เวลา",
            "Heart Rate (bpm)",
            "Temperature (องศาเซลเซียส)",
            "SpO2 (%)",
            "สถานะ",
        ];
        const lines = [header];
        records.forEach((record) => {
            lines.push([
                patient.device_code || record.device_code || record.device_id || "",
                patient.device_name || record.device_name || "",
                ...profile,
                formatDateTime(record.recorded_at),
                record.heart_rate == null ? "" : record.heart_rate,
                record.temperature == null ? "" : record.temperature,
                record.spo2 == null ? "" : record.spo2,
                classifyRecord(record, reportData.thresholds),
            ]);
        });
        const csv = `\uFEFF${lines.map((line) => line.map(csvCell).join(",")).join("\r\n")}`;
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `health-report-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExportPDF = () => {
        const records = reportData.records;
        if (records.length === 0) return;
        setPrintReport({
            patient: reportData.patient || {},
            records,
            emergencies: reportData.emergencies || [],
            thresholds: reportData.thresholds,
            range: { from: fromDate || "-", to: toDate || "-" },
        });
        window.setTimeout(() => window.print(), 200);
    };

    const timelineItems = useMemo(() => {
        const items = [
            ...emergencyEvents,
            ...(realtime.emergency?.emergency ? [realtime.emergency.emergency] : []),
        ].map((e, index) => ({
            time: formatTime(e.created_at || e.detected_at || e.recorded_at),
            title: e.event_type || "EMERGENCY",
            description: e.description || `Status: ${e.status || "ACTIVE"}`,
            index,
        }));
        return items.sort((a, b) => b.time.localeCompare(a.time));
    }, [emergencyEvents, realtime.emergency]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">History</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Stored health, emergency, GPS and device records
                    </p>
                </div>
                <span className="ui-badge bg-white text-slate-600 border-slate-200 shadow-sm">
                    <StatusDot tone={realtime.connected ? "emerald" : "rose"} />
                    {realtime.connected ? "Live sync" : "Offline"}
                </span>
            </div>

            <div className={`grid grid-cols-12 gap-4 md:gap-6 ${flash ? "ui-flash rounded-3xl" : ""}`}>
                <HistoryStatistics stats={stats} loading={loading} />
            </div>

            <HistoryFilter
                search={search}
                category={category}
                fromDate={fromDate}
                toDate={toDate}
                onSearchChange={setSearch}
                onCategoryChange={setCategory}
                onFromDateChange={setFromDate}
                onToDateChange={setToDate}
                onExport={handleExport}
            />
            <ReportExportToolbar
                devices={devices}
                selectedDevice={selectedDevice}
                onDeviceChange={setSelectedDevice}
                fromDate={fromDate}
                toDate={toDate}
                onFromDateChange={setFromDate}
                onToDateChange={setToDate}
                onExportCSV={handleExportCSV}
                onExportPDF={handleExportPDF}
                recordCount={reportData.records.length}
                busy={reportBusy}
            />
            {reportBusy && (
                <div className="ui-card flex items-center gap-3 px-5 py-4 text-sm text-[var(--midnight-muted)]">
                    <Spinner /> กำลังโหลดข้อมูลรายงาน...
                </div>
            )}
            <HistoryTimeline items={timelineItems} loading={loading} />

            {error && !loading && (
                <div className="ui-card p-5 flex items-center gap-3 bg-rose-500/10 border-rose-400/25 text-rose-300">
                    <XCircle size={20} />
                    <span className="text-sm font-semibold">Failed to load history data from the server.</span>
                </div>
            )}

            {!error && !loading && healthRecords.length === 0 && locationRecords.length === 0 && (
                <div className="ui-card p-8 flex items-center justify-center gap-3 text-slate-400 text-sm font-medium">
                    <TriangleAlert size={19} /> No records found.
                </div>
            )}

            <HistoryTable
                records={filteredRows}
                loading={loading}
                emptyMessage="No records found for the selected filter."
            />

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5"><Database size={12} /> API: {apiStatus === "connected" ? "Connected" : "Disconnected"}</span>
                <span className="flex items-center gap-1.5"><Radio size={12} /> Socket.IO: {realtime.connected ? "Connected" : "Disconnected"}</span>
                <span className="flex items-center gap-1.5"><Activity size={12} /> Records are read from the backend</span>
            </div>

            {printReport && (
                <MedicalReport
                    patient={printReport.patient}
                    records={printReport.records}
                    emergencies={printReport.emergencies}
                    thresholds={printReport.thresholds}
                    range={printReport.range}
                />
            )}
        </div>
    );
}

export default History;
