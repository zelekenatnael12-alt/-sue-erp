const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function generateStaffId(role) {
  const year = new Date().getFullYear();
  const type = (role || '').toLowerCase().includes('associate') ? 'A' : 'F';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omit confusable chars: I,O,0,1
  let idNumber;
  let attempts = 0;
  do {
    const rand = Array.from({ length: 3 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
    idNumber = `SUE-${type}${rand}/${year}`;
    attempts++;
    if (attempts > 100) throw new Error('ID generation failed after 100 attempts');
  } while (await prisma.user.findUnique({ where: { idNumber } }));
  return idNumber;
}

async function main() {
  const passwordHash = await bcrypt.hash('Password123', 10);
  
  const roleString = "Associate Area Staff";
  const idNumber = await generateStaffId(roleString);

  const issueDate = new Date();
  const expireDate = new Date(); expireDate.setFullYear(expireDate.getFullYear() + 1);

  const staff = await prisma.user.upsert({
    where: { email: 'samuel.associate@sueethiopia.org' },
    update: { idNumber, roleAmharic: 'ረዳት አስተባባሪ' },
    create: {
      email: 'samuel.associate@sueethiopia.org',
      full_name: 'Samuel Associate',
      role: 'AREA_STAFF',
      roleAmharic: 'ረዳት አስተባባሪ',
      title: 'Mr.',
      titleAm: 'አቶ',
      idNumber,
      passwordHash,
      issueDate,
      expireDate,
      isActive: true
    }
  });

  console.log(`✓ Associate Staff created!`);
  console.log(`  Role Passed: "${roleString}"`);
  console.log(`  Auto-Generated ID: ${idNumber}`);
  console.log(`  A-Prefix Status: ${idNumber.includes('-A') ? 'SUCCESS' : 'FAILED'}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
