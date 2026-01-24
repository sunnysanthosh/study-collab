import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TopicFavoriteModel } from '../src/models/TopicFavorite';

vi.mock('../src/db/connection', () => ({
  query: vi.fn(),
}));

describe('TopicFavoriteModel', () => {
  const topicId = 'topic-1';
  const userId = 'user-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds a favorite and returns row', async () => {
    const { query } = await import('../src/db/connection');
    (query as any).mockResolvedValue({ rows: [{ topic_id: topicId, user_id: userId }] });

    const result = await TopicFavoriteModel.add(topicId, userId);

    expect(result).toEqual({ topic_id: topicId, user_id: userId });
  });

  it('returns null when favorite already exists', async () => {
    const { query } = await import('../src/db/connection');
    (query as any).mockResolvedValue({ rows: [] });

    const result = await TopicFavoriteModel.add(topicId, userId);

    expect(result).toBeNull();
  });

  it('removes a favorite and returns true when deleted', async () => {
    const { query } = await import('../src/db/connection');
    (query as any).mockResolvedValue({ rowCount: 1 });

    const result = await TopicFavoriteModel.remove(topicId, userId);

    expect(result).toBe(true);
  });

  it('returns favorite ids for user', async () => {
    const { query } = await import('../src/db/connection');
    (query as any).mockResolvedValue({ rows: [{ topic_id: topicId }] });

    const result = await TopicFavoriteModel.getUserFavorites(userId);

    expect(result).toEqual([topicId]);
  });
});
