"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMemberOfTopic = exports.getTopicMembers = exports.removeMemberFromTopic = exports.addMemberToTopic = void 0;
const connection_1 = require("../db/connection");
const addMemberToTopic = async (topicId, userId) => {
    const result = await (0, connection_1.query)(`INSERT INTO topic_members (topic_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT (topic_id, user_id) DO NOTHING
     RETURNING *`, [topicId, userId]);
    if (result.rows.length === 0) {
        // User already a member, return existing
        const existing = await (0, connection_1.query)(`SELECT * FROM topic_members WHERE topic_id = $1 AND user_id = $2`, [topicId, userId]);
        return existing.rows[0];
    }
    return result.rows[0];
};
exports.addMemberToTopic = addMemberToTopic;
const removeMemberFromTopic = async (topicId, userId) => {
    const result = await (0, connection_1.query)(`DELETE FROM topic_members WHERE topic_id = $1 AND user_id = $2`, [topicId, userId]);
    return result.rowCount !== null && result.rowCount > 0;
};
exports.removeMemberFromTopic = removeMemberFromTopic;
const getTopicMembers = async (topicId) => {
    const result = await (0, connection_1.query)(`SELECT 
       tm.topic_id,
       tm.user_id,
       tm.joined_at,
       u.name as user_name,
       u.avatar_url as user_avatar,
       u.email as user_email
     FROM topic_members tm
     LEFT JOIN users u ON tm.user_id = u.id
     WHERE tm.topic_id = $1
     ORDER BY tm.joined_at ASC`, [topicId]);
    return result.rows;
};
exports.getTopicMembers = getTopicMembers;
const isMemberOfTopic = async (topicId, userId) => {
    const result = await (0, connection_1.query)(`SELECT 1 FROM topic_members WHERE topic_id = $1 AND user_id = $2 LIMIT 1`, [topicId, userId]);
    return result.rows.length > 0;
};
exports.isMemberOfTopic = isMemberOfTopic;
