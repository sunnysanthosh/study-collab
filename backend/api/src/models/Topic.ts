import { query } from '../db/connection';

export interface Topic {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  difficulty?: string;
  tags?: string[];
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTopicData {
  title: string;
  description?: string;
  subject?: string;
  difficulty?: string;
  tags?: string[];
  created_by: string;
}

export const createTopic = async (topicData: CreateTopicData): Promise<Topic> => {
  const result = await query(
    `INSERT INTO topics (title, description, subject, difficulty, tags, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      topicData.title,
      topicData.description || null,
      topicData.subject || null,
      topicData.difficulty || null,
      topicData.tags || [],
      topicData.created_by,
    ]
  );
  
  return result.rows[0];
};

export const getTopicById = async (id: string): Promise<Topic | null> => {
  const result = await query(
    `SELECT * FROM topics WHERE id = $1`,
    [id]
  );
  
  return result.rows[0] || null;
};

export const getAllTopics = async (filters?: {
  subject?: string;
  difficulty?: string;
  search?: string;
}): Promise<Topic[]> => {
  let sql = 'SELECT * FROM topics WHERE 1=1';
  const params: any[] = [];
  let paramCount = 1;
  
  if (filters?.subject) {
    sql += ` AND subject = $${paramCount++}`;
    params.push(filters.subject);
  }
  
  if (filters?.difficulty) {
    sql += ` AND difficulty = $${paramCount++}`;
    params.push(filters.difficulty);
  }
  
  if (filters?.search) {
    sql += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
    params.push(`%${filters.search}%`);
    paramCount++;
  }
  
  sql += ' ORDER BY created_at DESC';
  
  const result = await query(sql, params);
  return result.rows;
};

export const updateTopic = async (id: string, updates: Partial<CreateTopicData>): Promise<Topic> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;
  
  if (updates.title) {
    fields.push(`title = $${paramCount++}`);
    values.push(updates.title);
  }
  
  if (updates.description !== undefined) {
    fields.push(`description = $${paramCount++}`);
    values.push(updates.description);
  }
  
  if (updates.subject) {
    fields.push(`subject = $${paramCount++}`);
    values.push(updates.subject);
  }
  
  if (updates.difficulty) {
    fields.push(`difficulty = $${paramCount++}`);
    values.push(updates.difficulty);
  }
  
  if (updates.tags) {
    fields.push(`tags = $${paramCount++}`);
    values.push(updates.tags);
  }
  
  if (fields.length === 0) {
    throw new Error('No fields to update');
  }
  
  values.push(id);
  
  const result = await query(
    `UPDATE topics
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${paramCount}
     RETURNING *`,
    values
  );
  
  return result.rows[0];
};

export const deleteTopic = async (id: string): Promise<boolean> => {
  const result = await query(
    `DELETE FROM topics WHERE id = $1`,
    [id]
  );
  
  return result.rowCount !== null && result.rowCount > 0;
};

