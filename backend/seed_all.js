const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Password123!', 10);
  
  const roles = [
    { email: 'area@portal.local', name: 'Area Staff', role: 'AREA_STAFF' },
    { email: 'subregional@portal.local', name: 'Sub-Regional Coord', role: 'SUB_REGIONAL' },
    { email: 'regional@portal.local', name: 'Regional Director', role: 'COORDINATOR' },
    { email: 'admin@portal.local', name: 'Admin', role: 'ADMIN' },
    { email: 'executive@portal.local', name: 'Executive', role: 'EXECUTIVE' },
  ];

  for (const user of roles) {
    try {
      await db.user.upsert({
        where: { email: user.email },
        update: { passwordHash: hash, role: user.role, full_name: user.name },
        create: { email: user.email, passwordHash: hash, full_name: user.name, role: user.role }
      });
      console.log(`Created: ${user.email} -> ${user.role}`);
    } catch (e) {
      console.error(`Error for ${user.email}:`, e.message);
    }
  }

  await db.$disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });
