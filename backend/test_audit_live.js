const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAudit() {
  console.log('--- Live Audit Verification ---');
  
  try {
    // 1. Simulate Login
    console.log('Simulating login for admin@portal.local...');
    await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@portal.local',
      password: 'Password123!'
    });
    console.log('✅ Login successful.');

    // 2. Check Audit Logs
    const log = await prisma.auditLog.findFirst({
      where: { action: 'LOGIN' },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } }
    });

    if (log) {
      console.log('✅ Audit Log Found:');
      console.log(` - Action: ${log.action}`);
      console.log(` - User: ${log.user.email}`);
      console.log(` - Time: ${log.createdAt.toISOString()}`);
    } else {
      console.error('❌ ERROR: Audit log not found!');
    }

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAudit();
