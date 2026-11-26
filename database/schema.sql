-- =============================================
-- SMART HEALTH & EMERGENCY IoT DATABASE SCHEMA
-- =============================================
-- Project: Smart Health & Emergency IoT Device
-- Target DB: smart_health
-- Generated for: MySQL / MariaDB

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

DROP DATABASE IF EXISTS smart_health;
CREATE DATABASE IF NOT EXISTS smart_health DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_health;

-- =============================================
-- 1. TABLE: users
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(64) NOT NULL,
    email VARCHAR(255) NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user', 'caregiver') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY idx_users_username_unique (username),
    UNIQUE KEY idx_users_email_unique (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 2. TABLE: devices
-- =============================================
CREATE TABLE IF NOT EXISTS devices (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    device_id VARCHAR(64) NOT NULL,
    device_name VARCHAR(255) NOT NULL DEFAULT '',
    user_id BIGINT UNSIGNED NOT NULL,
    battery_level DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    status VARCHAR(20) NOT NULL DEFAULT 'online',
    last_seen TIMESTAMP NULL,
    patient_name VARCHAR(255) NULL,
    patient_age INT NULL,
    blood_type VARCHAR(10) NULL,
    medical_conditions TEXT NULL,
    drug_allergies TEXT NULL,
    emergency_contact_name VARCHAR(255) NULL,
    emergency_contact_phone VARCHAR(50) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY idx_devices_device_id_unique (device_id),
    KEY idx_devices_user_id (user_id),
    CONSTRAINT fk_devices_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 3. TABLE: health_records
-- =============================================
CREATE TABLE IF NOT EXISTS health_records (
    record_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    device_id VARCHAR(64) NOT NULL,
    user_id BIGINT UNSIGNED,
    heart_rate SMALLINT UNSIGNED NOT NULL,
    spo2 DECIMAL(5,2) NOT NULL,
    temperature DECIMAL(5,2) NOT NULL,
    battery_level DECIMAL(5,2) DEFAULT NULL,
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (record_id),
    KEY idx_health_records_device_id (device_id),
    KEY idx_health_records_user_id (user_id),
    KEY idx_health_records_recorded_at (recorded_at),
    CONSTRAINT fk_health_records_device_id FOREIGN KEY (device_id) REFERENCES devices (device_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_health_records_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 4. TABLE: location_records
-- =============================================
CREATE TABLE IF NOT EXISTS location_records (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    device_id VARCHAR(64) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_location_records_device_id (device_id),
    KEY idx_location_records_recorded_at (recorded_at),
    CONSTRAINT fk_location_records_device_id FOREIGN KEY (device_id) REFERENCES devices (device_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 5. TABLE: emergency_events
-- =============================================
CREATE TABLE IF NOT EXISTS emergency_events (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    device_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(50) NOT NULL DEFAULT 'SOS',
    description TEXT,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    status ENUM('active', 'acknowledged', 'resolved') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    PRIMARY KEY (id),
    KEY idx_emergency_events_device_id (device_id),
    KEY idx_emergency_events_status (status),
    KEY idx_emergency_events_created_at (created_at),
    CONSTRAINT fk_emergency_events_device_id FOREIGN KEY (device_id) REFERENCES devices (device_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 6. TABLE: notifications
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    device_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(50) NOT NULL DEFAULT 'EMERGENCY',
    message TEXT NOT NULL,
    status ENUM('unread', 'read') NOT NULL DEFAULT 'unread',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_notifications_user_id (user_id),
    KEY idx_notifications_device_id (device_id),
    KEY idx_notifications_created_at (created_at),
    CONSTRAINT fk_notifications_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_notifications_device_id FOREIGN KEY (device_id) REFERENCES devices (device_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 7. TABLE: notification_settings
-- =============================================
CREATE TABLE IF NOT EXISTS notification_settings (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NULL,
    telegram_bot_token VARCHAR(255) NOT NULL DEFAULT '',
    telegram_chat_id VARCHAR(64) NOT NULL DEFAULT '',
    telegram_username VARCHAR(255) NULL,
    telegram_enabled TINYINT(1) NOT NULL DEFAULT 1,
    connected_at DATETIME NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_notification_settings_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 8. TABLE: notification_logs
-- =============================================
CREATE TABLE IF NOT EXISTS notification_logs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NULL,
    device_id VARCHAR(64) NULL,
    emergency_id BIGINT UNSIGNED NULL,
    channel VARCHAR(50) NOT NULL DEFAULT 'telegram',
    recipient VARCHAR(255) NULL,
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_notification_logs_user_id (user_id),
    KEY idx_notification_logs_device_id (device_id),
    KEY idx_notification_logs_channel (channel),
    KEY idx_notification_logs_status (status),
    KEY idx_notification_logs_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 9. TABLE: system_settings (health alert thresholds)
-- =============================================
CREATE TABLE IF NOT EXISTS system_settings (
    setting_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (setting_id),
    UNIQUE KEY idx_system_settings_key_unique (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 10. TABLE: mqtt_settings (broker configuration)
-- =============================================
CREATE TABLE IF NOT EXISTS mqtt_settings (
    mqtt_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    host VARCHAR(255) NOT NULL DEFAULT 'broker.emqx.io',
    port INT NOT NULL DEFAULT 1883,
    client_id VARCHAR(150) NULL,
    username VARCHAR(150) NULL,
    password VARCHAR(255) NULL,
    auto_connect TINYINT(1) NOT NULL DEFAULT 1,
    auto_reconnect TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (mqtt_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- SEED DATA (Admin & Main Device)
-- =============================================
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notifications;
TRUNCATE TABLE emergency_events;
TRUNCATE TABLE location_records;
TRUNCATE TABLE health_records;
TRUNCATE TABLE devices;
TRUNCATE TABLE users;
TRUNCATE TABLE notification_logs;
TRUNCATE TABLE notification_settings;
TRUNCATE TABLE system_settings;
TRUNCATE TABLE mqtt_settings;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO users (name, username, email, password_hash, role) VALUES
    ('Administrator', 'admin', 'admin@smarthealth.local', '$2b$10$p8JIoWIuTTvfg8UHlC7LLuJ68zD7TE6NvbeHxiWEidZT9iORmtrqu', 'admin');

INSERT INTO devices (device_id, device_name, user_id, battery_level, status, last_seen,
    patient_name, patient_age, blood_type, medical_conditions, drug_allergies,
    emergency_contact_name, emergency_contact_phone) VALUES
    ('ESP32-HEALTH-01', 'ESP32 DevKit V1', (SELECT id FROM users WHERE username = 'admin'), 100.00, 'online', NOW() - INTERVAL 5 MINUTE,
     'สมชาย ใจดี', 45, 'O+', 'ความดันโลหิตสูง, เบาหวาน', 'แพ้ยา Penicillin', 'นางสาวสมหญิง ใจดี', '081-234-5678');

INSERT INTO system_settings (setting_key, setting_value) VALUES
    ('hr_min', '45'),
    ('hr_max', '120'),
    ('temp_max', '38.5'),
    ('spo2_min', '92');

INSERT INTO mqtt_settings (host, port, client_id, username, password, auto_connect, auto_reconnect) VALUES
    ('broker.emqx.io', 1883, 'smart-health-backend', '', '', 1, 1);

-- Seed sample health record for the main device (Placeholder values for testing)
INSERT INTO health_records (device_id, user_id, heart_rate, spo2, temperature, battery_level, recorded_at) VALUES
    ('ESP32-HEALTH-01', (SELECT id FROM users WHERE username = 'admin'), 72, 98.5, 36.5, 100.00, NOW() - INTERVAL 1 MINUTE);

-- End of schema.sql
