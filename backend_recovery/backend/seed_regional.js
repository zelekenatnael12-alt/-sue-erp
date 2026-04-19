const bcrypt = require('bcryptjs');
const { PrismaClient } = require('./node_modules/@prisma/client');
const db = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Password123!', 10);
  const user = await db.user.upsert({
    where: { email: 'regional@portal.local' },
    update: { passwordHash: hash, role: 'COORDINATOR', name: 'Tesfaye Bekele', region: 'Southern Region' },
    create: { email: 'regional@portal.local', passwordHash: hash, name: 'Tesfaye Bekele', role: 'COORDINATOR', region: 'Southern Region' }
  });
  console.log('Created:', user.email, user.role);
  await db.$disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });
