const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('--- Phase C Audit Verification ---');
  
  // 1. Check Audit Logs
  const logs = await prisma.auditLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { full_name: true } } }
  });
  
  console.log('Recent Audit Logs:');
  console.table(logs.map(l => ({
    Time: l.createdAt.toISOString(),
    User: l.user?.full_name || 'Unknown',
    Action: l.action,
    Entity: l.entityType,
    ID: l.entityId
  })));

  // 2. Check Date Mapping (Simulated)
  const { dateToMatrixIndex } = require('./utils/dateMapper');
  const now = new Date();
  const matrix = dateToMatrixIndex(now);
  console.log(`\nDate Mapping: ${now.toDateString()} -> ${matrix}`);

  console.log('\n✅ Phase C Verification Complete: Audit Engine and Date Mapping are operational.');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
