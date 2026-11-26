import { classifyRecord } from "../../utils/thresholds";

function formatDateTime(value) {
    if (value === null || value === undefined || value === "") return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat("th-TH", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Bangkok",
    }).format(date);
}

function toNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function summarize(records, key) {
    const values = records
        .map((record) => toNumber(record[key]))
        .filter((value) => value !== null);
    if (values.length === 0) return { avg: "-", max: "-", min: "-" };
    const sum = values.reduce((total, value) => total + value, 0);
    const digits = key === "heart_rate" ? 0 : 2;
    return {
        avg: (sum / values.length).toFixed(digits),
        max: Math.max(...values).toFixed(digits),
        min: Math.min(...values).toFixed(digits),
    };
}

function valueOrDash(value) {
    return value === null || value === undefined || value === "" ? "-" : String(value);
}

function MedicalReport({ patient = {}, records = [], emergencies = [], thresholds = null, range = {} }) {
    const heart = summarize(records, "heart_rate");
    const temperature = summarize(records, "temperature");
    const spo2 = summarize(records, "spo2");
    const criticalCount = records.filter((record) => classifyRecord(record, thresholds) === "วิกฤต").length;
    const patientRows = [
        ["ชื่อผู้ป่วย", valueOrDash(patient.patient_name)],
        ["อายุ", patient.patient_age == null ? "-" : `${patient.patient_age} ปี`],
        ["กรุ๊ปเลือด", valueOrDash(patient.blood_type)],
        ["โรคประจำตัว", valueOrDash(patient.medical_conditions)],
        ["ประวัติแพ้ยา", valueOrDash(patient.drug_allergies)],
        ["ผู้ติดต่อฉุกเฉิน", valueOrDash(patient.emergency_contact_name)],
        ["เบอร์ติดต่อฉุกเฉิน", valueOrDash(patient.emergency_contact_phone)],
        ["อุปกรณ์", [patient.device_name, patient.device_code].filter(Boolean).join(" / ") || "-"],
        ["ช่วงข้อมูล", `${valueOrDash(range.from)} ถึง ${valueOrDash(range.to)}`],
    ];

    return (
        <div className="print-report">
            <div className="report-title">รายงานสุขภาพย้อนหลัง</div>
            <div className="report-subtitle">Smart Health &amp; Emergency IoT Device</div>
            <div className="report-meta">
                วันที่ออกรายงาน: {formatDateTime(new Date())}
            </div>

            <h2 className="report-heading">1. ข้อมูลประจำตัวผู้ป่วย</h2>
            <table className="report-table report-kv-table">
                <tbody>
                    {patientRows.map(([label, value]) => (
                        <tr key={label}>
                            <th>{label}</th>
                            <td>{value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2 className="report-heading">2. สรุปสัญญาณชีพ</h2>
            <table className="report-table">
                <thead>
                    <tr>
                        <th>สัญญาณชีพ</th>
                        <th>ค่าเฉลี่ย</th>
                        <th>ค่าสูงสุด</th>
                        <th>ค่าต่ำสุด</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Heart Rate (bpm)</td>
                        <td>{heart.avg}</td>
                        <td>{heart.max}</td>
                        <td>{heart.min}</td>
                    </tr>
                    <tr>
                        <td>Temperature (องศาเซลเซียส)</td>
                        <td>{temperature.avg}</td>
                        <td>{temperature.max}</td>
                        <td>{temperature.min}</td>
                    </tr>
                    <tr>
                        <td>SpO2 (%)</td>
                        <td>{spo2.avg}</td>
                        <td>{spo2.max}</td>
                        <td>{spo2.min}</td>
                    </tr>
                </tbody>
            </table>
            <p className="report-note">
                จำนวนบันทึกทั้งหมด {records.length} รายการ | ค่าวิกฤต {criticalCount} รายการ
                {thresholds
                    ? ` | เกณฑ์ HR ${thresholds.hr_min}-${thresholds.hr_max} bpm, อุณหภูมิ > ${thresholds.temp_max} องศา, SpO2 < ${thresholds.spo2_min}%`
                    : ""}
            </p>

            <h2 className="report-heading">3. ประวัติเหตุฉุกเฉิน</h2>
            {emergencies.length === 0 ? (
                <p className="report-note">ไม่มีเหตุการณ์ฉุกเฉินในช่วงนี้</p>
            ) : (
                <table className="report-table">
                    <thead>
                        <tr>
                            <th>รหัสเคส</th>
                            <th>เหตุการณ์</th>
                            <th>เวลาเกิดเหตุ</th>
                            <th>สถานะ</th>
                            <th>รายละเอียด</th>
                        </tr>
                    </thead>
                    <tbody>
                        {emergencies.map((event) => (
                            <tr key={event.id ?? `${event.event_type}-${event.created_at}`}>
                                <td>{valueOrDash(event.id)}</td>
                                <td>{valueOrDash(event.event_type)}</td>
                                <td>{formatDateTime(event.created_at || event.detected_at)}</td>
                                <td>{valueOrDash(event.status)}</td>
                                <td>{valueOrDash(event.description)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <h2 className="report-heading">4. ตารางบันทึกข้อมูลสุขภาพ</h2>
            {records.length === 0 ? (
                <p className="report-note">ไม่มีข้อมูลสุขภาพในช่วงนี้</p>
            ) : (
                <table className="report-table">
                    <thead>
                        <tr>
                            <th>ลำดับ</th>
                            <th>วันที่-เวลา</th>
                            <th>Heart Rate (bpm)</th>
                            <th>Temperature (องศา)</th>
                            <th>SpO2 (%)</th>
                            <th>สถานะ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((record, index) => (
                            <tr key={record.record_id ?? index}>
                                <td>{index + 1}</td>
                                <td>{formatDateTime(record.recorded_at)}</td>
                                <td>{valueOrDash(record.heart_rate)}</td>
                                <td>{valueOrDash(record.temperature)}</td>
                                <td>{valueOrDash(record.spo2)}</td>
                                <td>{classifyRecord(record, thresholds)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div className="report-footer">
                เอกสารนี้สร้างจากข้อมูลจริงในฐานข้อมูล smart_health | แดชบอร์ดติดตามสุขภาพและเหตุฉุกเฉิน
            </div>
        </div>
    );
}

export default MedicalReport;
