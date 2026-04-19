const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function check() {
  const email = 'yisakor.teklu.betire@suethiopia.org';
  const password = 'SUE@Leader2025';
  
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log('USER_NOT_FOUND');
    return;
  }
  
  const valid = await bcrypt.compare(password, user.passwordHash);
  console.log('USER_ID:', user.id);
  console.log('USER_EMAIL:', user.email);
  console.log('USER_ACTIVE:', user.isActive);
  console.log('PASSWORD_VALID:', valid);
  
  // Also check for any other user with this email but different case (though findUnique is usually case sensitive depending on DB)
  const allUsers = await prisma.user.findMany({
    where: { email: { contains: 'yisakor.teklu.betire', mode: 'insensitive' } }
  });
  console.log('INDIRECT_MATCHES:', allUsers.length);
  allUsers.forEach(u => console.log('MATCH:', u.email, u.isActive));
}

check().catch(console.error).finally(() => prisma.$disconnect());
