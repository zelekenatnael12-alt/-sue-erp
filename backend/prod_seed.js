const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'erpadmin@suethiopia.org';
  const password = 'AdminPassword2026!';
  const role = 'ADMIN'; // verified from schema.prisma

  console.log(`--- Starting Production Seed for ${email} ---`);

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase() },
      update: {
        passwordHash,
        role: role,
        isActive: true,
        full_name: 'System Administrator' // Matching schema field full_name
      },
      create: {
        email: email.toLowerCase(),
        passwordHash,
        full_name: 'System Administrator',
        role: role,
        isActive: true
      },
    });

    console.log(`✅ Success: User ${user.email} with role ${user.role} is now ready.`);
    console.log(`🔑 Login: ${email} / ${password}`);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
