const db = require("../config/db");
const telegramService = require("../services/telegramService");
const thresholdsConfig = require("../config/thresholds");

function toBoolFlag(value, fallback) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (["true", "1", "yes", "on"].includes(normalized)) return true;
        if (["false", "0", "no", "off"].includes(normalized)) return false;
    }
    return fallback;
}

async function getThresholds(req, res, next) {
    try {
        return res.status(200).json({ success: true, data: await thresholdsConfig.getThresholds() });
    } catch (err) {
        console.error("Get Thresholds Error:", err);
        return next(err);
    }
}

async function updateThresholds(req, res, next) {
    try {
        const body = req.body || {};
        const current = await thresholdsConfig.getThresholds();
        const merged = { ...current };
        thresholdsConfig.THRESHOLD_KEYS.forEach((key) => {
            if (body[key] !== undefined && body[key] !== null && String(body[key]).trim() !== "") {
                merged[key] = body[key];
            }
        });
        const data = await thresholdsConfig.saveThresholds(merged);
        return res.status(200).json({ success: true, data });
    } catch (err) {
        console.error("Update Thresholds Error:", err);
        return next(err);
    }
}

async function notificationSettingsKeyColumn() {
    const [columns] = await db.query("SHOW COLUMNS FROM notification_settings");
    const fields = new Set(columns.map((row) => row.Field));
    return fields.has("id") ? "id" : "notification_setting_id";
}

async function safeNotificationData() {
    const keyColumn = await notificationSettingsKeyColumn();
    const [rows] = await db.query(
        `SELECT * FROM notification_settings ORDER BY ${keyColumn} LIMIT 1`
    );
    const row = rows[0] || null;
    return {
        id: row ? (row.id === undefined ? row.notification_setting_id : row.id) : null,
        telegram_chat_id: row && row.telegram_chat_id ? String(row.telegram_chat_id) : "",
        telegram_enabled: row
            ? toBoolFlag(row.telegram_enabled, false)
            : toBoolFlag(process.env.TELEGRAM_ENABLED, false),
        has_bot_token: Boolean((process.env.TELEGRAM_BOT_TOKEN || "").trim()),
    };
}

async function getNotificationSettings(req, res, next) {
    try {
        return res.status(200).json({ success: true, data: await safeNotificationData() });
    } catch (err) {
        console.error("Get Notification Settings Error:", err);
        return next(err);
    }
}

async function updateNotificationSettings(req, res, next) {
    try {
        const data = req.body || {};
        const telegramEnabled = data.telegram_enabled === undefined
            ? 1
            : toBoolFlag(data.telegram_enabled, false) ? 1 : 0;
        const keyColumn = await notificationSettingsKeyColumn();
        const [existing] = await db.query(
            `SELECT ${keyColumn} AS rowKey FROM notification_settings ORDER BY ${keyColumn} LIMIT 1`
        );
        if (existing.length > 0) {
            await db.query(
                `UPDATE notification_settings SET telegram_enabled = ? WHERE ${keyColumn} = ?`,
                [telegramEnabled, existing[0].rowKey]
            );
        } else {
            await db.query(
                "INSERT INTO notification_settings (telegram_enabled) VALUES (?)",
                [telegramEnabled]
            );
        }
        return res.status(200).json({ success: true, data: await safeNotificationData() });
    } catch (err) {
        console.error("Update Notification Settings Error:", err);
        return next(err);
    }
}

async function getTelegramLink(req, res, next) {
    try {
        const userId = req.user?.user_id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: { message: "Authentication required.", status: 401, type: "auth" },
            });
        }
        const link = await telegramService.createTelegramLink(userId);
        const connection = await telegramService.getTelegramConnection(userId);
        return res.status(200).json({
            success: true,
            data: {
                url: link.url,
                deep_link: link.url,
                bot_username: link.bot_username,
                expires_in: link.expires_in,
                connected: connection.connected,
                telegram_username: connection.telegram_username,
                connected_at: connection.connected_at,
            },
        });
    } catch (err) {
        console.error("Get Telegram Link Error:", err);
        return next(err);
    }
}

async function disconnectTelegramLink(req, res, next) {
    try {
        const userId = req.user?.user_id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: { message: "Authentication required.", status: 401, type: "auth" },
            });
        }
        const removed = await telegramService.clearTelegramConnection(userId);
        const connection = await telegramService.getTelegramConnection(userId);
        return res.status(200).json({
            success: true,
            data: { connected: connection.connected, removed },
        });
    } catch (err) {
        console.error("Disconnect Telegram Error:", err);
        return next(err);
    }
}

async function testTelegramMessage(req, res, next) {
    try {
        const sent = await telegramService.testSend(req.user?.user_id || null);
        return res.status(200).json({
            success: sent,
            data: {
                sent,
                message: sent
                    ? "ข้อความทดสอบถูกส่งไปยัง Telegram แล้ว"
                    : "ยังไม่ได้เชื่อมต่อบัญชี Telegram หรือยังไม่ได้ตั้งค่าบอท",
            },
        });
    } catch (err) {
        console.error("Test Telegram Error:", err);
        return next(err);
    }
}

module.exports = {
    getThresholds,
    updateThresholds,
    getNotificationSettings,
    updateNotificationSettings,
    getTelegramLink,
    disconnectTelegramLink,
    testTelegramMessage,
};
