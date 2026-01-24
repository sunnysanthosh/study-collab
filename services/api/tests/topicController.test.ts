import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFavorites, addFavorite, removeFavorite } from '../src/controllers/topicController';

vi.mock('../src/models/TopicFavorite', () => ({
  TopicFavoriteModel: {
    getUserFavorites: vi.fn(),
    add: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock('../src/models/Topic', () => ({
  getTopicById: vi.fn(),
}));

const mockResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('topicController favorites', () => {
  const userId = 'user-123';
  const topicId = 'topic-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns favorite ids for authenticated user', async () => {
    const { TopicFavoriteModel } = await import('../src/models/TopicFavorite');
    (TopicFavoriteModel.getUserFavorites as any).mockResolvedValue([topicId]);

    const req: any = { user: { userId } };
    const res = mockResponse();

    await getFavorites(req, res);

    expect(res.json).toHaveBeenCalledWith({ favorites: [topicId] });
  });

  it('adds a favorite when topic exists', async () => {
    const { getTopicById } = await import('../src/models/Topic');
    const { TopicFavoriteModel } = await import('../src/models/TopicFavorite');

    (getTopicById as any).mockResolvedValue({ id: topicId });
    (TopicFavoriteModel.add as any).mockResolvedValue({ topic_id: topicId, user_id: userId });

    const req: any = { params: { id: topicId }, user: { userId } };
    const res = mockResponse();

    await addFavorite(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: 'Topic favorited' });
  });

  it('removes a favorite for authenticated user', async () => {
    const { TopicFavoriteModel } = await import('../src/models/TopicFavorite');
    (TopicFavoriteModel.remove as any).mockResolvedValue(true);

    const req: any = { params: { id: topicId }, user: { userId } };
    const res = mockResponse();

    await removeFavorite(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: 'Topic unfavorited' });
  });
});
