import { query } from '../db/connection';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

export const getUserById = async (id: string): Promise<User | null> => {
  const result = await query(
    `SELECT id, name, email, avatar_url
     FROM users
     WHERE id = $1`,
    [id]
  );
  
  return result.rows[0] || null;
};

