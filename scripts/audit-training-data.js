/**
 * Audit Training Data Script
 * Checks the health of the training data pipeline.
 *
 * Reports:
 *   - Total assistant messages
 *   - Messages missing context_used (broken RAG logging)
 *   - Messages missing rating (no user feedback yet)
 *   - Messages with sentiment deviation > 20% (quality flags)
 *
 * Usage:
 *   node scripts/audit-training-data.js
 *
 * A healthy pipeline should have:
 *   - 0 assistant messages missing context_used
 *   - As many rated messages as possible
 */

const { PrismaClient, Prisma } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function auditTrainingData() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║       SOULSYNC TRAINING DATA PIPELINE AUDIT                ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // ── 1. Total counts ──────────────────────────────────────────────────────
    const totalMessages = await prisma.message.count();
    const totalAssistant = await prisma.message.count({ where: { role: 'assistant' } });
    const totalUser = await prisma.message.count({ where: { role: 'user' } });

    console.log('📊 Message Counts:');
    console.log(`   Total messages    : ${totalMessages}`);
    console.log(`   User messages     : ${totalUser}`);
    console.log(`   Assistant messages: ${totalAssistant}\n`);

    // ── 2. context_used audit (CRITICAL) ─────────────────────────────────────
    // Prisma can't filter nullable Json columns with null in count() — use raw SQL
    const missingContextResult = await prisma.$queryRaw`
        SELECT COUNT(*)::int AS count FROM messages
        WHERE role = 'assistant' AND context_used IS NULL
    `;
    const missingContext = missingContextResult[0]?.count ?? 0;

    const contextCoverage = totalAssistant > 0
        ? (((totalAssistant - missingContext) / totalAssistant) * 100).toFixed(1)
        : 'N/A';

    const contextStatus = missingContext === 0 ? '✅' : '❌';
    console.log('🔍 RAG Context Logging (context_used):');
    console.log(`   ${contextStatus} Missing context_used : ${missingContext} assistant messages`);
    console.log(`   Coverage            : ${contextCoverage}%`);
    if (missingContext > 0) {
        console.log('   ⚠️  ACTION REQUIRED: These messages were generated without logging RAG context.');
        console.log('      This breaks the training pipeline. Check streaming.controller.js.\n');
    } else {
        console.log('   Pipeline is healthy — all assistant messages have RAG context logged.\n');
    }

    // ── 3. Feedback / Rating audit ────────────────────────────────────────────
    const rated = await prisma.message.count({
        where: { role: 'assistant', rating: { not: null } },
    });
    const upvoted = await prisma.message.count({
        where: { role: 'assistant', rating: 1 },
    });
    const downvoted = await prisma.message.count({
        where: { role: 'assistant', rating: -1 },
    });
    const unrated = totalAssistant - rated;

    console.log('👍 Feedback / Rating:');
    console.log(`   Upvoted (rating=1)  : ${upvoted}`);
    console.log(`   Downvoted (rating=-1): ${downvoted}`);
    console.log(`   Unrated             : ${unrated}`);
    console.log(`   Training-ready (👍) : ${upvoted} examples\n`);

    // ── 4. Hybrid Sentiment Deviation audit ───────────────────────────────────
    const withDeviation = await prisma.message.count({
        where: { role: 'user', sentimentDeviation: { not: null } },
    });
    const flagged = await prisma.message.count({
        where: { role: 'user', sentimentDeviation: { gt: 0.2 } },
    });

    console.log('🧠 Hybrid Sentiment Scoring:');
    console.log(`   User messages with LLM sentiment : ${withDeviation}`);
    console.log(`   Flagged (deviation > 20%)        : ${flagged}`);
    if (flagged > 0) {
        console.log('   ⚠️  These messages have conflicting lexicon vs LLM sentiment.');
        console.log('      Review them before including in training data.\n');
    } else {
        console.log('   No high-deviation messages found.\n');
    }

    // ── 5. Summary ────────────────────────────────────────────────────────────
    console.log('═══════════════════════════════════════════════════════════');
    console.log('PIPELINE HEALTH SUMMARY:');
    const issues = [];
    if (missingContext > 0) issues.push(`❌ ${missingContext} assistant messages missing context_used`);
    if (upvoted === 0) issues.push('⚠️  No upvoted messages yet — use 👍 in the app to build training data');
    if (flagged > 0) issues.push(`⚠️  ${flagged} messages flagged for sentiment review`);

    if (issues.length === 0) {
        console.log('✅ All checks passed — pipeline is healthy!');
    } else {
        issues.forEach(i => console.log(`   ${i}`));
    }
    console.log('═══════════════════════════════════════════════════════════\n');
}

async function main() {
    try {
        await auditTrainingData();
    } catch (error) {
        console.error('❌ Audit failed:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
