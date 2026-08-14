const db = require("../config/db");

const getLatestHealth = async (req, res) => {

    try {

        const [rows] = await db.query(`
            SELECT
                record_id,
                device_id,
                user_id,
                heart_rate,
                spo2,
                temperature,
                battery_level,
                recorded_at
            FROM health_records
            ORDER BY recorded_at DESC
            LIMIT 1
        `);

        if (rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "No health records found",
            });

        }

        res.json({
            success: true,
            data: rows[0],
        });

    } catch (error) {

        console.error("Health API Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch health data",
            error: error.message,
        });

    }

};

module.exports = {
    getLatestHealth,
};