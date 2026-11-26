const bcrypt = require("bcrypt");
const crypto = require("crypto");

const db = require("../config/db");
const { getUserSchema } = require("../config/userSchema");
const telegramService = require("../services/telegramService");
const {
    ACCESS_EXPIRES_IN,
    signAccessToken,
} = require("../config/security");

const BCRYPT_HASH_PATTERN = /^\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MIN = 100000;
const OTP_MAX = 999999;

const otpStore = new Map();

function saltRounds() {
    const configured = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10);
    return Number.isFinite(configured) && configured >= 4 && configured <= 15
        ? configured
        : 10;
}

function createTokenPayload(userRow) {
    return {
        type: "access",
        user_id: userRow.id,
        username: userRow.username,
        email: userRow.email || null,
        role: userRow.role,
    };
}

function getUserSafe(userRow) {
    if (!userRow) return null;
    return {
        id: userRow.id,
        name: userRow.name || null,
        username: userRow.username,
        email: userRow.email || null,
        role: userRow.role,
        created_at: userRow.created_at || null,
        updated_at: userRow.updated_at || null,
    };
}

function apiError(res, status, message, type, data = null) {
    return res.status(status).json({
        success: false,
        error: {
            message,
            status,
            type,
            data,
        },
    });
}

function userSelect(schema) {
    const emailColumn = schema.hasEmail ? "email," : "";
    return `SELECT ${schema.idColumn} AS id, ${schema.nameColumn} AS name, ${emailColumn} username, ${schema.passwordColumn} AS password_hash, role, created_at, updated_at`;
}

function publicUserSelect(schema) {
    const emailColumn = schema.hasEmail ? "email," : "";
    return `SELECT ${schema.idColumn} AS id, ${schema.nameColumn} AS name, ${emailColumn} username, role, created_at, updated_at`;
}

function tokenResponse(userRow) {
    return {
        access_token: signAccessToken(createTokenPayload(userRow)),
        expires_in: ACCESS_EXPIRES_IN,
        token_type: "Bearer",
        user: getUserSafe(userRow),
    };
}

async function findUserByIdentifier(identifier) {
    const value = String(identifier || "").trim();
    if (!value) return null;

    const schema = await getUserSchema();
    const where = schema.hasEmail
        ? "WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) LIMIT 1"
        : "WHERE LOWER(username) = LOWER(?) LIMIT 1";
    const params = schema.hasEmail ? [value, value] : [value];

    const [rows] = await db.query(
        `${userSelect(schema)} FROM users ${where}`,
        params
    );
    return rows[0] || null;
}

async function verifyPassword(plainPassword, storedHash) {
    if (typeof storedHash !== "string" || storedHash.length === 0) {
        return false;
    }
    if (BCRYPT_HASH_PATTERN.test(storedHash)) {
        try {
            return await bcrypt.compare(plainPassword, storedHash);
        } catch {
            return false;
        }
    }
    return storedHash === plainPassword;
}

async function upgradePlaintextPassword(userId, plainPassword) {
    try {
        const schema = await getUserSchema();
        const passwordHash = await bcrypt.hash(plainPassword, saltRounds());
        await db.query(
            `UPDATE users SET ${schema.passwordColumn} = ? WHERE ${schema.idColumn} = ? LIMIT 1`,
            [passwordHash, userId]
        );
    } catch (err) {
        console.error("[AUTH] Could not hash stored plaintext password:", err.message);
    }
}

function otpKey(identifier) {
    return String(identifier || "").trim().toLowerCase();
}

function pruneExpiredOtps() {
    const now = Date.now();
    for (const [key, entry] of otpStore.entries()) {
        if (entry.expiresAt <= now) {
            otpStore.delete(key);
        }
    }
}

function createOtpCode() {
    return String(crypto.randomInt(OTP_MIN, OTP_MAX + 1));
}

async function registerUser(req, res, next) {
    const fullName = String(req.body?.full_name || req.body?.name || "").trim();
    const username = String(req.body?.username || "").trim();
    const email = req.body?.email ? String(req.body.email).trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    try {
        const schema = await getUserSchema();

        if (!fullName || !username || !password || (schema.hasEmail && !email)) {
            return apiError(
                res,
                400,
                "กรุณากรอกชื่อ-นามสกุล ชื่อผู้ใช้งาน อีเมล และรหัสผ่านให้ครบถ้วน",
                "validation"
            );
        }
        if (schema.hasEmail && !EMAIL_PATTERN.test(email)) {
            return apiError(res, 400, "รูปแบบอีเมลไม่ถูกต้อง", "validation");
        }
        if (password.length < 6) {
            return apiError(res, 400, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", "validation");
        }

        const [byUsername] = await db.query(
            `SELECT ${schema.idColumn} AS id FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1`,
            [username]
        );
        if (byUsername.length > 0) {
            return apiError(
                res,
                400,
                "ชื่อผู้ใช้งานนี้มีอยู่ในระบบแล้ว กรุณาเลือกชื่อผู้ใช้งานอื่น",
                "validation",
                { field: "username" }
            );
        }

        if (schema.hasEmail) {
            const [byEmail] = await db.query(
                `SELECT ${schema.idColumn} AS id FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1`,
                [email]
            );
            if (byEmail.length > 0) {
                return apiError(
                    res,
                    400,
                    "อีเมลนี้มีอยู่ในระบบแล้ว กรุณาใช้อีเมลอื่นหรือเข้าสู่ระบบด้วยบัญชีเดิม",
                    "validation",
                    { field: "email" }
                );
            }
        }

        const passwordHash = await bcrypt.hash(password, saltRounds());
        const columns = [schema.nameColumn, "username"];
        const values = [fullName, username];

        if (email && schema.hasEmail) {
            columns.push("email");
            values.push(email);
        }
        columns.push(schema.passwordColumn);
        values.push(passwordHash);
        if (schema.hasRole) {
            columns.push("role");
            values.push("user");
        }

        const [result] = await db.query(
            `INSERT INTO users (${columns.join(", ")}) VALUES (${columns
                .map(() => "?")
                .join(", ")})`,
            values
        );

        const [rows] = await db.query(
            `${userSelect(schema)} FROM users WHERE ${schema.idColumn} = ? LIMIT 1`,
            [result.insertId]
        );

        return res.status(201).json({
            success: true,
            data: tokenResponse(rows[0]),
        });
    } catch (err) {
        return next(err);
    }
}

async function login(req, res, next) {
    const identifier =
        req.body.identifier || req.body.username || req.body.email;
    const password = req.body.password;

    try {
        const user = await findUserByIdentifier(identifier);

        if (!user) {
            return apiError(res, 401, "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง", "auth");
        }

        const isMatch = await verifyPassword(password, user.password_hash);
        if (!isMatch) {
            return apiError(res, 401, "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง", "auth");
        }

        if (!BCRYPT_HASH_PATTERN.test(String(user.password_hash || ""))) {
            await upgradePlaintextPassword(user.id, password);
        }

        return res.status(200).json({
            success: true,
            data: tokenResponse(user),
        });
    } catch (err) {
        return next(err);
    }
}

async function forgotPassword(req, res, next) {
    const identifier = String(req.body?.identifier || "").trim();

    try {
        if (!identifier) {
            return apiError(
                res,
                400,
                "กรุณากรอก Username หรืออีเมลเพื่อขอรหัสยืนยัน",
                "validation"
            );
        }

        const user = await findUserByIdentifier(identifier);
        if (!user) {
            return apiError(
                res,
                404,
                "ไม่พบบัญชีผู้ใช้งานที่ตรงกับ Username หรืออีเมลที่ระบุ",
                "not_found"
            );
        }

        pruneExpiredOtps();
        for (const [storedKey, storedEntry] of otpStore.entries()) {
            if (String(storedEntry.userId) === String(user.id)) {
                otpStore.delete(storedKey);
            }
        }
        const key = otpKey(identifier);
        const code = createOtpCode();
        const entry = {
            code,
            userId: user.id,
            expiresAt: Date.now() + OTP_TTL_MS,
        };
        otpStore.set(key, entry);
        otpStore.set(`user:${user.id}`, entry);

        console.log(
            `[AUTH] OTP รีเซ็ตรหัสผ่านสำหรับ ${key}: ${code} (หมดอายุใน 10 นาที)`
        );

        let telegramSent = false;
        try {
            const connection = await telegramService.getTelegramConnection(user.id);
            if (connection.connected && connection.chat_id) {
                await telegramService.sendTextMessage(
                    connection.chat_id,
                    `รหัสยืนยันเพื่อรีเซ็ตรหัสผ่านบัญชี ${user.username} คือ ${code} (หมดอายุใน 10 นาที)`
                );
                telegramSent = true;
                console.log(`[AUTH] OTP ถูกส่งไปยัง Telegram ของผู้ใช้ ${user.username} แล้ว`);
            }
        } catch (err) {
            console.error(
                "[AUTH] ไม่สามารถส่ง OTP ผ่าน Telegram ได้:",
                err && err.message ? err.message : String(err)
            );
        }

        const data = {
            expires_in: Math.floor(OTP_TTL_MS / 1000),
            telegram_sent: telegramSent,
        };
        if (process.env.NODE_ENV !== "production") {
            data.dev_otp = code;
        }

        return res.status(200).json({
            success: true,
            data,
            message:
                "ส่งรหัสยืนยันเรียบร้อยแล้ว กรุณาตรวจสอบแชท Telegram หรือหน้าจอเซิร์ฟเวอร์",
        });
    } catch (err) {
        return next(err);
    }
}

async function resetPassword(req, res, next) {
    const identifier = String(req.body?.identifier || "").trim();
    const otp = String(req.body?.otp || "").trim();
    const newPassword =
        typeof req.body?.new_password === "string" ? req.body.new_password : "";

    try {
        if (!identifier || !otp || !newPassword) {
            return apiError(
                res,
                400,
                "กรุณากรอก Username หรืออีเมล รหัสยืนยัน และรหัสผ่านใหม่ให้ครบถ้วน",
                "validation"
            );
        }
        if (!/^\d{6}$/.test(otp)) {
            return apiError(res, 400, "รหัสยืนยันต้องเป็นตัวเลข 6 หลัก", "validation");
        }
        if (newPassword.length < 6) {
            return apiError(res, 400, "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร", "validation");
        }

        pruneExpiredOtps();
        const user = await findUserByIdentifier(identifier);
        const key = otpKey(identifier);
        const userKey = user ? `user:${user.id}` : "";
        const entry = otpStore.get(key) || (userKey ? otpStore.get(userKey) : null);

        if (!entry) {
            return apiError(
                res,
                400,
                "ไม่พบการขอรหัสยืนยัน กรุณากดขอรหัสยืนยัน OTP ก่อน",
                "validation"
            );
        }
        if (entry.expiresAt <= Date.now()) {
            otpStore.delete(key);
            if (userKey) {
                otpStore.delete(userKey);
            }
            return apiError(
                res,
                400,
                "รหัสยืนยันหมดอายุแล้ว กรุณาขอรหัสใหม่",
                "validation"
            );
        }
        if (entry.code !== otp) {
            return apiError(res, 400, "รหัสยืนยันไม่ถูกต้อง กรุณาลองอีกครั้ง", "validation");
        }

        if (!user) {
            otpStore.delete(key);
            return apiError(
                res,
                404,
                "ไม่พบบัญชีผู้ใช้งานที่ตรงกับ Username หรืออีเมลที่ระบุ",
                "not_found"
            );
        }

        const schema = await getUserSchema();
        const passwordHash = await bcrypt.hash(newPassword, saltRounds());
        await db.query(
            `UPDATE users SET ${schema.passwordColumn} = ? WHERE ${schema.idColumn} = ? LIMIT 1`,
            [passwordHash, user.id]
        );
        otpStore.delete(key);
        if (userKey) {
            otpStore.delete(userKey);
        }

        console.log(`[AUTH] เปลี่ยนรหัสผ่านของผู้ใช้ ${user.username} สำเร็จแล้ว`);

        return res.status(200).json({
            success: true,
            message: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่",
            data: null,
        });
    } catch (err) {
        return next(err);
    }
}

async function updateProfile(req, res, next) {
    const userId = req.user?.user_id;
    const name = String(req.body?.name || req.body?.full_name || "").trim();
    const email = req.body?.email ? String(req.body.email).trim().toLowerCase() : "";

    try {
        const schema = await getUserSchema();
        if (!name && !email) {
            return apiError(
                res,
                400,
                "กรุณากรอกข้อมูลที่ต้องการแก้ไขอย่างน้อยหนึ่งรายการ",
                "validation"
            );
        }
        if (email && !EMAIL_PATTERN.test(email)) {
            return apiError(res, 400, "รูปแบบอีเมลไม่ถูกต้อง", "validation");
        }

        if (email && schema.hasEmail) {
            const [existing] = await db.query(
                `SELECT ${schema.idColumn} AS id FROM users
                 WHERE LOWER(email) = LOWER(?) AND ${schema.idColumn} <> ? LIMIT 1`,
                [email, userId]
            );
            if (existing.length > 0) {
                return apiError(
                    res,
                    400,
                    "อีเมลนี้มีอยู่ในระบบแล้ว กรุณาใช้อีเมลอื่น",
                    "validation",
                    { field: "email" }
                );
            }
        }

        const assignments = [];
        const values = [];
        if (name) {
            assignments.push(`${schema.nameColumn} = ?`);
            values.push(name);
        }
        if (email && schema.hasEmail) {
            assignments.push("email = ?");
            values.push(email);
        }
        if (assignments.length > 0) {
            values.push(userId);
            await db.query(
                `UPDATE users SET ${assignments.join(", ")} WHERE ${schema.idColumn} = ? LIMIT 1`,
                values
            );
        }

        const [rows] = await db.query(
            `${publicUserSelect(schema)} FROM users WHERE ${schema.idColumn} = ? LIMIT 1`,
            [userId]
        );
        if (!rows[0]) {
            return apiError(res, 404, "ไม่พบข้อมูลผู้ใช้งาน", "not_found");
        }
        return res.status(200).json({
            success: true,
            data: getUserSafe(rows[0]),
        });
    } catch (err) {
        return next(err);
    }
}

async function changePassword(req, res, next) {
    const userId = req.user?.user_id;
    const currentPassword =
        typeof req.body?.current_password === "string" ? req.body.current_password : "";
    const newPassword =
        typeof req.body?.new_password === "string" ? req.body.new_password : "";

    try {
        if (!currentPassword || !newPassword) {
            return apiError(
                res,
                400,
                "กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่ให้ครบถ้วน",
                "validation"
            );
        }
        if (newPassword.length < 6) {
            return apiError(
                res,
                400,
                "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร",
                "validation"
            );
        }
        if (currentPassword === newPassword) {
            return apiError(
                res,
                400,
                "รหัสผ่านใหม่ต้องแตกต่างจากรหัสผ่านปัจจุบัน",
                "validation"
            );
        }

        const schema = await getUserSchema();
        const [rows] = await db.query(
            `${userSelect(schema)} FROM users WHERE ${schema.idColumn} = ? LIMIT 1`,
            [userId]
        );
        const user = rows[0];
        if (!user) {
            return apiError(res, 404, "ไม่พบข้อมูลผู้ใช้งาน", "not_found");
        }

        const isMatch = await verifyPassword(currentPassword, user.password_hash);
        if (!isMatch) {
            return apiError(res, 401, "รหัสผ่านปัจจุบันไม่ถูกต้อง", "auth");
        }

        const passwordHash = await bcrypt.hash(newPassword, saltRounds());
        await db.query(
            `UPDATE users SET ${schema.passwordColumn} = ? WHERE ${schema.idColumn} = ? LIMIT 1`,
            [passwordHash, userId]
        );

        return res.status(200).json({
            success: true,
            message: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว",
            data: null,
        });
    } catch (err) {
        return next(err);
    }
}

async function getMe(req, res, next) {
    try {
        const userId = req.user?.user_id;
        const schema = await getUserSchema();
        const [rows] = await db.query(
            `${publicUserSelect(schema)} FROM users WHERE ${schema.idColumn} = ? LIMIT 1`,
            [userId]
        );

        if (!rows || rows.length === 0) {
            return apiError(res, 404, "ไม่พบข้อมูลผู้ใช้งาน", "not_found");
        }

        return res.status(200).json({
            success: true,
            data: getUserSafe(rows[0]),
        });
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    registerUser,
    login,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    getMe,
};
