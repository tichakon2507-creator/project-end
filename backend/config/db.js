require("dotenv").config();

const mysql = require("mysql2");

const env = process.env;

const pool = mysql.createPool({
    host: env.DB_HOST || env.MYSQL_HOST || "localhost",
    port: Number(env.DB_PORT || env.MYSQL_PORT) || 3306,
    user: env.DB_USER || env.MYSQL_USER || "root",
    password: env.DB_PASSWORD ?? env.MYSQL_PASSWORD ?? "",
    database: env.DB_NAME || env.MYSQL_DATABASE || "smart_health",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: "utf8mb4",
    timezone: "+00:00",
    supportBigNumbers: true,
    bigNumberStrings: false,
    ssl: process.env.DB_SSL === "true" ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined,
});

pool.on("error", (err) => {
    console.error("[DB] Pool Error:", err.code, err.message);
});

const promisePool = pool.promise();

async function checkConnection() {
    let conn;
    try {
        conn = await promisePool.getConnection();
        const [rows] = await conn.query("SELECT 1 AS alive");
        return Array.isArray(rows) && rows[0]?.alive === 1;
    } catch (err) {
        console.error("[DB] Connection check failed:", err.code, err.message);
        return false;
    } finally {
        if (conn) conn.release();
    }
}

module.exports = promisePool;
module.exports.checkConnection = checkConnection;
module.exports.isConnected = checkConnection;
