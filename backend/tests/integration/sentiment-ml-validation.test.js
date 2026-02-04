/**
 * ML Model Validation Test
 * Tests the trained NLP.js model against the same 15 test cases
 * Compares accuracy with lexicon-based approach (86.7%)
 */

const { NlpManager } = require('node-nlp');
const path = require('path');

// Test cases (same as sentiment.test.js)
const testCases = [
    // Very Positive (3)
    { text: "I'm so happy and excited! This is the best day ever!", expected: 'very_positive' },
    { text: "Everything is wonderful! I love this so much!", expected: 'very_positive' },
    { text: "Amazing! Fantastic! I'm thrilled and grateful!", expected: 'very_positive' },

    // Positive (3)
    { text: "I'm feeling good today. Things are going well.", expected: 'positive' },
    { text: "That's nice! I like it.", expected: 'positive' },
    { text: "I'm happy with how things turned out.", expected: 'positive' },

    // Neutral (3)
    { text: "I'm working on my project today.", expected: 'neutral' },
    { text: "The weather is cloudy.", expected: 'neutral' },
    { text: "I had lunch at noon.", expected: 'neutral' },

    // Negative (3)
    { text: "I'm feeling a bit sad today.", expected: 'negative' },
    { text: "This is not what I wanted.", expected: 'negative' },
    { text: "I'm disappointed with the results.", expected: 'negative' },

    // Very Negative (3)
    { text: "I'm devastated. Everything is terrible and awful.", expected: 'very_negative' },
    { text: "I hate this. It's horrible and depressing.", expected: 'very_negative' },
    { text: "This is the worst day ever. I feel miserable.", expected: 'very_negative' },
];

async function validateModel() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║       ML MODEL VALIDATION TEST (NLP.js)                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Load the trained model
    const modelPath = path.join(__dirname, '../../ml/models/sentiment-model.nlp');

    console.log('📦 Loading trained model...');
    console.log(`   Path: ${modelPath}\n`);

    const manager = new NlpManager({ languages: ['en'] });

    try {
        await manager.load(modelPath);
        console.log('✅ Model loaded successfully!\n');
    } catch (err) {
        console.error('❌ Failed to load model:', err.message);
        console.error('\n💡 Make sure to train the model first:');
        console.error('   node backend/ml/scripts/train_sentiment_model.js\n');
        process.exit(1);
    }

    // Run tests
    console.log('🧪 Running validation tests...\n');
    console.log('Test Results:\n');

    let passed = 0;
    let failed = 0;
    const results = [];

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const result = await manager.process('en', testCase.text);

        const predicted = result.intent || 'neutral';
        const score = result.score || 0;
        const match = predicted === testCase.expected;

        if (match) {
            passed++;
        } else {
            failed++;
        }

        results.push({
            index: i + 1,
            text: testCase.text.substring(0, 50) + (testCase.text.length > 50 ? '...' : ''),
            expected: testCase.expected,
            predicted,
            score: (score * 100).toFixed(1),
            match
        });
    }

    // Print results
    results.forEach(r => {
        const status = r.match ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} Test #${r.index}`);
        console.log(`   Text: "${r.text}"`);
        console.log(`   Expected: ${r.expected.padEnd(15)} | Predicted: ${r.predicted.padEnd(15)}`);
        console.log(`   Confidence: ${r.score}%`);
        if (!r.match) {
            console.log(`   ⚠️  Mismatch detected!`);
        }
        console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`SUMMARY:`);
    console.log(`  Total Tests: ${testCases.length}`);
    console.log(`  ✅ Passed: ${passed} (${((passed / testCases.length) * 100).toFixed(1)}%)`);
    console.log(`  ❌ Failed: ${failed} (${((failed / testCases.length) * 100).toFixed(1)}%)`);
    console.log(`  ML Accuracy: ${((passed / testCases.length) * 100).toFixed(1)}%`);
    console.log('\n═══════════════════════════════════════════════════════════\n');

    // Comparison
    const mlAccuracy = (passed / testCases.length) * 100;
    const lexiconAccuracy = 86.7;
    const improvement = mlAccuracy - lexiconAccuracy;

    console.log('COMPARISON:\n');
    console.log(`  Lexicon-based (optimized): 86.7%`);
    console.log(`  ML (NLP.js trained):       ${mlAccuracy.toFixed(1)}%`);
    console.log(`  Improvement:               ${improvement >= 0 ? '+' : ''}${improvement.toFixed(1)}%\n`);

    if (mlAccuracy >= 90) {
        console.log('🎉 EXCELLENT! ML model achieved 90%+ accuracy!');
        console.log('   Consider switching to ML-based sentiment analysis.\n');
    } else if (mlAccuracy > lexiconAccuracy) {
        console.log('✅ GOOD! ML model is better than lexicon approach.');
        console.log(`   Improvement: +${improvement.toFixed(1)}%\n`);
    } else {
        console.log('⚠️  ML model did not outperform the lexicon approach.');
        console.log('   Stick with the optimized lexicon (86.7%) for now.\n');
    }

    console.log('═══════════════════════════════════════════════════════════\n');

    // Exit with status
    if (failed > 0) {
        console.log(`⚠️  ${failed} test(s) failed.`);
        process.exit(1);
    } else {
        console.log('🎉 All tests passed!');
        process.exit(0);
    }
}

// Run validation
validateModel().catch(err => {
    console.error('Test error:', err);
    process.exit(1);
});
