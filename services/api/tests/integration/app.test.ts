import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

vi.mock('../../src/models/User', () => ({
  verifyUserPassword: vi.fn().mockResolvedValue({
    id: 'u1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
  }),
}));

vi.mock('../../src/utils/jwt', () => ({
  generateAccessToken: vi.fn(() => 'access-token'),
  generateRefreshToken: vi.fn(() => 'refresh-token'),
}));

import app from '../../src/app';

describe('app integration', () => {
  it('responds to health check', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('logs in via auth route', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Password1' });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBe('access-token');
    expect(res.body.refreshToken).toBe('refresh-token');
  });
});
