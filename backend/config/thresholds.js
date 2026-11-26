const db = require("./db");

const DEFAULT_THRESHOLDS = {
    hr_min: 45,
    hr_max: 120,
    temp_max: 38.5,
    spo2_min: 92,
};

const THRESHOLD_KEYS = Object.keys(DEFAULT_THRESHOLDS);

const THRESHOLD_LIMITS = {
    hr_min: { min: 1, max: 300, integer: true },
    hr_max: { min: 1, max: 300, integer: true },
    temp_max: { min: 20, max: 45, integer: false },
    spo2_min: { min: 50, max: 100, integer: false },
};

function toFiniteNumber(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    }
    const parsed = typeof value === "number" ? value : Number(String(value).trim());
    return Number.isFinite(parsed) ? parsed : null;
}

function parseSettingValue(raw, key) {
    if (raw === null || raw === undefined) {
        return null;
    }
    const text = String(raw).trim();
    if (text === "") {
        return null;
    }
    if (text.startsWith("{")) {
        try {
            const parsed = JSON.parse(text);
            if (parsed && typeof parsed === "object" && parsed[key] !== undefined) {
                return toFiniteNumber(parsed[key]);
            }
        } catch {
            return null;
        }
        return null;
    }
    return toFiniteNumber(text);
}

function normalizeThresholds(input) {
    const source = input && typeof input === "object" ? input : {};
    const result = { ...DEFAULT_THRESHOLDS };

    THRESHOLD_KEYS.forEach((key) => {
        const rawValue = source[key];
        const value = toFiniteNumber(rawValue);
        if (value === null) {
            return;
        }
        const limits = THRESHOLD_LIMITS[key];
        if (value < limits.min || value > limits.max) {
            return;
        }
        result[key] = limits.integer ? Math.round(value) : Number(value.toFixed(2));
    });

    if (result.hr_min >= result.hr_max) {
        result.hr_min = DEFAULT_THRESHOLDS.hr_min;
        result.hr_max = DEFAULT_THRESHOLDS.hr_max;
    }
    return result;
}

async function getThresholds() {
    try {
        const placeholders = THRESHOLD_KEYS.map(() => "?").join(", ");
        const [rows] = await db.query(
            `SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (${placeholders})`,
            THRESHOLD_KEYS
        );
        const raw = {};
        rows.forEach((row) => {
            raw[row.setting_key] = parseSettingValue(row.setting_value, row.setting_key);
        });
        return normalizeThresholds(raw);
    } catch (err) {
        console.error("[Thresholds] Failed to read system_settings, using defaults:", err && err.message ? err.message : err);
        return { ...DEFAULT_THRESHOLDS };
    }
}

async function saveThresholds(input) {
    const normalized = normalizeThresholds(input);
    for (const key of THRESHOLD_KEYS) {
        await db.query(
            `INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
            [key, String(normalized[key])]
        );
    }
    return getThresholds();
}

module.exports = {
    DEFAULT_THRESHOLDS,
    THRESHOLD_KEYS,
    THRESHOLD_LIMITS,
    normalizeThresholds,
    getThresholds,
    saveThresholds,
};
