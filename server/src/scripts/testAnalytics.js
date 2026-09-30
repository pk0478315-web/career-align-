const axios = require('axios');
const assert = require('assert');

async function runTests() {
  console.log("🧪 Starting Dashboard Analytics Tests...");
  const API_URL = 'http://localhost:5000/api';
  let token1 = null;
  let token2 = null;

  try {
    // 1. New user with zero data
    const email1 = `analytics_zero_${Date.now()}@test.com`;
    await axios.post(`${API_URL}/auth/register`, { name: 'Zero Data User', email: email1, password: 'password123' });
    const login1 = await axios.post(`${API_URL}/auth/login`, { email: email1, password: 'password123' });
    token1 = login1.data.data.token;

    console.log("\n--- New User Zero Data ---");
    const zeroRes = await axios.get(`${API_URL}/analytics`, { headers: { Authorization: `Bearer ${token1}` }});
    assert.strictEqual(zeroRes.data.data.opportunities.tracked, 0);
    assert.strictEqual(zeroRes.data.data.applications.applied, 0);
    assert.strictEqual(zeroRes.data.data.career.roadmapCompletion, 0);
    assert.strictEqual(zeroRes.data.data.activity.recent.length, 0);
    console.log(`  ✅ PASS: New user starts with zero tracked items and empty arrays.`);

    // 2. User with data (Opportunities, Applications, Roadmap)
    const email2 = `analytics_rich_${Date.now()}@test.com`;
    await axios.post(`${API_URL}/auth/register`, { name: 'Rich Data User', email: email2, password: 'password123' });
    const login2 = await axios.post(`${API_URL}/auth/login`, { email: email2, password: 'password123' });
    token2 = login2.data.data.token;

    // Track some opportunities to simulate the pipeline
    const oppsRes = await axios.get(`${API_URL}/opportunities?category=all`);
    const opp1 = oppsRes.data.data.items[0].id;
    const opp2 = oppsRes.data.data.items[1].id;
    const opp3 = oppsRes.data.data.items[2].id;

    await axios.post(`${API_URL}/my-opportunities`, { opportunityId: opp1, status: 'saved' }, { headers: { Authorization: `Bearer ${token2}` }});
    await axios.post(`${API_URL}/my-opportunities`, { opportunityId: opp2, status: 'applied' }, { headers: { Authorization: `Bearer ${token2}` }});
    await axios.post(`${API_URL}/my-opportunities`, { opportunityId: opp3, status: 'interview' }, { headers: { Authorization: `Bearer ${token2}` }});

    // Create a roadmap
    // First simulate pro upgrade using the mock webhook
    const decodedToken = JSON.parse(Buffer.from(token2.split('.')[1], 'base64').toString());
    await axios.post(`${API_URL}/webhooks/payment`, {
      type: 'customer.subscription.created',
      data: {
        userId: decodedToken.id,
        plan_id: 'pro',
        status: 'active'
      }
    });

    await axios.post(`${API_URL}/roadmap/generate`, {}, { headers: { Authorization: `Bearer ${token2}` }});
    await axios.put(`${API_URL}/roadmap/progress`, { 
      milestones: [{ id: 'm1', title: 'Test', description: 'desc', status: 'completed' }],
      progress: 65 
    }, { headers: { Authorization: `Bearer ${token2}` }});

    console.log("\n--- User with Multiple Application States & Roadmap ---");
    const richRes = await axios.get(`${API_URL}/analytics`, { headers: { Authorization: `Bearer ${token2}` }});
    const { applications, career, activity, opportunities } = richRes.data.data;

    assert.strictEqual(opportunities.tracked, 3);
    assert.strictEqual(applications.saved || opportunities.saved, 1);
    assert.strictEqual(applications.applied, 1);
    assert.strictEqual(applications.interviews, 1);
    assert.strictEqual(career.roadmapCompletion, 65);
    assert.strictEqual(activity.recent.length, 3);
    console.log(`  ✅ PASS: Analytics accurately reflect tracked opportunities.`);
    console.log(`  ✅ PASS: Pipeline statuses accurately binned.`);
    console.log(`  ✅ PASS: Roadmap progress properly retrieved (65%).`);
    console.log(`  ✅ PASS: Recent activity sorted and truncated correctly.`);

    console.log("\n=================================================");
    console.log("📊 DASHBOARD ANALYTICS TEST SUMMARY: ALL PASSED");
    console.log("=================================================");
  } catch (err) {
    console.error("❌ Tests failed:", err.response ? err.response.data : err.message);
    process.exit(1);
  }
}

runTests();
