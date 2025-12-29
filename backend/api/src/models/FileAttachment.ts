import pool from '../db/connection';

export interface FileAttachment {
  id: string;
  message_id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: Date;
}

export interface CreateFileAttachmentData {
  message_id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type?: string;
  uploaded_by?: string;
}

export const FileAttachmentModel = {
  async create(data: CreateFileAttachmentData): Promise<FileAttachment> {
    const result = await pool.query(
      `INSERT INTO file_attachments (message_id, filename, original_filename, file_path, file_size, mime_type, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.message_id,
        data.filename,
        data.original_filename,
        data.file_path,
        data.file_size,
        data.mime_type || null,
        data.uploaded_by || null,
      ]
    );
    return result.rows[0];
  },

  async getByMessageId(messageId: string): Promise<FileAttachment[]> {
    const result = await pool.query(
      `SELECT * FROM file_attachments
       WHERE message_id = $1
       ORDER BY created_at ASC`,
      [messageId]
    );
    return result.rows;
  },

  async delete(attachmentId: string, userId: string): Promise<FileAttachment> {
    // Check if user has permission (uploaded by them or message owner)
    const attachment = await pool.query(
      `SELECT fa.*, m.user_id as message_user_id
       FROM file_attachments fa
       JOIN messages m ON fa.message_id = m.id
       WHERE fa.id = $1`,
      [attachmentId]
    );

    if (attachment.rows.length === 0) {
      throw new Error('File attachment not found');
    }

    const file = attachment.rows[0];
    if (file.uploaded_by !== userId && file.message_user_id !== userId) {
      throw new Error('Permission denied');
    }

    await pool.query(
      `DELETE FROM file_attachments WHERE id = $1`,
      [attachmentId]
    );

    return file;
  },
};

