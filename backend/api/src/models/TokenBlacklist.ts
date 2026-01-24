import crypto from 'crypto';
import pool from '../db/connection';

type TokenType = 'access' | 'refresh';

const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const blacklistToken = async (
  token: string,
  tokenType: TokenType,
  expiresAt?: Date
): Promise<void> => {
  const tokenHash = hashToken(token);
  await pool.query(
    `INSERT INTO token_blacklist (token_hash, token_type, expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (token_hash) DO NOTHING`,
    [tokenHash, tokenType, expiresAt || null]
  );
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const tokenHash = hashToken(token);
  const result = await pool.query(
    `SELECT 1
     FROM token_blacklist
     WHERE token_hash = $1
       AND (expires_at IS NULL OR expires_at > NOW())
     LIMIT 1`,
    [tokenHash]
  );
  return result.rowCount > 0;
};

export const cleanupExpiredTokens = async (): Promise<void> => {
  await pool.query(
    `DELETE FROM token_blacklist WHERE expires_at IS NOT NULL AND expires_at <= NOW()`
  );
};
