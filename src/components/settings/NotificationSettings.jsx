import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    CheckCircle2,
    Copy,
    ExternalLink,
    Link2,
    RefreshCw,
    Send,
    ShieldCheck,
    Smartphone,
    Trash2,
} from "lucide-react";

import { Spinner } from "../common/Ui";
import {
    disconnectTelegramLink,
    fetchTelegramLink,
    testTelegramMessage,
} from "../../services/api";

const QR_API_URL = "https://api.qrserver.com/v1/create-qr-code/";

function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    try {
        return new Intl.DateTimeFormat("th-TH", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Asia/Bangkok",
        }).format(date);
    } catch {
        return date.toISOString().replace("T", " ").slice(0, 16);
    }
}

function NotificationSettings() {
    const [linkData, setLinkData] = useState(null);
    const [connection, setConnection] = useState({
        connected: false,
        telegram_username: "",
        connected_at: null,
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [testing, setTesting] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [error, setError] = useState("");

    const applyLinkData = useCallback((data) => {
        setLinkData(data);
        setConnection({
            connected: Boolean(data.connected),
            telegram_username: data.telegram_username || "",
            connected_at: data.connected_at || null,
        });
    }, []);

    const loadLink = useCallback(async () => {
        try {
            const res = await fetchTelegramLink();
            applyLinkData(res?.data || {});
            setError("");
            return Boolean(res?.data?.connected);
        } catch (err) {
            setError(err?.apiMessage || err.message || "ไม่สามารถโหลดข้อมูลการเชื่อมต่อ Telegram ได้");
            return false;
        } finally {
            setLoading(false);
        }
    }, [applyLinkData]);

    useEffect(() => {
        loadLink();
    }, [loadLink]);

    useEffect(() => {
        if (connection.connected || loading) return undefined;
        const timer = setInterval(async () => {
            try {
                const res = await fetchTelegramLink();
                const data = res?.data || {};
                if (data.connected) {
                    applyLinkData(data);
                    setError("");
                    toast.success("เชื่อมต่อ Telegram สำเร็จ");
                } else if (data.url && data.url !== linkData?.url) {
                    setLinkData(data);
                }
            } catch {
                return;
            }
        }, 3000);
        return () => clearInterval(timer);
    }, [applyLinkData, connection.connected, linkData?.url, loading]);

    const handleConnect = () => {
        if (!linkData?.url) {
            toast.error("ยังไม่ได้ตั้งค่า TELEGRAM_BOT_USERNAME ใน backend");
            return;
        }
        window.open(linkData.url, "_blank", "noopener,noreferrer");
    };

    const handleCopy = async () => {
        if (!linkData?.url) return;
        try {
            await navigator.clipboard.writeText(linkData.url);
            toast.success("คัดลอกลิงก์แล้ว");
        } catch {
            toast.error("คัดลอกลิงก์ไม่สำเร็จ");
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await loadLink();
        } finally {
            setRefreshing(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        try {
            const res = await testTelegramMessage();
            if (res?.success) {
                toast.success("ส่งข้อความทดสอบเข้ามือถือแล้ว");
            } else {
                toast.error(res?.data?.message || "ส่งข้อความทดสอบไม่สำเร็จ");
            }
        } catch (err) {
            toast.error(err?.apiMessage || err.message || "ส่งข้อความทดสอบไม่สำเร็จ");
        } finally {
            setTesting(false);
        }
    };

    const handleDisconnect = async () => {
        setDisconnecting(true);
        try {
            await disconnectTelegramLink();
            setConnection({ connected: false, telegram_username: "", connected_at: null });
            setLinkData(null);
            toast.success("ยกเลิกการเชื่อมต่อ Telegram แล้ว");
            await loadLink();
        } catch (err) {
            toast.error(err?.apiMessage || err.message || "ยกเลิกการเชื่อมต่อไม่สำเร็จ");
        } finally {
            setDisconnecting(false);
        }
    };

    const qrUrl = linkData?.url
        ? `${QR_API_URL}?size=220x220&margin=16&data=${encodeURIComponent(linkData.url)}`
        : "";

    return (
        <div className="ui-card overflow-hidden">
            <div className="ui-gradient px-6 py-6 text-white sm:px-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">Notification Settings</h2>
                        <p className="mt-1 text-sm text-white/80">
                            เชื่อมต่อ Telegram ผ่าน Deep Link หรือ QR Code เพื่อรับการแจ้งเตือนเหตุฉุกเฉินบนมือถือ
                        </p>
                    </div>
                    <span
                        className={`ui-badge ${
                            connection.connected
                                ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-300"
                                : "border-white/20 bg-white/10 text-white"
                        }`}
                    >
                        {loading ? <Spinner /> : connection.connected ? <CheckCircle2 size={14} /> : <Link2 size={14} />}
                        {connection.connected ? "Connected" : "Not Connected"}
                    </span>
                </div>
            </div>

            <div className="space-y-7 p-6 sm:p-8">
                {error && (
                    <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-300">
                        {error}
                    </div>
                )}

                {connection.connected ? (
                    <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="ui-gradient-icon flex h-11 w-11 items-center justify-center">
                                    <CheckCircle2 size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">เชื่อมต่อ Telegram สำเร็จ</h3>
                                    <p className="mt-1 text-xs text-[var(--midnight-muted)]">
                                        บัญชี Telegram: {connection.telegram_username ? `@${connection.telegram_username}` : "-"}
                                    </p>
                                </div>
                            </div>
                            <span className="ui-badge border-emerald-400/30 bg-emerald-500/15 text-emerald-300">
                                <CheckCircle2 size={14} /> Active
                            </span>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <div className="flex justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
                                <span className="text-[var(--midnight-muted)]">Status</span>
                                <span className="font-semibold text-emerald-300">Connected</span>
                            </div>
                            <div className="flex justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
                                <span className="text-[var(--midnight-muted)]">Connected At</span>
                                <span className="font-semibold text-white">{formatDate(connection.connected_at)}</span>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-5">
                            <button
                                type="button"
                                onClick={handleTest}
                                disabled={testing}
                                className="ui-btn ui-press ui-gradient px-5 py-2.5 text-sm text-white disabled:opacity-50"
                            >
                                {testing ? <Spinner /> : <Send size={16} />}
                                {testing ? "กำลังส่ง..." : "ทดสอบส่งข้อความเข้ามือถือ"}
                            </button>
                            <button
                                type="button"
                                onClick={handleDisconnect}
                                disabled={disconnecting}
                                className="ui-btn ui-press border border-rose-400/30 bg-rose-500/10 px-5 py-2.5 text-sm text-rose-300 hover:bg-rose-500/20 disabled:opacity-50"
                            >
                                {disconnecting ? <Spinner /> : <Trash2 size={16} />}
                                {disconnecting ? "กำลังยกเลิก..." : "ยกเลิกการเชื่อมต่อ"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-[auto,1fr]">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            {qrUrl ? (
                                <img
                                    src={qrUrl}
                                    alt="QR Code สำหรับเชื่อมต่อ Telegram"
                                    className="h-[220px] w-[220px] rounded-xl bg-white p-2"
                                />
                            ) : (
                                <div className="flex h-[220px] w-[220px] items-center justify-center rounded-xl border border-white/10 bg-white/5 text-center text-xs text-[var(--midnight-muted)]">
                                    QR Code ไม่พร้อมใช้งาน
                                </div>
                            )}
                            <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-[var(--midnight-muted)]">
                                <Smartphone size={14} className="text-[var(--midnight-cyan)]" />
                                สแกนด้วยมือถือแล้วกด Start
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="flex items-center gap-2 text-base font-bold text-white">
                                <Link2 size={17} className="text-[var(--midnight-cyan)]" />
                                เชื่อมต่อบัญชี Telegram
                            </h3>
                            <ol className="space-y-2 text-sm text-[var(--midnight-muted)]">
                                <li>1. เปิด Telegram บนมือถือ แล้วสแกน QR Code หรือกดปุ่มเชื่อมต่อ</li>
                                <li>2. กด Start ในแชทของบอทกลางของเว็บไซต์</li>
                                <li>3. ระบบจะตรวจสอบสถานะอัตโนมัติทุก 3 วินาที</li>
                            </ol>

                            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                <p className="mb-2 text-xs font-semibold text-[var(--midnight-muted)]">Deep Link</p>
                                <div className="flex items-center gap-2">
                                    <code className="ui-num min-w-0 flex-1 truncate text-xs text-white">
                                        {linkData?.url || "ไม่พร้อมใช้งาน"}
                                    </code>
                                    <button
                                        type="button"
                                        onClick={handleCopy}
                                        disabled={!linkData?.url}
                                        aria-label="คัดลอกลิงก์"
                                        className="ui-btn ui-press border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10 disabled:opacity-50"
                                    >
                                        <Copy size={15} />
                                    </button>
                                </div>
                                {Boolean(linkData?.expires_in) && (
                                    <p className="ui-timer mt-2 text-xs text-[var(--midnight-muted)]">
                                        ลิงก์หมดอายุใน {Math.ceil(linkData.expires_in / 60)} นาที
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={handleConnect}
                                    disabled={!linkData?.url}
                                    className="ui-btn ui-press ui-gradient px-5 py-2.5 text-sm text-white disabled:opacity-50"
                                >
                                    <ExternalLink size={16} />
                                    เชื่อมต่อบัญชี Telegram
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    className="ui-btn ui-press border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white hover:bg-white/10 disabled:opacity-50"
                                >
                                    {refreshing ? <Spinner /> : <RefreshCw size={16} />}
                                    รีเฟรชลิงก์
                                </button>
                            </div>

                            <p className="flex items-center gap-2 text-xs text-[var(--midnight-muted)]">
                                <Spinner />
                                กำลังรอการยืนยันจาก Telegram...
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-[var(--midnight-muted)]">
                    <ShieldCheck size={16} className="shrink-0 text-violet-300" />
                    บอทกลางของเว็บไซต์และ Bot Token ถูกเก็บไว้บนเซิร์ฟเวอร์เท่านั้น ไม่จำเป็นต้องกรอก Token หรือ Chat ID เอง
                </div>
            </div>
        </div>
    );
}

export default NotificationSettings;
