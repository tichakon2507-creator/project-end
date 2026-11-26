const db = require("../config/db");
const { getUserSchema } = require("../config/userSchema");

async function getDashboardOverview(req, res, next) {
    try {
        const userSchema = await getUserSchema();
        const [devices] = await db.query(`
            SELECT
                COUNT(*) AS total_devices
            FROM devices
        `);

        const totalDevices = Number(devices[0].total_devices || 0);

        const [onlineDevices] = await db.query(`
            SELECT
                COUNT(*) AS online_count
            FROM devices
            WHERE status = 'online'
        `);

        const onlineCount = Number(onlineDevices[0].online_count || 0);
        const offlineCount = totalDevices - onlineCount;

        const [health] = await db.query(`
            SELECT
                hr.heart_rate,
                hr.temperature,
                hr.spo2,
                hr.battery_level,
                hr.recorded_at,
                d.device_id,
                d.device_name,
                d.status AS device_status,
                d.battery_level AS device_battery_level,
                d.last_seen AS device_last_seen
            FROM health_records AS hr
            JOIN devices AS d ON d.device_id = hr.device_id
            ORDER BY hr.recorded_at DESC
            LIMIT 1
        `);

        const latestHealth = health.length > 0 ? health[0] : null;

        const [emergency] = await db.query(`
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
                u.name AS user_name,
                u.username AS user_username,
                u.role AS user_role
            FROM emergency_events AS e
            LEFT JOIN devices AS d ON d.device_id = e.device_id
            LEFT JOIN users AS u ON u.${userSchema.idColumn} = d.user_id
            WHERE e.status = 'active'
            ORDER BY e.created_at DESC
            LIMIT 5
        `);

        const activeEmergencies =
            emergency.length > 0 ? emergency : [];

        const [latestLocation] = await db.query(`
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
            LIMIT 1
        `);

        return res.status(200).json({
            success: true,
            data: {
                devices: {
                    total: totalDevices,
                    online: onlineCount,
                    offline: offlineCount,
                },
                latest_health: latestHealth,
                emergency: {
                    active: activeEmergencies.length,
                    events: activeEmergencies,
                },
                latest_location: latestLocation.length > 0 ? latestLocation[0] : null,
            },
        });
    } catch (err) {
        console.error("Dashboard Error:", err);
        return next(err);
    }
}

module.exports = {
    getDashboardOverview,
};
