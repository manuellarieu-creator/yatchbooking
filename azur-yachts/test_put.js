const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const listingId = "cmqasyevg0001l9046hur2x6l";
prisma.listing.update({
  where: { id: listingId },
  data: {
    images: {
      deleteMany: {},
      create: [
        { url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", publicId: "new_0", order: 1 }
      ]
    }
  }
}).then(res => {
  console.log("Success:", !!res);
  return prisma.listing.findUnique({ where: { id: listingId }, include: { images: true }});
}).then(res => {
  console.log("Images:", res.images);
  prisma.$disconnect();
}).catch(err => {
  console.error(err);
  prisma.$disconnect();
});
