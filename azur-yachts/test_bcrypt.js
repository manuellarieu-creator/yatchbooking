const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'heroelijha@gmail.com';
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const match = await bcrypt.compare('eLITe213@@??', user.password);
    console.log(`Password match for ${email}: ${match}`);
  } else {
    console.log(`User ${email} not found`);
  }

  const clientEmail = 'elsa.client1@gmail.com';
  const client = await prisma.user.findUnique({ where: { email: clientEmail } });
  if (client) {
    const match2 = await bcrypt.compare('Demo@2025', client.password);
    console.log(`Password match for ${clientEmail}: ${match2}`);
  } else {
    console.log(`User ${clientEmail} not found`);
  }

  await prisma.$disconnect();
}
main();
