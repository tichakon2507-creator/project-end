const db = require("../config/db");

const table = "devices";

const PATIENT_FIELDS = [
    "patient_name",
    "patient_age",
    "blood_type",
    "medical_conditions",
    "drug_allergies",
    "emergency_contact_name",
    "emergency_contact_phone",
];

const DEVICE_COLUMNS = [
    "device_id",
    "device_code",
    "device_name",
    "user_id",
    "battery_level",
    "status",
    "last_seen",
    ...PATIENT_FIELDS,
].join(", ");

async function create(data) {
    const [result] = await db.query(
        `INSERT INTO ${table} (device_id, device_name, user_id, battery_level, status, last_seen) VALUES (?, ?, ?, ?, ?, ?)`,
        [data.device_id, data.device_name, data.user_id, data.battery_level || 100, data.status || "online", data.last_seen || new Date().toISOString()]
    );
    return getById(result.insertId);
}

async function findOne(where, params = []) {
    const [rows] = await db.query(`SELECT ${DEVICE_COLUMNS} FROM ${table} WHERE ${where} LIMIT 1`, params);
    return rows[0] || null;
}

async function getById(id) {
    if (id === null || id === undefined || String(id).trim() === "") {
        return null;
    }
    const identifier = String(id).trim();
    const byCode = await findOne("device_code = ?", [identifier]);
    if (byCode) {
        return byCode;
    }
    return findOne("device_id = ?", [identifier]);
}

async function getByDeviceId(deviceId) {
    return getById(deviceId);
}

async function updateStatus(deviceId, status) {
    await db.query(`UPDATE ${table} SET status = ?, last_seen = ? WHERE device_id = ? LIMIT 1`, [status, new Date().toISOString(), deviceId]);
    return getByDeviceId(deviceId);
}

async function updateBattery(deviceId, batteryLevel) {
    await db.query(`UPDATE ${table} SET battery_level = ?, last_seen = ? WHERE device_id = ? LIMIT 1`, [batteryLevel, new Date().toISOString(), deviceId]);
    return getByDeviceId(deviceId);
}

async function updatePatientProfile(deviceId, data) {
    const entries = PATIENT_FIELDS.filter((field) => data[field] !== undefined);
    if (entries.length === 0) {
        return getById(deviceId);
    }
    const assignments = entries.map((field) => `${field} = ?`).join(", ");
    const values = entries.map((field) => data[field]);
    const device = await getById(deviceId);
    if (!device) {
        return null;
    }
    await db.query(
        `UPDATE ${table} SET ${assignments} WHERE device_id = ? LIMIT 1`,
        [...values, device.device_id]
    );
    return getById(device.device_id);
}

async function getPatientProfile(deviceId) {
    const device = await getById(deviceId);
    if (!device) {
        return null;
    }
    const profile = {
        device_id: device.device_id,
        device_code: device.device_code,
        device_name: device.device_name,
    };
    PATIENT_FIELDS.forEach((field) => {
        profile[field] = device[field] === undefined ? null : device[field];
    });
    return profile;
}

module.exports = {
    PATIENT_FIELDS,
    DEVICE_COLUMNS,
    create,
    findOne,
    getById,
    getByDeviceId,
    updateStatus,
    updateBattery,
    updatePatientProfile,
    getPatientProfile,
};
