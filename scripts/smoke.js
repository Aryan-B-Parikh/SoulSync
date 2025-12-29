/**
 * Smoke Test Script
 * Quick validation of critical endpoints
 */

const API_URL = process.env.API_URL || 'http://localhost:5001/api';

async function smokeTest() {
  console.log('🔥 Running smoke tests...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthRes = await fetch(`${API_URL}/health`);
    const healthData = await healthRes.json();
    
    if (healthRes.ok && healthData.status === 'ok') {
      console.log('✅ Health check passed\n');
    } else {
      throw new Error('Health check failed');
    }

    // Test 2: Register new user
    console.log('2️⃣ Testing user registration...');
    const testEmail = `test-${Date.now()}@example.com`;
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123',
        name: 'Smoke Test User',
      }),
    });
    const registerData = await registerRes.json();

    if (!registerRes.ok) {
      throw new Error(`Registration failed: ${registerData.error}`);
    }
    console.log('✅ User registration passed');
    console.log(`   Token: ${registerData.token.substring(0, 20)}...\n`);

    const token = registerData.token;

    // Test 3: Get profile
    console.log('3️⃣ Testing profile endpoint...');
    const profileRes = await fetch(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const profileData = await profileRes.json();

    if (!profileRes.ok || profileData.user.email !== testEmail) {
      throw new Error('Profile fetch failed');
    }
    console.log('✅ Profile fetch passed\n');

    // Test 4: Create chat
    console.log('4️⃣ Testing chat creation...');
    const chatRes = await fetch(`${API_URL}/chats`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'Smoke Test Chat' }),
    });
    const chatData = await chatRes.json();

    if (!chatRes.ok) {
      throw new Error(`Chat creation failed: ${chatData.error}`);
    }
    console.log('✅ Chat creation passed');
    console.log(`   Chat ID: ${chatData.chat._id}\n`);

    const chatId = chatData.chat._id;

    // Test 5: Send message
    console.log('5️⃣ Testing message sending...');
    const messageRes = await fetch(`${API_URL}/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: 'Hello, this is a smoke test!' }),
    });
    const messageData = await messageRes.json();

    if (!messageRes.ok) {
      throw new Error(`Message send failed: ${messageData.error}`);
    }
    console.log('✅ Message sending passed');
    console.log(`   User message: "${messageData.userMessage.content}"`);
    console.log(`   AI response: "${messageData.assistantMessage.content.substring(0, 50)}..."\n`);

    // Test 6: Get chat list
    console.log('6️⃣ Testing chat list retrieval...');
    const chatsRes = await fetch(`${API_URL}/chats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const chatsData = await chatsRes.json();

    if (!chatsRes.ok || chatsData.chats.length === 0) {
      throw new Error('Chat list retrieval failed');
    }
    console.log('✅ Chat list retrieval passed');
    console.log(`   Found ${chatsData.chats.length} chat(s)\n`);

    // Test 7: Delete chat
    console.log('7️⃣ Testing chat deletion...');
    const deleteRes = await fetch(`${API_URL}/chats/${chatId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!deleteRes.ok) {
      throw new Error('Chat deletion failed');
    }
    console.log('✅ Chat deletion passed\n');

    console.log('🎉 All smoke tests passed!');
    console.log('✨ System is operational\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Smoke test failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  smokeTest();
}

module.exports = smokeTest;
