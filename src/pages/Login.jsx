import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Activity,
    ArrowLeft,
    ArrowRight,
    AtSign,
    CircleCheck,
    Eye,
    EyeOff,
    KeyRound,
    LockKeyhole,
    Mail,
    Send,
    ShieldCheck,
    TriangleAlert,
    UserPlus,
    UserRound,
} from "lucide-react";

import { FIELD_INPUT_CLASS, IconField, Spinner } from "../components/common/Ui";
import { useAuth } from "../context/authStore";
import { requestPasswordReset, resetPassword } from "../services/api";

const LABEL_CLASS =
    "mb-2 block text-xs font-semibold uppercase tracking-wide leading-relaxed text-[var(--midnight-muted)]";

const MODES = [
    { key: "login", label: "เข้าสู่ระบบ" },
    { key: "register", label: "สร้างบัญชีใหม่" },
    { key: "forgot", label: "ลืมรหัสผ่าน?" },
];

function resolveAuthError(error, fallback) {
    if (!error?.response) {
        return "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่อีกครั้ง";
    }
    const status = error.response.status;
    if (status === 401) {
        return "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง";
    }
    if (status >= 500) {
        return "เซิร์ฟเวอร์ขัดข้องชั่วคราว กรุณาลองใหม่ในภายหลัง";
    }
    return error?.apiMessage || fallback;
}

function TextField({
    id,
    label,
    placeholder,
    value,
    onChange,
    icon: Icon,
    type = "text",
    autoComplete,
    inputMode,
    maxLength,
    disabled,
    required = true,
}) {
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
                    inputMode={inputMode}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    className={FIELD_INPUT_CLASS}
                />
            </IconField>
        </div>
    );
}

function PasswordField({
    id,
    label,
    placeholder,
    value,
    onChange,
    autoComplete,
    disabled,
    show,
    onToggle,
}) {
    return (
        <div>
            <label htmlFor={id} className={LABEL_CLASS}>
                {label}
            </label>
            <IconField icon={LockKeyhole}>
                <input
                    id={id}
                    name={id}
                    type={show ? "text" : "password"}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    required
                    className={FIELD_INPUT_CLASS}
                />
                <button
                    type="button"
                    aria-label={show ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                    aria-pressed={show}
                    onClick={onToggle}
                    className="ui-btn ui-press h-9 w-9 shrink-0 text-[var(--midnight-muted)] hover:bg-white/10 hover:text-white"
                >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </IconField>
        </div>
    );
}

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { token, login, register } = useAuth();

    const [mode, setMode] = useState("login");
    const [forgotStep, setForgotStep] = useState(1);
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [resetIdentifier, setResetIdentifier] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [devOtp, setDevOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const destination = location.state?.from || "/";

    useEffect(() => {
        if (token) {
            navigate(destination, { replace: true });
        }
    }, [token, destination, navigate]);

    const switchMode = (nextMode) => {
        if (loading) return;
        setMode(nextMode);
        setForgotStep(1);
        setError("");
        setNotice("");
        setDevOtp("");
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        if (loading) return;

        setError("");
        setNotice("");
        setLoading(true);

        try {
            await login({ identifier: identifier.trim(), password }, remember);
            navigate(destination, { replace: true });
        } catch (err) {
            setError(
                resolveAuthError(err, "ข้อมูลที่ป้อนไม่ถูกต้อง กรุณาตรวจสอบแล้วลองใหม่")
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (event) => {
        event.preventDefault();
        if (loading) return;

        setError("");
        setNotice("");

        const trimmedName = fullName.trim();
        const trimmedUsername = username.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName || !trimmedUsername || !trimmedEmail || !registerPassword || !confirmPassword) {
            setError("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }
        if (registerPassword.length < 6) {
            setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
            return;
        }
        if (registerPassword !== confirmPassword) {
            setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
            return;
        }

        setLoading(true);
        try {
            await register(
                {
                    name: trimmedName,
                    username: trimmedUsername,
                    email: trimmedEmail,
                    password: registerPassword,
                },
                remember
            );
            setNotice("สร้างบัญชีเรียบร้อยแล้ว กำลังพาไปยังแดชบอร์ด");
            navigate(destination, { replace: true });
        } catch (err) {
            setError(
                resolveAuthError(err, "ไม่สามารถสร้างบัญชีได้ กรุณาตรวจสอบข้อมูลแล้วลองใหม่")
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRequestOtp = async (event) => {
        event.preventDefault();
        if (loading) return;

        setError("");
        setNotice("");

        const trimmedIdentifier = resetIdentifier.trim();
        if (!trimmedIdentifier) {
            setError("กรุณากรอก Username หรืออีเมลเพื่อขอรหัสยืนยัน");
            return;
        }

        setLoading(true);
        try {
            const response = await requestPasswordReset(trimmedIdentifier);
            const data = response?.data || {};
            setDevOtp(data.dev_otp || "");
            setNotice(
                response?.message ||
                    "ส่งรหัสยืนยันเรียบร้อยแล้ว กรุณาตรวจสอบแชท Telegram หรือหน้าจอเซิร์ฟเวอร์"
            );
            setForgotStep(2);
        } catch (err) {
            setError(
                resolveAuthError(err, "ไม่สามารถขอรหัสยืนยันได้ กรุณาลองใหม่ในภายหลัง")
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (event) => {
        event.preventDefault();
        if (loading) return;

        setError("");

        if (!/^\d{6}$/.test(otp)) {
            setError("รหัสยืนยันต้องเป็นตัวเลข 6 หลัก");
            return;
        }
        if (newPassword.length < 6) {
            setError("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
            return;
        }

        setLoading(true);
        try {
            await resetPassword({
                identifier: resetIdentifier.trim(),
                otp,
                new_password: newPassword,
            });
            setOtp("");
            setNewPassword("");
            setDevOtp("");
            setNotice("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่");
            setForgotStep(1);
            setMode("login");
        } catch (err) {
            setError(
                resolveAuthError(err, "ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่ในภายหลัง")
            );
        } finally {
            setLoading(false);
        }
    };

    const heading =
        mode === "register"
            ? {
                  title: "สร้างบัญชีใหม่",
                  subtitle: "กรอกข้อมูลเพื่อลงทะเบียนและเริ่มใช้งานแดชบอร์ด",
              }
            : mode === "forgot"
              ? {
                    title: "กู้คืนรหัสผ่าน",
                    subtitle:
                        forgotStep === 1
                            ? "กรอก Username หรืออีเมลเพื่อรับรหัสยืนยัน OTP"
                            : "กรอกรหัสยืนยัน 6 หลักและตั้งรหัสผ่านใหม่",
                }
              : {
                    title: "เข้าสู่ระบบ",
                    subtitle: "ใช้ชื่อผู้ใช้งานหรืออีเมลเพื่อเข้าสู่แดชบอร์ด",
                };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0B14] px-4 py-10 text-[var(--midnight-ink)]">
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-violet-500/20 blur-[130px]" />
                <div className="absolute -bottom-44 -left-32 h-[28rem] w-[28rem] rounded-full bg-cyan-400/20 blur-[130px]" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="ui-gradient-icon mx-auto h-14 w-14">
                        <Activity size={28} strokeWidth={2.2} />
                    </div>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">
                        SHEM
                    </h1>
                    <p className="mt-1 text-sm text-[var(--midnight-muted)]">
                        Smart Health &amp; Emergency Monitoring System
                    </p>
                </div>

                <div className="relative rounded-2xl border border-white/10 bg-[#131626] p-6 shadow-[0_0_80px_-24px_rgba(139,92,246,0.35),0_0_100px_-45px_rgba(34,211,238,0.35)] sm:p-8">
                    <div
                        className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/70 to-transparent"
                        aria-hidden="true"
                    />

                    <div
                        className="mb-7 grid grid-cols-3 gap-1 rounded-full border border-white/10 bg-white/5 p-1"
                        role="tablist"
                        aria-label="โหมดการเข้าสู่ระบบ"
                    >
                        {MODES.map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                role="tab"
                                aria-selected={mode === item.key}
                                disabled={loading}
                                onClick={() => switchMode(item.key)}
                                className={`ui-pill ui-press w-full px-1 text-[11px] sm:text-xs ${
                                    mode === item.key ? "ui-pill-active" : ""
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="mb-7">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--midnight-muted)]">
                            <ShieldCheck size={13} /> Secure Access
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                            {heading.title}
                        </h2>
                        <p className="mt-1.5 text-sm text-[var(--midnight-muted)]">
                            {heading.subtitle}
                        </p>
                    </div>

                    {notice && (
                        <div
                            role="status"
                            aria-live="polite"
                            className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
                        >
                            <CircleCheck size={17} className="mt-0.5 shrink-0" />
                            <span>{notice}</span>
                        </div>
                    )}

                    {mode === "login" && (
                        <form onSubmit={handleLogin} className="space-y-5" noValidate>
                            <TextField
                                id="identifier"
                                label="Username หรือ Email"
                                placeholder="admin หรือ admin@smarthealth.local"
                                value={identifier}
                                onChange={(event) => {
                                    setIdentifier(event.target.value);
                                    setError("");
                                }}
                                icon={UserRound}
                                autoComplete="username"
                                disabled={loading}
                            />

                            <PasswordField
                                id="password"
                                label="รหัสผ่าน"
                                placeholder="กรอกรหัสผ่าน"
                                value={password}
                                onChange={(event) => {
                                    setPassword(event.target.value);
                                    setError("");
                                }}
                                autoComplete="current-password"
                                disabled={loading}
                                show={showPassword}
                                onToggle={() => setShowPassword((value) => !value)}
                            />

                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--midnight-muted)]">
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(event) => setRemember(event.target.checked)}
                                        disabled={loading}
                                        className="h-4 w-4 rounded border-white/20 bg-[#1a1f36] accent-violet-500"
                                    />
                                    จดจำการเข้าสู่ระบบบนอุปกรณ์นี้
                                </label>
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() => switchMode("forgot")}
                                    className="ui-press text-sm font-medium text-violet-300 hover:text-violet-200"
                                >
                                    ลืมรหัสผ่าน?
                                </button>
                            </div>

                            {error && (
                                <div
                                    role="alert"
                                    aria-live="assertive"
                                    className="flex items-start gap-2.5 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
                                >
                                    <TriangleAlert size={17} className="mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="ui-btn ui-press h-12 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 text-sm font-semibold text-white shadow-[0_12px_30px_-14px_rgba(139,92,246,0.9)]"
                            >
                                {loading ? (
                                    <>
                                        <Spinner className="h-4 w-4" /> กำลังเข้าสู่ระบบ...
                                    </>
                                ) : (
                                    <>
                                        เข้าสู่ระบบ <ArrowRight size={17} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {mode === "register" && (
                        <form onSubmit={handleRegister} className="space-y-5" noValidate>
                            <TextField
                                id="fullName"
                                label="ชื่อ-นามสกุล"
                                placeholder="กรอกชื่อ-นามสกุล"
                                value={fullName}
                                onChange={(event) => {
                                    setFullName(event.target.value);
                                    setError("");
                                }}
                                icon={UserRound}
                                autoComplete="name"
                                disabled={loading}
                            />

                            <TextField
                                id="username"
                                label="Username"
                                placeholder="กรอกชื่อผู้ใช้งาน"
                                value={username}
                                onChange={(event) => {
                                    setUsername(event.target.value);
                                    setError("");
                                }}
                                icon={AtSign}
                                autoComplete="username"
                                disabled={loading}
                            />

                            <TextField
                                id="email"
                                label="Email"
                                placeholder="กรอกอีเมล"
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                    setError("");
                                }}
                                icon={Mail}
                                type="email"
                                autoComplete="email"
                                disabled={loading}
                            />

                            <PasswordField
                                id="registerPassword"
                                label="รหัสผ่าน"
                                placeholder="อย่างน้อย 6 ตัวอักษร"
                                value={registerPassword}
                                onChange={(event) => {
                                    setRegisterPassword(event.target.value);
                                    setError("");
                                }}
                                autoComplete="new-password"
                                disabled={loading}
                                show={showRegisterPassword}
                                onToggle={() =>
                                    setShowRegisterPassword((value) => !value)
                                }
                            />

                            <PasswordField
                                id="confirmPassword"
                                label="ยืนยันรหัสผ่าน"
                                placeholder="กรอกรหัสผ่านอีกครั้ง"
                                value={confirmPassword}
                                onChange={(event) => {
                                    setConfirmPassword(event.target.value);
                                    setError("");
                                }}
                                autoComplete="new-password"
                                disabled={loading}
                                show={showRegisterPassword}
                                onToggle={() =>
                                    setShowRegisterPassword((value) => !value)
                                }
                            />

                            {error && (
                                <div
                                    role="alert"
                                    aria-live="assertive"
                                    className="flex items-start gap-2.5 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
                                >
                                    <TriangleAlert size={17} className="mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="ui-btn ui-press h-12 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 text-sm font-semibold text-white shadow-[0_12px_30px_-14px_rgba(139,92,246,0.9)]"
                            >
                                {loading ? (
                                    <>
                                        <Spinner className="h-4 w-4" /> กำลังสร้างบัญชี...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={17} /> สร้างบัญชีและเข้าสู่ระบบ
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                disabled={loading}
                                onClick={() => switchMode("login")}
                                className="ui-press flex w-full items-center justify-center gap-2 text-sm text-[var(--midnight-muted)] hover:text-white"
                            >
                                <ArrowLeft size={15} /> มีบัญชีอยู่แล้ว เข้าสู่ระบบ
                            </button>
                        </form>
                    )}

                    {mode === "forgot" && forgotStep === 1 && (
                        <form onSubmit={handleRequestOtp} className="space-y-5" noValidate>
                            <TextField
                                id="resetIdentifier"
                                label="Username หรือ Email"
                                placeholder="กรอก Username หรืออีเมลของบัญชี"
                                value={resetIdentifier}
                                onChange={(event) => {
                                    setResetIdentifier(event.target.value);
                                    setError("");
                                }}
                                icon={UserRound}
                                autoComplete="username"
                                disabled={loading}
                            />

                            {error && (
                                <div
                                    role="alert"
                                    aria-live="assertive"
                                    className="flex items-start gap-2.5 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
                                >
                                    <TriangleAlert size={17} className="mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="ui-btn ui-press h-12 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 text-sm font-semibold text-white shadow-[0_12px_30px_-14px_rgba(139,92,246,0.9)]"
                            >
                                {loading ? (
                                    <>
                                        <Spinner className="h-4 w-4" /> กำลังส่งรหัส...
                                    </>
                                ) : (
                                    <>
                                        <Send size={17} /> ขอรหัสยืนยัน OTP
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                disabled={loading}
                                onClick={() => switchMode("login")}
                                className="ui-press flex w-full items-center justify-center gap-2 text-sm text-[var(--midnight-muted)] hover:text-white"
                            >
                                <ArrowLeft size={15} /> กลับไปเข้าสู่ระบบ
                            </button>
                        </form>
                    )}

                    {mode === "forgot" && forgotStep === 2 && (
                        <form onSubmit={handleResetPassword} className="space-y-5" noValidate>
                            {devOtp && (
                                <div className="flex items-start gap-2.5 rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-100">
                                    <ShieldCheck size={17} className="mt-0.5 shrink-0" />
                                    <span>
                                        รหัสสำหรับทดสอบบนเครื่อง:{" "}
                                        <strong className="ui-num font-mono tracking-[0.3em]">
                                            {devOtp}
                                        </strong>
                                    </span>
                                </div>
                            )}

                            <TextField
                                id="otp"
                                label="รหัสยืนยัน OTP"
                                placeholder="กรอกตัวเลข 6 หลัก"
                                value={otp}
                                onChange={(event) => {
                                    setOtp(event.target.value.replace(/\D/g, ""));
                                    setError("");
                                }}
                                icon={ShieldCheck}
                                inputMode="numeric"
                                maxLength={6}
                                autoComplete="one-time-code"
                                disabled={loading}
                            />

                            <PasswordField
                                id="newPassword"
                                label="รหัสผ่านใหม่"
                                placeholder="อย่างน้อย 6 ตัวอักษร"
                                value={newPassword}
                                onChange={(event) => {
                                    setNewPassword(event.target.value);
                                    setError("");
                                }}
                                autoComplete="new-password"
                                disabled={loading}
                                show={showNewPassword}
                                onToggle={() => setShowNewPassword((value) => !value)}
                            />

                            {error && (
                                <div
                                    role="alert"
                                    aria-live="assertive"
                                    className="flex items-start gap-2.5 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
                                >
                                    <TriangleAlert size={17} className="mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="ui-btn ui-press h-12 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 text-sm font-semibold text-white shadow-[0_12px_30px_-14px_rgba(139,92,246,0.9)]"
                            >
                                {loading ? (
                                    <>
                                        <Spinner className="h-4 w-4" /> กำลังยืนยัน...
                                    </>
                                ) : (
                                    <>
                                        <KeyRound size={17} /> ยืนยันและตั้งรหัสผ่านใหม่
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                disabled={loading}
                                onClick={() => {
                                    setForgotStep(1);
                                    setError("");
                                    setNotice("");
                                    setDevOtp("");
                                }}
                                className="ui-press flex w-full items-center justify-center gap-2 text-sm text-[var(--midnight-muted)] hover:text-white"
                            >
                                <ArrowLeft size={15} /> กลับไปขอรหัสใหม่
                            </button>
                        </form>
                    )}
                </div>

                {mode === "login" && (
                    <p className="mt-6 text-center text-xs text-[var(--midnight-muted)]">
                        บัญชีตั้งต้นที่สร้างโดยระบบ: admin / admin1234
                    </p>
                )}
            </div>
        </div>
    );
}

export default Login;
