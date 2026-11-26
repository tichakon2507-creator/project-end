import { io } from "socket.io-client";

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socketInstance = null;

export function getSocket() {
    if (!socketInstance) {
        socketInstance = io(SOCKET_URL, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionDelay: 2000,
            reconnectionDelayMax: 10000,
            timeout: 8000,
        });

        socketInstance.on("connect", () => {
            console.log("[Socket.IO] Connected");
        });
        socketInstance.on("connect_error", (err) => {
            console.warn("[Socket.IO] Connect error:", err.message);
        });
        socketInstance.on("disconnect", () => {
            console.log("[Socket.IO] Disconnected");
        });
    }
    return socketInstance;
}
