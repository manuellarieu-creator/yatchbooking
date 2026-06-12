require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    let emailToUpdate = 'heroelijha@gmail.com';
    let user = await prisma.user.findUnique({ where: { email: emailToUpdate } });
    
    if (!user) {
      // Si l'email n'est pas celui-là, prendre le tout dernier utilisateur inscrit
      const latestUser = await prisma.user.findFirst({
        orderBy: { createdAt: 'desc' }
      });
      if (latestUser) {
        emailToUpdate = latestUser.email;
      } else {
        throw new Error("Aucun utilisateur trouvé en base de données.");
      }
    }

    const updatedUser = await prisma.user.update({
      where: { email: emailToUpdate },
      data: { role: 'ADMIN', status: 'ACTIVE' }
    });
    
    console.log('Succès ! Rôle ADMIN activé pour :', updatedUser.email);
  } catch (error) {
    console.error('Erreur :', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
