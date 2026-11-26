import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Save, UserRound } from "lucide-react";

import { Spinner } from "../common/Ui";
import { fetchDeviceProfile, updateDeviceProfile } from "../../services/api";

const EMPTY_FORM = {
    patient_name: "",
    patient_age: "",
    blood_type: "",
    medical_conditions: "",
    drug_allergies: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
};

const FIELDS = [
    { name: "patient_name", label: "ชื่อผู้ป่วย", placeholder: "ชื่อ-นามสกุล", wide: false },
    { name: "patient_age", label: "อายุ", placeholder: "อายุ (ปี)", numeric: true, wide: false },
    { name: "blood_type", label: "กรุ๊ปเลือด", placeholder: "เช่น O+", wide: false },
    { name: "medical_conditions", label: "โรคประจำตัว", placeholder: "ระบุโรคประจำตัว", wide: true },
    { name: "drug_allergies", label: "ประวัติแพ้ยา", placeholder: "ระบุประวัติแพ้ยา", wide: true },
    { name: "emergency_contact_name", label: "ชื่อผู้ติดต่อฉุกเฉิน", placeholder: "ชื่อผู้ติดต่อ", wide: false },
    { name: "emergency_contact_phone", label: "เบอร์ติดต่อฉุกเฉิน", placeholder: "เบอร์โทรศัพท์", wide: false },
];

function toForm(profile) {
    if (!profile) return { ...EMPTY_FORM };
    return {
        patient_name: profile.patient_name == null ? "" : String(profile.patient_name),
        patient_age: profile.patient_age == null ? "" : String(profile.patient_age),
        blood_type: profile.blood_type == null ? "" : String(profile.blood_type),
        medical_conditions: profile.medical_conditions == null ? "" : String(profile.medical_conditions),
        drug_allergies: profile.drug_allergies == null ? "" : String(profile.drug_allergies),
        emergency_contact_name: profile.emergency_contact_name == null ? "" : String(profile.emergency_contact_name),
        emergency_contact_phone: profile.emergency_contact_phone == null ? "" : String(profile.emergency_contact_phone),
    };
}

function PatientProfileForm({ device, devices = [] }) {
    const [selectedKey, setSelectedKey] = useState("");
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const key = device?.device_code || device?.device_id || "";
        setSelectedKey((prev) => (prev === key ? prev : key));
    }, [device?.device_code, device?.device_id]);

    useEffect(() => {
        let isMounted = true;
        if (!selectedKey) {
            setForm({ ...EMPTY_FORM });
            return () => { isMounted = false; };
        }
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetchDeviceProfile(selectedKey);
                if (isMounted) setForm(toForm(res?.data));
            } catch (err) {
                console.error("Failed to load patient profile:", err);
                if (isMounted) setError(err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        load();
        return () => { isMounted = false; };
    }, [selectedKey]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!selectedKey) return;
        setSaving(true);
        try {
            const payload = { ...form };
            payload.patient_age = form.patient_age === "" ? null : Number(form.patient_age);
            const res = await updateDeviceProfile(selectedKey, payload);
            setForm(toForm(res?.data));
            toast.success("บันทึกข้อมูลประจำตัวผู้ป่วยแล้ว");
        } catch (err) {
            console.error("Failed to save patient profile:", err);
            toast.error(`บันทึกไม่สำเร็จ: ${err?.apiMessage || err.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="ui-card p-5 md:p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Patient Medical Profile</h2>
                    <p className="mt-0.5 text-xs text-[var(--midnight-muted)]">
                        ข้อมูลประจำตัวผู้ป่วย โรคประจำตัว และผู้ติดต่อฉุกเฉินของแต่ละเครื่อง
                    </p>
                </div>
                <div className="ui-gradient-icon h-10 w-10 shrink-0">
                    <UserRound size={19} />
                </div>
            </div>

            {devices.length > 1 && (
                <div className="mb-5 max-w-sm">
                    <label className="mb-2 block text-xs font-semibold text-[var(--midnight-muted)]">
                        อุปกรณ์
                    </label>
                    <select
                        value={selectedKey}
                        onChange={(event) => setSelectedKey(event.target.value)}
                        className="ui-input px-4 py-2.5 text-sm"
                    >
                        {devices.map((item) => {
                            const key = item.device_code || item.device_id;
                            return (
                                <option key={key} value={key}>
                                    {item.device_name || key} ({key})
                                </option>
                            );
                        })}
                    </select>
                </div>
            )}

            {error && !loading && (
                <p className="mb-4 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                    ไม่สามารถโหลดข้อมูลผู้ป่วยของอุปกรณ์นี้ได้
                </p>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {FIELDS.map((field) => (
                    <div key={field.name} className={field.wide ? "md:col-span-2" : ""}>
                        <label className="mb-2 block text-xs font-semibold text-[var(--midnight-muted)]">
                            {field.label}
                        </label>
                        <input
                            name={field.name}
                            type={field.numeric ? "number" : "text"}
                            value={form[field.name]}
                            onChange={handleChange}
                            placeholder={field.placeholder}
                            className={`ui-input px-4 py-2.5 text-sm ${field.numeric ? "ui-num" : ""}`}
                            disabled={loading || saving || !selectedKey}
                        />
                    </div>
                ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                <p className="text-xs text-[var(--midnight-muted)]">
                    ข้อมูลนี้จะแนบไปกับการแจ้งเตือนฉุกเฉินและรายงานสุขภาพ
                </p>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={loading || saving || !selectedKey}
                    className="ui-btn ui-press ui-gradient px-5 py-2.5 text-sm text-white disabled:opacity-50"
                >
                    {saving ? <Spinner /> : <Save size={16} />}
                    {saving ? "กำลังบันทึก..." : "บันทึกข้อมูลผู้ป่วย"}
                </button>
            </div>
        </div>
    );
}

export default PatientProfileForm;
