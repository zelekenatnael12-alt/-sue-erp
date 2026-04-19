const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const staff = await prisma.staff.findMany({ take: 1 });
    console.log('Staff columns:', Object.keys(staff[0] || { note: 'Table empty, trying alternate method' }));
    
    // Better method for empty tables:
    const result = await prisma.$queryRaw`PRAGMA table_info(Staff)`;
    console.log('Table Info:', result);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
