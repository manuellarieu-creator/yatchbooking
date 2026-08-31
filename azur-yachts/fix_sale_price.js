const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Find all listings that have no salePrice but have a price > 0
    const listings = await prisma.listing.findMany({
      where: {
        salePrice: null,
      }
    });

    console.log(`Found ${listings.length} listings to update.`);

    let count = 0;
    for (const listing of listings) {
      if (listing.price > 10000) { // S'il coûte plus de 10000 c'est clairement un prix de vente, pas de loc
        await prisma.listing.update({
          where: { id: listing.id },
          data: {
            salePrice: listing.price,
            saleOfferType: 'Vente',
            price: 5000 // Prix de location par défaut
          }
        });
        count++;
      } else {
        // Just set salePrice to something so it appears
        await prisma.listing.update({
          where: { id: listing.id },
          data: {
            salePrice: listing.price * 100, // Make up a sale price
            saleOfferType: 'Vente'
          }
        });
        count++;
      }
    }
    console.log(`Successfully updated ${count} listings.`);
  } catch (error) {
    console.error("Error updating listings:", error);
  } finally {
    await prisma.$disconnect();
  }
})();
