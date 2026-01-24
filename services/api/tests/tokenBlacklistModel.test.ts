import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import { blacklistToken, isTokenBlacklisted, cleanupExpiredTokens } from '../src/models/TokenBlacklist';

vi.mock('../src/db/connection', () => ({
  default: {
    query: vi.fn(),
  },
}));

describe('TokenBlacklist model', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blacklists tokens with hashed value', async () => {
    const pool = (await import('../src/db/connection')).default as any;
    const token = 'token-123';
    const hash = crypto.createHash('sha256').update(token).digest('hex');

    await blacklistToken(token, 'access');

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO token_blacklist'),
      [hash, 'access', null]
    );
  });

  it('returns true when token is blacklisted', async () => {
    const pool = (await import('../src/db/connection')).default as any;
    pool.query.mockResolvedValueOnce({ rowCount: 1 });

    const result = await isTokenBlacklisted('token-abc');

    expect(result).toBe(true);
  });

  it('cleans up expired tokens', async () => {
    const pool = (await import('../src/db/connection')).default as any;

    await cleanupExpiredTokens();

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM token_blacklist')
    );
  });
});
