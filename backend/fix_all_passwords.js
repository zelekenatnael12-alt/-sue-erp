const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function fixAll() {
  const hash = await bcrypt.hash('SUE@Leader2025', 12);
  const users = await prisma.user.findMany({
    where: { email: { endsWith: '@suethiopia.org' } }
  });
  
  for (const u of users) {
    await prisma.user.update({ where: { id: u.id }, data: { passwordHash: hash } });
    console.log(`Reset: ${u.full_name}`);
  }
  console.log(`Done. All ${users.length} users reset to SUE@Leader2025`);
}

fixAll().catch(console.error).finally(() => prisma.$disconnect());
