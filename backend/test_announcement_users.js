const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('password123', 10);
  
  // 1. Regional Coordinator
  await prisma.user.upsert({
    where: { email: 'regional1@hub.com' },
    update: {},
    create: {
      email: 'regional1@hub.com',
      full_name: 'Regional Broadcaster',
      passwordHash: hash,
      role: 'COORDINATOR',
      region: 'Hawassa'
    }
  });

  // 2. Matching Area Staff
  await prisma.user.upsert({
    where: { email: 'staff1@hub.com' },
    update: {},
    create: {
      email: 'staff1@hub.com',
      full_name: 'Hawassa Area Staff',
      passwordHash: hash,
      role: 'AREA_STAFF',
      region: 'Hawassa'
    }
  });

  // 3. Non-Matching Area Staff
  await prisma.user.upsert({
    where: { email: 'staff2@hub.com' },
    update: {},
    create: {
      email: 'staff2@hub.com',
      full_name: 'Arba Minch Area Staff',
      passwordHash: hash,
      role: 'AREA_STAFF',
      region: 'Arba Minch'
    }
  });

  // 4. Admin
  await prisma.user.upsert({
    where: { email: 'admin@hub.com' },
    update: {},
    create: {
      email: 'admin@hub.com',
      full_name: 'System Admin',
      passwordHash: hash,
      role: 'ADMIN'
    }
  });

  console.log('Test users created.');
}
main().catch(console.error).finally(() => prisma.$disconnect());
