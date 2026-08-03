const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const listingId = 'cmsdkf5l20001deawxepj5mqs';

  console.log(`Ajout des services pour le yacht ${listingId}...`);
  
  await prisma.service.createMany({
    data: [
      {
        name: 'Equipage',
        price: 600,
        unit: 'PER_DAY',
        isRequired: true,
        listingId: listingId
      },
      {
        name: 'Skipper + Hôtesse',
        price: 200,
        unit: 'PER_BOOKING',
        isRequired: false,
        listingId: listingId
      }
    ]
  });

  console.log(`Services ajoutés avec succès !`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
