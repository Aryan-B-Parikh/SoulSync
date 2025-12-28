# API Documentation

## Base URL

- **Development**: `http://localhost:5001/api`
- **Production**: `https://your-domain.vercel.app/api`

## Authentication

Currently, the API does not require authentication. API keys are managed server-side through environment variables.

## Rate Limiting

- **Window**: 15 minutes
- **Limit**: 100 requests per IP address
- **Headers**: 
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: ISO timestamp when limit resets

When rate limit is exceeded:
```json
HTTP 429 Too Many Requests
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 900
}
```

## Endpoints

### 1. Send Chat Message

Send a message and receive an AI-generated response.

**Endpoint**: `POST /api/chat`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What is the meaning of life?"
    }
  ]
}
```

**Parameters**:
- `messages` (array, required): Conversation history
  - Each message must have:
    - `role` (string): Either "user" or "assistant"
    - `content` (string): Message text (max 2000 characters)

**Success Response**:
```json
HTTP 200 OK
{
  "message": "The meaning of life is a profound question..."
}
```

**Error Responses**:

```json
HTTP 400 Bad Request
{
  "error": "Invalid request: messages array is required"
}
```

```json
HTTP 500 Internal Server Error
{
  "error": "AI service temporarily unavailable"
}
```

**Example**:
```javascript
const response = await fetch('http://localhost:5001/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Hello, SoulSync!' }
    ]
  })
});

const data = await response.json();
console.log(data.message);
```

---

### 2. Chat with Fallback

Same as `/api/chat` but with automatic fallback to mock responses if the AI service fails.

**Endpoint**: `POST /api/chat-fallback`

**Request/Response**: Same format as `/api/chat`

**Behavior**:
1. Attempts to call the AI service
2. If AI service fails, returns a predefined mock response
3. Useful for development and testing

**Example Mock Responses**:
- "I hear you, dear soul. Sometimes the quietest moments hold the deepest wisdom. 🌙"
- "Your thoughts are like ripples on still water - each one matters. Tell me more. 💭"
- "In the garden of consciousness, every feeling is a flower worthy of attention. 🌸"

---

### 3. Health Check

Check if the API is running and responsive.

**Endpoint**: `GET /api/health`

**Success Response**:
```json
HTTP 200 OK
{
  "status": "healthy",
  "timestamp": "2025-12-28T10:30:00.000Z",
  "uptime": 3600.5
}
```

**Parameters**: None

**Example**:
```bash
curl http://localhost:5001/api/health
```

---

### 4. Root Endpoint

Get API information and available endpoints.

**Endpoint**: `GET /`

**Success Response**:
```json
HTTP 200 OK
{
  "name": "SoulSync AI API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "chat": "POST /api/chat",
    "chatFallback": "POST /api/chat-fallback",
    "health": "GET /api/health"
  }
}
```

---

## Message Format

### Conversation Structure

The API maintains conversation context by accepting an array of messages. Each message represents either user input or AI response.

**Example Conversation**:
```json
{
  "messages": [
    { "role": "user", "content": "What is mindfulness?" },
    { "role": "assistant", "content": "Mindfulness is the practice of being present..." },
    { "role": "user", "content": "How do I practice it?" }
  ]
}
```

### Role Types

- **`user`**: Human input
- **`assistant`**: AI-generated responses
- **`system`**: System prompts (handled server-side, not accepted in API)

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Human-readable error message"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid request format or parameters |
| 404 | Not Found | Endpoint doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server or AI service error |

---

## Input Validation

### Message Validation Rules

1. **Messages array**:
   - Must be an array
   - Cannot be empty
   - Each message must be an object

2. **Individual messages**:
   - Must have `role` and `content` properties
   - `role` must be "user" or "assistant"
   - `content` must be a string

3. **Content sanitization**:
   - Control characters removed
   - Maximum length: 2000 characters
   - Leading/trailing whitespace trimmed

### Invalid Request Examples

```json
// Missing messages
{
  "error": "Invalid request: messages array is required"
}

// Empty messages
{
  "messages": []
}
// Returns: "Invalid request: messages array cannot be empty"

// Invalid role
{
  "messages": [
    { "role": "admin", "content": "test" }
  ]
}
// Returns: "Invalid message role"
```

---

## AI Service Configuration

### System Prompt

The AI is configured with this system prompt:

> "You're SoulSync, a sophisticated AI confidante — wise, thoughtful, calm, and caring. Respond with empathy, depth, and poetic insight. Keep responses thoughtful but concise."

### Model Parameters

- **Model**: `llama3-8b-8192` (Groq)
- **Max Tokens**: 500
- **Temperature**: 0.7
- **Top P**: Default (not specified)

---

## Client Library Example

### JavaScript/TypeScript

```javascript
class SoulSyncAPI {
  constructor(baseURL = 'http://localhost:5001/api') {
    this.baseURL = baseURL;
  }

  async sendMessage(messages) {
    const response = await fetch(`${this.baseURL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return await response.json();
  }

  async health() {
    const response = await fetch(`${this.baseURL}/health`);
    return await response.json();
  }
}

// Usage
const api = new SoulSyncAPI();
const result = await api.sendMessage([
  { role: 'user', content: 'Hello!' }
]);
console.log(result.message);
```

### Python

```python
import requests

class SoulSyncAPI:
    def __init__(self, base_url="http://localhost:5001/api"):
        self.base_url = base_url
    
    def send_message(self, messages):
        response = requests.post(
            f"{self.base_url}/chat",
            json={"messages": messages}
        )
        response.raise_for_status()
        return response.json()
    
    def health(self):
        response = requests.get(f"{self.base_url}/health")
        return response.json()

# Usage
api = SoulSyncAPI()
result = api.send_message([
    {"role": "user", "content": "Hello!"}
])
print(result["message"])
```

---

## Best Practices

1. **Always handle errors**: Check response status and parse error messages
2. **Respect rate limits**: Implement exponential backoff for retries
3. **Keep conversations focused**: Send only relevant message history
4. **Validate input client-side**: Check message format before sending
5. **Use fallback endpoint**: For non-critical flows where mock responses are acceptable
6. **Monitor health**: Periodically check `/api/health` endpoint
7. **Timeout requests**: Set reasonable timeout values (30s recommended)

---

## Changelog

### Version 2.0.0 (Current)
- Complete refactor with modular architecture
- Added rate limiting
- Improved error handling
- Added health check endpoint
- Enhanced input validation

### Version 1.0.0
- Initial release
- Basic chat functionality
- Groq AI integration

---

For implementation details, see the [Architecture Documentation](ARCHITECTURE.md).
