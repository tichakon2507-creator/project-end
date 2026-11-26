const TYPES = {
    VITALS: "vitals",
    LOCATION: "location",
    EMERGENCY: "emergency",
    STATUS: "status",
};

const TOPIC_TEMPLATES = {
    [TYPES.VITALS]: "iot/health/{device_id}/vitals",
    [TYPES.LOCATION]: "iot/health/{device_id}/location",
    [TYPES.EMERGENCY]: "iot/health/{device_id}/emergency",
    [TYPES.STATUS]: "iot/health/{device_id}/status",
};

const SUBSCRIBE_PATTERNS = Object.keys(TOPIC_TEMPLATES)
    .map((type) => TOPIC_TEMPLATES[type].replace("{device_id}", "+"))
    .sort();

function parseDeviceTopic(topic) {
    const match = /^iot\/health\/([^/]+)\/(vitals|location|emergency|status)$/i.exec(String(topic));
    if (!match) {
        return null;
    }
    return { deviceId: match[1], type: match[2].toLowerCase() };
}

module.exports = { TYPES, TOPIC_TEMPLATES, SUBSCRIBE_PATTERNS, parseDeviceTopic };
