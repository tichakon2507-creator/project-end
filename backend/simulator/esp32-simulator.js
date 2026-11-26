const mqtt = require("mqtt");
const { getMQTTConfig } = require("../config/mqtt");

const DEFAULT_DEVICE_ID = "ESP32-HEALTH-01";
const SEND_INTERVAL_MS = 3000;
const LOCAL_BROKER_URL = "mqtt://127.0.0.1:1883";
const useLocalBroker = process.argv.includes("--local");

// พิกัดแถวเชียงใหม่
const CHIANG_MAI_LAT = 18.7874;
const CHIANG_MAI_LON = 98.9892;

const deviceId = (process.env.DEVICE_ID || process.env.SIMULATOR_DEVICE_ID || DEFAULT_DEVICE_ID)
    .toString()
    .trim() || DEFAULT_DEVICE_ID;

const TOPICS = {
    vitals: `iot/health/${deviceId}/vitals`,
    location: `iot/health/${deviceId}/location`,
    emergency: `iot/health/${deviceId}/emergency`,
    status: `iot/health/${deviceId}/status`,
};

const batteryStartedAt = Date.now();

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

function batteryLevelNow() {
    const elapsedMinutes = (Date.now() - batteryStartedAt) / 60000;
    return Math.max(20, Math.min(100, 100 - Math.round(elapsedMinutes * 0.5)));
}

function buildVitalsPayload(options = {}) {
    const heartRate = options.heart_rate !== undefined
        ? options.heart_rate
        : options.abnormal
            ? randomBetween(170, 200)
            : randomBetween(62, 90);
    const temperature = options.temperature !== undefined ? options.temperature : randomBetween(35.6, 37.2);
    const spo2 = options.spo2 !== undefined ? options.spo2 : randomBetween(95, 99);
    return JSON.stringify({
        device_id: deviceId,
        heart_rate: Math.round(heartRate),
        temperature: Number(temperature.toFixed(2)),
        spo2: Number(spo2.toFixed(2)),
        battery_level: Math.round(batteryLevelNow()),
    });
}

function buildLocationPayload() {
    return JSON.stringify({
        device_id: deviceId,
        latitude: Number((CHIANG_MAI_LAT + randomBetween(-0.002, 0.002)).toFixed(6)),
        longitude: Number((CHIANG_MAI_LON + randomBetween(-0.002, 0.002)).toFixed(6)),
    });
}

function buildEmergencyPayload(eventType = "SOS_BUTTON", description = "ปุ่ม SOS ถูกกด - เกิดเหตุฉุกเฉินที่เชียงใหม่") {
    return JSON.stringify({
        device_id: deviceId,
        event_type: eventType,
        description,
        latitude: Number((CHIANG_MAI_LAT + randomBetween(-0.002, 0.002)).toFixed(6)),
        longitude: Number((CHIANG_MAI_LON + randomBetween(-0.002, 0.002)).toFixed(6)),
    });
}

function buildStatusPayload(status) {
    return JSON.stringify({ device_id: deviceId, status: status });
}

function publish(client, topic, payload, opts) {
    if (!client || !client.connected) {
        console.log(`[SIM] ไม่ได้เชื่อมต่อ - ไม่สามารถส่งไปยัง ${topic}`);
        return;
    }
    client.publish(topic, payload, opts || { qos: 0, retain: false }, (err) => {
        if (err) {
            console.log(`[SIM][error] ส่งไปยัง ${topic} เกิดข้อผิดพลาด: ${err.message}`);
        }
    });
}

function publishStatus(client, status) {
    publish(client, TOPICS.status, buildStatusPayload(status), { qos: 1, retain: true });
}

function printLegend() {
    console.log("[SIM] คีย์บอร์ด: [f] ผู้ป่วยล้มพร้อมพิกัด GPS | [t] อุณหภูมิสูง 39.4 องศาเซลเซียส | [a] หัวใจเต้นผิดปกติ 138 bpm | [e] กดปุ่ม SOS | [q] ตัดการเชื่อมต่อและส่งสถานะ offline");
}

function gracefulDisconnect(client) {
    console.log("[SIM] กดปุ่ม Q - ตัดการเชื่อมต่อ - ส่งสถานะ offline");
    try {
        publishStatus(client, "offline");
    } catch {
        // ไม่สามารถส่งได้ในกรณีที่การเชื่อมต่อไม่สมบูรณ์เท่าไหร่นั้น LWT จะรับช่วงต่อให้
    }
    setTimeout(() => {
        try {
            client.end();
        } catch {
            // ignore
        }
        setTimeout(() => process.exit(0), 500);
    }, 300);
}

async function main() {
    const config = await getMQTTConfig();
    const url = useLocalBroker ? LOCAL_BROKER_URL : config.url || `mqtt://${config.host}:${config.port}`;

    console.log("[SIM] Smart Health ESP32 Simulator - กำลังเชื่อมต่อ...");
    console.log(`[SIM] device_id: ${deviceId}`);
    console.log(`[SIM] broker: ${url}${useLocalBroker ? " (Local Broker)" : ""}`);
    printLegend();

    const client = mqtt.connect(url, {
        clientId: `simulator-${deviceId}-${process.pid}`,
        clean: true,
        reconnectPeriod: 5000,
        connectTimeout: 10000,
        username: useLocalBroker ? undefined : config.username || undefined,
        password: useLocalBroker ? undefined : config.password || undefined,
    });

    let sendInterval = null;

    client.on("connect", () => {
        console.log(`[SIM] เชื่อมต่อสำเร็จที่ ${url} - ส่งสถานะ online`);
        publishStatus(client, "online");
        if (!sendInterval) {
            sendInterval = setInterval(() => {
                publish(client, TOPICS.vitals, buildVitalsPayload({}));
                publish(client, TOPICS.location, buildLocationPayload());
            }, SEND_INTERVAL_MS);
        }
    });

    client.on("reconnect", () => console.log("[SIM] กำลังเชื่อมต่อใหม่..."));
    client.on("offline", () => console.log("[SIM] การเชื่อมต่อขาดหาย (LWT จะส่งสถานะ offline)"));
    client.on("close", () => {
        if (sendInterval) {
            clearInterval(sendInterval);
            sendInterval = null;
        }
    });
    client.on("error", (err) => console.log("[SIM][error]", err && err.message));

    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
    }
    process.stdin.setEncoding("utf8");
    process.stdin.resume();

    process.stdin.on("data", (key) => {
        const ch = String(key);
        if (ch === "f") {
            console.log("[SIM] กดปุ่ม F - จำลองเหตุการณ์ผู้ป่วยล้มพร้อมพิกัด GPS");
            publish(client, TOPICS.emergency, buildEmergencyPayload(
                "FALL_DETECTED",
                "ตรวจพบเหตุการณ์ผู้ป่วยล้ม พร้อมพิกัดตำแหน่งจากอุปกรณ์"
            ));
        } else if (ch === "t") {
            console.log("[SIM] กดปุ่ม T - จำลองอุณหภูมิร่างกายสูง 39.4 องศาเซลเซียส");
            publish(client, TOPICS.vitals, buildVitalsPayload({ temperature: 39.4 }));
        } else if (ch === "a") {
            console.log("[SIM] กดปุ่ม A - จำลองอัตราการเต้นของหัวใจผิดปกติ 138 bpm");
            publish(client, TOPICS.vitals, buildVitalsPayload({ heart_rate: 138 }));
        } else if (ch === "e") {
            console.log(`[SIM] กดปุ่ม SOS - ส่งเหตุการณ์ฉุกเฉินไปแล้ว (${TOPICS.emergency})`);
            publish(client, TOPICS.emergency, buildEmergencyPayload());
        } else if (ch === "q" || ch === "\u0003") {
            gracefulDisconnect(client);
        }
    });
}

main().catch((err) => {
    console.error("[SIM][error]", err && err.message);
    process.exit(1);
});
