# Backend Structure

## Directory Organization

```
backend/
├── config/             # Configuration (Prisma, etc.)
├── controllers/        # Request handlers
├── middleware/         # Express middleware (auth, validation)
├── routes/             # API routes
├── services/           # Business logic
│   └── sentiment/      # Sentiment analysis services
├── ml/                 # Machine Learning
│   ├── models/         # Trained ML models
│   ├── training/       # Training datasets
│   └── scripts/        # Training scripts
├── prisma/             # Database
│   └── schema.prisma   # Database schema
├── tests/              # Tests
│   ├── unit/           # Unit tests
│   └── integration/    # Integration tests
├── docs/               # Documentation
├── utils/              # Utilities
└── index.js            # Entry point
```

## Quick Commands

### Development
```bash
npm run dev              # Start server with nodemon
```

### Database
```bash
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Push schema to database
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create migration
```

### Tests
```bash
# Sentiment analysis (production)
node tests/unit/sentiment.test.js

# ML sentiment (experimental)
node tests/unit/sentiment-ml.test.js

# ML validation
node tests/integration/sentiment-ml-validation.test.js
```

### Train ML Model
```bash
node ml/scripts/train_sentiment_model.js
```

## Key Files

### Production
- **Database**: `prisma/schema.prisma` (PostgreSQL with Prisma)
- **Sentiment**: `services/sentiment/sentimentService.js` (93.3% accuracy)
- **Vector Memory**: `services/vectorService.js` (Pinecone)
- **Routes**: `routes/*.routes.js`

### ML/Experimental
- **ML Service**: `services/sentiment/sentimentServiceML.js`
- **Trained Model**: `ml/models/sentiment-model.nlp`
- **Training Data**: `ml/training/sentiment_training_data.json` (506 examples)

## Import Examples

```javascript
// Prisma client
const prisma = require('./config/prisma');

// Sentiment service
const { analyzeSentiment } = require('./services/sentiment/sentimentService');

// ML sentiment service
const { analyzeSentimentML } = require('./services/sentiment/sentimentServiceML');

// Vector service
const { storeInMemory, retrieveRelevantMemories } = require('./services/vectorService');
```

## Database Schema (Prisma)

```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  password    String
  name        String?
  personality String   @default("supportive")
  chats       Chat[]
  createdAt   DateTime @default(now())
}

model Chat {
  id        String    @id @default(cuid())
  title     String    @default("New Conversation")
  userId    String
  user      User      @relation(...)
  messages  Message[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Message {
  id        String   @id @default(cuid())
  content   String
  role      String   // 'user' or 'assistant'
  chatId    String
  chat      Chat     @relation(...)
  vectorId  String?  // Pinecone vector ID
  sentiment String?  // 'positive', 'negative', etc.
  feedback  String?  // 'up' or 'down'
  isMemory  Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

## API Routes Overview

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/auth` | POST | Register, Login |
| `/api/chats` | GET, POST, PATCH, DELETE | Chat CRUD |
| `/api/chats/:id/messages` | GET, POST | Messages |
| `/api/mood` | GET | Mood analytics |
| `/api/memory` | GET, DELETE | Memory management |
| `/api/user` | GET, PUT | Profile & personality |

## Notes

- Database: PostgreSQL via Neon (serverless)
- ORM: Prisma for type-safe queries
- All ML-related files are in `ml/`
- Tests are categorized by type (`unit/`, `integration/`)

Last Updated: 2026-02-05
