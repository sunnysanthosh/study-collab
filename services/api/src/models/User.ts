import { query } from '../db/connection';
import { hashPassword, comparePassword } from '../utils/password';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  avatar_url?: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  avatar_url?: string;
}

export const createUser = async (userData: CreateUserData): Promise<User> => {
  const passwordHash = await hashPassword(userData.password);
  
  const result = await query(
    `INSERT INTO users (name, email, password_hash, avatar_url)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, avatar_url, role, created_at, updated_at`,
    [userData.name, userData.email, passwordHash, userData.avatar_url || null]
  );
  
  return result.rows[0];
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const result = await query(
    `SELECT id, name, email, password_hash, avatar_url, role, created_at, updated_at
     FROM users
     WHERE email = $1`,
    [email]
  );
  
  return result.rows[0] || null;
};

export const getUserById = async (id: string): Promise<User | null> => {
  const result = await query(
    `SELECT id, name, email, avatar_url, role, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [id]
  );
  
  return result.rows[0] || null;
};

export const updateUser = async (id: string, updates: Partial<CreateUserData>): Promise<User> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;
  
  if (updates.name) {
    fields.push(`name = $${paramCount++}`);
    values.push(updates.name);
  }
  
  if (updates.email) {
    fields.push(`email = $${paramCount++}`);
    values.push(updates.email);
  }
  
  if (updates.password) {
    const passwordHash = await hashPassword(updates.password);
    fields.push(`password_hash = $${paramCount++}`);
    values.push(passwordHash);
  }
  
  if (updates.avatar_url !== undefined) {
    fields.push(`avatar_url = $${paramCount++}`);
    values.push(updates.avatar_url);
  }
  
  if (fields.length === 0) {
    throw new Error('No fields to update');
  }
  
  values.push(id);
  
  const result = await query(
    `UPDATE users
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${paramCount}
     RETURNING id, name, email, avatar_url, role, created_at, updated_at`,
    values
  );
  
  return result.rows[0];
};

export interface AdminUserUpdate {
  name?: string;
  email?: string;
  role?: 'user' | 'admin';
}

export const adminUpdateUser = async (id: string, updates: AdminUserUpdate): Promise<User> => {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (updates.name !== undefined && updates.name.trim()) {
    fields.push(`name = $${paramCount++}`);
    values.push(updates.name.trim());
  }
  if (updates.email !== undefined && updates.email.trim()) {
    fields.push(`email = $${paramCount++}`);
    values.push(updates.email.trim());
  }
  if (updates.role !== undefined && (updates.role === 'user' || updates.role === 'admin')) {
    fields.push(`role = $${paramCount++}`);
    values.push(updates.role);
  }
  if (fields.length === 0) throw new Error('No fields to update');

  values.push(id);
  const result = await query(
    `UPDATE users SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${paramCount}
     RETURNING id, name, email, avatar_url, role, created_at, updated_at`,
    values
  );
  return result.rows[0];
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const result = await query('DELETE FROM users WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
};

export const countUsersByRole = async (role: string): Promise<number> => {
  const r = await query('SELECT COUNT(*) AS count FROM users WHERE role = $1', [role]);
  return parseInt(r.rows[0]?.count as string, 10) || 0;
};

export const verifyUserPassword = async (email: string, password: string): Promise<User | null> => {
  const user = await getUserByEmail(email);
  
  if (!user || !user.password_hash) {
    return null;
  }
  
  const isValid = await comparePassword(password, user.password_hash);
  
  if (!isValid) {
    return null;
  }
  
  // Return user without password hash
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword as User;
};

