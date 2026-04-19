const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function traceUser() {
  const staff = await prisma.user.findUnique({ where: { email: 'central.hossana@portal.local' }});
  console.log('Staff:', staff ? { id: staff.id, role: staff.role } : 'Not found');
  
  const report = await prisma.report.findFirst({
    where: { title: 'Override Test Report' },
    orderBy: { id: 'desc' }
  });
  console.log('Report before review:', report ? { id: report.id, status: report.status } : 'Not found');
}

traceUser().catch(console.error).finally(() => prisma.$disconnect());
