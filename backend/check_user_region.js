const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findUnique({
    where: { email: 'central.regional@portal.local' }
  });
  console.log('--- User Region Info ---');
  console.log('ID:', user.id);
  console.log('Region (string):', user.region);
  console.log('SubRegion (string):', user.subRegion);

  const allAssociates = await prisma.associate.findMany({
    include: { registeredBy: true }
  });
  console.log('\n--- All Associates ---');
  console.log('Total Count:', allAssociates.length);
  if (allAssociates.length > 0) {
    console.log('Sample Associate Registry Info:', {
      name: allAssociates[0].name,
      registrarRegion: allAssociates[0].registeredBy.region
    });
  }

  await prisma.$disconnect();
}

check().catch(console.error);
