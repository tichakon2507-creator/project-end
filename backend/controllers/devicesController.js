const db = require("../config/db");
const devicesModel = require("../models/devices");
const { getUserSchema } = require("../config/userSchema");

const PATIENT_COLUMNS = [
    "d.patient_name",
    "d.patient_age",
    "d.blood_type",
    "d.medical_conditions",
    "d.drug_allergies",
    "d.emergency_contact_name",
    "d.emergency_contact_phone",
].join(",\n                ");

function badRequest(res, message, data = null) {
    return res.status(400).json({
        success: false,
        error: { message, status: 400, type: "validation", data },
    });
}

function notFound(res, deviceId) {
    return res.status(404).json({
        success: false,
        error: {
            message: "Device not found.",
            status: 404,
            type: "not_found",
            data: { device_id: deviceId },
        },
    });
}

async function getDevices(req, res, next) {
    try {
        const schema = await getUserSchema();
        const [rows] = await db.query(`
            SELECT
                d.device_id,
                d.device_code,
                d.device_name,
                d.user_id,
                d.battery_level,
                d.status,
                d.last_seen,
                ${PATIENT_COLUMNS},
                u.username AS user_username,
                u.name AS user_name
            FROM devices AS d
            LEFT JOIN users AS u ON u.${schema.idColumn} = d.user_id
            ORDER BY d.last_seen DESC
        `);

        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        console.error("Get Devices Error:", err);
        return next(err);
    }
}

async function getDeviceById(req, res, next) {
    try {
        const { deviceId } = req.params;
        const schema = await getUserSchema();
        const [rows] = await db.query(`
            SELECT
                d.device_id,
                d.device_code,
                d.device_name,
                d.user_id,
                d.battery_level,
                d.status,
                d.last_seen,
                ${PATIENT_COLUMNS},
                u.username AS user_username,
                u.name AS user_name
            FROM devices AS d
            LEFT JOIN users AS u ON u.${schema.idColumn} = d.user_id
            WHERE d.device_code = ? OR CAST(d.device_id AS CHAR) = ?
            LIMIT 1
        `, [deviceId, deviceId]);

        if (rows.length === 0) {
            return notFound(res, deviceId);
        }
        return res.status(200).json({ success: true, data: rows[0] });
    } catch (err) {
        console.error("Get Device By ID Error:", err);
        return next(err);
    }
}

async function getDeviceStatus(req, res, next) {
    try {
        const { deviceId } = req.params;
        const [rows] = await db.query(`
            SELECT
                d.device_id,
                d.device_code,
                d.status,
                d.battery_level,
                d.last_seen,
                d.device_name
            FROM devices AS d
            WHERE d.device_code = ? OR CAST(d.device_id AS CHAR) = ?
            LIMIT 1
        `, [deviceId, deviceId]);

        if (rows.length === 0) {
            return notFound(res, deviceId);
        }
        const device = rows[0];
        return res.status(200).json({
            success: true,
            data: {
                device_id: device.device_id,
                device_code: device.device_code,
                device_name: device.device_name,
                status: device.status,
                battery_level: device.battery_level,
                last_seen: device.last_seen,
            },
        });
    } catch (err) {
        console.error("Get Device Status Error:", err);
        return next(err);
    }
}

async function getDeviceProfile(req, res, next) {
    try {
        const { deviceId } = req.params;
        if (typeof deviceId !== "string" || deviceId.trim() === "") {
            return badRequest(res, "device_id must be a non-empty string.");
        }
        const profile = await devicesModel.getPatientProfile(deviceId.trim());
        if (!profile) {
            return notFound(res, deviceId);
        }
        return res.status(200).json({ success: true, data: profile });
    } catch (err) {
        console.error("Get Device Profile Error:", err);
        return next(err);
    }
}

function sanitizeText(value, maxLength) {
    if (value === null || value === undefined) {
        return "";
    }
    if (typeof value !== "string") {
        return null;
    }
    const trimmed = value.trim();
    return trimmed.length <= maxLength ? trimmed : null;
}

function sanitizeAge(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    }
    const age = Number(value);
    if (!Number.isInteger(age) || age < 0 || age > 150) {
        return null;
    }
    return age;
}

async function updateDeviceProfile(req, res, next) {
    try {
        const { deviceId } = req.params;
        const body = req.body || {};
        const allowed = [
            "patient_name",
            "patient_age",
            "blood_type",
            "medical_conditions",
            "drug_allergies",
            "emergency_contact_name",
            "emergency_contact_phone",
        ];
        const hasField = allowed.some((field) => body[field] !== undefined);
        if (!hasField) {
            return badRequest(res, "At least one patient profile field is required.");
        }

        const data = {};
        if (body.patient_name !== undefined) {
            data.patient_name = sanitizeText(body.patient_name, 255);
            if (data.patient_name === null) return badRequest(res, "patient_name is invalid.", { field: "patient_name" });
        }
        if (body.patient_age !== undefined) {
            data.patient_age = sanitizeAge(body.patient_age);
            if (data.patient_age === null && body.patient_age !== "" && body.patient_age !== null) {
                return badRequest(res, "patient_age must be between 0 and 150.", { field: "patient_age" });
            }
        }
        const textFields = {
            blood_type: 10,
            medical_conditions: 1000,
            drug_allergies: 1000,
            emergency_contact_name: 255,
            emergency_contact_phone: 50,
        };
        for (const [field, maxLength] of Object.entries(textFields)) {
            if (body[field] !== undefined) {
                data[field] = sanitizeText(body[field], maxLength);
                if (data[field] === null) {
                    return badRequest(res, `${field} is invalid.`, { field });
                }
            }
        }

        const profile = await devicesModel.updatePatientProfile(deviceId, data);
        if (!profile) {
            return notFound(res, deviceId);
        }
        return res.status(200).json({ success: true, data: profile });
    } catch (err) {
        console.error("Update Device Profile Error:", err);
        return next(err);
    }
}

module.exports = {
    getDevices,
    getDeviceById,
    getDeviceStatus,
    getDeviceProfile,
    updateDeviceProfile,
};
