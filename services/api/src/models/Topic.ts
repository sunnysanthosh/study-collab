import { query } from '../db/connection';

export interface Topic {
  id: string;
  title: string;
  description?: string;
  category?: string;
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
  category?: string;
  subject?: string;
  difficulty?: string;
  tags?: string[];
  created_by: string;
}

export const createTopic = async (topicData: CreateTopicData): Promise<Topic> => {
  const result = await query(
    `INSERT INTO topics (title, description, category, subject, difficulty, tags, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      topicData.title,
      topicData.description || null,
      topicData.category || null,
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
  category?: string;
  subject?: string;
  difficulty?: string;
  search?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  sort?: 'created_at' | 'title' | 'popularity';
  order?: 'asc' | 'desc';
  createdFrom?: string;
  createdTo?: string;
}): Promise<Topic[]> => {
  let sql = 'SELECT * FROM topics WHERE 1=1';
  const params: any[] = [];
  let paramCount = 1;
  
  if (filters?.subject) {
    sql += ` AND subject = $${paramCount++}`;
    params.push(filters.subject);
  }

  if (filters?.category) {
    sql += ` AND category = $${paramCount++}`;
    params.push(filters.category);
  }
  
  if (filters?.difficulty) {
    sql += ` AND difficulty = $${paramCount++}`;
    params.push(filters.difficulty);
  }
  
  if (filters?.search) {
    sql += ` AND (
      to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')) @@ plainto_tsquery('english', $${paramCount})
      OR title ILIKE $${paramCount + 1}
      OR description ILIKE $${paramCount + 1}
    )`;
    params.push(filters.search);
    params.push(`%${filters.search}%`);
    paramCount += 2;
  }

  if (filters?.tags && filters.tags.length > 0) {
    sql += ` AND tags && $${paramCount}::text[]`;
    params.push(filters.tags);
    paramCount++;
  }

  const sortOrder = filters?.order === 'asc' ? 'ASC' : 'DESC';
  if (filters?.createdFrom) {
    sql += ` AND created_at >= $${paramCount++}`;
    params.push(filters.createdFrom);
  }

  if (filters?.createdTo) {
    sql += ` AND created_at <= $${paramCount++}`;
    params.push(filters.createdTo);
  }

  if (filters?.sort === 'popularity') {
    sql += ` ORDER BY (SELECT COUNT(*) FROM topic_favorites tf WHERE tf.topic_id = topics.id) ${sortOrder}`;
  } else {
    const sortColumn = filters?.sort === 'title' ? 'title' : 'created_at';
    sql += ` ORDER BY ${sortColumn} ${sortOrder}`;
  }

  const limit = filters?.limit ?? 50;
  const offset = filters?.offset ?? 0;
  sql += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);
  
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

  if (updates.category) {
    fields.push(`category = $${paramCount++}`);
    values.push(updates.category);
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

export interface AdminTopicRow {
  id: string;
  title: string;
  created_at: Date;
  creator_name: string | null;
  member_count: string;
  message_count: string;
}

export const getAdminTopicList = async (limit = 50, offset = 0): Promise<AdminTopicRow[]> => {
  const result = await query(
    `SELECT t.id, t.title, t.created_at, u.name AS creator_name,
        (SELECT COUNT(*)::text FROM topic_members tm WHERE tm.topic_id = t.id) AS member_count,
        (SELECT COUNT(*)::text FROM messages m WHERE m.topic_id = t.id) AS message_count
     FROM topics t
     LEFT JOIN users u ON t.created_by = u.id
     ORDER BY t.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
};

