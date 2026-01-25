import { describe, it, expect, vi } from 'vitest';
import { getAllTopics } from '../src/models/Topic';

vi.mock('../src/db/connection', () => ({
  query: vi.fn(),
}));

describe('Topic model search filters', () => {
  it('builds search, date, and popularity filters', async () => {
    const { query } = await import('../src/db/connection');
    (query as any).mockResolvedValue({ rows: [] });

    await getAllTopics({
      search: 'calculus',
      subject: 'Math',
      difficulty: 'Beginner',
      createdFrom: '2026-01-01',
      createdTo: '2026-01-31',
      sort: 'popularity',
      order: 'desc',
    });

    const sql = (query as any).mock.calls[0][0] as string;
    expect(sql).toContain('to_tsvector');
    expect(sql).toContain('created_at >=');
    expect(sql).toContain('created_at <=');
    expect(sql).toContain('topic_favorites');
  });
});
