const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const revs = await prisma.review.findMany();
  console.log(JSON.stringify(revs, null, 2));
}
main().finally(() => prisma.$disconnect());
