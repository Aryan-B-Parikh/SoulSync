# Backend Structure

## Directory Organization

```
backend/
├── config/             # Configuration
├── controllers/        # Request handlers
├── middleware/         # Express middleware
├── models/             # MongoDB schemas
├── routes/             # API routes
├── services/           # Business logic
│   └── sentiment/      # Sentiment analysis services
├── ml/                 # Machine Learning 🆕
│   ├── models/         # Trained ML models
│   ├── training/       # Training datasets
│   └── scripts/        # Training scripts
├── tests/              # Tests 🆕
│   ├── unit/           # Unit tests
│   └── integration/    # Integration tests
├── docs/               # Documentation
├── utils/              # Utilities
└── index.js            # Entry point
```

## Quick Commands

### Run Tests
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

### Analyze Training Data
```bash
node ml/scripts/analyze_training_data.js
```

## Key Files

### Production
- **Sentiment**: `services/sentiment/sentimentService.js` (93.3% accuracy)
- **Routes**: `routes/*.routes.js`
- **Models**: `models/*.model.js`

### ML/Experimental
- **ML Service**: `services/sentiment/sentimentServiceML.js`
- **Trained Model**: `ml/models/sentiment-model.nlp`
- **Training Data**: `ml/training/sentiment_training_data.json` (506 examples)

## Import Examples

```javascript
// Sentiment service
const { analyzeSentiment } = require('./services/sentiment/sentimentService');

// ML sentiment service
const { analyzeSentimentML } = require('./services/sentiment/sentimentServiceML');

// Models
const User = require('./models/user.model');
const Chat = require('./models/chat.model');
```

## Notes

- All MongoDB schemas are in `models/`
- All ML-related files are in `ml/`
- Tests are categorized by type (`unit/`, `integration/`)
- No duplicate files!

Last Updated: 2026-02-04
