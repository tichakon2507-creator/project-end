require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");

const db = require("./config/db");
const { start: startMQTT } = require("./mqtt");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const healthRoutes = require("./routes/health");
const devicesRoutes = require("./routes/devices");
const emergencyRoutes = require("./routes/emergency");
const locationRoutes = require("./routes/location");
const settingsRoutes = require("./routes/settings");
const usersRoutes = require("./routes/users");
const { errorHandler } = require("./middleware/errorHandler");
const { ensureAdminUser } = require("./seedAdmin");
const telegramService = require("./services/telegramService");

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    })
);
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
    res.json({ success: true, message: "Smart Health Backend Running" });
});

app.get("/api/test-db", async (req, res, next) => {
    try {
        const [rows] = await db.query("SELECT DATABASE() AS database_name, NOW() AS server_time");
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        console.error("Database Error:", err);
        next(err);
    }
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/devices", devicesRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, _next) => {
    res.status(404).json({ success: false, error: { message: "Not Found", status: 404, type: "not_found" } });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, async () => {
    await ensureAdminUser();
    try {
        const connected = await db.checkConnection();
        console.log(connected
            ? `Smart Health Backend running at http://localhost:${PORT} (DB: smart_health)`
            : `Smart Health Backend running at http://localhost:${PORT} (DB check failed)`);
    } catch {
        console.log(`Smart Health Backend running at http://localhost:${PORT}`);
    }
});

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log("[IO] Client connected");
    socket.on("disconnect", () => console.log("[IO] Client disconnected"));
});

startMQTT(io);
telegramService.startTelegramPolling();

server.on("error", (err) => {
    console.error(`Server Error: ${err.code} ${err.message}`);
    process.exit(1);
});
