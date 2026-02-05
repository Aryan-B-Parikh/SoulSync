# ML Sentiment Analysis - Training Guide

## Quick Start

### 1. Train the Model
```bash
node backend/ml/scripts/train_sentiment_model.js
```

This will:
- Load 506 training examples
- Train NLP.js model (takes 30-60 seconds)
- Save model to `backend/models/sentiment-model.nlp`
- Run quick accuracy test

### 2. Validate the Model
```bash
node backend/tests/integration/sentiment-ml-validation.test.js
```

This will:
- Load the trained model
- Test on 15 standardized test cases
- Compare accuracy with lexicon approach (86.7%)
- Show improvement metrics

### 3. Use in Production

#### Option A: Replace Current Service
In `backend/controllers/streaming.controller.js`:
```javascript
// Change this:
const { analyzeSentiment } = require('../services/sentimentService');

// To this:
const { analyzeSentimentML } = require('../services/sentimentServiceML');
const sentimentService = require('../services/sentimentServiceML');

// At server startup (in index.js):
await sentimentService.loadModel();

// In streaming controller:
const sentimentData = await analyzeSentimentML(userMessage.content);
```

#### Option B: Hybrid Approach (Recommended)
```javascript
// Use lexicon for fast analysis, ML for low-confidence cases
const quickResult = analyzeSentiment(text);

if (quickResult.confidence < 70) {
  // Use ML for uncertain cases
  return await analyzeSentimentML(text);
}

return quickResult; // Fast path
```

## Files Created

1. **`backend/scripts/train_ml_model.js`** - Training script
2. **`backend/tests/sentiment-ml-validation.test.js`** - Validation tests
3. **`backend/services/sentimentServiceML.js`** - Production ML service
4. **`backend/models/sentiment-model.nlp`** - Trained model (created after training)

## Expected Results

### Training
```
Training examples: 506
Training time: ~40s
Model size: ~2-3 MB
```

### Accuracy
```
Target: 90%+ accuracy
Baseline: 86.7% (lexicon)
Expected ML: 93-95%
```

## Troubleshooting

### Model Not Found
```bash
# Train the model first:
node backend/ml/scripts/train_sentiment_model.js
```

### Low Accuracy
- Check training data quality
- Ensure balanced distribution
- Add more examples to weak categories

### Slow Performance
- Model loads on server startup (one-time cost)
- Inference is fast (<50ms per message)
- Consider caching for repeated texts

## Comparison: Lexicon vs ML

| Feature | Lexicon | ML (NLP.js) |
|---------|---------|-------------|
| Accuracy | 86.7% | 93-95% (est.) |
| Speed | <5ms | ~30ms |
| Model Size | 0 KB | 2-3 MB |
| Training | None | One-time |
| Dependencies | sentiment | node-nlp |
| Offline | ✅ Yes | ✅ Yes |
| Cost | $0 | $0 |

## Next Steps

1. Train model
2. Validate accuracy
3. If accuracy > 90%, consider switching
4. Monitor real-world performance
5. Retrain periodically with new data

---

**Ready to train!** Run: `node backend/ml/scripts/train_sentiment_model.js`
