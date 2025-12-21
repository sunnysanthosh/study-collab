import { query } from '../db/connection';

export const addMemberToTopic = async (topicId: string, userId: string): Promise<boolean> => {
  try {
    const result = await query(
      `INSERT INTO topic_members (topic_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (topic_id, user_id) DO NOTHING
       RETURNING *`,
      [topicId, userId]
    );
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error adding member to topic:', error);
    return false;
  }
};

export const isMemberOfTopic = async (topicId: string, userId: string): Promise<boolean> => {
  const result = await query(
    `SELECT 1 FROM topic_members WHERE topic_id = $1 AND user_id = $2 LIMIT 1`,
    [topicId, userId]
  );
  
  return result.rows.length > 0;
};

