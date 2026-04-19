async function verify() {
  const BASE_URL = 'http://127.0.0.1:3001/api';
  try {
    console.log('1. Logging in as Regional Director...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'central.regional@portal.local',
        password: 'Password123!'
      })
    });
    const { token, user } = await loginRes.json();
    console.log('   Login successful. Region:', user.region);

    console.log('2. Fetching regional pending approvals...');
    const approvalsRes = await fetch(`${BASE_URL}/regional/approvals/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const approvalsData = await approvalsRes.json();
    
    console.log('Approvals Data:', JSON.stringify(approvalsData, null, 2));

    if (approvalsData.reports) {
      const testReport = approvalsData.reports.find(r => r.title === 'Central Sub-Regional Monthly Roundup');
      if (testReport) {
        console.log('✅ Success: Test report found.');
      } else {
        console.log('❌ Failed: Test report NOT found in reports list.');
      }
    } else {
      console.log('❌ Failed: approvalsData.reports is missing.');
    }

  } catch (err) {
    console.error('❌ Error during verification:', err.message);
  }
}

verify();
