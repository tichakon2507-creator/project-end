require("dotenv").config();

const DEFAULT_HOST = "broker.emqx.io";
const DEFAULT_PORT = 1883;

function readHost() {
    const raw =
        process.env.MQTT_HOST ||
        process.env.MQTT_BROKER_HOST ||
        process.env.MQTT_BROKER ||
        "";
    return String(raw).trim() || DEFAULT_HOST;
}

function readPort() {
    const raw = process.env.MQTT_PORT || process.env.MQTT_BROKER_PORT || "";
    const parsed = Number(String(raw).trim());
    return Number.isInteger(parsed) && parsed > 0 && parsed <= 65535
        ? parsed
        : DEFAULT_PORT;
}

function readAutoConnect() {
    const raw = String(process.env.MQTT_AUTO_CONNECT || "").trim().toLowerCase();
    return !["0", "false", "no", "off"].includes(raw);
}

async function getMQTTConfig() {
    const host = readHost();
    const port = readPort();

    return {
        url: `mqtt://${host}:${port}`,
        host,
        port,
        autoConnect: readAutoConnect(),
        clientId:
            String(process.env.MQTT_CLIENT_ID || "").trim() ||
            `smart-health-backend-${process.pid}`,
        username: String(process.env.MQTT_USERNAME || "").trim() || null,
        password: process.env.MQTT_PASSWORD || null,
    };
}

module.exports = { getMQTTConfig, DEFAULT_HOST, DEFAULT_PORT };
