# Testing Guide

This document explains how to run and write tests for SoulSync AI.

## Test Structure

```
tests/
├── integration/          # Integration tests for API endpoints
│   ├── auth.test.js      # Authentication tests
│   └── chat-persistence.test.js  # Chat and message tests
└── unit/                 # Unit tests for individual functions
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Server Tests Only
```bash
npm run test:server
```

### Run Authentication Tests
```bash
npm run test:auth
```

### Run Chat Persistence Tests
```bash
npm run test:chat
```

### Run Smoke Tests
Quick validation of critical endpoints:
```bash
npm run smoke
```

Or test against production:
```bash
API_URL=https://your-domain.vercel.app/api npm run smoke
```

## Test Coverage

### Authentication Tests (`auth.test.js`)

**Registration:**
- ✅ Successful user registration
- ✅ Invalid email format rejection
- ✅ Short password rejection
- ✅ Duplicate email rejection

**Login:**
- ✅ Successful login with valid credentials
- ✅ Wrong password rejection
- ✅ Non-existent user rejection

**Profile:**
- ✅ Get profile with valid token
- ✅ Unauthorized without token
- ✅ Unauthorized with invalid token

### Chat Persistence Tests (`chat-persistence.test.js`)

**Chat Creation:**
- ✅ Create chat with default title
- ✅ Create chat with custom title
- ✅ Unauthorized without authentication

**Chat List:**
- ✅ Get all user chats
- ✅ Empty array for users with no chats
- ✅ Chats isolated per user

**Chat Retrieval:**
- ✅ Get chat with messages
- ✅ Invalid chat ID rejection
- ✅ Cannot access other users' chats

**Message Sending:**
- ✅ Send message and receive AI response
- ✅ Auto-generate title from first message
- ✅ Empty message rejection

**Chat Deletion:**
- ✅ Delete chat and cascade to messages
- ✅ Cannot delete other users' chats

**History and Continuity:**
- ✅ Maintain conversation context across messages
- ✅ Retrieve full message history

### Smoke Tests (`smoke.js`)

Quick validation of:
1. Health endpoint
2. User registration
3. Profile retrieval
4. Chat creation
5. Message sending
6. Chat list
7. Chat deletion

## Writing New Tests

### Integration Test Template

```javascript
const request = require('supertest');
const app = require('../../server/index');
const { connectDB, disconnectDB } = require('../../server/config/database');

describe('Feature Name', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    // Clear test data
  });

  it('should do something', async () => {
    const res = await request(app)
      .post('/api/endpoint')
      .send({ data: 'test' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('key', 'value');
  });
});
```

## Test Database

Tests use the MongoDB database specified in your environment:
- Uses `MONGODB_URI` or `DB_URL` from `.env`
- Each test suite cleans up its data in `beforeEach`
- Database connection is shared across test files

**⚠️ WARNING:** Never run tests against production database!

For testing, use a separate database:
```bash
MONGODB_URI=mongodb://localhost:27017/soulsync_test npm test
```

## CI/CD Integration

Tests can be run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: |
    npm install
    npm test
  env:
    MONGODB_URI: ${{ secrets.MONGODB_URI_TEST }}
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
    GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}
```

## Debugging Tests

### Run Single Test File
```bash
npx jest tests/integration/auth.test.js --config config/jest.server.config.js
```

### Run with Verbose Output
```bash
npm run test:auth -- --verbose
```

### Run in Watch Mode
```bash
npm run test:server -- --watch
```

## Test Environment Variables

Required for tests:
- `MONGODB_URI` or `DB_URL` - Test database connection
- `JWT_SECRET` - JWT signing secret
- `GROQ_API_KEY` - AI service API key

## Best Practices

1. **Isolation:** Each test should be independent
2. **Cleanup:** Always clean up test data in `beforeEach`
3. **Descriptive Names:** Use clear test descriptions
4. **Assertions:** Check both success and error cases
5. **Mock External Services:** Mock AI API calls when possible
6. **Fast Tests:** Keep tests quick to encourage frequent runs
7. **Real Database:** Integration tests use real DB for accuracy

## Troubleshooting

### Tests Timeout
- Increase Jest timeout: `jest.setTimeout(10000)`
- Check MongoDB connection
- Ensure database is running

### Tests Fail on CI
- Verify environment variables are set
- Check database connectivity
- Ensure test database is accessible

### Random Test Failures
- Check for shared state between tests
- Ensure proper cleanup in `beforeEach`
- Look for race conditions

## Coverage Reports

Generate coverage report:
```bash
npm run test:server -- --coverage
```

View coverage in `coverage/` directory.

## Next Steps

- Add unit tests for services and utilities
- Add frontend component tests
- Add E2E tests with Playwright or Cypress
- Set up coverage thresholds
- Integrate with CI/CD pipeline
