import { useEffect, useState } from "react";
import {
    Activity,
    HeartPulse,
    MessageCircle,
    UserRound,
} from "lucide-react";

import ProfileSettings from "../components/settings/ProfileSettings";
import ThresholdSettings from "../components/settings/ThresholdSettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import PatientProfileForm from "../components/device/PatientProfileForm";
import { Skeleton, Spinner } from "../components/common/Ui";
import { useAuth } from "../context/authStore";
import { fetchDevices, fetchMe } from "../services/api";

const TABS = [
    { key: "account", label: "ข้อมูลบัญชีผู้ใช้", icon: UserRound },
    { key: "patient", label: "ข้อมูลผู้ป่วยและโรคประจำตัว", icon: HeartPulse },
    { key: "thresholds", label: "เกณฑ์แจ้งเตือนสุขภาพ", icon: Activity },
    { key: "telegram", label: "การแจ้งเตือนผ่าน Telegram", icon: MessageCircle },
];

function Settings() {
    const { refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState("account");
    const [user, setUser] = useState(null);
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            try {
                const [meRes, devicesRes] = await Promise.all([fetchMe(), fetchDevices()]);
                if (!isMounted) return;
                setUser(meRes?.data || null);
                setDevices(Array.isArray(devicesRes?.data) ? devicesRes.data : []);
            } catch (err) {
                console.error("Failed to load settings data:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        load();
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                    ตั้งค่าผู้ใช้
                </h1>
                <p className="mt-1 text-sm text-[var(--midnight-muted)]">
                    จัดการข้อมูลบัญชี ข้อมูลผู้ป่วย เกณฑ์แจ้งเตือน และช่องทางแจ้งเตือนของคุณ
                </p>
            </div>

            <div
                className="grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-white/5 p-1 sm:grid-cols-4"
                role="tablist"
                aria-label="หมวดหมู่การตั้งค่าผู้ใช้"
            >
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`ui-pill ui-press w-full px-2 text-[11px] sm:text-xs ${
                                activeTab === tab.key ? "ui-pill-active" : ""
                            }`}
                        >
                            <Icon size={14} className="shrink-0" />
                            <span className="truncate">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {activeTab === "account" && (
                <ProfileSettings user={user} loading={loading} refreshUser={refreshUser} />
            )}

            {activeTab === "patient" && (
                loading ? (
                    <div className="ui-card space-y-4 p-6">
                        <Skeleton className="h-7 w-64" />
                        <div className="grid gap-4 sm:grid-cols-2">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <Skeleton key={index} className="h-11 w-full" />
                            ))}
                        </div>
                    </div>
                ) : devices.length === 0 ? (
                    <div className="ui-card flex flex-wrap items-center gap-3 p-6 text-sm text-[var(--midnight-muted)]">
                        <Spinner className="h-4 w-4" />
                        ยังไม่พบอุปกรณ์ของผู้ใช้ กรุณารอให้อุปกรณ์เชื่อมต่อกับระบบ
                    </div>
                ) : (
                    <PatientProfileForm device={devices[0]} devices={devices} />
                )
            )}

            {activeTab === "thresholds" && <ThresholdSettings />}

            {activeTab === "telegram" && <NotificationSettings />}
        </div>
    );
}

export default Settings;
