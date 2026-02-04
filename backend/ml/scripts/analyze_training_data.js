/**
 * Analyze Training Data Distribution
 * Checks how many examples per category
 */

const path = require('path');
const dataPath = path.join(__dirname, '../training/sentiment_training_data.json');
const trainingData = require(dataPath);

console.log('═══════════════════════════════════════════════════════════');
console.log('         SENTIMENT TRAINING DATA ANALYSIS');
console.log('═══════════════════════════════════════════════════════════\n');

// Count by category
const distribution = {};
let totalExamples = 0;

for (const item of trainingData) {
    const label = item.label;
    distribution[label] = (distribution[label] || 0) + 1;
    totalExamples++;
}

console.log(`Total Examples: ${totalExamples}\n`);
console.log('Distribution by Category:');
console.log('─────────────────────────────────────────────────────────\n');

const categories = ['very_positive', 'positive', 'neutral', 'negative', 'very_negative'];

for (const category of categories) {
    const count = distribution[category] || 0;
    const percentage = ((count / totalExamples) * 100).toFixed(1);
    const bar = '█'.repeat(Math.floor(count / 5));

    console.log(`${category.padEnd(15)}: ${count.toString().padStart(3)} (${percentage.padStart(5)}%) ${bar}`);
}

console.log('\n═══════════════════════════════════════════════════════════\n');

// Check if ready for training
const minRequired = 100;
const isReady = categories.every(cat => (distribution[cat] || 0) >= minRequired);

if (isReady) {
    console.log('✅ READY FOR TRAINING!');
    console.log('   All categories have 100+ examples.');
} else {
    console.log('⚠️  NEEDS MORE EXAMPLES:');
    categories.forEach(cat => {
        const count = distribution[cat] || 0;
        if (count < minRequired) {
            const needed = minRequired - count;
            console.log(`   - ${cat}: Need ${needed} more (currently ${count})`);
        }
    });
}

console.log('\n═══════════════════════════════════════════════════════════\n');

// Sample examples from each category
console.log('Sample Examples:\n');
categories.forEach(cat => {
    const examples = trainingData.filter(item => item.label === cat).slice(0, 2);
    console.log(`${cat}:`);
    examples.forEach(ex => console.log(`  - "${ex.text}"`));
    console.log('');
});

console.log('═══════════════════════════════════════════════════════════\n');
