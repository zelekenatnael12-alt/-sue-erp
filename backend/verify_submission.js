const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE_URL = 'http://localhost:3001/api';

async function verify() {
  try {
    console.log('1. Logging in...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'central.regional@portal.local',
      password: 'Password123!'
    });
    const token = loginRes.data.token;
    console.log('   Login successful.');

    console.log('2. Submitting regional report...');
    const reportRes = await axios.post(`${BASE_URL}/reports/sub-regional`, 
      {
        title: 'Backend Verification Report',
        content: 'Testing persistence via direct API call.',
        expenseAmount: 999
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    console.log(`   Report submitted. ID: ${reportRes.data.id}, Status: ${reportRes.data.status}`);

    console.log('3. Verifying in database...');
    const dbReport = await prisma.report.findUnique({
      where: { id: reportRes.data.id }
    });
    
    if (dbReport && dbReport.status === 'PENDING_NATIONAL') {
      console.log('✅ VERIFICATION SUCCESS: Report persisted with PENDING_NATIONAL status.');
    } else {
      console.log('❌ VERIFICATION FAILED: Report not found or status incorrect.');
      console.log('Actual report:', dbReport);
    }

  } catch (error) {
    console.error('❌ ERROR during verification:', error.response ? error.response.data : error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
