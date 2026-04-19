const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Password123!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'area@portal.local' },
    update: { passwordHash: hash, role: 'AREA_STAFF', name: 'Area Test Coordinator', region: 'Addis Ababa', mustChangePassword: false },
    create: { email: 'area@portal.local', passwordHash: hash, role: 'AREA_STAFF', name: 'Area Test Coordinator', region: 'Addis Ababa', mustChangePassword: false },
  });
  console.log('Seeded Area Staff user:', user.email);
}
main().catch(console.error).finally(() => prisma.$disconnect());
