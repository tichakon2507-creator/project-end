require("dotenv").config();

const express = require("express");
const cors = require("cors");

const db = require("./config/db");
const healthRoutes = require("./routes/health");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Smart Health Backend Running",
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                DATABASE() AS database_name,
                NOW() AS server_time
        `);

        res.json({
            success: true,
            data: rows[0],
        });

    } catch (error) {

        console.error("Database Error:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message,
        });

    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Smart Health Backend running at http://localhost:${PORT}`);
});