const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Using the ID from the previous creation
  const listingId = 'cmsdifqgf0001dego8itz0609';

  console.log(`Mise à jour du bateau avec l'ID ${listingId}...`);
  
  const updatedListing = await prisma.listing.update({
    where: { id: listingId },
    data: {
      maxAdults: 7,
      enginePower: 220,
      boatLength: 5.9,
      description: `Vivez une aventure maritime inoubliable en louant ce super bateau moderne et sportif de 7 places de 220 cv, au départ du centre de Genève. Le tarif est le plus avantageux de Genève pour ce type de bateau, seulement 490 CHF la demi journée et 590 CHF pour la journée complète (essence non comprise) sans skipper. Possibilité de le louer avec skipper sur demande. Il y a tout ce qu'il vous faut abord: un wakeboard, une bouée tractée, une sono USB et AUX, une batterie portable pour charger les téléphones ou autres, 7 gilets de sauvetage.

Laissez-vous séduire par la liberté de naviguer et explorez les eaux vastes et captivantes en toute autonomie.
Amarré dans le prestigieux port au centre de Genève. Les amateurs de frissons pourront s'essayer au wakeboard, surfant sur les eaux cristallines avec une montée d'adrénaline inégalée. Si vous préférez la détente, offrez-vous des balades paisibles et des baignades revigorantes au milieu du lac.

Veuillez noter qu'un permis de navigation est impératif pour la location de notre bateau à moteur, assurant ainsi une expérience sûre et plaisante pour vous et vos compagnons d'aventure.

N'hésitez pas à me contacter via la messagerie Click&Boat pour plus d'informations.

A bientôt !`,
      cancellationPolicy: 'FLEXIBLE',
      requiresLicense: false,
      skipperAvailable: true,
      features: [
        'Taud de soleil',
        'Enceintes extérieures',
        'Bain de soleil arrière',
        'Plateforme de bain',
        'Échelle de bain',
        'Prise USB',
        'Sondeur',
        'Matériel de pêche',
        'Wakeboard',
        'Bouée tractable'
      ]
    }
  });

  console.log(`Bateau mis à jour avec succès !`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
