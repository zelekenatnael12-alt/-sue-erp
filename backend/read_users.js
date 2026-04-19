const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ 
    select: { id: true, email: true, idNumber: true, role: true, isActive: true } 
  });
  console.log('Total Users:', users.length);
  console.log(JSON.stringify(users, null, 2));
}
main().finally(() => prisma.$disconnect());
