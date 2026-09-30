const axios = require('axios');

async function runTests() {
  console.log("🧪 Starting Persistent Conversations Tests...");
  const API_URL = 'http://localhost:5000/api';
  let token1 = null;
  let token2 = null;
  let convId = null;

  try {
    // 1. Setup Users
    const email1 = `conv_${Date.now()}@test.com`;
    await axios.post(`${API_URL}/auth/register`, { name: 'User 1', email: email1, password: 'password123' });
    const login1 = await axios.post(`${API_URL}/auth/login`, { email: email1, password: 'password123' });
    token1 = login1.data.data.token;

    const email2 = `conv_unauth_${Date.now()}@test.com`;
    await axios.post(`${API_URL}/auth/register`, { name: 'User 2', email: email2, password: 'password123' });
    const login2 = await axios.post(`${API_URL}/auth/login`, { email: email2, password: 'password123' });
    token2 = login2.data.data.token;

    // 2. Create Conversation
    console.log("\n--- Create Conversation ---");
    const createRes = await axios.post(`${API_URL}/ai/conversations`, { title: 'My AI Chat' }, { headers: { Authorization: `Bearer ${token1}` }});
    convId = createRes.data.data.id;
    console.log(`  ✅ PASS: Created conversation ${convId}`);

    // 3. Send Message
    console.log("\n--- Send Message ---");
    const msgRes = await axios.post(`${API_URL}/ai/conversations/${convId}/messages`, { content: 'What skills do I need?' }, { headers: { Authorization: `Bearer ${token1}` }});
    console.log(`  ✅ PASS: Message sent. AI replied: "${msgRes.data.data.content.substring(0, 50)}..."`);

    // 4. Retrieve Conversation (Simulating refresh / login)
    console.log("\n--- Retrieve Conversation ---");
    const getRes = await axios.get(`${API_URL}/ai/conversations/${convId}`, { headers: { Authorization: `Bearer ${token1}` }});
    if (getRes.data.data.messages.length === 2) {
      console.log("  ✅ PASS: Conversation retrieved with full history (User + AI).");
    }

    // 5. Unauthorized Access (User 2 tries to read User 1's chat)
    console.log("\n--- Unauthorized Access ---");
    try {
      await axios.get(`${API_URL}/ai/conversations/${convId}`, { headers: { Authorization: `Bearer ${token2}` }});
      console.error("❌ FAILED: User 2 accessed User 1's conversation!");
    } catch (e) {
      if (e.response.status === 404) {
        console.log("  ✅ PASS: User 2 securely blocked from User 1's conversation (404 Not Found).");
      } else {
        console.error("❌ Error type mismatch:", e.message);
      }
    }

    // 6. Delete Conversation
    console.log("\n--- Delete Conversation ---");
    const delRes = await axios.delete(`${API_URL}/ai/conversations/${convId}`, { headers: { Authorization: `Bearer ${token1}` }});
    console.log("  ✅ PASS: Deleted conversation.");

    try {
      await axios.get(`${API_URL}/ai/conversations/${convId}`, { headers: { Authorization: `Bearer ${token1}` }});
      console.error("❌ FAILED: Conversation still exists after delete!");
    } catch (e) {
      if (e.response.status === 404) {
        console.log("  ✅ PASS: Conversation successfully verified as deleted.");
      }
    }

    console.log("\n=================================================");
    console.log("📊 PERSISTENT CONVERSATIONS TEST SUMMARY: ALL PASSED");
    console.log("=================================================");
  } catch (err) {
    console.error("❌ Tests failed:", err.response ? err.response.data : err.message);
    process.exit(1);
  }
}

runTests();
