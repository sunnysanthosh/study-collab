"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTopic = exports.updateTopic = exports.getAllTopics = exports.getTopicById = exports.createTopic = void 0;
const connection_1 = require("../db/connection");
const createTopic = async (topicData) => {
    const result = await (0, connection_1.query)(`INSERT INTO topics (title, description, subject, difficulty, tags, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`, [
        topicData.title,
        topicData.description || null,
        topicData.subject || null,
        topicData.difficulty || null,
        topicData.tags || [],
        topicData.created_by,
    ]);
    return result.rows[0];
};
exports.createTopic = createTopic;
const getTopicById = async (id) => {
    const result = await (0, connection_1.query)(`SELECT * FROM topics WHERE id = $1`, [id]);
    return result.rows[0] || null;
};
exports.getTopicById = getTopicById;
const getAllTopics = async (filters) => {
    let sql = 'SELECT * FROM topics WHERE 1=1';
    const params = [];
    let paramCount = 1;
    if (filters?.subject) {
        sql += ` AND subject = $${paramCount++}`;
        params.push(filters.subject);
    }
    if (filters?.difficulty) {
        sql += ` AND difficulty = $${paramCount++}`;
        params.push(filters.difficulty);
    }
    if (filters?.search) {
        sql += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
        params.push(`%${filters.search}%`);
        paramCount++;
    }
    sql += ' ORDER BY created_at DESC';
    const result = await (0, connection_1.query)(sql, params);
    return result.rows;
};
exports.getAllTopics = getAllTopics;
const updateTopic = async (id, updates) => {
    const fields = [];
    const values = [];
    let paramCount = 1;
    if (updates.title) {
        fields.push(`title = $${paramCount++}`);
        values.push(updates.title);
    }
    if (updates.description !== undefined) {
        fields.push(`description = $${paramCount++}`);
        values.push(updates.description);
    }
    if (updates.subject) {
        fields.push(`subject = $${paramCount++}`);
        values.push(updates.subject);
    }
    if (updates.difficulty) {
        fields.push(`difficulty = $${paramCount++}`);
        values.push(updates.difficulty);
    }
    if (updates.tags) {
        fields.push(`tags = $${paramCount++}`);
        values.push(updates.tags);
    }
    if (fields.length === 0) {
        throw new Error('No fields to update');
    }
    values.push(id);
    const result = await (0, connection_1.query)(`UPDATE topics
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${paramCount}
     RETURNING *`, values);
    return result.rows[0];
};
exports.updateTopic = updateTopic;
const deleteTopic = async (id) => {
    const result = await (0, connection_1.query)(`DELETE FROM topics WHERE id = $1`, [id]);
    return result.rowCount !== null && result.rowCount > 0;
};
exports.deleteTopic = deleteTopic;
