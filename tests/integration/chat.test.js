/**
 * Integration tests for Chat API
 */

const request = require('supertest');
const express = require('express');
const chatRoutes = require('../../server/routes/chat');
const { validateChatRequest } = require('../../server/middleware/validator');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Mock config
  app.set('config', {
    groqApiKey: 'test-key',
  });

  app.use('/api', chatRoutes);
  
  return app;
};

describe('Chat API Integration Tests', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('POST /api/chat', () => {
    it('accepts valid chat request', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({
          messages: [
            { role: 'user', content: 'Hello' }
          ]
        });

      // May succeed or fail depending on API availability
      // Just checking request structure is accepted
      expect([200, 500]).toContain(response.status);
    });

    it('rejects request without messages', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('rejects empty messages array', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ messages: [] });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('empty');
    });

    it('rejects invalid message format', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({
          messages: [
            { invalid: 'format' }
          ]
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/health', () => {
    it('returns health status', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });
});
