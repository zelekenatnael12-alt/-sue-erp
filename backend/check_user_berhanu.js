const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findUnique({
    where: { email: 'berhanu.solomon.g.michael@suethiopia.org' }
  });

  if (user) {
    console.log(`User found: ${user.full_name}`);
    console.log(`Role: ${user.role}`);
    console.log(`Active: ${user.isActive}`);
  } else {
    console.log('User NOT found');
  }
}

check().finally(() => prisma.$disconnect());
