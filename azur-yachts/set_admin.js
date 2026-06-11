require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  try {
    const email = 'heroelijha@gmail.com';
    const passwordHash = await bcrypt.hash('eLITe213@@??', 10);
    
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (user) {
      user = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN', password: passwordHash, status: 'ACTIVE' },
      });
      console.log('Succès! Utilisateur existant mis à jour en ADMIN :', user.email);
    } else {
      user = await prisma.user.create({
        data: {
          email,
          password: passwordHash,
          firstName: 'Admin',
          lastName: 'Azur',
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      });
      console.log('Succès! Nouvel utilisateur ADMIN créé :', user.email);
    }
  } catch (error) {
    console.error('Erreur :', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
