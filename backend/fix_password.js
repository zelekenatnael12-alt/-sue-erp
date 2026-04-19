const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function fix() {
  const email = 'berhanu.solomon.g.michael@suethiopia.org';
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) { console.log('User not found'); return; }
  
  // Test current password
  const testOld = await bcrypt.compare('SUE@Leader2025', user.passwordHash);
  console.log(`Password 'SUE@Leader2025' matches: ${testOld}`);
  
  if (!testOld) {
    console.log('Resetting password to SUE@Leader2025...');
    const hash = await bcrypt.hash('SUE@Leader2025', 12);
    await prisma.user.update({ where: { email }, data: { passwordHash: hash } });
    console.log('Password reset complete.');
  }
}

fix().catch(console.error).finally(() => prisma.$disconnect());
