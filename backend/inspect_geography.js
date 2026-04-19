const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({
    select: {
      regionLegacy: true,
      subRegionLegacy: true,
      areaLegacy: true
    }
  });
  
  const regions = [...new Set(users.map(u => u.regionLegacy).filter(Boolean))];
  const subRegions = [...new Set(users.map(u => u.subRegionLegacy).filter(Boolean))];
  const areas = [...new Set(users.map(u => u.areaLegacy).filter(Boolean))];
  
  console.log('--- Current Data Snapshot ---');
  console.log('Unique Regions:', regions);
  console.log('Unique SubRegions:', subRegions);
  console.log('Unique Areas:', areas);
  console.log('Total Users:', users.length);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
