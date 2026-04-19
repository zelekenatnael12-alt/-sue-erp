const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { role: 'AREA_STAFF' },
    select: { id: true, email: true, area: true }
  });
  console.log(JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}

main();
