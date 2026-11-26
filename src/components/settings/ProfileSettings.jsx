import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    CircleCheck,
    KeyRound,
    LockKeyhole,
    Mail,
    Save,
    ShieldCheck,
    UserRound,
} from "lucide-react";

import { FIELD_INPUT_CLASS, IconField, Skeleton, Spinner } from "../common/Ui";
import { changeMyPassword, updateMyProfile } from "../../services/api";

const LABEL_CLASS =
    "mb-2 block text-xs font-semibold uppercase tracking-wide leading-relaxed text-[var(--midnight-muted)]";

function TextField({ id, label, icon: Icon, value, onChange, type = "text", autoComplete, placeholder, disabled }) {
    return (
        <div>
            <label htmlFor={id} className={LABEL_CLASS}>
                {label}
            </label>
            <IconField icon={Icon}>
                <input
                    id={id}
                    name={id}
                    type={type}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={FIELD_INPUT_CLASS}
                />
            </IconField>
        </div>
    );
}

function ProfileSettings({ user = null, loading = false, refreshUser = async () => {} }) {
    const [profile, setProfile] = useState({ name: "", email: "" });
    const [passwords, setPasswords] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        setProfile({
            name: user?.name || "",
            email: user?.email || "",
        });
    }, [user?.name, user?.email]);

    const handleProfileChange = (event) => {
        const { name, value } = event.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;
        setPasswords((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async (event) => {
        event.preventDefault();
        if (savingProfile) return;

        const name = profile.name.trim();
        const email = profile.email.trim();
        if (!name) {
            toast.error("กรุณากรอกชื่อ-นามสกุล");
            return;
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error("รูปแบบอีเมลไม่ถูกต้อง");
            return;
        }

        setSavingProfile(true);
        try {
            const payload = { name };
            if (email) payload.email = email;
            await updateMyProfile(payload);
            await refreshUser();
            toast.success("บันทึกข้อมูลบัญชีเรียบร้อยแล้ว");
        } catch (err) {
            toast.error(err?.apiMessage || err.message || "บันทึกข้อมูลบัญชีไม่สำเร็จ");
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async (event) => {
        event.preventDefault();
        if (savingPassword) return;

        if (!passwords.current_password) {
            toast.error("กรุณากรอกรหัสผ่านปัจจุบัน");
            return;
        }
        if (passwords.new_password.length < 6) {
            toast.error("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
            return;
        }
        if (passwords.new_password !== passwords.confirm_password) {
            toast.error("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน");
            return;
        }

        setSavingPassword(true);
        try {
            await changeMyPassword({
                current_password: passwords.current_password,
                new_password: passwords.new_password,
            });
            setPasswords({ current_password: "", new_password: "", confirm_password: "" });
            toast.success("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
        } catch (err) {
            toast.error(err?.apiMessage || err.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
        } finally {
            setSavingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-5">
                <div className="ui-card p-6">
                    <Skeleton className="mb-6 h-7 w-56" />
                    <div className="grid gap-4 md:gap-6 sm:grid-cols-2">
                        <Skeleton className="h-11 w-full" />
                        <Skeleton className="h-11 w-full" />
                    </div>
                </div>
                <div className="ui-card p-6">
                    <Skeleton className="mb-6 h-7 w-56" />
                    <div className="grid gap-4 md:gap-6 sm:grid-cols-2">
                        <Skeleton className="h-11 w-full" />
                        <Skeleton className="h-11 w-full" />
                        <Skeleton className="h-11 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="ui-card p-6 text-sm text-[var(--midnight-muted)]">
                ไม่พบข้อมูลบัญชี กรุณาตรวจสอบการเชื่อมต่อกับเซิร์ฟเวอร์
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <form onSubmit={handleSaveProfile} className="ui-card p-5 md:p-6" noValidate>
                <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-white sm:text-xl">
                            ข้อมูลบัญชีผู้ใช้
                        </h2>
                        <p className="mt-1 text-xs text-[var(--midnight-muted)]">
                            แก้ไขชื่อ-นามสกุลและอีเมลที่ใช้กับบัญชีนี้
                        </p>
                    </div>
                    <div className="ui-gradient-icon flex h-10 w-10 shrink-0 items-center justify-center">
                        <UserRound size={19} />
                    </div>
                </div>

                <div className="grid gap-4 md:gap-6 sm:grid-cols-2">
                    <TextField
                        id="profileName"
                        label="ชื่อ-นามสกุล"
                        icon={UserRound}
                        value={profile.name}
                        onChange={handleProfileChange}
                        autoComplete="name"
                        placeholder="กรอกชื่อ-นามสกุล"
                        disabled={savingProfile}
                    />
                    <TextField
                        id="profileEmail"
                        label="อีเมล"
                        icon={Mail}
                        type="email"
                        value={profile.email}
                        onChange={handleProfileChange}
                        autoComplete="email"
                        placeholder="กรอกอีเมล"
                        disabled={savingProfile}
                    />
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--midnight-muted)]">
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck size={14} className="text-violet-300" />
                            Username: <span className="font-semibold text-white">{user.username || "-"}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <CircleCheck size={14} className="text-emerald-300" />
                            สิทธิ์: <span className="font-semibold text-white">{user.role || "user"}</span>
                        </span>
                    </div>
                    <button
                        type="submit"
                        disabled={savingProfile}
                        className="ui-btn ui-press ui-gradient px-5 py-2.5 text-sm text-white disabled:opacity-50"
                    >
                        {savingProfile ? <Spinner /> : <Save size={16} />}
                        {savingProfile ? "กำลังบันทึก..." : "บันทึกข้อมูลบัญชี"}
                    </button>
                </div>
            </form>

            <form onSubmit={handleChangePassword} className="ui-card p-5 md:p-6" noValidate>
                <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-white sm:text-xl">
                            เปลี่ยนรหัสผ่าน
                        </h2>
                        <p className="mt-1 text-xs text-[var(--midnight-muted)]">
                            กรอกรหัสผ่านปัจจุบันก่อนตั้งรหัสผ่านใหม่อย่างน้อย 6 ตัวอักษร
                        </p>
                    </div>
                    <div className="ui-gradient-icon flex h-10 w-10 shrink-0 items-center justify-center">
                        <KeyRound size={19} />
                    </div>
                </div>

                <div className="grid gap-4 md:gap-6 sm:grid-cols-2">
                    <TextField
                        id="currentPassword"
                        label="รหัสผ่านปัจจุบัน"
                        icon={LockKeyhole}
                        type="password"
                        value={passwords.current_password}
                        onChange={handlePasswordChange}
                        autoComplete="current-password"
                        placeholder="กรอกรหัสผ่านปัจจุบัน"
                        disabled={savingPassword}
                    />
                    <TextField
                        id="newPassword"
                        label="รหัสผ่านใหม่"
                        icon={KeyRound}
                        type="password"
                        value={passwords.new_password}
                        onChange={handlePasswordChange}
                        autoComplete="new-password"
                        placeholder="อย่างน้อย 6 ตัวอักษร"
                        disabled={savingPassword}
                    />
                    <TextField
                        id="confirmPassword"
                        label="ยืนยันรหัสผ่านใหม่"
                        icon={ShieldCheck}
                        type="password"
                        value={passwords.confirm_password}
                        onChange={handlePasswordChange}
                        autoComplete="new-password"
                        placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                        disabled={savingPassword}
                    />
                </div>

                <div className="mt-6 flex justify-end border-t border-white/10 pt-5">
                    <button
                        type="submit"
                        disabled={savingPassword}
                        className="ui-btn ui-press ui-gradient px-5 py-2.5 text-sm text-white disabled:opacity-50"
                    >
                        {savingPassword ? <Spinner /> : <Save size={16} />}
                        {savingPassword ? "กำลังเปลี่ยน..." : "เปลี่ยนรหัสผ่าน"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProfileSettings;
