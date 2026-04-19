const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const areas = [
  'Hossana', 'Durame', 'Halaba Kulito', 'Shone',
  'Butajira', '7 Bet', 'Worabe'
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const activities = [
  'አዳዲስ የኃይስኩል ሕብረቶችን ማደራጀት',
  'ቀድመው የተደራጁ ነገር ግን በኤስ.ዩ ያልተያዙ ሕብረቶች በኤስ.ዩ አገልግሎት እንዲታቀፉ ማድረግ',
  'ቢሮ በሚገኝበት ከተማ ውስጥ የሚገኙ የኃይስኩል ፌሎሽፖችን ማጎብኘት',
  'በክልሉ በሚገኙ ከተሞች ውስጥ የሚገኙ የኃይስኩል ሕብረቶችን ሄዶ መጎብኘት',
  'በሴሚስተር ዕረፍት የሚካሄድ የወንጌል ተልዕኮ (Break-Mission)',
  'በትምህርት ማጠናቀቂያ የሚካሄድ የወንጌል ተልዕኮ (Summer Mission)',
  'አጫጭር የወንጌል የምስክርነት ፕሮግራሞች (Mini-missions)',
  'መሠረታዊ የክርስትና ት/ት ማስተማር'
];

async function main() {
  for (const areaName of areas) {
    const emailPrefix = areaName.toLowerCase().replace(/ /g, '.').replace('area', '').replace(/\.\.$/, '.');
    const email = `central.${emailPrefix}portal.local`.replace('..', '.');
    
    // Find user
    const user = await prisma.user.findFirst({ where: { area: areaName } });
    if (!user) {
      console.log(`User for ${areaName} not found, skipping.`);
      continue;
    }

    // Delete existing plans
    await prisma.projectPlan.deleteMany({ where: { coordinatorId: user.id } });

    // Create new plan
    const associateStaff = getRandomInt(4, 9);
    const volunteers = getRandomInt(9, 15);
    const totalSchools = getRandomInt(20, 50);

    const planData = {
      projectName: `${areaName} Master Plan 2017`,
      projectType: 'FIELD',
      status: 'APPROVED',
      coordinatorId: user.id,
      associateStaffCount: associateStaff,
      volunteerCount: volunteers,
      totalHighSchools: totalSchools,
      suFellowshipSchools: Math.floor(totalSchools * 0.7),
      noFellowshipSchools: Math.ceil(totalSchools * 0.3),
      matrixActivities: {
        create: activities.map(act => ({
          activity: act,
          target: getRandomInt(5, 20),
          m1: getRandomInt(0, 3),
          m2: getRandomInt(0, 3),
          m3: getRandomInt(0, 3),
          m4: getRandomInt(0, 3),
          m5: getRandomInt(0, 3),
          m6: getRandomInt(0, 3),
          m7: getRandomInt(0, 3),
          m8: getRandomInt(0, 3),
          m9: getRandomInt(0, 3),
          m10: getRandomInt(0, 3),
          m11: getRandomInt(0, 3),
          m12: getRandomInt(0, 3),
        }))
      }
    };

    const plan = await prisma.projectPlan.create({ data: planData });
    console.log(`Created plan for ${areaName} (ID: ${plan.id})`);
  }

  await prisma.$disconnect();
}

main();
