const db = require("../config/db");

const runQuery = async (sql, params = []) => {
    return db.query(sql, params);
};

async function getLatestHealth(req, res, next) {
    try {
        const { device_id } = req.query;

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

            const [rows] = await runQuery(
                `
                SELECT
                    hr.record_id,
                    hr.device_id,
                    hr.user_id,
                    hr.heart_rate,
                    hr.temperature,
                    hr.spo2,
                    hr.battery_level,
                    hr.recorded_at,
                    d.device_name,
                    d.status AS device_status
                FROM health_records AS hr
                LEFT JOIN devices AS d ON d.device_id = hr.device_id
                WHERE hr.device_id = ?
                ORDER BY hr.recorded_at DESC
                LIMIT 1
            `,
                [device_id.trim()]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: "No health records found for device.",
                        status: 404,
                        type: "not_found",
                        data: { device_id: device_id.trim() },
                    },
                });
            }

            return res.status(200).json({
                success: true,
                data: rows[0],
            });
        }

        const [rows] = await runQuery(`
            SELECT
                hr.record_id,
                hr.device_id,
                hr.user_id,
                hr.heart_rate,
                hr.temperature,
                hr.spo2,
                hr.battery_level,
                hr.recorded_at,
                d.device_name,
                d.status AS device_status
            FROM health_records AS hr
            LEFT JOIN devices AS d ON d.device_id = hr.device_id
            ORDER BY hr.recorded_at DESC
            LIMIT 1
        `);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    message: "No health records found",
                    status: 404,
                    type: "not_found",
                    data: null,
                },
            });
        }

        return res.status(200).json({
            success: true,
            data: rows[0],
        });
    } catch (err) {
        console.error("Health API Error:", err);
        return next(err);
    }
}

function normalizeDateInput(value, isEnd) {
    const raw = String(value || "").trim();
    if (raw === "") return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        return isEnd ? `${raw} 23:59:59` : `${raw} 00:00:00`;
    }
    if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/.test(raw)) {
        return raw.replace("T", " ");
    }
    return null;
}

async function getHealthHistory(req, res, next) {
    try {
        const { device_id, limit, offset, start_date, end_date } = req.query;

        const params = [];
        const whereClauses = [];

        if (start_date !== undefined) {
            const normalized = normalizeDateInput(start_date, false);
            if (normalized === null) {
                return res.status(400).json({
                    success: false,
                    error: { message: "start_date must be YYYY-MM-DD or YYYY-MM-DD HH:mm.", status: 400, type: "validation" },
                });
            }
            whereClauses.push("hr.recorded_at >= ?");
            params.push(normalized);
        }
        if (end_date !== undefined) {
            const normalized = normalizeDateInput(end_date, true);
            if (normalized === null) {
                return res.status(400).json({
                    success: false,
                    error: { message: "end_date must be YYYY-MM-DD or YYYY-MM-DD HH:mm.", status: 400, type: "validation" },
                });
            }
            whereClauses.push("hr.recorded_at <= ?");
            params.push(normalized);
        }

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
            whereClauses.push("hr.device_id = ?");
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

        const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
        const finalLimitStr =
            limit !== undefined ? "LIMIT ?" : limit !== undefined ? "LIMIT ?" : "";
        const finalOffsetStr =
            offset !== undefined ? "OFFSET ?" : offset !== undefined ? "OFFSET ?" : "";

        const sql = `
            SELECT
                hr.record_id,
                hr.device_id,
                hr.user_id,
                hr.heart_rate,
                hr.temperature,
                hr.spo2,
                hr.battery_level,
                hr.recorded_at,
                d.device_name,
                d.status AS device_status
            FROM health_records AS hr
            LEFT JOIN devices AS d ON d.device_id = hr.device_id
            ${whereClause}
            ORDER BY hr.recorded_at DESC
            ${finalLimitStr}
            ${finalOffsetStr}
        `;

        const [rows] = await runQuery(sql, params);

        return res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (err) {
        console.error("Health History Error:", err);
        return next(err);
    }
}

async function createHealthRecord(req, res, next) {
    try {
        const {
            record_id,
            device_id,
            user_id,
            heart_rate,
            temperature,
            spo2,
            battery_level,
        } = req.body;

        if (record_id !== undefined && !Number.isInteger(record_id)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: "record_id must be an integer if provided.",
                    status: 400,
                    type: "validation",
                    data: { record_id },
                },
            });
        }

        const [existing] = await runQuery(
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
        const [result] = await runQuery(
            `
            INSERT INTO health_records (
                record_id, device_id, user_id, heart_rate, temperature, spo2, battery_level, recorded_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `,
            [
                record_id,
                resolvedDeviceId,
                user_id,
                heart_rate,
                temperature,
                spo2,
                battery_level,
            ]
        );

        const insertId = result.insertId || record_id;

        const [rows] = await runQuery(
            "SELECT * FROM health_records WHERE record_id = ? LIMIT 1",
            [insertId]
        );

        return res.status(201).json({
            success: true,
            data: rows[0] || { record_id: insertId, device_id },
        });
    } catch (err) {
        console.error("Create Health Record Error:", err);
        return next(err);
    }
}

module.exports = {
    getLatestHealth,
    getHealthHistory,
    createHealthRecord,
};
