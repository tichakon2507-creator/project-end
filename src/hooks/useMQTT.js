import { useEffect, useState } from "react";
import client from "../services/mqtt";

function useMQTT(topic, initialValue = null) {

    const [value, setValue] = useState(initialValue);

    useEffect(() => {

        if (!client || !topic) {
            return;
        }

        const subscribeTopic = () => {

            client.subscribe(topic, (error) => {

                if (error) {

                    console.error(
                        `MQTT Subscribe Error [${topic}]:`,
                        error
                    );

                    return;
                }

                console.log(
                    `MQTT Subscribed: ${topic}`
                );

            });

        };

        const onMessage = (receiveTopic, payload) => {

            if (receiveTopic === topic) {

                const message = payload.toString();

                console.log(
                    `MQTT Message [${topic}]:`,
                    message
                );

                setValue(message);

            }

        };

        // รับข้อความ MQTT
        client.on("message", onMessage);

        // ถ้าเชื่อมต่ออยู่แล้ว ให้ Subscribe ทันที
        if (client.connected) {

            subscribeTopic();

        }

        // ถ้า MQTT เพิ่งเชื่อมต่อ ให้ Subscribe ตอน connect
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