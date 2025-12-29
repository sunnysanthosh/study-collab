"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageReactionModel = void 0;
const connection_1 = __importDefault(require("../db/connection"));
exports.MessageReactionModel = {
    async create(data) {
        // Check if reaction already exists
        const existing = await connection_1.default.query(`SELECT * FROM message_reactions
       WHERE message_id = $1 AND user_id = $2 AND emoji = $3`, [data.message_id, data.user_id, data.emoji]);
        if (existing.rows.length > 0) {
            // Remove reaction (toggle off)
            await connection_1.default.query(`DELETE FROM message_reactions
         WHERE message_id = $1 AND user_id = $2 AND emoji = $3`, [data.message_id, data.user_id, data.emoji]);
            return existing.rows[0];
        }
        // Add reaction
        const result = await connection_1.default.query(`INSERT INTO message_reactions (message_id, user_id, emoji)
       VALUES ($1, $2, $3)
       RETURNING *`, [data.message_id, data.user_id, data.emoji]);
        return result.rows[0];
    },
    async getByMessageId(messageId) {
        const result = await connection_1.default.query(`SELECT mr.*, u.name as user_name, u.avatar_url
       FROM message_reactions mr
       JOIN users u ON mr.user_id = u.id
       WHERE mr.message_id = $1
       ORDER BY mr.created_at ASC`, [messageId]);
        return result.rows;
    },
    async getReactionCounts(messageIds) {
        if (messageIds.length === 0)
            return {};
        const result = await connection_1.default.query(`SELECT message_id, emoji, COUNT(*) as count
       FROM message_reactions
       WHERE message_id = ANY($1::uuid[])
       GROUP BY message_id, emoji`, [messageIds]);
        const counts = {};
        result.rows.forEach((row) => {
            if (!counts[row.message_id]) {
                counts[row.message_id] = {};
            }
            counts[row.message_id][row.emoji] = parseInt(row.count);
        });
        return counts;
    },
};
