import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMessages, postMessage, addReaction } from '../src/controllers/messageController';

vi.mock('../src/models/Message', () => ({
  createMessage: vi.fn(),
  getMessagesByTopic: vi.fn(),
  getMessageById: vi.fn(),
  updateMessage: vi.fn(),
  deleteMessage: vi.fn(),
}));

vi.mock('../src/models/MessageReaction', () => ({
  MessageReactionModel: {
    create: vi.fn(),
    getByMessageId: vi.fn(),
    getReactionCounts: vi.fn(),
  },
}));

vi.mock('../src/models/Notification', () => ({
  NotificationModel: {
    create: vi.fn(),
  },
}));

vi.mock('../src/models/TopicMember', () => ({
  getTopicMembers: vi.fn(),
}));

vi.mock('../src/models/Topic', () => ({
  getTopicById: vi.fn(),
}));

vi.mock('../src/utils/logger', () => ({
  logError: vi.fn(),
}));

const mockResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('messageController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns messages with reactions in ascending order', async () => {
    const { getMessagesByTopic } = await import('../src/models/Message');
    const { MessageReactionModel } = await import('../src/models/MessageReaction');

    (getMessagesByTopic as any).mockResolvedValue([
      { id: 'm1', content: 'First' },
      { id: 'm2', content: 'Second' },
    ]);
    (MessageReactionModel.getByMessageId as any)
      .mockResolvedValueOnce([{ emoji: '👍' }])
      .mockResolvedValueOnce([]);
    (MessageReactionModel.getReactionCounts as any).mockResolvedValue({
      m1: { '👍': 1 },
      m2: {},
    });

    const req: any = { params: { topicId: 't1' }, query: { limit: '50', offset: '0' } };
    const res = mockResponse();

    await getMessages(req, res);

    expect(res.json).toHaveBeenCalledWith({
      messages: [
        expect.objectContaining({ id: 'm2' }),
        expect.objectContaining({ id: 'm1', reaction_counts: { '👍': 1 } }),
      ],
    });
  });

  it('rejects posting without auth or content', async () => {
    const res = mockResponse();

    await postMessage({ params: { topicId: 't1' }, body: { content: 'Hi' } } as any, res);
    expect(res.status).toHaveBeenCalledWith(401);

    const authedRes = mockResponse();
    await postMessage(
      { params: { topicId: 't1' }, body: { content: '  ' }, user: { userId: 'u1' } } as any,
      authedRes
    );
    expect(authedRes.status).toHaveBeenCalledWith(400);
  });

  it('posts message and creates notifications for other members', async () => {
    const { createMessage } = await import('../src/models/Message');
    const { getTopicMembers } = await import('../src/models/TopicMember');
    const { getTopicById } = await import('../src/models/Topic');
    const { NotificationModel } = await import('../src/models/Notification');

    (createMessage as any).mockResolvedValue({ id: 'm1' });
    (getTopicById as any).mockResolvedValue({ title: 'Physics' });
    (getTopicMembers as any).mockResolvedValue([
      { user_id: 'u1' },
      { user_id: 'u2' },
      { user_id: 'u3' },
    ]);

    const req: any = {
      params: { topicId: 't1' },
      body: { content: 'Hello everyone' },
      user: { userId: 'u1' },
    };
    const res = mockResponse();

    await postMessage(req, res);

    expect(NotificationModel.create).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('adds reaction and notifies message owner', async () => {
    const { MessageReactionModel } = await import('../src/models/MessageReaction');
    const { getMessageById } = await import('../src/models/Message');
    const { NotificationModel } = await import('../src/models/Notification');

    (MessageReactionModel.create as any).mockResolvedValue({ id: 'r1' });
    (getMessageById as any).mockResolvedValue({ user_id: 'owner', topic_id: 't1' });

    const req: any = {
      params: { messageId: 'm1' },
      body: { emoji: '🔥' },
      user: { userId: 'reactor' },
    };
    const res = mockResponse();

    await addReaction(req, res);

    expect(NotificationModel.create).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'owner',
      type: 'reaction',
    }));
  });
});
