const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.listing.deleteMany({
  where: {
    title: { in: ['Belle Époque 44', 'Liberté Bleue 52', 'Azura Prestige 68'] }
  }
}).then(res => console.log('Deleted duplicates:', res.count)).catch(console.error).finally(() => prisma.$disconnect());
