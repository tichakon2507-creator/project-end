import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Activity, RotateCcw, Save } from "lucide-react";

import { Spinner } from "../common/Ui";
import { fetchThresholds, updateThresholds } from "../../services/api";

const DEFAULT_THRESHOLDS = {
    hr_min: 45,
    hr_max: 120,
    temp_max: 38.5,
    spo2_min: 92,
};

const FIELDS = [
    { name: "hr_min", label: "Heart Rate ต่ำสุด", hint: "bpm", step: "1", min: 1, max: 300 },
    { name: "hr_max", label: "Heart Rate สูงสุด", hint: "bpm", step: "1", min: 1, max: 300 },
    { name: "temp_max", label: "อุณหภูมิสูงสุด", hint: "องศาเซลเซียส", step: "0.1", min: 20, max: 45 },
    { name: "spo2_min", label: "SpO2 ต่ำสุด", hint: "%", step: "0.1", min: 50, max: 100 },
];

function ThresholdSettings() {
    const [values, setValues] = useState({ ...DEFAULT_THRESHOLDS });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            try {
                setLoading(true);
                const res = await fetchThresholds();
                if (isMounted && res?.data) {
                    setValues({
                        hr_min: res.data.hr_min ?? DEFAULT_THRESHOLDS.hr_min,
                        hr_max: res.data.hr_max ?? DEFAULT_THRESHOLDS.hr_max,
                        temp_max: res.data.temp_max ?? DEFAULT_THRESHOLDS.temp_max,
                        spo2_min: res.data.spo2_min ?? DEFAULT_THRESHOLDS.spo2_min,
                    });
                }
            } catch (err) {
                console.error("Failed to load thresholds:", err);
                toast.error("ไม่สามารถโหลดค่าเกณฑ์แจ้งเตือนได้");
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        load();
        return () => { isMounted = false; };
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        const payload = {};
        FIELDS.forEach((field) => {
            const number = Number(values[field.name]);
            if (!Number.isFinite(number) || number < field.min || number > field.max) {
                toast.error(`ค่า ${field.label} ไม่ถูกต้อง`);
                return;
            }
            payload[field.name] = number;
        });
        if (Object.keys(payload).length !== FIELDS.length) return;
        if (payload.hr_min >= payload.hr_max) {
            toast.error("Heart Rate ต่ำสุดต้องน้อยกว่าค่าสูงสุด");
            return;
        }
        setSaving(true);
        try {
            const res = await updateThresholds(payload);
            if (res?.data) {
                setValues({
                    hr_min: res.data.hr_min,
                    hr_max: res.data.hr_max,
                    temp_max: res.data.temp_max,
                    spo2_min: res.data.spo2_min,
                });
            }
            toast.success("บันทึกเกณฑ์แจ้งเตือนสุขภาพแล้ว");
        } catch (err) {
            console.error("Failed to save thresholds:", err);
            toast.error(`บันทึกไม่สำเร็จ: ${err?.apiMessage || err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => setValues({ ...DEFAULT_THRESHOLDS });

    return (
        <div className="ui-card p-5 md:p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Dynamic Alert Thresholds</h2>
                    <p className="mt-0.5 text-xs text-[var(--midnight-muted)]">
                        เกณฑ์แจ้งเตือนสุขภาพที่ backend ใช้ตัดสินใจแบบ real-time
                    </p>
                </div>
                <div className="ui-gradient-icon h-10 w-10 shrink-0">
                    <Activity size={19} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {FIELDS.map((field) => (
                    <div key={field.name}>
                        <label className="mb-2 block text-xs font-semibold text-[var(--midnight-muted)]">
                            {field.label}
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name={field.name}
                                value={values[field.name]}
                                onChange={handleChange}
                                step={field.step}
                                min={field.min}
                                max={field.max}
                                disabled={loading || saving}
                                className="ui-input ui-num px-4 py-2.5 pr-20 text-sm disabled:opacity-60"
                            />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--midnight-muted)]">
                                {field.hint}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                <button
                    type="button"
                    onClick={handleReset}
                    disabled={saving}
                    className="ui-btn ui-press border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white hover:bg-white/10"
                >
                    <RotateCcw size={15} /> ค่าเริ่มต้น
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="ui-btn ui-press ui-gradient px-5 py-2.5 text-sm text-white disabled:opacity-50"
                >
                    {saving ? <Spinner /> : <Save size={16} />}
                    {saving ? "กำลังบันทึก..." : "บันทึกเกณฑ์แจ้งเตือน"}
                </button>
            </div>
        </div>
    );
}

export default ThresholdSettings;
