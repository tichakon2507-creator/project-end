import mqtt from "mqtt";

const MQTT_URL = "ws://localhost:9001";

const client = mqtt.connect(MQTT_URL, {
    clientId: `smart-health-dashboard-${Date.now()}`,
    clean: true,
    reconnectPeriod: 3000,
    connectTimeout: 10000,
});

client.on("connect", () => {

    console.log("✅ MQTT Connected");
    console.log(`📡 Broker: ${MQTT_URL}`);

});

client.on("reconnect", () => {

    console.log("♻ MQTT Reconnecting...");

});

client.on("close", () => {

    console.log("🔌 MQTT Connection Closed");

});

client.on("offline", () => {

    console.log("⚠️ MQTT Offline");

});

client.on("error", (err) => {

    console.error("❌ MQTT Error:", err);

});

export default client;