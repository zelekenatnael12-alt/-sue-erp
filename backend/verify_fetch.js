async function verify() {
  const BASE_URL = 'http://localhost:3001/api';
  try {
    console.log('1. Logging in...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'central.regional@portal.local',
        password: 'Password123!'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('   Login successful.');

    console.log('2. Submitting regional report...');
    const reportRes = await fetch(`${BASE_URL}/reports/sub-regional`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Fetch Verification Report',
        content: 'Manual fetch test.',
        expenseAmount: 888
      })
    });
    const reportData = await reportRes.json();
    console.log(`   Report submitted. ID: ${reportData.id}, Status: ${reportData.status}`);

    console.log('3. Fetching submissions to verify visibility...');
    const subRes = await fetch(`${BASE_URL}/sub-regional/submissions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const subData = await subRes.json();
    const found = subData.reports.find(r => r.id === reportData.id);
    
    if (found) {
      console.log('✅ VERIFICATION SUCCESS: Report visible in manager submissions log.');
      console.log(`   Status: ${found.status} (Expected: PENDING_NATIONAL)`);
    } else {
      console.log('❌ VERIFICATION FAILED: Report not found in log.');
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

verify();
