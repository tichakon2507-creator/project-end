const db = require("../config/db");
const { getUserSchema } = require("../config/userSchema");

async function getActiveEmergencies(req, res, next) {
    try {
        const userSchema = await getUserSchema();
        const [rows] = await db.query(`
            SELECT
                e.id,
                e.device_id,
                e.event_type,
                e.description,
                e.latitude,
                e.longitude,
                e.status,
                e.created_at,
                e.resolved_at,
                d.device_name,
                d.status AS device_status,
                u.username AS user_username,
                u.name AS user_name,
                u.role AS user_role
            FROM emergency_events AS e
            LEFT JOIN devices AS d ON d.device_id = e.device_id
            LEFT JOIN users AS u ON u.${userSchema.idColumn} = d.user_id
            WHERE e.status = 'active'
            ORDER BY e.created_at DESC
        `);

        return res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (err) {
        console.error("Get Active Emergencies Error:", err);
        return next(err);
    }
}

async function getEmergencyHistory(req, res, next) {
    try {
        const userSchema = await getUserSchema();
        const { device_id, limit, offset } = req.query;

        const params = [];
        const whereClauses = [];

        if (device_id !== undefined) {
            if (typeof device_id !== "string" || device_id.trim() === "") {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: "device_id query parameter must be a non-empty string.",
                        status: 400,
                        type: "validation",
                        data: { device_id },
                    },
                });
            }
            whereClauses.push("e.device_id = ?");
            params.push(device_id.trim());
        }

        if (limit !== undefined) {
            const limitInt = parseInt(limit, 10);
            if (isNaN(limitInt) || limitInt <= 0 || limitInt > 1000) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: "limit must be a positive integer <= 1000.",
                        status: 400,
                        type: "validation",
                        data: { limit },
                    },
                });
            }
            params.push(limitInt);
        }

        if (offset !== undefined) {
            const offsetInt = parseInt(offset, 10);
            if (isNaN(offsetInt) || offsetInt < 0) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: "offset must be a non-negative integer.",
                        status: 400,
                        type: "validation",
                        data: { offset },
                    },
                });
            }
            params.push(offsetInt);
        }

        const whereClause = whereClauses.length
            ? `WHERE ${whereClauses.join(" AND ")}`
            : "";

        const finalLimitStr = limit !== undefined ? "LIMIT ?" : limit !== undefined ? "LIMIT ?" : "";
        const finalOffsetStr = offset !== undefined ? "OFFSET ?" : offset !== undefined ? "OFFSET ?" : "";

        const sql = `
            SELECT
                e.id,
                e.device_id,
                e.event_type,
                e.description,
                e.latitude,
                e.longitude,
                e.status,
                e.created_at,
                e.resolved_at,
                d.device_name,
                d.status AS device_status,
                u.username AS user_username,
                u.name AS user_name,
                u.role AS user_role
            FROM emergency_events AS e
            LEFT JOIN devices AS d ON d.device_id = e.device_id
            LEFT JOIN users AS u ON u.${userSchema.idColumn} = d.user_id
            ${whereClause}
            ORDER BY e.created_at DESC
            ${finalLimitStr}
            ${finalOffsetStr}
        `;

        const [rows] = await db.query(sql, params);

        return res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (err) {
        console.error("Get Emergency History Error:", err);
        return next(err);
    }
}

async function createEmergencyEvent(req, res, next) {
    try {
        const {
            device_id,
            event_type,
            description,
            latitude,
            longitude,
            status,
        } = req.body;

        const [existing] = await db.query(
            "SELECT device_id FROM devices WHERE CAST(device_id AS CHAR) = ? OR device_code = ? LIMIT 1",
            [String(device_id), String(device_id)]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    message: "Device not found.",
                    status: 404,
                    type: "not_found",
                    data: { device_id },
                },
            });
        }

        const eventStatus =
            status === "active" ||
            status === "acknowledged" ||
            status === "resolved"
                ? status
                : "active";

        const resolvedAt =
            eventStatus === "resolved" ? new Date().toISOString() : null;

        const resolvedDeviceId = existing[0].device_id;
        const [result] = await db.query(
            `
            INSERT INTO emergency_events (
                device_id, event_type, description, latitude, longitude, status, resolved_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
            [
                resolvedDeviceId,
                event_type || "SOS",
                description || "",
                latitude,
                longitude,
                eventStatus,
                resolvedAt,
            ]
        );

        const insertId = result.insertId;

        const [rows] = await db.query(
            "SELECT * FROM emergency_events WHERE id = ? LIMIT 1",
            [insertId]
        );

        return res.status(201).json({
            success: true,
            data: rows[0] || { id: insertId, device_id: resolvedDeviceId },
        });
    } catch (err) {
        console.error("Create Emergency Event Error:", err);
        return next(err);
    }
}

async function updateEmergencyStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { status, resolved_at } = req.body;

        if (!["active", "acknowledged", "resolved"].includes(status)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: "status must be active, acknowledged, or resolved.",
                    status: 400,
                    type: "validation",
                    data: { status },
                },
            });
        }

        const finalResolvedAt =
            status === "resolved" ? new Date().toISOString() : resolved_at;

        const [rows] = await db.query(
            `
            UPDATE emergency_events
            SET status = ?, resolved_at = ?
            WHERE id = ?
            LIMIT 1
        `,
            [status, finalResolvedAt, id]
        );

        if (rows.changedRows === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    message: "Emergency event not found.",
                    status: 404,
                    type: "not_found",
                    data: { id },
                },
            });
        }

        const [updated] = await db.query(
            "SELECT * FROM emergency_events WHERE id = ? LIMIT 1",
            [id]
        );

        return res.status(200).json({
            success: true,
            data: updated[0] || { id, status },
        });
    } catch (err) {
        console.error("Update Emergency Status Error:", err);
        return next(err);
    }
}

module.exports = {
    getActiveEmergencies,
    getEmergencyHistory,
    createEmergencyEvent,
    updateEmergencyStatus,
};
