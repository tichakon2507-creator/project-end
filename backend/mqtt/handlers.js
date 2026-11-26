const db = require("../config/db");
const telegramService = require("../services/telegramService");
const { getThresholds } = require("../config/thresholds");

const DEVICE_COLUMNS =
    "device_id, device_code, device_name, user_id, battery_level, status, last_seen, " +
    "patient_name, patient_age, blood_type, medical_conditions, drug_allergies, " +
    "emergency_contact_name, emergency_contact_phone";
const EMERGENCY_SELECT = `
    SELECT id, device_id, event_type, description, latitude, longitude,
           status, created_at, resolved_at
    FROM emergency_events WHERE id = ? LIMIT 1
`;

async function findDevice(deviceId) {
    const id = String(deviceId || "").trim();
    if (id === "") {
        return null;
    }
    const [rows] = await db.query(`SELECT ${DEVICE_COLUMNS} FROM devices WHERE device_id = ? LIMIT 1`, [id]);
    if (rows[0]) {
        return rows[0];
    }
    try {
        const [legacyRows] = await db.query(`SELECT ${DEVICE_COLUMNS} FROM devices WHERE device_code = ? LIMIT 1`, [id]);
        return legacyRows[0] || null;
    } catch {
        return null;
    }
}

async function getUserById(userId) {
    const queries = [
        "SELECT user_id, name, username, email FROM users WHERE user_id = ? LIMIT 1",
        "SELECT id AS user_id, name, username, email FROM users WHERE id = ? LIMIT 1",
    ];
    for (const sql of queries) {
        try {
            const [rows] = await db.query(sql, [userId]);
            if (rows[0]) {
                return rows[0];
            }
        } catch (err) {
            console.error("[MQTT] Failed to read user:", err && err.message ? err.message : err);
        }
    }
    return null;
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
            console.error("[MQTT] Failed to read latest location:", err && err.message ? err.message : err);
        }
    }
    return null;
}

async function findActiveEmergency(deviceId, eventType) {
    try {
        const [rows] = await db.query(
            "SELECT id, event_type FROM emergency_events WHERE device_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 20",
            [deviceId]
        );
        return rows.find((row) => row.event_type === eventType) || null;
    } catch (err) {
        console.error("[MQTT] Failed to check active emergency:", err && err.message ? err.message : err);
        return null;
    }
}

async function enrichEmergency(row) {
    if (!row) {
        return row;
    }
    let deviceName = "";
    let userName = "";
    try {
        const [devices] = await db.query("SELECT device_name, user_id FROM devices WHERE device_id = ? LIMIT 1", [row.device_id]);
        const device = devices[0] || null;
        if (device) {
            deviceName = device.device_name || "";
            if (device.user_id !== null && device.user_id !== undefined) {
                const user = await getUserById(device.user_id);
                if (user) {
                    userName = user.name || "";
                }
            }
        }
    } catch (err) {
        console.error("[MQTT] Failed to enrich emergency:", err && err.message ? err.message : err);
    }
    return { ...row, device_name: deviceName, user_name: userName };
}

async function createEmergency(deviceId, userId, eventType, description, latitude, longitude) {
    const [result] = await db.query(
        `INSERT INTO emergency_events (device_id, event_type, description, latitude, longitude, status, created_at)
         VALUES (?, ?, ?, ?, ?, 'active', NOW())`,
        [deviceId, eventType, description || null, latitude, longitude]
    );
    const [rows] = await db.query(EMERGENCY_SELECT, [result.insertId]);
    const row = rows[0] || { id: result.insertId, device_id: deviceId, event_type: eventType, description, latitude, longitude, status: "active" };
    return enrichEmergency(row);
}

async function notifyEmergency(io, device, emergency, payload) {
    const notifications = [];
    if (device.user_id !== null && device.user_id !== undefined) {
        const user = await getUserById(device.user_id);
        const message = emergency.description || telegramService.EVENT_MESSAGES[telegramService.normalizeEventType(emergency.event_type)] || "Emergency";
        try {
            const [inserted] = await db.query(
                `INSERT INTO notification_logs (user_id, emergency_id, channel, recipient, message, status) VALUES (?, ?, ?, ?, ?, 'pending')`,
                [device.user_id, emergency.id, "email", user ? user.email : null, message]
            );
            notifications.push({
                id: inserted.insertId,
                user_id: device.user_id,
                channel: "email",
                recipient: user ? user.email : null,
                message,
                status: "pending",
            });
        } catch (err) {
            console.error("[MQTT] Failed to write notification_logs:", err && err.message ? err.message : err);
        }
    }

    io.emit("emergency:alert", {
        emergency,
        notifications,
        device_id: device.device_id,
        health: payload.health || null,
        location: payload.location || null,
    });

    telegramService.sendEmergencyAlert({ device, emergency, payload }).catch((err) => {
        console.error("[MQTT] Telegram emergency alert failed:", err && err.message ? err.message : err);
    });
    return notifications;
}

async function handleVitals(io, payload) {
    const device = await findDevice(payload.device_id);
    if (!device) {
        throw new Error(`Device not found: ${payload.device_id}`);
    }

    const [result] = await db.query(
        `INSERT INTO health_records (device_id, user_id, heart_rate, temperature, spo2, battery_level, recorded_at) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [device.device_id, device.user_id, payload.heart_rate, payload.temperature, payload.spo2, payload.battery_level]
    );

    const batteryLevel = payload.battery_level !== null && payload.battery_level !== undefined ? payload.battery_level : null;
    if (batteryLevel !== null) {
        await db.query("UPDATE devices SET battery_level = ?, last_seen = NOW() WHERE device_id = ? LIMIT 1", [batteryLevel, device.device_id]);
    } else {
        await db.query("UPDATE devices SET last_seen = NOW() WHERE device_id = ? LIMIT 1", [device.device_id]);
    }

    const [rows] = await db.query(
        `SELECT record_id, device_id, user_id, heart_rate, temperature, spo2, battery_level, recorded_at FROM health_records WHERE record_id = ? LIMIT 1`,
        [result.insertId]
    );
    const row = rows[0] || null;

    io.emit("health:update", row || { device_id: device.device_id });

    const vitals = row || payload;
    const thresholds = await getThresholds();
    const types = telegramService.classifyHealthRecord(vitals, thresholds);
    if (types.length > 0) {
        const eventType = types[0];
        const existing = await findActiveEmergency(device.device_id, eventType);
        if (!existing) {
            const location = await getLatestLocation(device.device_id);
            const description = types
                .map((type) => telegramService.getEventMessage(type, thresholds))
                .join(" | ");
            const emergency = await createEmergency(
                device.device_id,
                device.user_id,
                eventType,
                description,
                location ? location.latitude : null,
                location ? location.longitude : null
            );
            await notifyEmergency(io, device, emergency, {
                ...payload,
                heart_rate: vitals.heart_rate,
                temperature: vitals.temperature,
                spo2: vitals.spo2,
                health: row,
                location,
            });
        }
    }
    return row;
}

async function handleLocation(io, payload) {
    const device = await findDevice(payload.device_id);
    if (!device) {
        throw new Error(`Device not found: ${payload.device_id}`);
    }

    const [result] = await db.query(
        `INSERT INTO location_records (device_id, latitude, longitude, recorded_at) VALUES (?, ?, ?, NOW())`,
        [device.device_id, payload.latitude, payload.longitude]
    );

    const [rows] = await db.query(
        `SELECT id, device_id, latitude, longitude, recorded_at FROM location_records WHERE id = ? LIMIT 1`,
        [result.insertId]
    );
    const row = rows[0] || null;

    io.emit("location:update", row || { device_id: device.device_id, latitude: payload.latitude, longitude: payload.longitude });
    return row;
}

async function handleEmergency(io, payload) {
    const device = await findDevice(payload.device_id);
    if (!device) {
        throw new Error(`Device not found: ${payload.device_id}`);
    }

    const eventType = telegramService.normalizeEventType(payload.event_type);
    let description = telegramService.describeEvent(eventType, payload.description);

    let latitude = payload.latitude !== undefined ? payload.latitude : null;
    let longitude = payload.longitude !== undefined ? payload.longitude : null;
    let location = null;
    if (latitude === null || longitude === null) {
        location = await getLatestLocation(device.device_id);
        if (location) {
            if (latitude === null) {
                latitude = location.latitude;
            }
            if (longitude === null) {
                longitude = location.longitude;
            }
        }
    }
    if (latitude === null || longitude === null) {
        description = `${description} | ตำแหน่งยังไม่มีข้อมูลจากอุปกรณ์`;
        latitude = 0;
        longitude = 0;
    }

    const emergency = await createEmergency(
        device.device_id,
        device.user_id,
        eventType,
        description,
        latitude,
        longitude
    );

    await notifyEmergency(io, device, emergency, { ...payload, location });
    return emergency;
}

async function handleStatus(io, payload) {
    const device = await findDevice(payload.device_id);
    if (!device) {
        throw new Error(`Device not found: ${payload.device_id}`);
    }

    const status = payload.status || "offline";
    await db.query("UPDATE devices SET status = ?, last_seen = NOW() WHERE device_id = ? LIMIT 1", [status, device.device_id]);

    const [rows] = await db.query(`SELECT ${DEVICE_COLUMNS} FROM devices WHERE device_id = ? LIMIT 1`, [device.device_id]);
    const row = rows[0] || { device_id: device.device_id, status };

    io.emit("device:status", row);
    return row;
}

const HANDLERS = {
    vitals: handleVitals,
    location: handleLocation,
    emergency: handleEmergency,
    status: handleStatus,
};

function getHandler(type) {
    return HANDLERS[type] || null;
}

module.exports = {
    findDevice,
    getUserById,
    getLatestLocation,
    findActiveEmergency,
    createEmergency,
    handleVitals,
    handleLocation,
    handleEmergency,
    handleStatus,
    getHandler,
};
