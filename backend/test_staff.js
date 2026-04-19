const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123', 10);
  
  // Admin
  await prisma.user.upsert({
    where: { email: 'test_admin@sueethiopia.org' },
    update: { passwordHash },
    create: {
      email: 'test_admin@sueethiopia.org',
      full_name: 'Verification Admin',
      role: 'ADMIN',
      passwordHash
    }
  });
  console.log('✓ Admin ready');

  // Generate a collision-safe ID
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let idNumber;
  do {
    const rand = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    idNumber = `SUE-F${rand}/${year}`;
  } while (await prisma.user.findUnique({ where: { idNumber } }));

  const issueDate = new Date();
  const expireDate = new Date(); expireDate.setFullYear(expireDate.getFullYear() + 2);

  const staff = await prisma.user.upsert({
    where: { email: 'aster.bekele@sueethiopia.org' },
    update: {
      idNumber,
      photoUrl: '/uploads/staff_photo.png',
      firstNameAm: '\u12a0\u1235\u1274\u122d',
      lastNameAm: '\u1260\u1240\u1208',
      fullNameAmharic: '\u12c8/\u122a\u1275 \u12a0\u1235\u1274\u122d \u1260\u1240\u1208',
      title: 'Ms.',
      titleAm: '\u12c8/\u122a\u1275',
      department: 'Area Office',
      departmentAm: '\u12e8\u12d6\u1295 \u121b\u1235\u1270\u1263\u1260\u122a\u12eb',
      roleAmharic: '\u12e8\u12a0\u12ab\u1263\u1262 \u12a0\u1235\u1270\u1263\u1263\u122a',
      phone: '+251 91 123 4567',
      emergencyContact: '+251 91 765 4321',
      officeAddress: 'CENTRAL ETHIOPIA / \u12d0\u12a8\u1208\u12ed \u12a2\u1275\u12ee\u1335\u12eb',
      nationality: 'ETHIOPIAN / \u12a2\u1275\u12ee\u1335\u12eb\u12ca',
      issueDate,
      expireDate,
    },
    create: {
      email: 'aster.bekele@sueethiopia.org',
      full_name: 'Aster Bekele',
      firstNameAm: '\u12a0\u1235\u1274\u122d',
      lastNameAm: '\u1260\u1240\u1208',
      fullNameAmharic: '\u12c8/\u122a\u1275 \u12a0\u1235\u1274\u122d \u1260\u1240\u1208',
      title: 'Ms.',
      titleAm: '\u12c8/\u122a\u1275',
      role: 'AREA_STAFF',
      region: 'Central Ethiopia',
      subRegion: 'Southern SNNPR',
      area: 'Hawassa',
      department: 'Area Office',
      departmentAm: '\u12e8\u12d6\u1295 \u121b\u1235\u1270\u1263\u1260\u122a\u12eb',
      roleAmharic: '\u12e8\u12a0\u12ab\u1263\u1262 \u12a0\u1235\u1270\u1263\u1263\u122a',
      phone: '+251 91 123 4567',
      emergencyContact: '+251 91 765 4321',
      officeAddress: 'CENTRAL ETHIOPIA / \u12d0\u12a8\u1208\u12ed \u12a2\u1275\u12ee\u1335\u12eb',
      nationality: 'ETHIOPIAN / \u12a2\u1275\u12ee\u1335\u12eb\u12ca',
      idNumber,
      passwordHash,
      photoUrl: '/uploads/staff_photo.png',
      issueDate,
      expireDate,
    }
  });

  console.log(`✓ Staff created: ${staff.email} → ${idNumber}`);
  console.log(`  Verify: http://127.0.0.1:5173/erp/verify/${idNumber}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
