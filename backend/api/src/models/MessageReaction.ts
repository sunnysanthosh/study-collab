import pool from '../db/connection';

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: Date;
}

export interface CreateReactionData {
  message_id: string;
  user_id: string;
  emoji: string;
}

export const MessageReactionModel = {
  async create(data: CreateReactionData): Promise<MessageReaction> {
    // Check if reaction already exists
    const existing = await pool.query(
      `SELECT * FROM message_reactions
       WHERE message_id = $1 AND user_id = $2 AND emoji = $3`,
      [data.message_id, data.user_id, data.emoji]
    );

    if (existing.rows.length > 0) {
      // Remove reaction (toggle off)
      await pool.query(
        `DELETE FROM message_reactions
         WHERE message_id = $1 AND user_id = $2 AND emoji = $3`,
        [data.message_id, data.user_id, data.emoji]
      );
      return existing.rows[0];
    }

    // Add reaction
    const result = await pool.query(
      `INSERT INTO message_reactions (message_id, user_id, emoji)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.message_id, data.user_id, data.emoji]
    );
    return result.rows[0];
  },

  async getByMessageId(messageId: string): Promise<MessageReaction[]> {
    const result = await pool.query(
      `SELECT mr.*, u.name as user_name, u.avatar_url
       FROM message_reactions mr
       JOIN users u ON mr.user_id = u.id
       WHERE mr.message_id = $1
       ORDER BY mr.created_at ASC`,
      [messageId]
    );
    return result.rows;
  },

  async getReactionCounts(messageIds: string[]): Promise<Record<string, Record<string, number>>> {
    if (messageIds.length === 0) return {};

    const result = await pool.query(
      `SELECT message_id, emoji, COUNT(*) as count
       FROM message_reactions
       WHERE message_id = ANY($1::uuid[])
       GROUP BY message_id, emoji`,
      [messageIds]
    );

    const counts: Record<string, Record<string, number>> = {};
    result.rows.forEach((row) => {
      if (!counts[row.message_id]) {
        counts[row.message_id] = {};
      }
      counts[row.message_id][row.emoji] = parseInt(row.count);
    });

    return counts;
  },
};

