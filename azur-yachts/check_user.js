require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'heroelijha@gmail.com' }
    });
    console.log('User found:', user);
  } catch (error) {
    console.error('Erreur :', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
