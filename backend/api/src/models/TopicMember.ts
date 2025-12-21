import { query } from '../db/connection';

export interface TopicMember {
  topic_id: string;
  user_id: string;
  joined_at: Date;
}

export const addMemberToTopic = async (topicId: string, userId: string): Promise<TopicMember> => {
  const result = await query(
    `INSERT INTO topic_members (topic_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT (topic_id, user_id) DO NOTHING
     RETURNING *`,
    [topicId, userId]
  );
  
  if (result.rows.length === 0) {
    // User already a member, return existing
    const existing = await query(
      `SELECT * FROM topic_members WHERE topic_id = $1 AND user_id = $2`,
      [topicId, userId]
    );
    return existing.rows[0];
  }
  
  return result.rows[0];
};

export const removeMemberFromTopic = async (topicId: string, userId: string): Promise<boolean> => {
  const result = await query(
    `DELETE FROM topic_members WHERE topic_id = $1 AND user_id = $2`,
    [topicId, userId]
  );
  
  return result.rowCount !== null && result.rowCount > 0;
};

export const getTopicMembers = async (topicId: string) => {
  const result = await query(
    `SELECT 
       tm.topic_id,
       tm.user_id,
       tm.joined_at,
       u.name as user_name,
       u.avatar_url as user_avatar,
       u.email as user_email
     FROM topic_members tm
     LEFT JOIN users u ON tm.user_id = u.id
     WHERE tm.topic_id = $1
     ORDER BY tm.joined_at ASC`,
    [topicId]
  );
  
  return result.rows;
};

export const isMemberOfTopic = async (topicId: string, userId: string): Promise<boolean> => {
  const result = await query(
    `SELECT 1 FROM topic_members WHERE topic_id = $1 AND user_id = $2 LIMIT 1`,
    [topicId, userId]
  );
  
  return result.rows.length > 0;
};

