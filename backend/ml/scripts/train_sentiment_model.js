/**
 * ML Sentiment Analysis Training Script
 * Trains NLP.js model on 506 labeled examples
 * Expected accuracy: 90%+
 */

const { NlpManager } = require('node-nlp');
const fs = require('fs');
const path = require('path');

// Load training data
const trainingDataPath = path.join(__dirname, '../training/sentiment_training_data.json');
const trainingData = JSON.parse(fs.readFileSync(trainingDataPath, 'utf-8'));

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║          ML SENTIMENT ANALYSIS TRAINING                    ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

async function trainModel() {
    console.log('📊 Loading training data...');
    console.log(`   Total examples: ${trainingData.length}\n`);

    // Count distribution
    const distribution = {};
    trainingData.forEach(item => {
        distribution[item.label] = (distribution[item.label] || 0) + 1;
    });

    console.log('Distribution:');
    Object.entries(distribution).forEach(([label, count]) => {
        console.log(`   ${label.padEnd(15)}: ${count}`);
    });
    console.log('');

    // Initialize NLP Manager
    console.log('🤖 Initializing NLP Manager...');
    const manager = new NlpManager({
        languages: ['en'],
        forceNER: true,
        nlu: { useNoneFeature: true }
    });

    // Add documents (training examples)
    console.log('📚 Adding training documents...');
    let addedCount = 0;

    for (const example of trainingData) {
        manager.addDocument('en', example.text, example.label);
        addedCount++;

        // Show progress
        if (addedCount % 50 === 0) {
            process.stdout.write(`\r   Added ${addedCount}/${trainingData.length} examples...`);
        }
    }
    console.log(`\r   Added ${addedCount}/${trainingData.length} examples... ✅\n`);

    // Train the model
    console.log('🎓 Training model...');
    console.log('   This may take 30-60 seconds...\n');

    const startTime = Date.now();
    await manager.train();
    const trainingTime = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`   ✅ Training completed in ${trainingTime}s\n`);

    // Save the trained model
    const modelPath = path.join(__dirname, '../models/sentiment-model.nlp');
    const modelDir = path.dirname(modelPath);

    if (!fs.existsSync(modelDir)) {
        fs.mkdirSync(modelDir, { recursive: true });
    }

    console.log('💾 Saving trained model...');
    await manager.save(modelPath);
    console.log(`   ✅ Model saved to: ${modelPath}\n`);

    // Test the model
    console.log('🧪 Testing model on sample inputs...\n');

    const testCases = [
        { text: "I'm so happy and excited!", expected: 'very_positive' },
        { text: "That's nice! I like it", expected: 'positive' },
        { text: "I'm working on my project", expected: 'neutral' },
        { text: "I'm feeling sad today", expected: 'negative' },
        { text: "I'm devastated. Everything is terrible", expected: 'very_negative' },
    ];

    let correct = 0;
    for (const test of testCases) {
        const result = await manager.process('en', test.text);
        const predicted = result.intent;
        const score = result.score;
        const match = predicted === test.expected ? '✅' : '❌';

        console.log(`${match} Text: "${test.text}"`);
        console.log(`   Expected: ${test.expected} | Predicted: ${predicted} (${(score * 100).toFixed(1)}% confidence)`);
        console.log('');

        if (predicted === test.expected) correct++;
    }

    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`Quick Test Accuracy: ${correct}/${testCases.length} (${((correct / testCases.length) * 100).toFixed(1)}%)\n`);
    console.log('═══════════════════════════════════════════════════════════\n');

    // Model info
    const modelSize = fs.statSync(modelPath).size;
    const modelSizeMB = (modelSize / 1024 / 1024).toFixed(2);

    console.log('📦 Model Information:');
    console.log(`   Training examples: ${trainingData.length}`);
    console.log(`   Training time: ${trainingTime}s`);
    console.log(`   Model size: ${modelSizeMB} MB`);
    console.log(`   Model path: ${modelPath}`);
    console.log('');

    console.log('✅ ML MODEL TRAINING COMPLETE!\n');
    console.log('Next steps:');
    console.log('   1. Run: node backend/tests/integration/sentiment-ml-validation.test.js');
    console.log('   2. Compare ML accuracy with lexicon (86.7%)');
    console.log('   3. Decide which to use in production\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    return manager;
}

// Run training
trainModel()
    .then(() => {
        console.log('🎉 Training pipeline completed successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Training failed:', err);
        process.exit(1);
    });
