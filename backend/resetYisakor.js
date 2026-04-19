const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetAndCheck() {
  const email = 'yisakor.teklu.betire@suethiopia.org';
  const password = 'SUE@Leader2025';
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { 
      passwordHash,
      mustChangePassword: true, // Forces them to change it again to be safe
      isActive: true
    }
  });

  console.log('User password reset successfully:');
  console.log(JSON.stringify({ 
      email: user.email, 
      isActive: user.isActive, 
      mustChangePassword: user.mustChangePassword 
    }, null, 2));
}

resetAndCheck().catch(console.error).finally(() => prisma.$disconnect());
