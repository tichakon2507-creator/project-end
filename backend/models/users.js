const db = require("../config/db");

const table = "users";

async function columnExists(column) {
    const [rows] = await db.query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [table, column]
    );
    return rows.length > 0;
}

async function create(data) {
    const [result] = await db.query(`INSERT INTO ${table} (name, username, password_hash, role) VALUES (?, ?, ?, ?)`, [data.name, data.username, data.password_hash, data.role]);
    return getById(result.insertId);
}

async function findOne(where, params = []) {
    const [rows] = await db.query(`SELECT * FROM ${table} WHERE ${where} LIMIT 1`, params);
    return rows[0] || null;
}

async function getById(id) {
    const [rows] = await db.query(`SELECT * FROM ${table} WHERE id = ? LIMIT 1`, [id]);
    return rows[0] || null;
}

async function getByUsername(username) {
    return findOne("username = ?", [username]);
}

async function update(id, data) {
    await db.query(`UPDATE ${table} SET name = ?, role = ? WHERE id = ? LIMIT 1`, [data.name, data.role, id]);
    return getById(id);
}

async function updateStatus(id, status) {
    if (!(await columnExists("status"))) {
        return getById(id);
    }
    await db.query(`UPDATE ${table} SET status = ? WHERE id = ? LIMIT 1`, [status, id]);
    return getById(id);
}

async function getAll() {
    const [rows] = await db.query(`SELECT * FROM ${table} ORDER BY created_at DESC`);
    return rows;
}

module.exports = { create, findOne, getById, getByUsername, update, updateStatus, getAll };
