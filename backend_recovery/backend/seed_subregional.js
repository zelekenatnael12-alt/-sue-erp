const bcrypt = require('bcryptjs');
const { PrismaClient } = require('./node_modules/@prisma/client');
const db = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Password123!', 10);
  const user = await db.user.upsert({
    where: { email: 'subregional@portal.local' },
    update: { passwordHash: hash, role: 'SUB_REGIONAL', name: 'Sub-Regional Test Coordinator', subRegion: 'Addis Ababa Sub-Region' },
    create: { email: 'subregional@portal.local', passwordHash: hash, name: 'Sub-Regional Test Coordinator', role: 'SUB_REGIONAL', subRegion: 'Addis Ababa Sub-Region' }
  });
  console.log('Created:', user.email, user.role);
  await db.$disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });
