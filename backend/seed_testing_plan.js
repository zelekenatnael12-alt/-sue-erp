const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'central.hossana@portal.local' } });
  if (!user) {
    console.error('User not found');
    return;
  }

  // Delete existing plan for this user if any, to avoid confusion
  await prisma.projectPlan.deleteMany({ where: { coordinatorId: user.id } });

  const plan = await prisma.projectPlan.create({
    data: {
      projectName: 'Verification Plan 2017',
      projectType: 'FIELD',
      status: 'APPROVED',
      coordinatorId: user.id,
      matrixActivities: {
        create: [
          {
            activity: 'አዳዲስ የኃይስኩል ሕብረቶችን ማደራጀት',
            target: 12,
            m1: 1, m2: 2, m3: 1, m4: 1, m5: 1, m6: 1, m7: 1, m8: 1, m9: 1, m10: 1, m11: 1, m12: 0
          },
          {
            activity: 'ቀድመው የተደራጁ ነገር ግን በኤስ.ዩ ያልተያዙ ሕብረቶች በኤስ.ዩ አገልግሎት እንዲታቀፉ ማድረግ',
            target: 6,
            m1: 0, m2: 1, m3: 0, m4: 1, m5: 0, m6: 1, m7: 0, m8: 1, m9: 0, m10: 1, m11: 0, m12: 1
          }
        ]
      }
    }
  });

  console.log('Approved plan created with ID:', plan.id);
  await prisma.$disconnect();
}

main();
