const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateYisakor() {
  await prisma.user.updateMany({
    where: { email: 'yisakor.teklu.betire@suethiopia.org' },
    data: {
      title: 'Ato',
      titleAm: 'አቶ',
      fullNameAmharic: 'ይሳቆር ተክሉ',
      firstNameAm: 'ይሳቆር',
      lastNameAm: 'ተክሉ',
      department: 'Regional Coordinator',
      departmentAm: 'የክልል አስተባባሪ',
      roleAmharic: 'የክልል አስተባባሪ',
      bloodType: 'O+'
    }
  });
  console.log('Update successful');
}
updateYisakor().catch(console.error).finally(() => prisma.$disconnect());
