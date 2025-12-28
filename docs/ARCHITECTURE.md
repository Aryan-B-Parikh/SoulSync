# SoulSync Architecture Documentation

## 🏗️ System Overview

SoulSync is built as a modern, full-stack web application with a clear separation between frontend (client) and backend (server) concerns. The architecture follows industry best practices for scalability, maintainability, and security.

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ HTTPS
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Client)                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Components │  │   Hooks    │  │   Utils    │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ REST API (JSON)
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express Backend (Server)                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Routes   │  │ Middleware │  │  Services  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ HTTP API
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Groq AI API (LLaMA3)                      │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Frontend Architecture

### Component Hierarchy

```
App.js (Root)
├── ErrorBoundary
│   ├── Hero
│   ├── Features
│   │   └── FeatureCard (×3)
│   ├── ChatWindow
│   │   ├── MessageBubble (×N)
│   │   └── LoadingIndicator
│   ├── MessageInput
│   └── Footer
```

### Data Flow

1. **User Input** → `MessageInput` component
2. **State Update** → `useChat` hook
3. **API Call** → `api.js` utility
4. **Server Request** → Express backend
5. **AI Response** → Back through the chain
6. **UI Update** → `ChatWindow` renders new message

### Key Design Patterns

- **Custom Hooks**: `useChat` encapsulates all chat logic
- **Component Composition**: Small, focused, reusable components
- **Error Boundaries**: Graceful failure handling at the root
- **Configuration Objects**: Centralized constants for easy maintenance

## ⚙️ Backend Architecture

### Layer Structure

```
┌─────────────────────────────────────┐
│           API Routes Layer          │
│      (chat.js - Endpoint logic)     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        Middleware Layer              │
│  (rateLimiter, validator, errors)   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Service Layer                │
│    (aiService - Business logic)     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         External APIs                │
│         (Groq, HuggingFace)         │
└─────────────────────────────────────┘
```

### Request Flow

1. **Incoming Request** → Express app
2. **CORS Check** → Allow cross-origin requests
3. **Rate Limiting** → Prevent abuse
4. **Route Matching** → Find correct handler
5. **Input Validation** → Sanitize & validate data
6. **Service Call** → AI service generates response
7. **Error Handling** → Catch and format errors
8. **Response** → Send JSON back to client

### Security Layers

1. **Environment Validation** - Ensures required vars exist
2. **Rate Limiting** - In-memory store tracks requests per IP
3. **Input Sanitization** - Removes control characters, limits length
4. **Error Handling** - Never exposes sensitive information
5. **API Key Security** - Stored in environment, never in code

## 🔄 State Management

### Client State

```javascript
useChat Hook State:
├── messages[]      // Conversation history
├── input          // Current user input
├── loading        // API request in progress
└── error          // Current error message
```

### Server State

- **Stateless API** - No session storage
- **Rate Limit Store** - In-memory Map (IP → request count)
- **Environment Config** - Loaded once at startup

## 📡 API Communication

### Request Format

```json
POST /api/chat
{
  "messages": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi there!" }
  ]
}
```

### Response Format

```json
{
  "message": "I hear you, dear soul..."
}
```

### Error Format

```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 900
}
```

## 🚀 Deployment Architecture

### Development Environment

```
localhost:3000 (React Dev Server)
      ↓
localhost:5001 (Express Server)
      ↓
api.groq.com (Groq API)
```

### Production Environment (Vercel)

```
vercel.app (Static React Build)
      ↓
/api/* (Serverless Functions)
      ↓
api.groq.com (Groq API)
```

## 🗂️ File Organization Philosophy

### Frontend (`client/src/`)

- **components/** - Presentational components (JSX + styling)
- **hooks/** - Reusable stateful logic
- **utils/** - Pure functions (API calls, validation)
- **config/** - Constants and configuration objects

### Backend (`server/`)

- **routes/** - Express route handlers
- **services/** - Business logic (AI integration)
- **middleware/** - Request processing (validation, rate limiting)
- **config/** - Environment and server configuration

## 🔐 Security Architecture

### Defense in Depth

1. **Client-Side**
   - Input validation before sending
   - Request timeout handling
   - Error boundaries prevent crashes

2. **Server-Side**
   - Rate limiting (100 req/15 min per IP)
   - Input sanitization
   - Environment variable validation
   - Proper error messages (no stack traces in prod)

3. **Infrastructure**
   - Environment variables for secrets
   - HTTPS enforced in production
   - CORS configuration

## 📊 Scalability Considerations

### Current Limitations

- In-memory rate limiting (resets on restart)
- No database (chat history client-side only)
- Single AI provider (Groq)

### Future Improvements

- Redis for rate limiting
- Database for chat persistence
- Load balancer for multiple server instances
- CDN for static assets
- WebSocket for real-time updates

## 🧪 Testing Strategy

### Unit Tests

- React components (rendering, interactions)
- API utilities (request formatting)
- Server middleware (validation, rate limiting)
- AI service (response formatting)

### Integration Tests

- Full API request/response cycle
- Error handling flows
- Rate limiting behavior

### E2E Tests (Future)

- Complete user journeys
- Cross-browser compatibility

## 📈 Performance Optimization

### Frontend

- Code splitting (React lazy loading)
- Memoization of expensive computations
- Debounced API calls
- Optimized re-renders

### Backend

- Request timeout configuration
- Connection pooling
- Response compression
- Caching strategies (future)

## 🔍 Monitoring & Logging

### Current Implementation

- Console logging for errors
- Request logging in development
- Error stack traces in development only

### Production Recommendations

- Structured logging (Winston, Pino)
- Error tracking (Sentry)
- Analytics (PostHog, Mixpanel)
- API monitoring (Datadog, New Relic)

---

This architecture document provides a comprehensive overview of SoulSync's design. For specific implementation details, refer to the code comments and inline documentation.
