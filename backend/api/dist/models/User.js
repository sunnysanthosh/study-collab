"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUserPassword = exports.updateUser = exports.getUserById = exports.getUserByEmail = exports.createUser = void 0;
const connection_1 = require("../db/connection");
const password_1 = require("../utils/password");
const createUser = async (userData) => {
    const passwordHash = await (0, password_1.hashPassword)(userData.password);
    const result = await (0, connection_1.query)(`INSERT INTO users (name, email, password_hash, avatar_url)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, avatar_url, role, created_at, updated_at`, [userData.name, userData.email, passwordHash, userData.avatar_url || null]);
    return result.rows[0];
};
exports.createUser = createUser;
const getUserByEmail = async (email) => {
    const result = await (0, connection_1.query)(`SELECT id, name, email, password_hash, avatar_url, role, created_at, updated_at
     FROM users
     WHERE email = $1`, [email]);
    return result.rows[0] || null;
};
exports.getUserByEmail = getUserByEmail;
const getUserById = async (id) => {
    const result = await (0, connection_1.query)(`SELECT id, name, email, avatar_url, role, created_at, updated_at
     FROM users
     WHERE id = $1`, [id]);
    return result.rows[0] || null;
};
exports.getUserById = getUserById;
const updateUser = async (id, updates) => {
    const fields = [];
    const values = [];
    let paramCount = 1;
    if (updates.name) {
        fields.push(`name = $${paramCount++}`);
        values.push(updates.name);
    }
    if (updates.email) {
        fields.push(`email = $${paramCount++}`);
        values.push(updates.email);
    }
    if (updates.password) {
        const passwordHash = await (0, password_1.hashPassword)(updates.password);
        fields.push(`password_hash = $${paramCount++}`);
        values.push(passwordHash);
    }
    if (updates.avatar_url !== undefined) {
        fields.push(`avatar_url = $${paramCount++}`);
        values.push(updates.avatar_url);
    }
    if (fields.length === 0) {
        throw new Error('No fields to update');
    }
    values.push(id);
    const result = await (0, connection_1.query)(`UPDATE users
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${paramCount}
     RETURNING id, name, email, avatar_url, role, created_at, updated_at`, values);
    return result.rows[0];
};
exports.updateUser = updateUser;
const verifyUserPassword = async (email, password) => {
    const user = await (0, exports.getUserByEmail)(email);
    if (!user || !user.password_hash) {
        return null;
    }
    const isValid = await (0, password_1.comparePassword)(password, user.password_hash);
    if (!isValid) {
        return null;
    }
    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
exports.verifyUserPassword = verifyUserPassword;
