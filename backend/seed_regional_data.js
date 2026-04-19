const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const regionalDirector = await prisma.user.findUnique({
    where: { email: 'central.regional@portal.local' }
  });

  const hossanaArea = await prisma.area.upsert({
    where: { id: 'test-area-hossana' },
    update: {},
    create: {
      id: 'test-area-hossana',
      name: 'Hossana Central Area',
      region: 'Central Ethiopia',
      subRegion: 'Hadiya',
      zone: 'Hadiya Zone',
      town: 'Hossana',
      contactPerson: 'Abebe Kebede',
      fellowshipsCount: 12,
      status: 'ACTIVE',
      proposedById: regionalDirector.id
    }
  });

  const durameArea = await prisma.area.upsert({
    where: { id: 'test-area-durame' },
    update: {},
    create: {
      id: 'test-area-durame',
      name: 'Durame North Area',
      region: 'Central Ethiopia',
      subRegion: 'Kembata',
      zone: 'Kembata Tembaro',
      town: 'Durame',
      contactPerson: 'Marta Tessema',
      fellowshipsCount: 8,
      status: 'ACTIVE',
      proposedById: regionalDirector.id
    }
  });

  const associates = [
    { name: 'Samuel Desta', phone: '0911000001', background: 'BSc in Theology, 5 years youth ministry', status: 'APPROVED' },
    { name: 'Tirhas G/Egziabher', phone: '0911000002', background: 'Social Work degree, focuses on high schools', status: 'APPROVED' },
    { name: 'Daniel Yohannes', phone: '0911000003', background: 'Volunteer for 2 years, now part-time associate', status: 'PENDING' },
    { name: 'Ruth Bekele', phone: '0911000004', background: 'Experienced trainer for SU materials', status: 'APPROVED' }
  ];

  for (const a of associates) {
    await prisma.associate.create({
      data: {
        name: a.name,
        phone: a.phone,
        backgroundInfo: a.background,
        status: a.status,
        registeredById: regionalDirector.id
      }
    });
  }

  console.log('--- Seeded Central Ethiopia Data ---');
  console.log('Areas created: 2');
  console.log('Associates created: 4');
  
  await prisma.$disconnect();
}

seed().catch(console.error);
