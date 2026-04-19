const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    where: {
      email: { endsWith: '@suethiopia.org' }
    },
    select: {
      full_name: true,
      email: true,
      role: true,
      region: { select: { name: true } }
    }
  });

  console.log('--- Provisioned Users Check ---');
  users.forEach(u => {
    console.log(`${u.full_name} | ${u.role} | ${u.region?.name || 'National'}`);
  });
  console.log(`Total: ${users.length}`);
}

check().finally(() => prisma.$disconnect());
