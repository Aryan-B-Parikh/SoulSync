/**
 * Security Isolation Test — Cross-Tenant Memory Leak
 *
 * Verifies that User B cannot access User A's memories through the RAG system.
 * This is a CRITICAL security test for any multi-user RAG application.
 *
 * Workflow:
 *   1. Register User A → send message containing a secret ("My secret code is 1234")
 *   2. Register User B → ask "What is the secret code?"
 *   3. PASS: User B's response does NOT contain "1234"
 *   4. FAIL (Critical Security Bug): User B's response contains "1234"
 *
 * Prerequisites:
 *   - Backend running: npm run backend:dev
 *   - Pinecone configured in .env
 *
 * Usage:
 *   node tests/security-isolation.js
 */

const fetch = require('node-fetch');
require('dotenv').config();

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3001';
const TS = Date.now();
const USER_A_EMAIL = `security-test-a-${TS}@soulsync-test.local`;
const USER_B_EMAIL = `security-test-b-${TS}@soulsync-test.local`;
const TEST_PASSWORD = 'TestPassword123!';
const SECRET = '1234';

let tokenA = null;
let tokenB = null;

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
    if (!res.ok) throw new Error(`API ${method} ${path} → ${res.status}: ${JSON.stringify(data)}`);
    return data;
}

async function sendMessage(chatId, content, authToken) {
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

async function cleanup(tokenA, tokenB) {
    for (const token of [tokenA, tokenB]) {
        if (!token) continue;
        try {
            await fetch(`${BASE_URL}/api/user/profile`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch { /* ignore */ }
    }
}

async function runTest() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║       SECURITY TEST — CROSS-TENANT ISOLATION               ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    try {
        // ── User A: plant the secret ──────────────────────────────────────────
        console.log('1️⃣  Registering User A and planting secret memory...');
        const regA = await api('POST', '/api/auth/register', {
            email: USER_A_EMAIL, password: TEST_PASSWORD, name: 'Security Test User A',
        });
        tokenA = regA.token;

        const chatA = await api('POST', '/api/chats', { title: 'User A Secret Chat' }, tokenA);
        const chatAId = chatA.chat._id || chatA.chat.id;

        await sendMessage(chatAId, `My secret code is ${SECRET}. Please remember this.`, tokenA);
        console.log(`   ✅ User A planted secret: "${SECRET}"\n`);

        // Wait for embedding to be stored in Pinecone
        console.log('   ⏳ Waiting 3s for Pinecone to index User A\'s memory...');
        await new Promise(r => setTimeout(r, 3000));

        // ── User B: attempt to extract the secret ─────────────────────────────
        console.log('2️⃣  Registering User B and querying for the secret...');
        const regB = await api('POST', '/api/auth/register', {
            email: USER_B_EMAIL, password: TEST_PASSWORD, name: 'Security Test User B',
        });
        tokenB = regB.token;

        const chatB = await api('POST', '/api/chats', { title: 'User B Probe Chat' }, tokenB);
        const chatBId = chatB.chat._id || chatB.chat.id;

        const response = await sendMessage(chatBId, 'What is the secret code?', tokenB);
        const aiResponse = response.assistantMessage?.content || '';
        console.log(`   AI Response to User B: "${aiResponse.substring(0, 300)}"\n`);

        // ── Evaluate ──────────────────────────────────────────────────────────
        console.log('3️⃣  Evaluating isolation...');
        const leaked = aiResponse.includes(SECRET);

        if (!leaked) {
            console.log('   ✅ PASS — User B did NOT receive User A\'s secret.');
            console.log('   ✅ Cross-tenant isolation is working correctly.');
            console.log('   ✅ Pinecone userId filter is enforced.\n');
        } else {
            console.log('   ❌ CRITICAL SECURITY FAILURE — User B received User A\'s secret!');
            console.log(`   ❌ The response contained: "${SECRET}"`);
            console.log('   ❌ IMMEDIATE ACTION REQUIRED:');
            console.log('      Check vectorService.js → retrieveRelevantMemories()');
            console.log('      Ensure filter: { userId: { $eq: userId } } is present in Pinecone query.\n');
            process.exitCode = 1;
        }

    } catch (error) {
        console.error('❌ Test error:', error.message);
        process.exitCode = 1;
    } finally {
        await cleanup(tokenA, tokenB);
        console.log('🧹 Test users cleaned up.');
    }
}

runTest();
