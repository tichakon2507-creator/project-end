const db = require("../config/db");

async function getLatestLocations(req, res, next) {
    try {
        const [rows] = await db.query(`
            SELECT
                l.device_id,
                l.latitude,
                l.longitude,
                l.recorded_at,
                d.device_name,
                d.status AS device_status
            FROM location_records AS l
            JOIN devices AS d ON d.device_id = l.device_id
            ORDER BY l.recorded_at DESC
        `);

        return res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (err) {
        console.error("Get Latest Locations Error:", err);
        return next(err);
    }
}

async function getLocationHistory(req, res, next) {
    try {
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
            whereClauses.push("l.device_id = ?");
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

        const sql = `
            SELECT
                l.id,
                l.device_id,
                l.latitude,
                l.longitude,
                l.recorded_at,
                d.device_name,
                d.status AS device_status
            FROM location_records AS l
            JOIN devices AS d ON d.device_id = l.device_id
            ${whereClause}
            ORDER BY l.recorded_at DESC
        `;

        const [rows] = await db.query(sql, params);

        return res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (err) {
        console.error("Get Location History Error:", err);
        return next(err);
    }
}

async function createLocationRecord(req, res, next) {
    try {
        const {
            device_id,
            latitude,
            longitude,
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

        const resolvedDeviceId = existing[0].device_id;
        const [result] = await db.query(
            `
            INSERT INTO location_records (
                device_id, latitude, longitude, recorded_at
            ) VALUES (?, ?, ?, NOW())
        `,
            [resolvedDeviceId, latitude, longitude]
        );

        const insertId = result.insertId;

        const [rows] = await db.query(
            "SELECT * FROM location_records WHERE id = ? LIMIT 1",
            [insertId]
        );

        return res.status(201).json({
            success: true,
            data: rows[0] || { id: insertId, device_id: resolvedDeviceId },
        });
    } catch (err) {
        console.error("Create Location Record Error:", err);
        return next(err);
    }
}

module.exports = {
    getLatestLocations,
    getLocationHistory,
    createLocationRecord,
};
