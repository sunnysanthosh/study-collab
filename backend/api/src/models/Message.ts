import { query } from '../db/connection';

export interface Message {
  id: string;
  topic_id: string;
  user_id: string;
  content: string;
  edited_at: Date | null;
  created_at: Date;
}

export interface MessageWithUser extends Message {
  user_name?: string;
  user_avatar?: string;
}

export interface CreateMessageData {
  topic_id: string;
  user_id: string;
  content: string;
}

export const createMessage = async (messageData: CreateMessageData): Promise<Message> => {
  const result = await query(
    `INSERT INTO messages (topic_id, user_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [messageData.topic_id, messageData.user_id, messageData.content]
  );
  
  return result.rows[0];
};

export const getMessagesByTopic = async (topicId: string, limit: number = 50, offset: number = 0): Promise<MessageWithUser[]> => {
  const result = await query(
    `SELECT 
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
     LIMIT $2 OFFSET $3`,
    [topicId, limit, offset]
  );
  
  return result.rows;
};

export const getMessageById = async (id: string): Promise<Message | null> => {
  const result = await query(
    `SELECT * FROM messages WHERE id = $1`,
    [id]
  );
  
  return result.rows[0] || null;
};

export const updateMessage = async (id: string, userId: string, content: string): Promise<Message | null> => {
  const result = await query(
    `UPDATE messages 
     SET content = $1, edited_at = NOW()
     WHERE id = $2 AND user_id = $3
     RETURNING *`,
    [content, id, userId]
  );
  
  return result.rows[0] || null;
};

export const deleteMessage = async (id: string, userId: string): Promise<boolean> => {
  const result = await query(
    `DELETE FROM messages WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  
  return result.rowCount !== null && result.rowCount > 0;
};

