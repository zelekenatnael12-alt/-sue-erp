const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      full_name: true,
      isActive: true
    }
  });
  console.log('--- User Audit ---');
  console.table(users);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
