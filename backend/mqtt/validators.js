const STATUS_VALUES = ["online", "offline", "emergency"];

function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function toNumber(value) {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }
    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value.trim());
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
}

function resolveDeviceId(payload, topicDeviceId) {
    const fromPayload =
        payload.device_id !== undefined && payload.device_id !== null && String(payload.device_id).trim() !== ""
            ? String(payload.device_id).trim()
            : null;
    return fromPayload || topicDeviceId || null;
}

function validateVitals(payload, deviceId) {
    if (!isPlainObject(payload)) {
        return { error: "Payload must be a JSON object" };
    }
    const heartRate = toNumber(payload.heart_rate);
    const temperature = toNumber(payload.temperature);
    const spo2 = toNumber(payload.spo2);
    const batteryLevel = toNumber(payload.battery_level);
    if (heartRate === null && temperature === null && spo2 === null) {
        return { error: "Payload must contain heart_rate, temperature or spo2" };
    }
    if (batteryLevel !== null && (batteryLevel < 0 || batteryLevel > 100)) {
        return { error: "battery_level must be between 0 and 100" };
    }
    return {
        data: {
            device_id: deviceId,
            heart_rate: heartRate,
            temperature: temperature,
            spo2: spo2,
            battery_level: batteryLevel,
        },
    };
}

function validateLocation(payload, deviceId) {
    if (!isPlainObject(payload)) {
        return { error: "Payload must be a JSON object" };
    }
    const latitude = toNumber(payload.latitude);
    const longitude = toNumber(payload.longitude);
    if (latitude === null || latitude < -90 || latitude > 90) {
        return { error: "latitude is required and must be within -90 to 90" };
    }
    if (longitude === null || longitude < -180 || longitude > 180) {
        return { error: "longitude is required and must be within -180 to 180" };
    }
    return { data: { device_id: deviceId, latitude, longitude } };
}

function validateEmergency(payload, deviceId) {
    if (!isPlainObject(payload)) {
        return { error: "Payload must be a JSON object" };
    }
    const eventType = typeof payload.event_type === "string" ? payload.event_type.trim() : "";
    if (eventType === "") {
        return { error: "event_type is required" };
    }
    if (eventType.length > 100) {
        return { error: "event_type must be at most 100 characters" };
    }
    let description = null;
    if (payload.description !== undefined && payload.description !== null) {
        if (typeof payload.description !== "string") {
            return { error: "description must be a string" };
        }
        description = payload.description;
    }
    const hasLatitude = payload.latitude !== undefined && payload.latitude !== null;
    const hasLongitude = payload.longitude !== undefined && payload.longitude !== null;
    const latitude = hasLatitude ? toNumber(payload.latitude) : null;
    const longitude = hasLongitude ? toNumber(payload.longitude) : null;
    if (hasLatitude && (latitude === null || latitude < -90 || latitude > 90)) {
        return { error: "latitude must be within -90 to 90" };
    }
    if (hasLongitude && (longitude === null || longitude < -180 || longitude > 180)) {
        return { error: "longitude must be within -180 to 180" };
    }
    return {
        data: {
            device_id: deviceId,
            event_type: eventType,
            description,
            latitude,
            longitude,
        },
    };
}

function resolveStatus(payload) {
    const raw = payload.status !== undefined ? payload.status : payload.state;
    if (typeof raw === "string") {
        const normalized = raw.trim().toLowerCase();
        if (STATUS_VALUES.includes(normalized)) {
            return normalized;
        }
    }
    const boolean = payload.online !== undefined ? payload.online : payload.connected;
    if (typeof boolean === "boolean") {
        return boolean ? "online" : "offline";
    }
    return null;
}

function validateStatus(payload, deviceId) {
    if (!isPlainObject(payload)) {
        return { error: "Payload must be a JSON object" };
    }
    return { data: { device_id: deviceId, status: resolveStatus(payload) } };
}

const VALIDATORS = {
    vitals: validateVitals,
    location: validateLocation,
    emergency: validateEmergency,
    status: validateStatus,
};

function validate(type, payload, topicDeviceId) {
    const validator = VALIDATORS[type];
    if (!validator) {
        return { error: `Unknown topic type: ${type}` };
    }
    const deviceId = resolveDeviceId(payload, topicDeviceId);
    if (!deviceId) {
        return { error: "device_id is missing from payload and topic" };
    }
    return validator(payload, deviceId);
}

module.exports = { validate, toNumber, isPlainObject, STATUS_VALUES };
