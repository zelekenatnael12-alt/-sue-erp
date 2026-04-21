const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Demo@1234', 10);

  // Regional: ESHETU DESSIE MEKONNEN
  await prisma.user.update({
    where: { email: 'eshetu.dessie.mekonnen@suethiopia.org' },
    data: { passwordHash: hash, mustChangePassword: false }
  });

  // Sub-Regional: Deborah Samson Meried
  await prisma.user.update({
    where: { email: 'deborah.samson.meried@suethiopia.org' },
    data: { passwordHash: hash, mustChangePassword: false }
  });

  // Executive: Berhanu (already working via simulator)
  await prisma.user.update({
    where: { email: 'berhanu.solomon.g.michael@suethiopia.org' },
    data: { passwordHash: hash, mustChangePassword: false }
  });

  // Ensure there's an Area Staff user for demo
  const areaUser = await prisma.user.findFirst({ where: { role: 'AREA_STAFF' } });
  if (areaUser) {
    await prisma.user.update({
      where: { id: areaUser.id },
      data: { passwordHash: hash, mustChangePassword: false }
    });
    console.log(`Area user: ${areaUser.email}`);
  }

  const coordUser = await prisma.user.findFirst({ where: { role: 'COORDINATOR' } });
  if (coordUser) {
    await prisma.user.update({
      where: { id: coordUser.id },
      data: { passwordHash: hash, mustChangePassword: false }
    });
    console.log(`Coordinator user: ${coordUser.email}`);
  }

  console.log('Done! All demo accounts reset to: Demo@1234');
  console.log('Regional: eshetu.dessie.mekonnen@suethiopia.org');
  console.log('Sub-Regional: deborah.samson.meried@suethiopia.org');
}

main().catch(console.error).finally(() => prisma.$disconnect());
