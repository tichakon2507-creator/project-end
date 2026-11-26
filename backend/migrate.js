const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const db = require("./config/db");

const PATIENT_COLUMNS = {
    patient_name: "VARCHAR(255) NULL",
    patient_age: "INT NULL",
    blood_type: "VARCHAR(10) NULL",
    medical_conditions: "TEXT NULL",
    drug_allergies: "TEXT NULL",
    emergency_contact_name: "VARCHAR(255) NULL",
    emergency_contact_phone: "VARCHAR(50) NULL",
};

const THRESHOLD_DEFAULTS = {
    hr_min: "45",
    hr_max: "120",
    temp_max: "38.5",
    spo2_min: "92",
};

const DEMO_DEVICE_CODE = "ESP32-HEALTH-01";

async function columnExists(table, column) {
    const [rows] = await db.query(
        "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
        [table, column]
    );
    return rows.length > 0;
}

async function tableExists(table) {
    const [rows] = await db.query(
        "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
        [table]
    );
    return rows.length > 0;
}

async function ensurePatientColumns() {
    for (const [column, definition] of Object.entries(PATIENT_COLUMNS)) {
        if (await columnExists("devices", column)) {
            console.log(`[migrate] devices.${column} already exists`);
            continue;
        }
        await db.query(`ALTER TABLE devices ADD COLUMN ${column} ${definition}`);
        console.log(`[migrate] devices.${column} added`);
    }
}

async function ensureCompatibilityTables() {
    if (!(await tableExists("emergency_events"))) {
        await db.query(`
            CREATE TABLE emergency_events (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                device_id INT NULL,
                event_type VARCHAR(50) NOT NULL DEFAULT 'SOS',
                description TEXT NULL,
                latitude DECIMAL(10,7) NULL,
                longitude DECIMAL(10,7) NULL,
                status ENUM('active','acknowledged','resolved') NOT NULL DEFAULT 'active',
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                resolved_at DATETIME NULL,
                PRIMARY KEY (id),
                KEY idx_emergency_events_device_id (device_id),
                KEY idx_emergency_events_status (status),
                KEY idx_emergency_events_created_at (created_at),
                CONSTRAINT fk_emergency_events_device_id FOREIGN KEY (device_id) REFERENCES devices (device_id) ON DELETE SET NULL ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log("[migrate] emergency_events created");
    } else {
        console.log("[migrate] emergency_events already exists");
    }

    if (!(await tableExists("location_records"))) {
        await db.query(`
            CREATE TABLE location_records (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                device_id INT NULL,
                latitude DECIMAL(10,7) NOT NULL,
                longitude DECIMAL(10,7) NOT NULL,
                recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                KEY idx_location_records_device_id (device_id),
                KEY idx_location_records_recorded_at (recorded_at),
                CONSTRAINT fk_location_records_device_id FOREIGN KEY (device_id) REFERENCES devices (device_id) ON DELETE SET NULL ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log("[migrate] location_records created");
    } else {
        console.log("[migrate] location_records already exists");
    }
}

async function alignNotificationLogEmergencyKey() {
    const [foreignKeys] = await db.query(
        `SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME
         FROM information_schema.KEY_COLUMN_USAGE
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notification_logs'
           AND COLUMN_NAME = 'emergency_id' AND REFERENCED_TABLE_NAME IS NOT NULL`
    );
    const alreadyAligned = foreignKeys.some(
        (row) => row.REFERENCED_TABLE_NAME === "emergency_events"
    );
    if (alreadyAligned) {
        console.log("[migrate] notification_logs emergency key already aligned");
        return;
    }
    for (const row of foreignKeys) {
        await db.query(`ALTER TABLE notification_logs DROP FOREIGN KEY ${row.CONSTRAINT_NAME}`);
    }
    await db.query("ALTER TABLE notification_logs MODIFY emergency_id BIGINT UNSIGNED NULL");
    await db.query(
        `ALTER TABLE notification_logs
         ADD CONSTRAINT fk_notification_emergency_events
         FOREIGN KEY (emergency_id) REFERENCES emergency_events (id)
         ON DELETE SET NULL ON UPDATE CASCADE`
    );
    console.log("[migrate] notification_logs emergency key aligned to emergency_events");
}

async function ensureTelegramLinkColumns() {
    const columns = {
        user_id: "BIGINT UNSIGNED NULL",
        telegram_username: "VARCHAR(255) NULL",
        connected_at: "DATETIME NULL",
    };
    for (const [column, definition] of Object.entries(columns)) {
        if (await columnExists("notification_settings", column)) {
            console.log(`[migrate] notification_settings.${column} already exists`);
            continue;
        }
        await db.query(`ALTER TABLE notification_settings ADD COLUMN ${column} ${definition}`);
        console.log(`[migrate] notification_settings.${column} added`);
    }
    const [indexes] = await db.query(
        "SHOW INDEX FROM notification_settings WHERE Key_name = ?",
        ["idx_notification_settings_user_id"]
    );
    if (indexes.length === 0) {
        await db.query(
            "ALTER TABLE notification_settings ADD KEY idx_notification_settings_user_id (user_id)"
        );
        console.log("[migrate] notification_settings user_id index added");
    }
}

async function ensureThresholds() {
    for (const [key, value] of Object.entries(THRESHOLD_DEFAULTS)) {
        await db.query(
            "INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES (?, ?)",
            [key, value]
        );
        console.log(`[migrate] system_settings.${key} ready`);
    }
}

async function ensureDemoDevice() {
    const [users] = await db.query("SELECT user_id FROM users ORDER BY user_id ASC LIMIT 1");
    const userId = users.length > 0 ? users[0].user_id : null;

    await db.query(
        `INSERT IGNORE INTO devices
            (device_code, device_name, device_type, user_id, firmware_version, battery_level, status, last_seen)
         VALUES (?, ?, ?, ?, '1.0.0', 100.00, 'online', NOW())`,
        [DEMO_DEVICE_CODE, "ESP32 Health Monitor 01", "Smart Health Device", userId]
    );

    await db.query(
        `UPDATE devices SET
            patient_name = ?,
            patient_age = ?,
            blood_type = ?,
            medical_conditions = ?,
            drug_allergies = ?,
            emergency_contact_name = ?,
            emergency_contact_phone = ?
         WHERE device_code = ?`,
        [
            "สมชาย ใจดี",
            45,
            "O+",
            "ความดันโลหิตสูง, เบาหวาน",
            "แพ้ยา Penicillin",
            "นางสาวสมหญิง ใจดี",
            "081-234-5678",
            DEMO_DEVICE_CODE,
        ]
    );
    console.log(`[migrate] ${DEMO_DEVICE_CODE} patient profile updated`);
}

async function ensureMQTTSettings() {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM mqtt_settings");
    const total = Number(rows[0]?.total || 0);
    if (total > 0) {
        console.log("[migrate] mqtt_settings already has a row");
        return;
    }
    await db.query(
        `INSERT INTO mqtt_settings (host, port, client_id, username, password, auto_connect, auto_reconnect)
         VALUES (?, ?, ?, '', '', 1, 1)`,
        ["broker.emqx.io", 1883, `smart-health-backend-${process.pid}`]
    );
    console.log("[migrate] mqtt_settings cloud preset seeded");
}

async function main() {
    console.log("[migrate] Starting smart_health migration");
    await ensurePatientColumns();
    await ensureCompatibilityTables();
    await alignNotificationLogEmergencyKey();
    await ensureTelegramLinkColumns();
    await ensureThresholds();
    await ensureDemoDevice();
    await ensureMQTTSettings();
    console.log("[migrate] Completed successfully");
}

main()
    .then(async () => {
        await db.end();
        process.exit(0);
    })
    .catch(async (err) => {
        console.error("[migrate] Failed:", err && err.message ? err.message : err);
        try {
            await db.end();
        } catch {
            // ignore shutdown errors
        }
        process.exit(1);
    });
