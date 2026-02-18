/**
 * RAG Stress Test — Memory Poisoning
 *
 * Tests whether the AI correctly ignores irrelevant ("poisoned") memories
 * when answering an unrelated query.
 *
 * Workflow:
 *   1. Register a test user
 *   2. Create a chat and send a message about pizza (stored as memory)
 *   3. Ask an unrelated factual question ("What is the capital of France?")
 *   4. PASS: AI answers "Paris"
 *   5. FAIL: AI mentions "pizza" or gets confused
 *
 * Prerequisites:
 *   - Backend running: npm run backend:dev
 *   - Pinecone configured in .env
 *
 * Usage:
 *   node tests/rag-stress-test.js
 */

const fetch = require('node-fetch');
require('dotenv').config();

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3001';
const TEST_EMAIL = `rag-stress-test-${Date.now()}@soulsync-test.local`;
const TEST_PASSWORD = 'TestPassword123!';

let token = null;
let chatId = null;

async function api(method, path, body, authToken) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`API ${method} ${path} failed: ${JSON.stringify(data)}`);
    return data;
}

async function streamMessage(chatId, content, authToken) {
    // Use non-streaming endpoint for test simplicity
    const res = await fetch(`${BASE_URL}/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Send message failed: ${JSON.stringify(data)}`);
    return data;
}

async function cleanup() {
    // Best-effort cleanup — delete test user via profile endpoint if available
    try {
        if (token) {
            await fetch(`${BASE_URL}/api/user/profile`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
        }
    } catch { /* ignore */ }
}

async function runTest() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║       RAG STRESS TEST — MEMORY POISONING                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    try {
        // Step 1: Register test user
        console.log('1️⃣  Registering test user...');
        const reg = await api('POST', '/api/auth/register', {
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            name: 'RAG Test User',
        });
        token = reg.token;
        console.log('   ✅ Registered\n');

        // Step 2: Create a chat and inject "poisoned" memory
        console.log('2️⃣  Injecting poisoned memory ("My favorite food is Pizza")...');
        const chatRes = await api('POST', '/api/chats', { title: 'RAG Stress Test' }, token);
        chatId = chatRes.chat._id || chatRes.chat.id;

        // Send the pizza message — this gets embedded into Pinecone as a memory
        await streamMessage(chatId, 'My favorite food is Pizza. I absolutely love pizza!', token);
        console.log('   ✅ Poisoned memory injected\n');

        // Wait briefly for embedding to be stored
        await new Promise(r => setTimeout(r, 2000));

        // Step 3: Ask an unrelated factual question
        console.log('3️⃣  Asking unrelated query: "What is the capital of France?"...');
        const response = await streamMessage(chatId, 'What is the capital of France?', token);
        const aiResponse = (response.assistantMessage?.content || '').toLowerCase();
        console.log(`   AI Response: "${response.assistantMessage?.content?.substring(0, 200)}"\n`);

        // Step 4: Evaluate
        const mentionsParis = aiResponse.includes('paris');
        const mentionsPizza = aiResponse.includes('pizza');

        console.log('4️⃣  Evaluating response...');
        if (mentionsParis && !mentionsPizza) {
            console.log('   ✅ PASS — AI correctly answered "Paris" and ignored the pizza memory.');
            console.log('   ✅ RAG system is NOT susceptible to memory poisoning.\n');
        } else if (mentionsPizza) {
            console.log('   ❌ FAIL — AI mentioned "pizza" in response to a geography question!');
            console.log('   ❌ RISK: Irrelevant memories are influencing AI responses.');
            console.log('   FIX: Improve memory relevance threshold in vectorService.js (raise minScore).\n');
            process.exitCode = 1;
        } else {
            console.log('   ⚠️  INCONCLUSIVE — AI did not mention Paris or Pizza.');
            console.log(`   Full response: ${response.assistantMessage?.content}\n`);
        }

    } catch (error) {
        console.error('❌ Test error:', error.message);
        process.exitCode = 1;
    } finally {
        await cleanup();
        console.log('🧹 Test user cleaned up.');
    }
}

runTest();
