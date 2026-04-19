const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAudit() {
  console.log('--- Light-weight Audit Verification ---');
  
  const postData = JSON.stringify({
    email: 'admin@portal.local',
    password: 'Password123!'
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Response Status: ${res.statusCode}`);
    
    res.on('data', () => {}); // Consume data
    
    res.on('end', async () => {
      console.log('Checking Audit Logs...');
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
      await prisma.$disconnect();
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Request Failed: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

testAudit();
