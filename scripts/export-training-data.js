/**
 * Export Training Data Script (Prisma / PostgreSQL)
 * Exports high-quality conversations as JSONL for Llama 3 fine-tuning.
 *
 * Quality filters applied:
 *   - Only assistant messages with rating = 1 (thumbs up) are included
 *   - Conversations with predominantly negative user sentiment are skipped
 *   - All content is PII-scrubbed before export
 *
 * Usage:
 *   node scripts/export-training-data.js            # Full export
 *   node scripts/export-training-data.js --dry-run  # Stats only, no file written
 *
 * Output format (Llama 3 / OpenAI fine-tuning compatible JSONL):
 *   {"messages": [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const prisma = new PrismaClient();
const isDryRun = process.argv.includes('--dry-run');

// ─── PII Scrubbing ────────────────────────────────────────────────────────────

const PII_PATTERNS = [
    // Email addresses
    { pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, token: '<EMAIL>' },
    // Phone numbers (various formats: +91-XXXXX-XXXXX, (XXX) XXX-XXXX, XXX.XXX.XXXX, etc.)
    { pattern: /(\+?\d{1,3}[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}/g, token: '<PHONE>' },
    // URLs
    { pattern: /https?:\/\/[^\s]+/g, token: '<URL>' },
    // Credit card numbers (basic pattern)
    { pattern: /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g, token: '<CARD_NUMBER>' },
];

/**
 * Scrub PII from a string using regex patterns.
 * @param {string} text
 * @returns {string} Sanitized text
 */
function scrubPII(text) {
    if (!text) return text;
    let sanitized = text;
    for (const { pattern, token } of PII_PATTERNS) {
        sanitized = sanitized.replace(pattern, token);
    }
    return sanitized;
}

// ─── Quality Filters ──────────────────────────────────────────────────────────

/**
 * Check if a conversation has predominantly positive user sentiment.
 * Skips conversations where the user was mostly negative (crisis/distress).
 * @param {Array} messages - All messages in the chat
 * @returns {boolean} True if the conversation quality is acceptable
 */
function hasAcceptableSentiment(messages) {
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length === 0) return true;

    const negativeMoods = ['negative', 'very_negative'];
    const negativeCount = userMessages.filter(m => negativeMoods.includes(m.sentimentMood)).length;
    const negativeRatio = negativeCount / userMessages.length;

    // Skip if more than 80% of user messages are negative
    // (These are crisis conversations — we don't want to train on them)
    return negativeRatio < 0.8;
}

// ─── Main Export Logic ────────────────────────────────────────────────────────

async function exportTrainingData() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║       SOULSYNC TRAINING DATA EXPORT                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    if (isDryRun) {
        console.log('🔍 DRY RUN MODE — No files will be written.\n');
    }

    // 1. Find all assistant messages with positive rating
    console.log('📊 Fetching upvoted assistant messages...');
    const upvotedMessages = await prisma.message.findMany({
        where: {
            role: 'assistant',
            rating: 1,
        },
        select: {
            id: true,
            chatId: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
    });

    console.log(`   Found ${upvotedMessages.length} upvoted assistant messages`);

    if (upvotedMessages.length === 0) {
        console.log('\n⚠️  No upvoted messages found. Use 👍 on AI responses to build your dataset.');
        return;
    }

    // 2. Get unique chat IDs
    const chatIds = [...new Set(upvotedMessages.map(m => m.chatId))];
    console.log(`   Spanning ${chatIds.length} unique conversations\n`);

    const trainingExamples = [];
    let skippedSentiment = 0;
    let skippedNoUser = 0;

    // 3. Process each chat
    for (const chatId of chatIds) {
        // Fetch all messages in this chat
        const chatMessages = await prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                role: true,
                content: true,
                rating: true,
                sentimentMood: true,
                metadata: true,
                createdAt: true,
            },
        });

        // Apply sentiment quality filter
        if (!hasAcceptableSentiment(chatMessages)) {
            skippedSentiment++;
            continue;
        }

        // Find upvoted assistant messages in this chat
        const upvotedInChat = chatMessages.filter(
            m => m.role === 'assistant' && m.rating === 1
        );

        for (const upvotedMsg of upvotedInChat) {
            // Get conversation history up to and including this message
            const msgIndex = chatMessages.findIndex(m => m.id === upvotedMsg.id);
            const history = chatMessages.slice(0, msgIndex + 1);

            // Build messages array (user + assistant turns only)
            const messages = history
                .filter(m => m.role === 'user' || m.role === 'assistant')
                .map(msg => ({
                    role: msg.role,
                    content: scrubPII(msg.content),
                }));

            // Must have at least one user message
            if (!messages.some(m => m.role === 'user')) {
                skippedNoUser++;
                continue;
            }

            // Build the training example
            const example = { messages };

            // Optionally include RAG context as metadata comment
            // (not part of the training messages, but useful for analysis)
            if (upvotedMsg.metadata?.retrievedMemories?.length > 0) {
                example._rag_context = upvotedMsg.metadata.retrievedMemories.map(m => ({
                    content: scrubPII(m.content),
                    score: m.score,
                }));
            }

            trainingExamples.push(example);
        }
    }

    // 4. Report stats
    console.log('📈 Export Statistics:');
    console.log(`   ✅ Training examples generated : ${trainingExamples.length}`);
    console.log(`   ⏭️  Skipped (negative sentiment): ${skippedSentiment} conversations`);
    console.log(`   ⏭️  Skipped (no user message)  : ${skippedNoUser} examples`);
    console.log(`   🔒 PII scrubbing               : Applied (emails, phones, URLs, card numbers)\n`);

    if (isDryRun) {
        console.log('✅ Dry run complete. Run without --dry-run to write the JSONL file.');
        return;
    }

    if (trainingExamples.length === 0) {
        console.log('⚠️  No valid training examples after filtering. Exiting.');
        return;
    }

    // 5. Write JSONL file
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = path.join(dataDir, `training-data-${timestamp}.jsonl`);

    const jsonlContent = trainingExamples
        .map(example => JSON.stringify(example))
        .join('\n');

    fs.writeFileSync(filename, jsonlContent, 'utf8');

    console.log(`✅ Exported ${trainingExamples.length} examples to:`);
    console.log(`   ${filename}\n`);
    console.log('📝 Format  : JSONL (JSON Lines) — one training example per line');
    console.log('🤖 Compatible with: Llama 3 fine-tuning, OpenAI fine-tuning, Groq fine-tuning\n');
    console.log('Next steps:');
    console.log('  1. Review the exported file for quality');
    console.log('  2. Remove _rag_context fields if not needed by your fine-tuning provider');
    console.log('  3. Upload to your fine-tuning platform (e.g., Together AI, Replicate, OpenAI)');
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

async function main() {
    try {
        await exportTrainingData();
    } catch (error) {
        console.error('\n❌ Export failed:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        console.log('🔌 Database connection closed');
    }
}

main();
