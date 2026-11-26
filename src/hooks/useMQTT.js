import { useEffect, useState } from "react";
import client from "../services/mqtt";

function parseMessage(payload) {
    const message = String(payload ?? "").trim();
    if (message === "") {
        return payload;
    }
    const numeric = Number(message);
    return Number.isNaN(numeric) ? payload : numeric;
}

function useMQTT(topic, initialValue = null) {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        if (!client || !topic) {
            return;
        }

        const subscribeTopic = () => {
            client.subscribe(topic, (error) => {
                if (error) {
                    console.error(`MQTT Subscribe Error [${topic}]:`, error);
                    return;
                }
                console.log(`MQTT Subscribed: ${topic}`);
            });
        };

        const onMessage = (receiveTopic, payload) => {
            if (receiveTopic === topic) {
                console.log(`MQTT Message [${topic}]:`, payload.toString());
                setValue(parseMessage(payload));
            }
        };

        client.on("message", onMessage);

        if (client.connected) {
            subscribeTopic();
        }

        client.on("connect", subscribeTopic);

        return () => {
            client.off("message", onMessage);
            client.off("connect", subscribeTopic);
            if (client.connected) {
                client.unsubscribe(topic);
            }
        };
    }, [topic]);

    return value;
}

export default useMQTT;
