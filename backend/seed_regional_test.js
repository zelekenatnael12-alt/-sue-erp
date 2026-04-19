const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  try {
    const subRegionalUser = await prisma.user.findFirst({
        where: { email: 'central.sr1@portal.local' }
    });

    if (!subRegionalUser) {
        console.error('Sub-regional user not found');
        return;
    }

    console.log('Seeding PENDING_REGIONAL reports...');
    await prisma.report.create({
      data: {
        title: 'Central Sub-Regional Monthly Roundup',
        content: 'Comprehensive report on sub-regional ministry metrics.',
        expenseAmount: 4500,
        status: 'PENDING_REGIONAL',
        authorId: subRegionalUser.id,
        coordinatorId: subRegionalUser.id, // Just in case it's still needed
        dateSubmitted: new Date()
      }
    });

    console.log('✅ Seed successful.');
  } catch (err) {
    console.error('Error seeding test reports:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
