const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function run() {
  const email = 'admin@portal.local';
  const password = 'Password123!';
  
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log('User not found');
    return;
  }
  
  const valid = await bcrypt.compare(password, user.passwordHash);
  console.log('--- Credential Audit ---');
  console.log('User:', email);
  console.log('Password Match:', valid);
  if (!valid) {
    console.log('Stored Hash:', user.passwordHash);
    const newHash = await bcrypt.hash(password, 12);
    console.log('Expected Hash (new):', newHash);
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
