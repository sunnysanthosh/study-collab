import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { ensureDockerDb, waitForDb, migrateAndSeed, resetDb, closeDb } from '../helpers/dbTestSetup';

const loginAndGetToken = async () => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@studycollab.com', password: 'Test1234!' });
  return response.body.accessToken as string;
};

describe('database integration', () => {
  beforeAll(async () => {
    await ensureDockerDb();
    await waitForDb();
    await migrateAndSeed();
  });

  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await closeDb();
  });

  it('creates topics and favorites with real DB', async () => {
    const token = await loginAndGetToken();

    const createTopic = await request(app)
      .post('/api/topics')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'DB Integration Topic',
        description: 'Created in integration test',
        category: 'Mathematics',
        subject: 'Math',
        difficulty: 'Beginner',
        tags: ['Test'],
      });

    expect(createTopic.status).toBe(201);
    const topicId = createTopic.body.topic?.id || createTopic.body.id;
    expect(topicId).toBeTruthy();

    const addFavorite = await request(app)
      .post(`/api/topics/${topicId}/favorite`)
      .set('Authorization', `Bearer ${token}`);
    expect(addFavorite.status).toBe(200);

    const removeFavorite = await request(app)
      .delete(`/api/topics/${topicId}/favorite`)
      .set('Authorization', `Bearer ${token}`);
    expect(removeFavorite.status).toBe(200);
  });

  it('creates and reads messages', async () => {
    const token = await loginAndGetToken();

    const topics = await request(app)
      .get('/api/topics')
      .set('Authorization', `Bearer ${token}`);
    expect(topics.status).toBe(200);

    const topicId = topics.body.topics?.[0]?.id;
    expect(topicId).toBeTruthy();

    const createMessage = await request(app)
      .post(`/api/messages/topic/${topicId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Integration test message' });
    expect(createMessage.status).toBe(201);

    const getMessages = await request(app)
      .get(`/api/messages/topic/${topicId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getMessages.status).toBe(200);
    expect(getMessages.body.messages?.length).toBeGreaterThan(0);
  });
});
