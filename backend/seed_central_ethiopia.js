const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const db = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Password123!', 10);
  const region = 'Central Ethiopia';

  const users = [
    // Regional Director
    { email: 'central.regional@portal.local', full_name: 'Central Regional Director', role: 'COORDINATOR', region },

    // Sub-Regional coordinators
    { email: 'central.sr1@portal.local', full_name: 'SR1 Coordinator', role: 'SUB_REGIONAL', region, subRegion: 'Sub Region 1' },
    { email: 'central.sr2@portal.local', full_name: 'SR2 Coordinator', role: 'SUB_REGIONAL', region, subRegion: 'Sub Region 2' },

    // Area Staff - Sub Region 1
    { email: 'central.hossana@portal.local', full_name: 'Hossana Staff', role: 'AREA_STAFF', region, subRegion: 'Sub Region 1', area: 'Hossana' },
    { email: 'central.durame@portal.local', full_name: 'Durame Staff', role: 'AREA_STAFF', region, subRegion: 'Sub Region 1', area: 'Durame' },
    { email: 'central.alaba@portal.local', full_name: 'Alaba Staff', role: 'AREA_STAFF', region, subRegion: 'Sub Region 1', area: 'Alaba' },
    { email: 'central.shone@portal.local', full_name: 'Shone Staff', role: 'AREA_STAFF', region, subRegion: 'Sub Region 1', area: 'Shone' },

    // Area Staff - Sub Region 2
    { email: 'central.butajira@portal.local', full_name: 'Butajira Staff', role: 'AREA_STAFF', region, subRegion: 'Sub Region 2', area: 'Butajira' },
    { email: 'central.sevenbet@portal.local', full_name: '7 Bet Staff', role: 'AREA_STAFF', region, subRegion: 'Sub Region 2', area: '7 Bet' },
    { email: 'central.worabe@portal.local', full_name: 'Worabe Staff', role: 'AREA_STAFF', region, subRegion: 'Sub Region 2', area: 'Worabe' },
  ];

  console.log(`--- Seeding Central Ethiopia Accounts ---`);

  for (const user of users) {
    try {
      await db.user.upsert({
        where: { email: user.email },
        update: { 
          passwordHash: hash, 
          role: user.role, 
          full_name: user.full_name,
          region: user.region,
          subRegion: user.subRegion || null,
          area: user.area || null
        },
        create: { 
          email: user.email, 
          passwordHash: hash, 
          full_name: user.full_name, 
          role: user.role,
          region: user.region,
          subRegion: user.subRegion || null,
          area: user.area || null
        }
      });
      console.log(`✅ Created/Updated: ${user.email} (${user.role}) - ${user.area || user.subRegion || 'Region'}`);
    } catch (e) {
      console.error(`❌ Error for ${user.email}:`, e.message);
    }
  }

  await db.$disconnect();
  console.log('--- Seeding Complete ---');
}

main().catch(e => { console.error(e.message); process.exit(1); });
