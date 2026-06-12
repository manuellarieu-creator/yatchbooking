const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.listing.findMany({
  include: { images: true },
  orderBy: { createdAt: 'desc' },
  take: 1
}).then(res => {
  console.log(JSON.stringify(res, null, 2));
  prisma.$disconnect();
});
