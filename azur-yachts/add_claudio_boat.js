const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Création de l'utilisateur Claudio...");
  const owner = await prisma.user.create({
    data: {
      email: `claudio.cambrils_${Date.now()}@example.com`,
      firstName: 'Claudio',
      lastName: 'Loueur',
      role: 'ADVERTISER',
      status: 'ACTIVE',
      languages: ['Espagnol'],
      countryResidence: 'Espagne',
      isEmailVerified: true,
      bio: "Je m'appelle Claudio, j'ai 67 ans et je vis à Barcelone. Mon lien avec la mer remonte à ma jeunesse, lorsque je pratiquais l'aviron, et elle a toujours fait partie intégrante de ma vie. Je possède un permis bateau et j'apprécie particulièrement la navigation à moteur, la détente le long de la côte : jeter l'ancre dans une crique, se baigner, déjeuner à bord et rentrer tranquillement. Mes deux bateaux sont amarrés à Cambrils, sur la Costa Daurada, et mon projet est simple : partager ce magnifique littoral préservé avec tous ceux qui souhaitent le découvrir dans la même sérénité que celle dont nous profitons en famille."
    }
  });

  console.log(`Propriétaire Claudio créé avec l'ID: ${owner.id}`);

  console.log("Création du bateau Bond Yacht 13...");
  const listing = await prisma.listing.create({
    data: {
      title: 'Bond Yacht 13 - Bateau sans permis',
      description: `Louez le Bond, notre bateau sans permis, pour une excursion d'une journée sur la Costa Dorada. Long de 4 mètres, moteur de 15 CV, il peut accueillir jusqu'à 5 personnes. Pas besoin de permis, juste une pièce d'identité. Nous vous expliquerons les bases en quinze minutes, et c'est parti ! Départ du port de Cambrils.

C'est le bateau idéal pour une première expérience en mer : léger, maniable et très facile à piloter. Parfait pour explorer la côte de Cambrils à votre rythme, trouver un coin tranquille et jeter l'ancre pour une baignade.

Équipement inclus :
- Taud de soleil
- Échelle de bain
- Sièges confortables pour 5 personnes
- Ancre avec corde et gaffe
- Gilets de sauvetage (gilets enfants disponibles sur demande)
- Fusées de détresse, pompe de secours et trousse de premiers secours
- Glacière

Le prix comprend l'amarrage au port, la TVA, l'assurance (SOVI obligatoire + responsabilité civile) et le carburant. Réservations pour les personnes de 18 ans et plus. Les enfants sont les bienvenus à bord, toujours accompagnés d'un adulte.

Une journée type à bord du Bond : vous quittez le port de Cambrils, naviguez tranquillement le long de la côte et trouvez l'endroit idéal pour jeter l'ancre. Vous pouvez vous baigner depuis le bateau, profiter du soleil, écouter de la musique et garder la glacière à portée de main, en revenant quand vous le souhaitez. Aucun permis ni expérience préalable ne sont requis : nous nous assurerons que vous sachiez exactement ce que vous faites avant de partir.

Je vous accueillerai à Cambrils et vous remettrai le bateau propre et avec le plein. Avant de larguer les amarres, nous passerons en revue la navigation du bateau ensemble, et je marquerai la zone et les meilleurs mouillages sur la carte, ainsi que les prévisions météo du jour (environ quinze minutes), puis nous partirons.`,
      price: 150, // Prix par défaut (non mentionné dans le texte)
      country: 'Espagne',
      location: 'Cambrils, Puerto De Cambrils',
      status: 'ACTIVE',
      maxAdults: 4,
      maxChildren: 0,
      boatType: 'Bateau à moteur',
      boatLength: 4,
      boatYear: 2013,
      cabins: 1,
      enginePower: 15,
      cleaningFee: 0,
      securityDeposit: 250,
      requiresLicense: false,
      fuelIncluded: true,
      skipperAvailable: true,
      cancellationPolicy: 'FLEXIBLE',
      navigationMode: 'INCLUDED',
      features: [
        'Taud de soleil',
        'Échelle de bain',
        'Ancre',
        'Gilets de sauvetage',
        'Glacière',
        'Paddle',
        'Bouée tractable',
        'Masques et tubas',
        'Matériel de pêche'
      ],
      owner: {
        connect: { id: owner.id }
      }
    }
  });

  console.log(`Bateau Bond Yacht 13 créé avec l'ID: ${listing.id}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
