/**
 * Chat Persistence Integration Tests
 * Tests for chat CRUD and messaging with history
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server/index');
const User = require('../../server/models/user.model');
const Chat = require('../../server/models/chat.model');
const Message = require('../../server/models/message.model');
const { connectDB, disconnectDB } = require('../../server/config/database');

describe('Chat Persistence Endpoints', () => {
  let token;
  let userId;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Chat.deleteMany({});
    await Message.deleteMany({});

    // Create test user and get token
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    token = res.body.token;
    userId = res.body.user._id;
  });

  describe('POST /api/chats', () => {
    it('should create a new chat with default title', async () => {
      const res = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(201);
      expect(res.body.chat).toHaveProperty('_id');
      expect(res.body.chat).toHaveProperty('title', 'New Conversation');
      expect(res.body.chat).toHaveProperty('userId', userId);
    });

    it('should create a new chat with custom title', async () => {
      const res = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'My Custom Chat' });

      expect(res.status).toBe(201);
      expect(res.body.chat).toHaveProperty('title', 'My Custom Chat');
    });

    it('should fail without authentication', async () => {
      const res = await request(app).post('/api/chats').send({});

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/chats', () => {
    beforeEach(async () => {
      // Create multiple chats
      await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Chat 1' });

      await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Chat 2' });
    });

    it('should get all user chats', async () => {
      const res = await request(app)
        .get('/api/chats')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.chats).toHaveLength(2);
    });

    it('should return empty array for user with no chats', async () => {
      // Create new user
      const newUserRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
        });

      const res = await request(app)
        .get('/api/chats')
        .set('Authorization', `Bearer ${newUserRes.body.token}`);

      expect(res.status).toBe(200);
      expect(res.body.chats).toHaveLength(0);
    });
  });

  describe('GET /api/chats/:chatId', () => {
    let chatId;

    beforeEach(async () => {
      const chatRes = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Chat' });
      chatId = chatRes.body.chat._id;

      // Add some messages
      await request(app)
        .post(`/api/chats/${chatId}/messages`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Hello' });
    });

    it('should get chat with messages', async () => {
      const res = await request(app)
        .get(`/api/chats/${chatId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.chat).toHaveProperty('title', 'Test Chat');
      expect(res.body.messages).toBeDefined();
      expect(res.body.messages.length).toBeGreaterThan(0);
    });

    it('should fail with invalid chat ID', async () => {
      const res = await request(app)
        .get('/api/chats/invalid-id')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
    });

    it('should fail when accessing another user\'s chat', async () => {
      // Create new user
      const newUserRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
        });

      const res = await request(app)
        .get(`/api/chats/${chatId}`)
        .set('Authorization', `Bearer ${newUserRes.body.token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/chats/:chatId/messages', () => {
    let chatId;

    beforeEach(async () => {
      const chatRes = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      chatId = chatRes.body.chat._id;
    });

    it('should send message and get AI response', async () => {
      const res = await request(app)
        .post(`/api/chats/${chatId}/messages`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Hello, how are you?' });

      expect(res.status).toBe(200);
      expect(res.body.userMessage).toHaveProperty('content', 'Hello, how are you?');
      expect(res.body.userMessage).toHaveProperty('role', 'user');
      expect(res.body.assistantMessage).toHaveProperty('role', 'assistant');
      expect(res.body.assistantMessage).toHaveProperty('content');
      expect(res.body.chat).toBeDefined();
    });

    it('should auto-generate title from first message', async () => {
      const res = await request(app)
        .post(`/api/chats/${chatId}/messages`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'What is the meaning of life?' });

      expect(res.status).toBe(200);
      expect(res.body.chat.title).not.toBe('New Conversation');
    });

    it('should fail with empty message', async () => {
      const res = await request(app)
        .post(`/api/chats/${chatId}/messages`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/chats/:chatId', () => {
    let chatId;

    beforeEach(async () => {
      const chatRes = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Chat' });
      chatId = chatRes.body.chat._id;

      // Add message
      await request(app)
        .post(`/api/chats/${chatId}/messages`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Hello' });
    });

    it('should delete chat and messages', async () => {
      const res = await request(app)
        .delete(`/api/chats/${chatId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);

      // Verify chat is deleted
      const getRes = await request(app)
        .get(`/api/chats/${chatId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getRes.status).toBe(404);

      // Verify messages are deleted
      const messages = await Message.find({ chatId });
      expect(messages).toHaveLength(0);
    });

    it('should fail when deleting another user\'s chat', async () => {
      // Create new user
      const newUserRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
        });

      const res = await request(app)
        .delete(`/api/chats/${chatId}`)
        .set('Authorization', `Bearer ${newUserRes.body.token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('Message History and Continuity', () => {
    let chatId;

    beforeEach(async () => {
      const chatRes = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'History Test' });
      chatId = chatRes.body.chat._id;
    });

    it('should maintain conversation context across messages', async () => {
      // First message
      await request(app)
        .post(`/api/chats/${chatId}/messages`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'My name is Alice' });

      // Second message referencing first
      const res = await request(app)
        .post(`/api/chats/${chatId}/messages`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'What is my name?' });

      expect(res.status).toBe(200);
      // AI should remember the name from context
    });

    it('should retrieve full message history', async () => {
      // Send multiple messages
      await request(app)
        .post(`/api/chats/${chatId}/messages`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Message 1' });

      await request(app)
        .post(`/api/chats/${chatId}/messages`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Message 2' });

      await request(app)
        .post(`/api/chats/${chatId}/messages`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Message 3' });

      // Get chat with history
      const res = await request(app)
        .get(`/api/chats/${chatId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.messages.length).toBeGreaterThanOrEqual(6); // 3 user + 3 assistant
    });
  });
});
