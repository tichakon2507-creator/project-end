const mqtt = require("mqtt");

const { getMQTTConfig } = require("../config/mqtt");
const { SUBSCRIBE_PATTERNS, parseDeviceTopic } = require("./topics");
const { validate } = require("./validators");
const { getHandler } = require("./handlers");

let ioRef = null;
let activeClient = null;
let reconnecting = false;

function log(message) {
    console.log("[MQTT]", message);
}

function logWarn(message, detail) {
    console.warn("[MQTT][warn]", message, detail === undefined ? "" : detail);
}

function logError(message, err) {
    console.error("[MQTT][error]", message, err && err.message ? err.message : err);
}

function emitStatus(status, config) {
    if (ioRef) {
        ioRef.emit("mqtt:status", {
            status,
            connected: status === "Connected",
            host: config ? config.host : null,
            port: config ? config.port : null,
            url: config ? config.url : null,
            at: new Date().toISOString(),
        });
    }
    log(`Status: ${status}`);
}

function parseJsonPayload(raw) {
    if (raw === null || raw === undefined) {
        return null;
    }
    const text = raw.toString("utf8");
    if (text.trim() === "") {
        return null;
    }
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

async function routeMessage(io, topic, payloadBuffer) {
    const topicStr = String(topic);
    const parsed = parseDeviceTopic(topicStr);
    if (!parsed) {
        logWarn("Received message on unhandled topic", topicStr);
        return;
    }

    const payload = parseJsonPayload(payloadBuffer);
    if (payload === null) {
        logWarn("Ignoring invalid or empty JSON payload", `${topicStr} :: ${String(payloadBuffer).slice(0, 300)}`);
        return;
    }

    const validation = validate(parsed.type, payload, parsed.deviceId);
    if (validation.error) {
        logWarn(`Payload validation failed (${parsed.type})`, `${topicStr} :: ${validation.error}`);
        return;
    }

    const handler = getHandler(parsed.type);
    if (!handler) {
        logWarn(`No handler for topic type (${parsed.type})`, topicStr);
        return;
    }

    try {
        await handler(io || ioRef, validation.data);
    } catch (err) {
        logError(`Failed to process ${parsed.type} message`, err);
    }
}

function connect(config) {
    log(`Connecting to ${config.url}`);
    emitStatus("Reconnecting", config);

    const client = mqtt.connect(config.url, {
        clientId: config.clientId,
        username: config.username || undefined,
        password: config.password || undefined,
        clean: true,
        reconnectPeriod: config.autoConnect === false ? 0 : 5000,
        connectTimeout: 10000,
    });
    activeClient = client;

    client.on("connect", () => {
        reconnecting = false;
        log(`Connected to ${config.url}`);
        emitStatus("Connected", config);
        client.subscribe(SUBSCRIBE_PATTERNS, (err) => {
            if (err) {
                logError("Subscription failed", err);
                return;
            }
            log(`Subscribed to: ${SUBSCRIBE_PATTERNS.join(", ")}`);
        });
    });

    client.on("message", (topic, payload) => {
        routeMessage(ioRef, topic, payload).catch((err) => logError("Message routing error", err));
    });

    client.on("reconnect", () => {
        reconnecting = true;
        emitStatus("Reconnecting", config);
    });
    client.on("close", () => {
        if (activeClient !== client) return;
        reconnecting = false;
        emitStatus("Disconnected", config);
    });
    client.on("offline", () => {
        if (activeClient !== client) return;
        reconnecting = true;
        emitStatus("Reconnecting", config);
    });
    client.on("error", (err) => {
        if (activeClient === client) reconnecting = true;
        logError("MQTT error", err);
    });

    return client;
}

async function start(io) {
    if (io) {
        ioRef = io;
    }
    const config = await getMQTTConfig();

    if (!config.autoConnect) {
        log("MQTT_AUTO_CONNECT is disabled in .env; MQTT subscriber is not started");
        reconnecting = false;
        emitStatus("Disconnected", config);
        return null;
    }

    reconnecting = true;
    return connect(config);
}

async function reconnectMQTT() {
    const config = await getMQTTConfig();
    reconnecting = true;
    emitStatus("Reconnecting", config);

    if (activeClient) {
        const oldClient = activeClient;
        activeClient = null;
        try {
            oldClient.removeAllListeners("message");
            oldClient.end(true);
        } catch (err) {
            logWarn("Failed to close previous MQTT client", err && err.message ? err.message : err);
        }
    }

    return new Promise((resolve) => {
        const client = connect(config);
        let settled = false;
        const finish = (status) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve({ success: status === "Connected", status, host: config.host, port: config.port });
        };
        const timer = setTimeout(() => finish(client.connected ? "Connected" : "Disconnected"), 6000);
        client.once("connect", () => finish("Connected"));
        client.once("error", (err) => logError("Reconnect attempt error", err));
    });
}

async function getMQTTStatus() {
    const config = await getMQTTConfig();
    const connected = Boolean(activeClient && activeClient.connected);
    return {
        status: connected ? "Connected" : reconnecting ? "Reconnecting" : "Disconnected",
        connected,
        host: config.host,
        port: config.port,
        url: config.url,
        auto_connect: config.autoConnect,
    };
}

module.exports = {
    start,
    reconnectMQTT,
    getMQTTStatus,
    routeMessage,
    parseJsonPayload,
    getMQTTConfig,
};
