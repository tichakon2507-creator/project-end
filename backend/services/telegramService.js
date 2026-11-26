const crypto = require("crypto");
const db = require("../config/db");
const { getThresholds, normalizeThresholds } = require("../config/thresholds");

const TELEGRAM_API_URL = "https://api.telegram.org";
const SEND_TIMEOUT_MS = 5000;
const CRITICAL_ALERT_COOLDOWN_MS = 60000;
const LINK_TOKEN_TTL_MS = 10 * 60 * 1000;
const POLL_TIMEOUT_SECONDS = 10;
const POLL_RETRY_MS = 1000;
const DASHBOARD_BUTTON_TEXT = "เปิดแดชบอร์ดดูสถานะและพิกัดผู้ป่วย";
const BOOKMARK_HINT = "หมายเหตุ: กรุณาเปิดแดชบอร์ดจากบุ๊กมาร์กในเบราว์เซอร์";
const LINK_CONFIRM_TEXT = "เชื่อมต่อบัญชีกับระบบ Smart Health Dashboard เรียบร้อยแล้ว";
const LINK_INVALID_TEXT = "ลิงก์ไม่ถูกต้องหรือหมดอายุ กรุณาสร้างลิงก์ใหม่จากแดชบอร์ดแล้วกด Start อีกครั้ง";

const EVENT_MESSAGES = {
    FALL_DETECTED: "ตรวจพบเหตุการณ์ผู้ป่วยล้ม",
    HIGH_TEMP: "ตรวจพบอุณหภูมิร่างกายสูงผิดปกติ (มากกว่า 38.5 องศาเซลเซียส)",
    ABNORMAL_HR: "ตรวจพบอัตราการเต้นของหัวใจผิดปกติ (ต่ำกว่า 45 หรือมากกว่า 120 bpm)",
    LOW_SPO2: "ตรวจพบระดับออกซิเจนในเลือดต่ำกว่าเกณฑ์ (น้อยกว่า 92%)",
    SOS_BUTTON: "ผู้ป่วยกดปุ่มขอความช่วยเหลือฉุกเฉิน",
};

const EVENT_ALIASES = {
    SOS: "SOS_BUTTON",
    SOS_BUTTON: "SOS_BUTTON",
    BUTTON: "SOS_BUTTON",
    FALL: "FALL_DETECTED",
    FALL_DETECTION: "FALL_DETECTED",
    FALL_DETECTED: "FALL_DETECTED",
    TEMP_HIGH: "HIGH_TEMP",
    HIGH_TEMP: "HIGH_TEMP",
    FEVER: "HIGH_TEMP",
    HR_ABNORMAL: "ABNORMAL_HR",
    ABNORMAL_HR: "ABNORMAL_HR",
    HIGH_HR: "ABNORMAL_HR",
    LOW_HR: "ABNORMAL_HR",
    SPO2_LOW: "LOW_SPO2",
    LOW_SPO2: "LOW_SPO2",
};

const lastHealthAlertAt = new Map();
const linkTokens = new Map();
const pollingState = { active: false, offset: 0, timer: null };
let settingsColumnsCache = null;

function toBoolFlag(value, fallback) {
    if (typeof value === "boolean") {
        return value;
    }
    if (typeof value === "number") {
        return value === 1;
    }
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
            return true;
        }
        if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
            return false;
        }
    }
    return fallback;
}

function toFiniteNumber(value) {
    if (value === null || value === undefined) {
        return null;
    }
    const parsed = typeof value === "number" ? value : Number(String(value).trim());
    return Number.isFinite(parsed) ? parsed : null;
}

function logError(message, detail) {
    console.error("[Telegram]", message, detail === undefined ? "" : detail);
}

function stripLinks(value) {
    if (value === null || value === undefined) {
        return "";
    }
    return String(value)
        .replace(/https?:\/\/[^\s<>"']+/gi, "")
        .replace(/\bwww\.[^\s<>"']+/gi, "")
        .replace(/\bt\.me\/[^\s<>"']+/gi, "")
        .replace(/\s+/g, " ")
        .trim();
}

function formatTime(value) {
    if (value === null || value === undefined) {
        return null;
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    try {
        return new Intl.DateTimeFormat("th-TH", {
            dateStyle: "medium",
            timeStyle: "medium",
            timeZone: "Asia/Bangkok",
        }).format(date);
    } catch {
        return date.toISOString().replace("T", " ").slice(0, 19);
    }
}

function normalizeEventType(value) {
    const raw = String(value === null || value === undefined ? "" : value).trim().toUpperCase();
    if (raw === "") {
        return "UNKNOWN";
    }
    return EVENT_ALIASES[raw] || raw;
}

function describeEvent(eventType, description) {
    const type = normalizeEventType(eventType);
    const title = EVENT_MESSAGES[type] || `เหตุฉุกเฉินจากอุปกรณ์ (${type})`;
    const extra = stripLinks(description);
    if (extra === "" || extra === title) {
        return title;
    }
    return `${title} | ${extra}`;
}

function classifyHealthRecord(healthRecord, thresholds) {
    const record = healthRecord || {};
    const limits = normalizeThresholds(thresholds || {});
    const types = [];
    const heartRate = toFiniteNumber(record.heart_rate);
    const temperature = toFiniteNumber(record.temperature);
    const spo2 = toFiniteNumber(record.spo2);

    if (temperature !== null && temperature > limits.temp_max) {
        types.push("HIGH_TEMP");
    }
    if (heartRate !== null && (heartRate < limits.hr_min || heartRate > limits.hr_max)) {
        types.push("ABNORMAL_HR");
    }
    if (spo2 !== null && spo2 < limits.spo2_min) {
        types.push("LOW_SPO2");
    }
    return types;
}

function getEventMessage(eventType, thresholds) {
    const type = normalizeEventType(eventType);
    const limits = normalizeThresholds(thresholds || {});
    if (type === "HIGH_TEMP") {
        return `ตรวจพบอุณหภูมิร่างกายสูงผิดปกติ (มากกว่า ${limits.temp_max} องศาเซลเซียส)`;
    }
    if (type === "ABNORMAL_HR") {
        return `ตรวจพบอัตราการเต้นของหัวใจผิดปกติ (ต่ำกว่า ${limits.hr_min} หรือมากกว่า ${limits.hr_max} bpm)`;
    }
    if (type === "LOW_SPO2") {
        return `ตรวจพบระดับออกซิเจนในเลือดต่ำกว่าเกณฑ์ (น้อยกว่า ${limits.spo2_min}%)`;
    }
    return EVENT_MESSAGES[type] || `เหตุฉุกเฉินจากอุปกรณ์ (${type})`;
}

async function getPatientProfile(deviceId) {
    const id = String(deviceId === null || deviceId === undefined ? "" : deviceId).trim();
    if (id === "") {
        return null;
    }
    const columns =
        "patient_name, patient_age, blood_type, medical_conditions, drug_allergies, emergency_contact_name, emergency_contact_phone";
    const queries = [
        `SELECT ${columns} FROM devices WHERE device_code = ? LIMIT 1`,
        `SELECT ${columns} FROM devices WHERE device_id = ? LIMIT 1`,
    ];
    for (const sql of queries) {
        try {
            const [rows] = await db.query(sql, [id]);
            if (rows[0]) {
                return rows[0];
            }
        } catch (err) {
            logError("Failed to read patient profile", err && err.message ? err.message : String(err));
        }
    }
    return null;
}

function patientFromDevice(device) {
    if (!device || !device.patient_name) {
        return null;
    }
    return {
        patient_name: device.patient_name,
        patient_age: device.patient_age,
        blood_type: device.blood_type,
        medical_conditions: device.medical_conditions,
        drug_allergies: device.drug_allergies,
        emergency_contact_name: device.emergency_contact_name,
        emergency_contact_phone: device.emergency_contact_phone,
    };
}

function buildPatientLines(patient) {
    if (!patient) {
        return [];
    }
    const lines = [];
    const name = stripLinks(patient.patient_name);
    const age = toFiniteNumber(patient.patient_age);
    const bloodType = stripLinks(patient.blood_type);
    const conditions = stripLinks(patient.medical_conditions);
    const allergies = stripLinks(patient.drug_allergies);
    const contactName = stripLinks(patient.emergency_contact_name);
    const contactPhone = stripLinks(patient.emergency_contact_phone);

    if (name !== "" || age !== null || bloodType !== "") {
        lines.push(
            `ข้อมูลประจำตัวผู้ป่วย: ${name === "" ? "-" : name} | อายุ ${age === null ? "-" : age} ปี | กรุ๊ปเลือด ${bloodType === "" ? "-" : bloodType}`
        );
    }
    if (conditions !== "") {
        lines.push(`โรคประจำตัว: ${conditions}`);
    }
    if (allergies !== "") {
        lines.push(`ประวัติแพ้ยา: ${allergies}`);
    }
    if (contactName !== "" || contactPhone !== "") {
        lines.push(
            `ผู้ติดต่อฉุกเฉิน: ${contactName === "" ? "-" : contactName} | เบอร์ติดต่อ ${contactPhone === "" ? "-" : contactPhone}`
        );
    }
    return lines;
}

function buildDashboardButton(caseId) {
    const raw = (process.env.FRONTEND_URL || "").trim();
    if (!raw.startsWith("https://")) {
        return null;
    }
    let url;
    try {
        const base = raw.replace(/\/+$/, "");
        url = `${base}/dashboard?case=${encodeURIComponent(caseId === null || caseId === undefined ? "" : String(caseId))}`;
        if (new URL(url).protocol !== "https:") {
            return null;
        }
    } catch {
        return null;
    }
    return {
        inline_keyboard: [[{ text: DASHBOARD_BUTTON_TEXT, url }]],
    };
}

function formatAlertText(alert) {
    const lines = ["การแจ้งเตือนเหตุฉุกเฉิน"];

    const title = stripLinks(alert.eventTitle) || "เหตุฉุกเฉินจากอุปกรณ์";
    lines.push(`หัวข้อสถานการณ์: ${title}`);

    const symptoms = Array.isArray(alert.symptoms)
        ? alert.symptoms.map(stripLinks).filter((item) => item !== "")
        : [];
    if (symptoms.length > 0) {
        lines.push(`อาการที่ตรวจพบ: ${symptoms.join(" | ")}`);
    }

    const deviceName = stripLinks(alert.deviceName);
    const deviceId = stripLinks(alert.deviceId);
    const deviceLabel = [deviceName, deviceId].filter((item) => item !== "").join(" / ");
    if (deviceLabel !== "") {
        lines.push(`อุปกรณ์: ${deviceLabel}`);
    }

    const userName = stripLinks(alert.userName);
    if (userName !== "") {
        lines.push(`ผู้ป่วย: ${userName}`);
    }
    buildPatientLines(alert.patient).forEach((line) => lines.push(line));

    const description = stripLinks(alert.description);
    if (description !== "" && description !== title) {
        lines.push(`รายละเอียดเพิ่มเติม: ${description}`);
    }

    const heartRate = toFiniteNumber(alert.heartRate);
    const temperature = toFiniteNumber(alert.temperature);
    const spo2 = toFiniteNumber(alert.spo2);
    lines.push(`Heart Rate: ${heartRate === null ? "-" : heartRate} bpm`);
    lines.push(`Temperature: ${temperature === null ? "-" : temperature} องศาเซลเซียส`);
    lines.push(`SpO2: ${spo2 === null ? "-" : spo2}%`);

    const caseId = stripLinks(alert.caseId);
    lines.push(`รหัสอ้างอิงเคส (Case ID): ${caseId === "" ? "-" : caseId}`);

    const time = formatTime(alert.detectedAt);
    lines.push(`เวลาเกิดเหตุ: ${time === null ? "-" : time}`);

    const latitude = toFiniteNumber(alert.latitude);
    const longitude = toFiniteNumber(alert.longitude);
    if (latitude !== null && longitude !== null) {
        lines.push(`พิกัด: ${latitude}, ${longitude}`);
    }
    if (alert.showBookmarkHint === true) {
        lines.push(BOOKMARK_HINT);
    }
    return lines.join("\n");
}

async function getNotificationSettingsColumns() {
    if (settingsColumnsCache) return settingsColumnsCache;
    const [rows] = await db.query(
        "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notification_settings'"
    );
    settingsColumnsCache = new Set(rows.map((row) => row.COLUMN_NAME));
    return settingsColumnsCache;
}

async function ensureNotificationSettingsSchema() {
    const columns = await getNotificationSettingsColumns();
    const additions = [
        ["user_id", "BIGINT UNSIGNED NULL"],
        ["telegram_username", "VARCHAR(255) NULL"],
        ["connected_at", "DATETIME NULL"],
    ];
    for (const [column, definition] of additions) {
        if (columns.has(column)) continue;
        try {
            await db.query(`ALTER TABLE notification_settings ADD COLUMN ${column} ${definition}`);
            columns.add(column);
        } catch (err) {
            logError(`Failed to add notification_settings.${column}`, err && err.message ? err.message : String(err));
        }
    }
    return columns.has("id") ? "id" : "notification_setting_id";
}

function getBotToken() {
    return (process.env.TELEGRAM_BOT_TOKEN || "").trim();
}

function getBotUsername() {
    const raw = (process.env.TELEGRAM_BOT_USERNAME || "").trim().replace(/^@/, "");
    return /^[A-Za-z0-9_]{3,32}$/.test(raw) ? raw : "";
}

async function getNotificationSettings() {
    const [rows] = await db.query(
        "SELECT id, telegram_bot_token, telegram_chat_id, telegram_enabled FROM notification_settings ORDER BY id LIMIT 1"
    );
    return rows[0] || null;
}

async function isTelegramEnabled() {
    try {
        await ensureNotificationSettingsSchema();
        const [rows] = await db.query(
            "SELECT COUNT(*) AS total FROM notification_settings WHERE telegram_enabled = 1 AND telegram_chat_id <> ''"
        );
        if (rows[0] && Number(rows[0].total) > 0) return true;
    } catch (err) {
        logError("Failed to read notification_settings", err && err.message ? err.message : String(err));
    }
    return toBoolFlag(process.env.TELEGRAM_ENABLED, false);
}

async function getLegacyBotToken() {
    try {
        const settings = await getNotificationSettings();
        if (settings && settings.telegram_bot_token) {
            return String(settings.telegram_bot_token).trim();
        }
    } catch (err) {
        logError("Failed to read legacy bot token", err && err.message ? err.message : String(err));
    }
    return "";
}

async function getLegacyChatId() {
    try {
        const settings = await getNotificationSettings();
        if (settings && settings.telegram_chat_id) {
            return String(settings.telegram_chat_id).trim();
        }
    } catch (err) {
        logError("Failed to read legacy chat id", err && err.message ? err.message : String(err));
    }
    return (process.env.TELEGRAM_CHAT_ID || "").trim();
}

async function resolveTelegramTarget() {
    const token = getBotToken() || await getLegacyBotToken();
    const chatId = await getLegacyChatId();
    return { token, chatId };
}

function pruneExpiredLinkTokens() {
    const now = Date.now();
    for (const [token, entry] of linkTokens.entries()) {
        if (entry.expiresAt <= now) linkTokens.delete(token);
    }
}

function createOrReuseLinkToken(userId) {
    pruneExpiredLinkTokens();
    const id = String(userId);
    for (const [token, entry] of linkTokens.entries()) {
        if (entry.userId === id) return { token, expiresAt: entry.expiresAt };
    }
    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = Date.now() + LINK_TOKEN_TTL_MS;
    linkTokens.set(token, { userId: id, expiresAt });
    return { token, expiresAt };
}

function consumeLinkToken(token) {
    if (typeof token !== "string") return null;
    const entry = linkTokens.get(token);
    if (!entry) return null;
    linkTokens.delete(token);
    if (entry.expiresAt <= Date.now()) return null;
    return entry.userId;
}

async function createTelegramLink(userId) {
    if (userId === null || userId === undefined || String(userId).trim() === "") {
        throw new Error("User authentication is required");
    }
    const { token, expiresAt } = createOrReuseLinkToken(userId);
    const username = getBotUsername();
    return {
        url: username === "" ? "" : `https://t.me/${username}?start=${token}`,
        bot_username: username === "" ? null : username,
        expires_in: Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)),
    };
}

async function getTelegramConnection(userId) {
    await ensureNotificationSettingsSchema();
    const keyColumn = settingsColumnsCache.has("id") ? "id" : "notification_setting_id";
    const [rows] = await db.query(
        `SELECT telegram_chat_id, telegram_username, telegram_enabled, connected_at
         FROM notification_settings WHERE user_id = ? ORDER BY ${keyColumn} DESC LIMIT 1`,
        [String(userId)]
    );
    const row = rows[0] || null;
    const chatId = row && row.telegram_chat_id ? String(row.telegram_chat_id).trim() : "";
    return {
        connected: chatId !== "",
        chat_id: chatId === "" ? null : chatId,
        telegram_username: row && row.telegram_username ? String(row.telegram_username) : null,
        connected_at: row && row.connected_at ? row.connected_at : null,
    };
}

async function saveTelegramConnection(userId, chatId, telegramUsername) {
    await ensureNotificationSettingsSchema();
    const id = String(userId);
    const chat = String(chatId === null || chatId === undefined ? "" : chatId).trim();
    const username = String(telegramUsername === null || telegramUsername === undefined ? "" : telegramUsername)
        .trim()
        .slice(0, 255);
    if (id === "" || chat === "") {
        throw new Error("Invalid Telegram connection data");
    }
    await db.query(
        "UPDATE notification_settings SET telegram_chat_id = '', telegram_username = NULL, telegram_enabled = 0, connected_at = NULL WHERE telegram_chat_id = ? AND (user_id IS NULL OR user_id <> ?)",
        [chat, id]
    );
    const [result] = await db.query(
        "UPDATE notification_settings SET telegram_chat_id = ?, telegram_username = ?, telegram_enabled = 1, connected_at = NOW() WHERE user_id = ?",
        [chat, username === "" ? null : username, id]
    );
    if (!result.affectedRows) {
        await db.query(
            "INSERT INTO notification_settings (user_id, telegram_chat_id, telegram_username, telegram_enabled, connected_at) VALUES (?, ?, ?, 1, NOW())",
            [id, chat, username === "" ? null : username]
        );
    }
    return getTelegramConnection(id);
}

async function clearTelegramConnection(userId) {
    await ensureNotificationSettingsSchema();
    const [result] = await db.query(
        "UPDATE notification_settings SET telegram_chat_id = '', telegram_username = NULL, telegram_enabled = 0, connected_at = NULL WHERE user_id = ?",
        [String(userId)]
    );
    return Number(result.affectedRows || 0) > 0;
}

async function getDeviceUserIds(deviceId) {
    const id = String(deviceId === null || deviceId === undefined ? "" : deviceId).trim();
    if (id === "") return [];
    const ids = new Set();
    const queries = [
        "SELECT user_id FROM devices WHERE device_id = ? AND user_id IS NOT NULL",
        "SELECT user_id FROM devices WHERE device_code = ? AND user_id IS NOT NULL",
    ];
    for (const sql of queries) {
        try {
            const [rows] = await db.query(sql, [id]);
            rows.forEach((row) => ids.add(String(row.user_id)));
        } catch (err) {
            logError("Failed to read device owner", err && err.message ? err.message : String(err));
        }
    }
    return Array.from(ids);
}

async function getConnectedRecipients(options = {}) {
    await ensureNotificationSettingsSchema();
    let rows = [];
    try {
        [rows] = await db.query(
            "SELECT user_id, telegram_chat_id, telegram_username FROM notification_settings WHERE telegram_chat_id <> '' AND telegram_enabled = 1"
        );
    } catch (err) {
        logError("Failed to read connected Telegram accounts", err && err.message ? err.message : String(err));
    }
    const recipients = rows
        .map((row) => ({
            chat_id: row.telegram_chat_id === null || row.telegram_chat_id === undefined ? "" : String(row.telegram_chat_id).trim(),
            user_id: row.user_id === null || row.user_id === undefined ? null : String(row.user_id),
            telegram_username: row.telegram_username || null,
        }))
        .filter((row) => row.chat_id !== "");

    const preferred = new Set();
    if (options.userId !== null && options.userId !== undefined && String(options.userId) !== "") {
        preferred.add(String(options.userId));
    }
    if (options.deviceId) {
        for (const id of await getDeviceUserIds(options.deviceId)) preferred.add(id);
    }
    if (preferred.size > 0) {
        const matched = recipients.filter((row) => row.user_id !== null && preferred.has(row.user_id));
        if (matched.length > 0) return matched;
    }
    if (recipients.length > 0) return recipients;

    const legacyChatId = await getLegacyChatId();
    if (legacyChatId !== "") {
        return [{ chat_id: legacyChatId, user_id: null, telegram_username: null }];
    }
    return [];
}

async function sendTextMessage(chatId, text, tokenOverride) {
    const token = tokenOverride || getBotToken() || await getLegacyBotToken();
    if (!token) throw new Error("Telegram bot token is not configured");
    return postTelegram(token, "sendMessage", { chat_id: chatId, text });
}

async function fetchTelegramUpdates(token, offset) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), (POLL_TIMEOUT_SECONDS + 5) * 1000);
    try {
        const params = new URLSearchParams({
            offset: String(offset),
            timeout: String(POLL_TIMEOUT_SECONDS),
            allowed_updates: JSON.stringify(["message"]),
        });
        const response = await fetch(`${TELEGRAM_API_URL}/bot${token}/getUpdates?${params.toString()}`, {
            signal: controller.signal,
        });
        const data = await response.json().catch(() => null);
        if (!response.ok || !data || data.ok !== true) {
            const detail = data && data.description ? data.description : `HTTP ${response.status}`;
            throw new Error(detail);
        }
        return Array.isArray(data.result) ? data.result : [];
    } finally {
        clearTimeout(timer);
    }
}

async function handleTelegramUpdate(update, token) {
    const message = update && update.message;
    if (!message || typeof message.text !== "string") return;
    const chatId = message.chat && message.chat.id;
    if (chatId === undefined || chatId === null) return;

    const text = message.text.trim();
    const match = text.match(/^\/start(?:@[A-Za-z0-9_]+)?(?:\s+([A-Za-z0-9_-]+))?\s*$/i);
    if (!match) return;

    const linkToken = match[1];
    if (!linkToken) {
        try {
            await sendTextMessage(chatId, LINK_INVALID_TEXT, token);
        } catch (err) {
            logError("Failed to reply to /start", err && err.message ? err.message : String(err));
        }
        return;
    }

    const userId = consumeLinkToken(linkToken);
    if (!userId) {
        try {
            await sendTextMessage(chatId, LINK_INVALID_TEXT, token);
        } catch (err) {
            logError("Failed to reply to invalid link token", err && err.message ? err.message : String(err));
        }
        return;
    }

    const from = message.from || {};
    const username = String(from.username || from.first_name || "").trim();
    try {
        await saveTelegramConnection(userId, chatId, username);
        await sendTextMessage(chatId, LINK_CONFIRM_TEXT, token);
        console.log(`[Telegram] Connected user ${userId} to chat ${chatId}`);
    } catch (err) {
        logError("Failed to complete Telegram linking", err && err.message ? err.message : String(err));
    }
}

async function pollTelegramUpdates() {
    if (!pollingState.active) return;
    const token = getBotToken();
    if (!token) return;

    let updates = [];
    try {
        updates = await fetchTelegramUpdates(token, pollingState.offset);
    } catch (err) {
        if (err.name !== "AbortError") {
            logError("Telegram getUpdates failed", err && err.message ? err.message : String(err));
        }
    }

    for (const update of updates) {
        const updateId = Number(update && update.update_id);
        if (Number.isFinite(updateId)) {
            pollingState.offset = Math.max(pollingState.offset, updateId + 1);
        }
        try {
            await handleTelegramUpdate(update, token);
        } catch (err) {
            logError("Failed to handle Telegram update", err && err.message ? err.message : String(err));
        }
    }

    if (pollingState.active) {
        pollingState.timer = setTimeout(pollTelegramUpdates, updates.length > 0 ? 0 : POLL_RETRY_MS);
    }
}

function startTelegramPolling() {
    if (!getBotToken()) {
        console.log("[Telegram] Long polling disabled: TELEGRAM_BOT_TOKEN is not configured");
        return false;
    }
    if (pollingState.active) return true;
    pollingState.active = true;
    console.log("[Telegram] Long polling started");
    pollTelegramUpdates();
    return true;
}

function stopTelegramPolling() {
    pollingState.active = false;
    if (pollingState.timer) {
        clearTimeout(pollingState.timer);
        pollingState.timer = null;
    }
}

async function getLatestLocation(deviceId) {
    const queries = [
        "SELECT latitude, longitude FROM location_records WHERE device_id = ? ORDER BY recorded_at DESC LIMIT 1",
        "SELECT latitude, longitude FROM gps_tracking WHERE device_id = ? ORDER BY recorded_at DESC LIMIT 1",
    ];
    for (const sql of queries) {
        try {
            const [rows] = await db.query(sql, [deviceId]);
            if (rows[0]) {
                return rows[0];
            }
        } catch (err) {
            logError("Failed to read latest location", err && err.message ? err.message : String(err));
        }
    }
    return null;
}

async function logSendResult(result) {
    const { status, message, recipient, emergencyId, userId, deviceId } = result;
    try {
        await db.query(
            "INSERT INTO notification_logs (user_id, device_id, emergency_id, channel, recipient, message, status) VALUES (?, ?, ?, 'telegram', ?, ?, ?)",
            [
                userId === null || userId === undefined ? null : userId,
                deviceId || null,
                emergencyId === null || emergencyId === undefined ? null : emergencyId,
                recipient || null,
                message || "",
                status,
            ]
        );
    } catch (err) {
        logError("Failed to write notification_logs", err && err.message ? err.message : String(err));
    }
}

function extractEmergencyId(emergency) {
    if (!emergency) {
        return null;
    }
    if (emergency.emergency_id !== undefined && emergency.emergency_id !== null) {
        return emergency.emergency_id;
    }
    if (emergency.id !== undefined && emergency.id !== null) {
        return emergency.id;
    }
    return null;
}

async function postTelegram(token, method, payload) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
    try {
        const response = await fetch(`${TELEGRAM_API_URL}/bot${token}/${method}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });
        const data = await response.json().catch(() => null);
        if (!response.ok || !data || data.ok !== true) {
            const detail = data && data.description ? data.description : `HTTP ${response.status}`;
            throw new Error(detail);
        }
        return data;
    } finally {
        clearTimeout(timer);
    }
}

async function sendAlert(alert) {
    if (!alert) {
        return false;
    }
    const message = alert.text || formatAlertText(alert);
    let sent = false;
    try {
        if (!(await isTelegramEnabled())) {
            return false;
        }
        const token = getBotToken() || await getLegacyBotToken();
        if (!token) {
            logError("Telegram send skipped: TELEGRAM_BOT_TOKEN is not configured");
            return false;
        }

        let recipients = [];
        if (alert.recipient && !alert.userId && !alert.deviceId) {
            recipients = [{ chat_id: String(alert.recipient).trim(), user_id: null, telegram_username: null }];
        } else {
            recipients = await getConnectedRecipients({ userId: alert.userId, deviceId: alert.deviceId });
        }
        if (recipients.length === 0) {
            logError("Telegram send skipped: no connected Telegram accounts");
            return false;
        }

        const payload = { text: message };
        if (alert.replyMarkup) {
            payload.reply_markup = alert.replyMarkup;
        }
        const latitude = toFiniteNumber(alert.latitude);
        const longitude = toFiniteNumber(alert.longitude);

        for (const recipient of recipients) {
            const chatId = recipient.chat_id;
            if (!chatId) continue;
            try {
                await postTelegram(token, "sendMessage", { chat_id: chatId, ...payload });
                sent = true;
                if (latitude !== null && longitude !== null) {
                    try {
                        await postTelegram(token, "sendLocation", { chat_id: chatId, latitude, longitude });
                    } catch (err) {
                        logError("Failed to send Telegram location", err && err.message ? err.message : String(err));
                    }
                }
                await logSendResult({
                    status: "sent",
                    message,
                    recipient: chatId,
                    emergencyId: alert.emergencyId || null,
                    userId: recipient.user_id || alert.userId || null,
                    deviceId: alert.deviceId || null,
                });
            } catch (err) {
                logError(`Failed to send Telegram message to ${chatId}`, err && err.message ? err.message : String(err));
                await logSendResult({
                    status: "failed",
                    message,
                    recipient: chatId,
                    emergencyId: alert.emergencyId || null,
                    userId: recipient.user_id || alert.userId || null,
                    deviceId: alert.deviceId || null,
                });
            }
        }
    } catch (err) {
        logError("Failed to send Telegram message", err && err.message ? err.message : String(err));
    }
    return sent;
}

async function sendEmergencyAlert(ctx) {
    try {
        if (!ctx || !ctx.device || !ctx.device.device_id) {
            return false;
        }
        const device = ctx.device;
        const emergency = ctx.emergency || null;
        const payload = ctx.payload || {};
        const deviceId = device.device_id;

        const eventType = normalizeEventType(
            payload.event_type !== undefined && payload.event_type !== null && String(payload.event_type).trim() !== ""
                ? payload.event_type
                : emergency && emergency.emergency_type
        );
        const thresholds = await getThresholds();
        const eventTitle = getEventMessage(eventType, thresholds);
        const vitals = {
            heart_rate: payload.heart_rate !== undefined ? payload.heart_rate : null,
            temperature: payload.temperature !== undefined ? payload.temperature : null,
            spo2: payload.spo2 !== undefined ? payload.spo2 : null,
        };
        const triggered = classifyHealthRecord(vitals, thresholds);
        const symptoms = triggered.length > 0
            ? triggered.map((type) => getEventMessage(type, thresholds))
            : [eventTitle];
        const patient = ctx.patient || patientFromDevice(device) || await getPatientProfile(deviceId);

        const detectedAt =
            (emergency && (emergency.detected_at || emergency.created_at)) || new Date();
        const caseId = extractEmergencyId(emergency);
        const replyMarkup = caseId !== null ? buildDashboardButton(caseId) : null;

        let latitude = payload.latitude !== undefined ? payload.latitude : (emergency ? emergency.latitude : null);
        let longitude = payload.longitude !== undefined ? payload.longitude : (emergency ? emergency.longitude : null);
        if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
            const location = await getLatestLocation(deviceId);
            if (location) {
                if (latitude === null || latitude === undefined) {
                    latitude = location.latitude;
                }
                if (longitude === null || longitude === undefined) {
                    longitude = location.longitude;
                }
            }
        }

        return await sendAlert({
            eventTitle,
            symptoms,
            deviceId,
            deviceName: device.device_name || (emergency && emergency.device_name) || "",
            userName: (emergency && emergency.user_name) || device.user_name || "",
            patient,
            description: payload.description !== undefined ? payload.description : (emergency && emergency.description),
            heartRate: vitals.heart_rate,
            temperature: vitals.temperature,
            spo2: vitals.spo2,
            latitude,
            longitude,
            detectedAt,
            caseId,
            emergencyId: caseId,
            userId: device.user_id || null,
            replyMarkup,
            showBookmarkHint: replyMarkup === null,
        });
    } catch (err) {
        logError("Failed to send Telegram emergency alert", err && err.message ? err.message : String(err));
        return false;
    }
}

async function sendHealthAlert(device, healthRecord, options = {}) {
    try {
        const deviceId = device && device.device_id;
        if (!deviceId) {
            return false;
        }
        const record = healthRecord || {};
        const thresholds = await getThresholds();
        const types = classifyHealthRecord(record, thresholds);
        if (types.length === 0) {
            return false;
        }
        const last = lastHealthAlertAt.get(deviceId) || 0;
        if (Date.now() - last < CRITICAL_ALERT_COOLDOWN_MS) {
            return false;
        }
        lastHealthAlertAt.set(deviceId, Date.now());

        let latitude = options.latitude;
        let longitude = options.longitude;
        if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
            const location = await getLatestLocation(deviceId);
            if (location) {
                if (latitude === null || latitude === undefined) {
                    latitude = location.latitude;
                }
                if (longitude === null || longitude === undefined) {
                    longitude = location.longitude;
                }
            }
        }

        const patient = options.patient || patientFromDevice(device) || await getPatientProfile(deviceId);

        return await sendAlert({
            eventTitle: getEventMessage(types[0], thresholds),
            symptoms: types.map((type) => getEventMessage(type, thresholds)),
            deviceId,
            deviceName: device.device_name || "",
            patient,
            heartRate: record.heart_rate,
            spo2: record.spo2,
            temperature: record.temperature,
            latitude,
            longitude,
            detectedAt: record.recorded_at || new Date(),
            userId: device.user_id || null,
            showBookmarkHint: true,
        });
    } catch (err) {
        logError("Failed to send Telegram health alert", err && err.message ? err.message : String(err));
        return false;
    }
}

async function testSend(userId) {
    return sendAlert({
        text: "ข้อความทดสอบจากระบบแจ้งเตือน Smart Health Dashboard",
        userId: userId === null || userId === undefined ? null : userId,
    });
}

module.exports = {
    sendAlert,
    sendEmergencyAlert,
    sendHealthAlert,
    testSend,
    isCriticalValue: (healthRecord) => classifyHealthRecord(healthRecord).length > 0,
    classifyHealthRecord,
    getEventMessage,
    getPatientProfile,
    normalizeEventType,
    describeEvent,
    formatAlertText,
    buildDashboardButton,
    EVENT_MESSAGES,
    getNotificationSettings,
    isTelegramEnabled,
    resolveTelegramTarget,
    getBotToken,
    getBotUsername,
    createTelegramLink,
    getTelegramConnection,
    saveTelegramConnection,
    clearTelegramConnection,
    getConnectedRecipients,
    sendTextMessage,
    startTelegramPolling,
    stopTelegramPolling,
};
