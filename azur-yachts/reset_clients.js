const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Demo@2025', 10);
  
  await prisma.user.updateMany({
    where: {
      email: {
        in: ['elsa.client1@gmail.com', 'radghv30@gmail.com']
      }
    },
    data: {
      password: hashedPassword
    }
  });

  console.log('Passwords reset for clients.');
  await prisma.$disconnect();
}
main();
