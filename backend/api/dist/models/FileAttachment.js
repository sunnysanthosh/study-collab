"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileAttachmentModel = void 0;
const connection_1 = __importDefault(require("../db/connection"));
exports.FileAttachmentModel = {
    async create(data) {
        const result = await connection_1.default.query(`INSERT INTO file_attachments (message_id, filename, original_filename, file_path, file_size, mime_type, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`, [
            data.message_id,
            data.filename,
            data.original_filename,
            data.file_path,
            data.file_size,
            data.mime_type || null,
            data.uploaded_by || null,
        ]);
        return result.rows[0];
    },
    async getByMessageId(messageId) {
        const result = await connection_1.default.query(`SELECT * FROM file_attachments
       WHERE message_id = $1
       ORDER BY created_at ASC`, [messageId]);
        return result.rows;
    },
    async delete(attachmentId, userId) {
        // Check if user has permission (uploaded by them or message owner)
        const attachment = await connection_1.default.query(`SELECT fa.*, m.user_id as message_user_id
       FROM file_attachments fa
       JOIN messages m ON fa.message_id = m.id
       WHERE fa.id = $1`, [attachmentId]);
        if (attachment.rows.length === 0) {
            throw new Error('File attachment not found');
        }
        const file = attachment.rows[0];
        if (file.uploaded_by !== userId && file.message_user_id !== userId) {
            throw new Error('Permission denied');
        }
        await connection_1.default.query(`DELETE FROM file_attachments WHERE id = $1`, [attachmentId]);
        return file;
    },
};
