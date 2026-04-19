const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const user = await prisma.user.findFirst({
        where: { email: 'central.regional@portal.local' }
    });
    console.log('User found:', JSON.stringify(user, null, 2));

    const pendingCount = await prisma.report.count({
        where: { status: 'PENDING_REGIONAL' }
    });
    console.log('Total PENDING_REGIONAL reports:', pendingCount);

  } catch (err) {
    console.error('Error checking DB:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
