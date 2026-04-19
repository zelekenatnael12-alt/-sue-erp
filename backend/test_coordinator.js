const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function generateStaffId(role) {
  const year = new Date().getFullYear();
  const type = (role || '').toLowerCase().includes('associate') ? 'A' : 'F';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let idNumber;
  let attempts = 0;
  do {
    const rand = Array.from({ length: 3 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
    idNumber = `SUE-${type}${rand}/${year}`;
    attempts++;
  } while (await prisma.user.findUnique({ where: { idNumber } }));
  return idNumber;
}

async function main() {
  const passwordHash = await bcrypt.hash('Password123', 10);
  
  const roleString = 'Regional Coordinator';
  const idNumber = await generateStaffId(roleString);

  const issueDate = new Date();
  const expireDate = new Date(); expireDate.setFullYear(expireDate.getFullYear() + 1);

  const staff = await prisma.user.upsert({
    where: { email: 'test.coordinator@sueethiopia.org' },
    update: { idNumber, role: 'COORDINATOR', roleAmharic: 'የክልል አስተባባሪ' },
    create: {
      email: 'test.coordinator@sueethiopia.org',
      full_name: 'David Coordinator Test',
      role: 'COORDINATOR',
      roleAmharic: 'የክልል አስተባባሪ',
      title: 'Rev.',
      titleAm: 'ቄስ',
      idNumber,
      passwordHash,
      issueDate,
      expireDate,
      region: 'Central Ethiopia',
      nationality: 'ETHIOPIAN / ኢትዮጵያዊ',
      officeAddress: 'HEAD OFFICE / ዋና ቢሮ',
      isActive: true
    }
  });

  console.log('✓ Regional Coordinator Access created!');
  console.log('  Email: test.coordinator@sueethiopia.org');
  console.log('  Password: Password123');
  console.log('  Role Passed: "' + roleString + '"');
  console.log('  Auto-Generated ID: ' + idNumber);
}

main().catch(console.error).finally(() => prisma.$disconnect());
