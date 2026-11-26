const db = require("./db");

let cachedSchema = null;

async function getUserSchema() {
    if (cachedSchema) {
        return cachedSchema;
    }

    const [rows] = await db.query("SHOW COLUMNS FROM users");
    const fields = new Set(rows.map((row) => row.Field));

    cachedSchema = {
        idColumn: fields.has("user_id") ? "user_id" : "id",
        nameColumn: fields.has("name") ? "name" : fields.has("full_name") ? "full_name" : "name",
        passwordColumn: fields.has("password") ? "password" : "password_hash",
        hasEmail: fields.has("email"),
        hasRole: fields.has("role"),
    };

    return cachedSchema;
}

function resetUserSchemaCache() {
    cachedSchema = null;
}

module.exports = { getUserSchema, resetUserSchemaCache };
