/**
 * Sentiment Analysis Test Suite
 * Tests the accuracy of mood detection across various message types
 */

const { analyzeSentiment, getMoodEmoji, getMoodColor } = require('../../services/sentiment/sentimentService');

// Test cases with expected moods
const testCases = [
    // Very Positive
    { text: "I'm so happy and excited! This is the best day ever!", expected: 'very_positive' },
    { text: "Everything is wonderful! I love this so much!", expected: 'very_positive' },
    { text: "Amazing! Fantastic! I'm thrilled and grateful!", expected: 'very_positive' },

    // Positive
    { text: "I'm feeling good today. Things are going well.", expected: 'positive' },
    { text: "That's nice! I like it.", expected: 'positive' },
    { text: "I'm happy with how things turned out.", expected: 'positive' },

    // Neutral
    { text: "I'm working on my project today.", expected: 'neutral' },
    { text: "The weather is cloudy.", expected: 'neutral' },
    { text: "I had lunch at noon.", expected: 'neutral' },

    // Negative
    { text: "I'm feeling a bit sad today.", expected: 'negative' },
    { text: "This is not what I wanted.", expected: 'negative' },
    { text: "I'm disappointed with the results.", expected: 'negative' },

    // Very Negative
    { text: "I'm devastated. Everything is terrible and awful.", expected: 'very_negative' },
    { text: "I hate this. It's horrible and depressing.", expected: 'very_negative' },
    { text: "This is the worst day ever. I feel miserable.", expected: 'very_negative' },
];

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║       SENTIMENT ANALYSIS ACCURACY TEST                     ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

let passed = 0;
let failed = 0;
const results = [];

testCases.forEach((testCase, index) => {
    const result = analyzeSentiment(testCase.text);
    const match = result.mood === testCase.expected;

    if (match) {
        passed++;
    } else {
        failed++;
    }

    results.push({
        index: index + 1,
        text: testCase.text.substring(0, 50) + (testCase.text.length > 50 ? '...' : ''),
        expected: testCase.expected,
        actual: result.mood,
        score: result.score,
        comparative: result.comparative.toFixed(3),
        confidence: result.confidence,
        emoji: getMoodEmoji(result.mood),
        color: getMoodColor(result.mood),
        match
    });
});

// Print results
console.log('Test Results:\n');
results.forEach(r => {
    const status = r.match ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} Test #${r.index}`);
    console.log(`   Text: "${r.text}"`);
    console.log(`   Expected: ${r.expected.padEnd(15)} | Actual: ${r.actual.padEnd(15)} ${r.emoji}`);
    console.log(`   Score: ${r.score.toString().padEnd(5)} | Comparative: ${r.comparative.padEnd(6)} | Confidence: ${r.confidence}%`);
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
console.log(`  Accuracy: ${((passed / testCases.length) * 100).toFixed(1)}%`);
console.log('\n═══════════════════════════════════════════════════════════\n');

// Additional edge case tests
console.log('EDGE CASE TESTS:\n');

const edgeCases = [
    { text: '', label: 'Empty string' },
    { text: '...', label: 'Only punctuation' },
    { text: '12345', label: 'Only numbers' },
    { text: 'I feel both happy and sad at the same time.', label: 'Mixed emotions' },
];

edgeCases.forEach(test => {
    const result = analyzeSentiment(test.text);
    console.log(`${test.label}:`);
    console.log(`  Mood: ${result.mood} ${getMoodEmoji(result.mood)}`);
    console.log(`  Score: ${result.score}, Comparative: ${result.comparative.toFixed(3)}`);
    console.log('');
});

console.log('═══════════════════════════════════════════════════════════\n');

// Exit with appropriate code
if (failed > 0) {
    console.log('⚠️  Some tests failed. Review sentiment analysis thresholds.');
    process.exit(1);
} else {
    console.log('🎉 All tests passed! Sentiment analysis is working correctly.');
    process.exit(0);
}
