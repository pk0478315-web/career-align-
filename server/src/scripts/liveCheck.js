const http = require('http');

function apiCall(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  console.log('--- 1. Testing GET /api/health ---');
  const health = await apiCall('GET', '/api/health');
  console.log('Status:', health.status);
  console.log('Body:', JSON.stringify(health.body, null, 2));

  console.log('\n--- 2. Testing POST /api/auth/register ---');
  const email = `live_student_${Date.now()}@college.edu`;
  const reg = await apiCall('POST', '/api/auth/register', {
    email,
    password: 'Password123!',
    displayName: 'Piyush Student'
  });
  console.log('Status:', reg.status);
  const token = reg.body?.data?.token;
  console.log('Got Token:', token ? `${token.substring(0, 30)}...` : 'NONE');

  console.log('\n--- 3. Testing GET /api/opportunities (Personalized) ---');
  const opps = await apiCall('GET', '/api/opportunities', null, token);
  console.log('Status:', opps.status);
  console.log('Total Opportunities:', opps.body?.data?.total);
  const sampleOpp = opps.body?.data?.items?.[0];
  console.log('First Item Title:', sampleOpp?.title);
  console.log('Match Explanation:', sampleOpp?.matchExplanation);

  console.log('\n--- 4. Testing POST /api/ai/eligibility-check ---');
  const eligibility = await apiCall('POST', '/api/ai/eligibility-check', {
    opportunityId: sampleOpp?.id
  }, token);
  console.log('Status:', eligibility.status);
  console.log('Eligibility Result:', JSON.stringify(eligibility.body?.data, null, 2));

  console.log('\n--- 5. Testing POST /api/my-opportunities (Track/Save) ---');
  const track = await apiCall('POST', '/api/my-opportunities', {
    opportunityId: sampleOpp?.id,
    status: 'saved',
    notes: 'Saved for deadline tracking'
  }, token);
  console.log('Status:', track.status);
  console.log('Tracked Item Status:', track.body?.data?.status);

  console.log('\n--- 6. Testing GET /api/my-opportunities (Pipeline Counts) ---');
  const tracker = await apiCall('GET', '/api/my-opportunities', null, token);
  console.log('Status:', tracker.status);
  console.log('Pipeline Counts:', JSON.stringify(tracker.body?.data?.counts, null, 2));
}

main().catch(console.error);
