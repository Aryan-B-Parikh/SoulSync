/**
 * Tests for AI Service
 */

const { generateResponse, validateMessages } = require('../../server/services/aiService');
const fetch = require('node-fetch');

jest.mock('node-fetch');

describe('AI Service', () => {
  describe('validateMessages', () => {
    it('validates correct message format', () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' },
      ];

      expect(validateMessages(messages)).toBe(true);
    });

    it('rejects empty array', () => {
      expect(validateMessages([])).toBe(false);
    });

    it('rejects non-array input', () => {
      expect(validateMessages('not an array')).toBe(false);
      expect(validateMessages(null)).toBe(false);
      expect(validateMessages(undefined)).toBe(false);
    });

    it('rejects messages without role', () => {
      const messages = [{ content: 'Hello' }];
      expect(validateMessages(messages)).toBe(false);
    });

    it('rejects messages without content', () => {
      const messages = [{ role: 'user' }];
      expect(validateMessages(messages)).toBe(false);
    });

    it('rejects messages with wrong types', () => {
      const messages = [
        { role: 123, content: 'Hello' }
      ];
      expect(validateMessages(messages)).toBe(false);
    });
  });

  describe('generateResponse', () => {
    const mockConfig = {
      groqApiKey: 'test-api-key',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('generates response from Groq API', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          choices: [
            { message: { content: 'AI response' } }
          ]
        })
      };

      fetch.mockResolvedValue(mockResponse);

      const messages = [{ role: 'user', content: 'Hello' }];
      const response = await generateResponse(messages, mockConfig);

      expect(response).toBe('AI response');
      expect(fetch).toHaveBeenCalledWith(
        'https://api.groq.com/openai/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key'
          })
        })
      );
    });

    it('handles API errors', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({
          error: { message: 'API error' }
        })
      };

      fetch.mockResolvedValue(mockResponse);

      const messages = [{ role: 'user', content: 'Hello' }];

      await expect(generateResponse(messages, mockConfig))
        .rejects
        .toThrow('API error');
    });

    it('returns default message when response is empty', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          choices: []
        })
      };

      fetch.mockResolvedValue(mockResponse);

      const messages = [{ role: 'user', content: 'Hello' }];
      const response = await generateResponse(messages, mockConfig);

      expect(response).toBe("I'm pondering that... 🧘‍♀️");
    });

    it('throws error when no API keys configured', async () => {
      const emptyConfig = {};
      const messages = [{ role: 'user', content: 'Hello' }];

      await expect(generateResponse(messages, emptyConfig))
        .rejects
        .toThrow('No API keys configured');
    });
  });
});
