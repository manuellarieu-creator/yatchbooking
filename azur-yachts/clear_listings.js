const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning listings and related data...');
  await prisma.payment.deleteMany();
  await prisma.bookingService.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.service.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.listingImage.deleteMany();
  
  const res = await prisma.listing.deleteMany();
  console.log(`Deleted ${res.count} listings!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
