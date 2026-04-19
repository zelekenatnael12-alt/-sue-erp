const fs = require('fs');

async function verify_override() {
  const BASE_URL = 'http://127.0.0.1:3001/api';
  let logs = '';
  const log = (msg) => { logs += msg + '\n'; console.log(msg); };

  try {
    log('1. Logging in as Area Staff...');
    const staffLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'central.hossana@portal.local',
        password: 'Password123!'
      })
    });
    const { token: staffToken, user: staffUser } = await staffLogin.json();
    log(`   Staff logged in region: ${staffUser.region}`);

    log('2. Submitting a report as Area Staff...');
    const reportRes = await fetch(`${BASE_URL}/reports/sub-regional`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${staffToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Override Test Report',
        content: 'Testing regional step-in authority.',
        expenseAmount: 250
      })
    });
    const report = await reportRes.json();
    log(`   Report submitted. ID: ${report.id}, Status: ${report.status}`);

    log('3. Logging in as Regional Director...');
    const rdLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'central.regional@portal.local',
        password: 'Password123!'
      })
    });
    const { token: rdToken } = await rdLogin.json();

    log('4. Checking regional queue for the sub-regional pending report...');
    const queueRes = await fetch(`${BASE_URL}/regional/approvals/all`, {
      headers: { 'Authorization': `Bearer ${rdToken}` }
    });
    const queue = await queueRes.json();
    const testItem = queue.reports.find(r => r.id === report.id);
    if (testItem) {
      log('✅ Success: Sub-regional report found in RD queue.');
    } else {
      log('❌ Failed: Sub-regional report NOT found in RD queue.');
      fs.writeFileSync('verify_out2.txt', logs);
      return;
    }

    log('5. Approving report as Regional Director (Override)...');
    const reviewRes = await fetch(`${BASE_URL}/workflows/report/${report.id}/review`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${rdToken}`
      },
      body: JSON.stringify({ status: 'APPROVED', comments: 'Regional override approval' })
    });
    const updatedReport = await reviewRes.json();
    log(`   Review submitted. New Status: ${updatedReport.status}, Debug: ${JSON.stringify(updatedReport._debug)}`);

    if (updatedReport.status === 'PENDING_NATIONAL') {
      log('✅ Success: Status correctly advanced to PENDING_NATIONAL (Skipped Regional step).');
    } else {
      log(`❌ Failed: Status was ${updatedReport.status} instead of PENDING_NATIONAL`);
    }

  } catch (err) {
    log(`❌ Error during verification: ${err.message}`);
  }
  
  fs.writeFileSync('verify_out2.txt', logs);
}

verify_override();
