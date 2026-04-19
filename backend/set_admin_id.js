const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.user.update({
    where: { email: 'admin@portal.local' },
    data: { 
      idNumber: 'SUE-ADM-001', 
      title: 'Managing Director', 
      department: 'National Office',
      fullNameAmharic: 'አስተዳዳሪ'
    }
  });
  console.log('Admin SUE-ADM-001 seeded successfully.');
}
main().finally(() => prisma.$disconnect());
