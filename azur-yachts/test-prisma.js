const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    await prisma.listing.update({
      where: { id: "cmqasyevg0001l9046hur2x6l" },
      data: {
        title: "Gobbi Atlantis 425 sc - Année 2009",
        description: "Atlantis 425 SC",
        price: 540,
        country: "Espagne",
        location: "Barcelone",
        latitude: null,
        longitude: null,
        maxAdults: 8,
        maxChildren: 6,
        boatType: "Motor Yacht",
        boatLength: 14,
        boatYear: 2009,
        requiresCaptain: true,
        skipperAvailable: true,
        maxRentalHours: 4,
        deliveryAvailable: true,
        deliveryPricing: [],
        cleaningFee: 119.98,
        images: {
          deleteMany: {},
          create: [
            {
              url: "data:image/png;base64,...",
              publicId: "new_0",
              order: 1
            }
          ]
        },
        services: {
          deleteMany: {},
          create: []
        }
      }
    });
    console.log("Success");
  } catch (e) {
    console.error(e.message);
  }
}
main();
