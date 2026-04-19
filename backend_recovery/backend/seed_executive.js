const bcrypt = require('bcryptjs');
const { PrismaClient } = require('./node_modules/@prisma/client');
const db = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Password123!', 10);
  const user = await db.user.upsert({
    where: { email: 'executive@portal.local' },
    update: { passwordHash: hash, role: 'EXECUTIVE', name: 'National Director' },
    create: { email: 'executive@portal.local', passwordHash: hash, name: 'National Director', role: 'EXECUTIVE' }
  });
  console.log('Created:', user.email, user.role);
  await db.$disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });
