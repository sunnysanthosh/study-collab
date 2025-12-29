"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessage = exports.updateMessage = exports.getMessageById = exports.getMessagesByTopic = exports.createMessage = void 0;
const connection_1 = require("../db/connection");
const createMessage = async (messageData) => {
    const result = await (0, connection_1.query)(`INSERT INTO messages (topic_id, user_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`, [messageData.topic_id, messageData.user_id, messageData.content]);
    return result.rows[0];
};
exports.createMessage = createMessage;
const getMessagesByTopic = async (topicId, limit = 50, offset = 0) => {
    const result = await (0, connection_1.query)(`SELECT 
       m.id,
       m.topic_id,
       m.user_id,
       m.content,
       m.edited_at,
       m.created_at,
       u.name as user_name,
       u.avatar_url as user_avatar
     FROM messages m
     LEFT JOIN users u ON m.user_id = u.id
     WHERE m.topic_id = $1
     ORDER BY m.created_at ASC
     LIMIT $2 OFFSET $3`, [topicId, limit, offset]);
    return result.rows;
};
exports.getMessagesByTopic = getMessagesByTopic;
const getMessageById = async (id) => {
    const result = await (0, connection_1.query)(`SELECT * FROM messages WHERE id = $1`, [id]);
    return result.rows[0] || null;
};
exports.getMessageById = getMessageById;
const updateMessage = async (id, userId, content) => {
    const result = await (0, connection_1.query)(`UPDATE messages 
     SET content = $1, edited_at = NOW()
     WHERE id = $2 AND user_id = $3
     RETURNING *`, [content, id, userId]);
    return result.rows[0] || null;
};
exports.updateMessage = updateMessage;
const deleteMessage = async (id, userId) => {
    const result = await (0, connection_1.query)(`DELETE FROM messages WHERE id = $1 AND user_id = $2`, [id, userId]);
    return result.rowCount !== null && result.rowCount > 0;
};
exports.deleteMessage = deleteMessage;
