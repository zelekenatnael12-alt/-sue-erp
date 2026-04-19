const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function list() {
  const regions = await prisma.region.findMany();
  console.log(JSON.stringify(regions, null, 2));
  await prisma.$disconnect();
}

list().catch(console.error);
