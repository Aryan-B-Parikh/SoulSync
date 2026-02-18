/**
 * Load Test — Vercel Serverless Timeout Simulation
 *
 * Opens N concurrent SSE streams with a long-generation prompt and monitors:
 *   - Time to first token (TTFT)
 *   - Total stream duration
 *   - Whether streams are cut at Vercel's 10s (Hobby) or 60s (Pro) timeout
 *
 * Prerequisites:
 *   - Backend running: npm run backend:dev  (or set TEST_API_URL to deployed URL)
 *   - A valid JWT token (set TEST_TOKEN env var, or the script will register a temp user)
 *
 * Usage:
 *   node scripts/load-test-streaming.js
 *   TEST_API_URL=https://your-vercel-app.vercel.app node scripts/load-test-streaming.js
 *
 * Interpreting results:
 *   - If streams cut at ~10s → You're on Vercel Hobby plan (10s limit)
 *   - If streams cut at ~60s → You're on Vercel Pro plan (60s limit)
 *   - If streams complete    → You're within the timeout budget ✅
 */

const http = require('http');
const https = require('https');
const fetch = require('node-fetch');
require('dotenv').config();

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3001';
const CONCURRENT_STREAMS = parseInt(process.env.LOAD_CONCURRENCY || '5', 10); // Start with 5, not 20
const LONG_PROMPT = 'Write a detailed 400-word story about the Aurora Borealis and its scientific explanation.';
const TS = Date.now();
const TEST_EMAIL = `load-test-${TS}@soulsync-test.local`;
const TEST_PASSWORD = 'TestPassword123!';

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
    if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(data)}`);
    return data;
}

function openSSEStream(url, token) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        let firstTokenTime = null;
        let totalChunks = 0;
        let completed = false;
        let timedOut = false;

        const urlObj = new URL(url);
        const lib = urlObj.protocol === 'https:' ? https : http;

        const req = lib.request({
            hostname: urlObj.hostname,
            port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
            path: urlObj.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'text/event-stream',
            },
        }, (res) => {
            res.on('data', (chunk) => {
                const text = chunk.toString();
                if (!firstTokenTime && text.includes('"chunk"')) {
                    firstTokenTime = Date.now() - startTime;
                }
                totalChunks++;

                if (text.includes('"done":true')) {
                    completed = true;
                    req.destroy();
                }
            });

            res.on('end', () => {
                resolve({
                    duration: Date.now() - startTime,
                    ttft: firstTokenTime,
                    chunks: totalChunks,
                    completed,
                    timedOut,
                    statusCode: res.statusCode,
                });
            });

            res.on('error', (err) => {
                resolve({
                    duration: Date.now() - startTime,
                    ttft: firstTokenTime,
                    chunks: totalChunks,
                    completed: false,
                    timedOut,
                    error: err.message,
                });
            });
        });

        req.on('error', (err) => {
            resolve({
                duration: Date.now() - startTime,
                ttft: firstTokenTime,
                chunks: totalChunks,
                completed: false,
                error: err.message,
            });
        });

        // Timeout detection
        const TIMEOUT_MS = 70000; // 70s — catches both 10s and 60s Vercel limits
        setTimeout(() => {
            timedOut = true;
            req.destroy();
        }, TIMEOUT_MS);

        const body = JSON.stringify({ content: LONG_PROMPT });
        req.write(body);
        req.end();
    });
}

async function runLoadTest() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║       LOAD TEST — VERCEL TIMEOUT SIMULATION                ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log(`Target URL    : ${BASE_URL}`);
    console.log(`Concurrency   : ${CONCURRENT_STREAMS} simultaneous streams`);
    console.log(`Prompt        : "${LONG_PROMPT.substring(0, 60)}..."\n`);

    let token = process.env.TEST_TOKEN;
    let chatIds = [];

    try {
        // Setup: register user and create chats
        if (!token) {
            console.log('⚙️  Setting up test user...');
            const reg = await api('POST', '/api/auth/register', {
                email: TEST_EMAIL, password: TEST_PASSWORD, name: 'Load Test User',
            });
            token = reg.token;
        }

        console.log(`⚙️  Creating ${CONCURRENT_STREAMS} test chats...`);
        for (let i = 0; i < CONCURRENT_STREAMS; i++) {
            const chat = await api('POST', '/api/chats', { title: `Load Test ${i + 1}` }, token);
            chatIds.push(chat.chat._id || chat.chat.id);
        }
        console.log('   ✅ Chats created\n');

        // Run concurrent streams
        console.log(`🚀 Opening ${CONCURRENT_STREAMS} concurrent SSE streams...\n`);
        const overallStart = Date.now();

        const streamPromises = chatIds.map((chatId, i) => {
            const url = `${BASE_URL}/api/stream/${chatId}`;
            return openSSEStream(url, token).then(result => ({ stream: i + 1, ...result }));
        });

        const results = await Promise.all(streamPromises);
        const totalTime = Date.now() - overallStart;

        // Report
        console.log('📊 Results:\n');
        console.log('Stream │ Duration │ TTFT   │ Chunks │ Status');
        console.log('───────┼──────────┼────────┼────────┼────────────────');
        results.forEach(r => {
            const status = r.error ? `❌ Error: ${r.error.substring(0, 30)}`
                : r.timedOut ? '⏰ TIMED OUT'
                    : r.completed ? '✅ Completed'
                        : '⚠️  Incomplete';
            const dur = `${(r.duration / 1000).toFixed(1)}s`.padEnd(8);
            const ttft = r.ttft ? `${r.ttft}ms`.padEnd(6) : 'N/A   ';
            const chunks = String(r.chunks).padEnd(6);
            console.log(`  ${String(r.stream).padEnd(5)} │ ${dur} │ ${ttft} │ ${chunks} │ ${status}`);
        });

        const completed = results.filter(r => r.completed).length;
        const timedOut = results.filter(r => r.timedOut).length;
        const avgDuration = results.reduce((s, r) => s + r.duration, 0) / results.length;
        const avgTTFT = results.filter(r => r.ttft).reduce((s, r) => s + r.ttft, 0) / (results.filter(r => r.ttft).length || 1);

        console.log('\n📈 Summary:');
        console.log(`   Completed   : ${completed}/${CONCURRENT_STREAMS}`);
        console.log(`   Timed out   : ${timedOut}/${CONCURRENT_STREAMS}`);
        console.log(`   Avg duration: ${(avgDuration / 1000).toFixed(1)}s`);
        console.log(`   Avg TTFT    : ${avgTTFT.toFixed(0)}ms`);
        console.log(`   Total time  : ${(totalTime / 1000).toFixed(1)}s\n`);

        // Recommendations
        console.log('💡 Recommendations:');
        if (timedOut > 0) {
            const cutAt = results.filter(r => r.timedOut).map(r => r.duration);
            const avgCut = cutAt.reduce((a, b) => a + b, 0) / cutAt.length;
            if (avgCut < 12000) {
                console.log('   ⚠️  Streams cut at ~10s → Vercel Hobby plan limit detected.');
                console.log('   FIX: Upgrade to Vercel Pro (60s limit) OR migrate streaming to:');
                console.log('        - Vercel Edge Functions (no timeout for streaming)');
                console.log('        - Railway / Render (persistent Node.js server)');
            } else if (avgCut < 65000) {
                console.log('   ⚠️  Streams cut at ~60s → Vercel Pro plan limit detected.');
                console.log('   FIX: Move streaming endpoint to Vercel Edge Functions or Railway.');
            }
        } else {
            console.log('   ✅ All streams completed within timeout budget.');
            console.log('   ✅ No Vercel timeout issues detected at this concurrency level.');
        }

    } catch (error) {
        console.error('❌ Load test error:', error.message);
    } finally {
        // Cleanup
        if (token && !process.env.TEST_TOKEN) {
            try {
                await fetch(`${BASE_URL}/api/user/profile`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('\n🧹 Test user cleaned up.');
            } catch { /* ignore */ }
        }
    }
}

runLoadTest();
