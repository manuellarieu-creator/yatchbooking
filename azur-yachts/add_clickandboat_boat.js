const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Création du propriétaire factice...");
  
  const owner = await prisma.user.create({
    data: {
      email: `nicolas.dubois_${Date.now()}@example.com`,
      firstName: 'Nicolas',
      lastName: 'Dubois',
      role: 'ADVERTISER',
      status: 'ACTIVE',
      languages: ['Français', 'Anglais'],
      countryResidence: 'Suisse',
      isEmailVerified: true,
      bio: 'Passionné de navigation sur le Lac Léman depuis plus de 10 ans.'
    }
  });

  console.log(`Propriétaire créé avec succès ! ID: ${owner.id}`);

  console.log("Création du bateau...");
  
  const listing = await prisma.listing.create({
    data: {
      title: 'Glastron GT 205',
      description: 'Ce superbe bateau à moteur Glastron GT 205 (2009) est parfait pour une sortie sur le lac Léman au départ de Genève. Très bien entretenu, idéal pour des balades en famille ou entre amis.',
      price: 590,
      country: 'Suisse',
      location: 'Genève',
      status: 'ACTIVE',
      maxAdults: 6,
      maxChildren: 0,
      boatType: 'Bateau à moteur',
      boatLength: 6.2,
      boatYear: 2009,
      cleaningFee: 50,
      securityDeposit: 1000,
      requiresLicense: true,
      navigationMode: 'INCLUDED',
      owner: {
        connect: { id: owner.id }
      },
      images: {
        create: [
          {
            url: 'https://static1.clickandboat.com/v1/p/rUd0HbVBwIZpP9aQ3f5iczEm28VhP3gB.medium.jpg',
            publicId: 'clickandboat_glastron_gt_205',
            order: 0
          }
        ]
      }
    }
  });

  console.log(`Bateau créé avec succès ! ID: ${listing.id}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
