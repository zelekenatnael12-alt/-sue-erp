/**
 * seed_south_ethiopia.js
 * Provisions 5 SUE South Ethiopia staff identities for the live SQLite database.
 * Run: node seed_south_ethiopia.js
 */

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

const REGION = 'South Ethiopia';
const SUB_REGION = 'Sub-Region 1';
const PASSWORD = 'Password123!';

const STAFF = [
  // Regional Director
  {
    email: 'abebech.w@suethiopia.org',
    name: 'Abebech Wolde',
    role: 'COORDINATOR',
    region: REGION,
    subRegion: null,
    area: null,
  },
  // Sub-Regional Coordinator
  {
    email: 'dawit.y@suethiopia.org',
    name: 'Dawit Yohannes',
    role: 'SUB_REGIONAL',
    region: REGION,
    subRegion: SUB_REGION,
    area: null,
  },
  // Area Coordinators
  {
    email: 'elias.g@suethiopia.org',
    name: 'Elias Gebre',
    role: 'AREA_STAFF',
    region: REGION,
    subRegion: SUB_REGION,
    area: 'Gamo',
  },
  {
    email: 'mestawet.a@suethiopia.org',
    name: 'Mestawet Assefa',
    role: 'AREA_STAFF',
    region: REGION,
    subRegion: SUB_REGION,
    area: 'South Omo',
  },
  {
    email: 'bereket.t@suethiopia.org',
    name: 'Bereket Tadesse',
    role: 'AREA_STAFF',
    region: REGION,
    subRegion: SUB_REGION,
    area: 'Konso',
  },
];

// Sample Tikimt reports to seed for each Area coordinator
const SAMPLE_REPORTS = [
  {
    email: 'elias.g@suethiopia.org',
    title: 'Monthly Report – Tikimt 2017 (Gamo)',
    content: JSON.stringify({
      document_type: 'MONTHLY_REPORT',
      reporting_month: 'Tikimt',
      academic_year: '2017',
      payload: {
        module_1_general: { total_high_schools: 18, schools_with_su: 8 },
        module_4_missions: [{ activity: 'Mini-missions', target: 2, actual: 3, impact_metrics: { heard_gospel: 120, students_accepted_jesus: 18, others_accepted_jesus: 4 } }],
      },
    }),
  },
  {
    email: 'mestawet.a@suethiopia.org',
    title: 'Monthly Report – Tikimt 2017 (South Omo)',
    content: JSON.stringify({
      document_type: 'MONTHLY_REPORT',
      reporting_month: 'Tikimt',
      academic_year: '2017',
      payload: {
        module_1_general: { total_high_schools: 12, schools_with_su: 5 },
        module_4_missions: [{ activity: 'Break-Mission', target: 1, actual: 1, impact_metrics: { heard_gospel: 80, students_accepted_jesus: 11, others_accepted_jesus: 2 } }],
      },
    }),
  },
  {
    email: 'bereket.t@suethiopia.org',
    title: 'Monthly Report – Tikimt 2017 (Konso)',
    content: JSON.stringify({
      document_type: 'MONTHLY_REPORT',
      reporting_month: 'Tikimt',
      academic_year: '2017',
      payload: {
        module_1_general: { total_high_schools: 9, schools_with_su: 4 },
        module_4_missions: [{ activity: 'Summer Mission', target: 1, actual: 2, impact_metrics: { heard_gospel: 95, students_accepted_jesus: 14, others_accepted_jesus: 3 } }],
      },
    }),
  },
];

async function main() {
  const hash = await bcrypt.hash(PASSWORD, 10);

  console.log('\n🌿 Seeding South Ethiopia Branch...\n');

  const createdUsers = [];

  for (const staff of STAFF) {
    try {
      const user = await db.user.upsert({
        where: { email: staff.email },
        update: {
          name: staff.name,
          role: staff.role,
          region: staff.region,
          subRegion: staff.subRegion,
          area: staff.area,
          passwordHash: hash,
        },
        create: {
          email: staff.email,
          name: staff.name,
          role: staff.role,
          region: staff.region,
          subRegion: staff.subRegion,
          area: staff.area,
          passwordHash: hash,
        },
      });
      console.log(`  ✅ ${user.name.padEnd(20)} | ${user.role.padEnd(13)} | ${user.email}`);
      createdUsers.push(user);
    } catch (e) {
      console.error(`  ❌ Error for ${staff.email}:`, e.message);
    }
  }

  // Seed sample pending Tikimt reports
  console.log('\n📋 Seeding sample Tikimt monthly reports...\n');

  for (const rep of SAMPLE_REPORTS) {
    const user = createdUsers.find(u => u.email === rep.email);
    if (!user) continue;
    try {
      // Check if already seeded
      const existing = await db.monthlyReport.findFirst({
        where: { userId: user.id, title: rep.title },
      });
      if (existing) {
        console.log(`  ⏭  Already seeded: ${rep.title}`);
        continue;
      }
      await db.monthlyReport.create({
        data: {
          userId: user.id,
          title: rep.title,
          status: 'PENDING_REVIEW',
          content: rep.content,
        },
      });
      console.log(`  ✅ Report seeded: ${rep.title}`);
    } catch (e) {
      console.error(`  ❌ Report error for ${rep.email}:`, e.message);
    }
  }

  console.log('\n🚀 Deployment Successful: 5 SUE Staff Identities provisioned for South Ethiopia branch.\n');
  console.log('─'.repeat(60));
  console.log('  CREDENTIAL MATRIX');
  console.log('─'.repeat(60));
  console.log(`  abebech.w@suethiopia.org  →  ${PASSWORD}  (COORDINATOR → /regional)`);
  console.log(`  dawit.y@suethiopia.org    →  ${PASSWORD}  (SUB_REGIONAL → /sub-regional)`);
  console.log(`  elias.g@suethiopia.org    →  ${PASSWORD}  (AREA_STAFF → /area)`);
  console.log(`  mestawet.a@suethiopia.org →  ${PASSWORD}  (AREA_STAFF → /area)`);
  console.log(`  bereket.t@suethiopia.org  →  ${PASSWORD}  (AREA_STAFF → /area)`);
  console.log('─'.repeat(60) + '\n');

  await db.$disconnect();
}

main().catch(e => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});
