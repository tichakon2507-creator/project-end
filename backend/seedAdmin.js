const bcrypt = require("bcrypt");

const db = require("./config/db");
const { getUserSchema, resetUserSchemaCache } = require("./config/userSchema");

const ADMIN_NAME = "Administrator";
const ADMIN_USERNAME = "admin";
const ADMIN_EMAIL = "admin@smarthealth.local";
const ADMIN_PASSWORD = "admin1234";
const ADMIN_ROLE = "admin";

const BCRYPT_HASH_PATTERN = /^\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}$/;

function saltRounds() {
    const configured = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10);
    return Number.isFinite(configured) && configured >= 4 && configured <= 15
        ? configured
        : 10;
}

async function ensureEmailColumn() {
    const [columns] = await db.query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        ["users", "email"]
    );

    if (columns.length === 0) {
        await db.query(`ALTER TABLE users ADD COLUMN email VARCHAR(150) NULL AFTER name`);
        resetUserSchemaCache();
    }

    const [indexes] = await db.query(
        `SHOW INDEX FROM users WHERE Column_name = ? AND Non_unique = 0`,
        ["email"]
    );
    if (indexes.length === 0) {
        await db.query(`ALTER TABLE users ADD UNIQUE KEY idx_users_email (email)`);
    }
}

async function ensureAdminUser() {
    try {
        try {
            await ensureEmailColumn();
        } catch (err) {
            console.error(
                "[SEED] Could not prepare users.email column:",
                err.code || "",
                err.message
            );
        }

        const schema = await getUserSchema();
        const where = schema.hasEmail
            ? "WHERE username = ? OR email = ? LIMIT 1"
            : "WHERE username = ? LIMIT 1";
        const params = schema.hasEmail
            ? [ADMIN_USERNAME, ADMIN_EMAIL]
            : [ADMIN_USERNAME];

        const [rows] = await db.query(
            `SELECT ${schema.idColumn} AS id, name, username, ${
                schema.hasEmail ? "email," : ""
            } ${schema.passwordColumn} AS password_hash, role FROM users ${where}`,
            params
        );

        const existing = rows[0];

        if (!existing) {
            const columns = ["name", "username"];
            const values = [ADMIN_NAME, ADMIN_USERNAME];
            if (schema.hasEmail) {
                columns.push("email");
                values.push(ADMIN_EMAIL);
            }
            columns.push(schema.passwordColumn, "role");
            values.push(await bcrypt.hash(ADMIN_PASSWORD, saltRounds()), ADMIN_ROLE);

            await db.query(
                `INSERT INTO users (${columns.join(", ")}) VALUES (${columns
                    .map(() => "?")
                    .join(", ")})`,
                values
            );
            console.log("[SEED] Default admin account created.");
            return;
        }

        const assignments = [];
        const values = [];

        if (schema.hasEmail && existing.email !== ADMIN_EMAIL) {
            assignments.push("email = ?");
            values.push(ADMIN_EMAIL);
        }
        if (!BCRYPT_HASH_PATTERN.test(String(existing.password_hash || ""))) {
            assignments.push(`${schema.passwordColumn} = ?`);
            values.push(await bcrypt.hash(ADMIN_PASSWORD, saltRounds()));
        }
        if (existing.role !== ADMIN_ROLE) {
            assignments.push("role = ?");
            values.push(ADMIN_ROLE);
        }

        if (assignments.length > 0) {
            values.push(existing.id);
            await db.query(
                `UPDATE users SET ${assignments.join(", ")} WHERE ${schema.idColumn} = ? LIMIT 1`,
                values
            );
            console.log("[SEED] Default admin account credentials verified.");
        }
    } catch (err) {
        console.error(
            "[SEED] Unable to ensure admin account:",
            err.code || "",
            err.message
        );
    }
}

module.exports = { ensureAdminUser };
