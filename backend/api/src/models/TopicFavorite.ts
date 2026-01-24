import { query } from '../db/connection';

export interface TopicFavorite {
  topic_id: string;
  user_id: string;
  created_at: Date;
}

export const TopicFavoriteModel = {
  async add(topicId: string, userId: string): Promise<TopicFavorite | null> {
    const result = await query(
      `INSERT INTO topic_favorites (topic_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (topic_id, user_id) DO NOTHING
       RETURNING *`,
      [topicId, userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  },

  async remove(topicId: string, userId: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM topic_favorites WHERE topic_id = $1 AND user_id = $2`,
      [topicId, userId]
    );

    return result.rowCount !== null && result.rowCount > 0;
  },

  async isFavorite(topicId: string, userId: string): Promise<boolean> {
    const result = await query(
      `SELECT 1 FROM topic_favorites WHERE topic_id = $1 AND user_id = $2 LIMIT 1`,
      [topicId, userId]
    );

    return result.rows.length > 0;
  },

  async getUserFavorites(userId: string): Promise<string[]> {
    const result = await query(
      `SELECT topic_id FROM topic_favorites WHERE user_id = $1`,
      [userId]
    );

    return result.rows.map((row) => row.topic_id);
  },
};
