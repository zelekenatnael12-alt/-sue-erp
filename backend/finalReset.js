const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function cleanAndReset() {
  const email = 'yisakor.teklu.betire@suethiopia.org';
  const password = 'SUE@Leader2025';
  const hashed = await bcrypt.hash(password, 12);

  // Find by ID to be extremely sure
  const user = await prisma.user.findUnique({ where: { id: 12 } });
  if (!user) {
    console.log('USER_ID_12_NOT_FOUND');
    return;
  }

  const updated = await prisma.user.update({
    where: { id: 12 },
    data: {
      email: email.toLowerCase().trim(),
      passwordHash: hashed,
      isActive: true,
      mustChangePassword: true
    }
  });

  console.log('---RESET_COMPLETE---');
  console.log('Email:', updated.email);
  console.log('Hash prefix:', updated.passwordHash.substring(0, 10));
}

cleanAndReset().catch(console.error).finally(() => prisma.$disconnect());
