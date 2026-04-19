const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const rd = await prisma.user.findFirst({
        where: { email: 'central.regional@portal.local' }
    });
    console.log('RD Region:', rd.region);

    const sr = await prisma.user.findFirst({
        where: { email: 'central.sr1@portal.local' }
    });
    console.log('SR Region:', sr.region);

    const report = await prisma.report.findFirst({
        where: { status: 'PENDING_REGIONAL' },
        include: { author: true }
    });
    if (report) {
        console.log('Report Title:', report.title);
        console.log('Report Author Region:', report.author?.region);
    } else {
        console.log('No PENDING_REGIONAL report found.');
    }

  } catch (err) {
    console.error('Error checking DB:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
