async function verify() {
  const BASE_URL = 'http://localhost:3001/api';
  try {
    console.log('1. Logging in as central.regional@portal.local...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'central.regional@portal.local',
        password: 'Password123!'
      })
    });
    
    if (!loginRes.ok) {
        const errText = await loginRes.text();
        console.error(`❌ Login failed: ${loginRes.status} - ${errText}`);
        return;
    }

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
        title: 'Diagnostic Verification Report',
        content: 'Testing persistence via unified API test.',
        expenseAmount: 777
      })
    });
    
    const reportData = await reportRes.json();
    if (reportRes.ok) {
        console.log(`✅ Success! Report ID: ${reportData.id}, Status: ${reportData.status}`);
    } else {
        console.error(`❌ Submission failed: ${reportRes.status}`, reportData);
        return;
    }

    console.log('3. Fetching submissions list...');
    const subRes = await fetch(`${BASE_URL}/sub-regional/submissions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const subData = await subRes.json();
    if (subRes.ok) {
        const found = subData.reports.find(r => r.id === reportData.id);
        if (found) {
            console.log(`✅ VERIFICATION COMPLETE: Report is visible in manager history.`);
            console.log(`   Final Status: ${found.status}`);
        } else {
            console.error('❌ Report not found in history log result.');
            console.log('History data:', JSON.stringify(subData, null, 2));
        }
    } else {
        console.error(`❌ Failed to fetch submissions: ${subRes.status}`, subData);
    }

  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error.message);
  }
}

verify();
