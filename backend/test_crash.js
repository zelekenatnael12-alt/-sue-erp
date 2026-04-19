const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const joinedDate = "";
    const dateObj = joinedDate ? new Date(joinedDate) : new Date();
    console.log('Date object:', dateObj, 'is valid:', !isNaN(dateObj));

    const staff = await prisma.staff.create({
      data: {
        name: 'Invalid Date Test',
        position: 'Tester',
        joinedDate: dateObj
      }
    });
    console.log('Success!');
  } catch (error) {
    console.error('CRASHED:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
