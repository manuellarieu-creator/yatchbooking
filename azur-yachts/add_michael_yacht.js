const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Création de l'utilisateur Michael...");
  const owner = await prisma.user.create({
    data: {
      email: `michael.bandol_${Date.now()}@example.com`,
      firstName: 'Michael',
      lastName: 'YachtOwner',
      role: 'ADVERTISER',
      status: 'ACTIVE',
      languages: ['Français', 'Anglais'],
      countryResidence: 'France',
      isEmailVerified: true,
      bio: "Propriétaire professionnel et passionné de yachting."
    }
  });

  console.log(`Propriétaire Michael créé avec l'ID: ${owner.id}`);

  console.log("Création du Yacht Conam Wide Body 75...");
  const listing = await prisma.listing.create({
    data: {
      title: 'Conam Wide Body 75',
      description: `Louez ce splendide Yacht Conam, idéal pour découvrir la magnifique cote d'azur ainsi que ses iles jusqu'à la Corse et la Sardaigne.
Vivez une expérience unique à bord d'un bateau élégant et raffiné, tout confort et doté d'un caractère sportif affirmé, pour réaliser les rêves de ceux qui souhaitent profiter pleinement de la mer.

Le bateau dispose de grands bains de soleil ainsi que de nombreux espaces pour vous laisser aller au rythme d'une expérience unique.

Un accès à la plage arrière vous permettra de découvrir les nombreuses activités aquatiques dont le bateau dispose (jet ski, seabob, snorkeling, stand up paddle...)

A l'intérieur, un immense salon pour vous accueillir après quelques heures de soleil, une salle à manger et une cuisine équipée tout confort.
Coté couchage, 4 cabines doubles avec chacune leur propre salle de douche et WC pour une intimité préservée.

En journée le bateau peut accueillir jusqu'à 20 personnes, dont 8 en cas de nuitée.

N'hésitez pas à nous contacter pour prendre des renseignements ou bien réserver ce magnifique bateau et vivre des moments inoubliables en famille ou entre amis.
Nos prestations sont la carte, pour une journée ou pour un séjour d'une semaine, de nombreuses options sont disponibles pour s'adapter a vos besoins, vos envies.

*APA 40% du prix de la location.`,
      price: 2500, // Prix par défaut car non mentionné
      country: 'France',
      location: 'Bandol, Port De Bandol',
      status: 'ACTIVE',
      maxAdults: 20,
      maxChildren: 0,
      boatType: 'Yacht',
      boatLength: 23, 
      boatYear: 2015,
      cabins: 4,
      berths: 8,
      bathrooms: 4,
      cleaningFee: 200,
      securityDeposit: 5000,
      requiresLicense: false,
      requiresCaptain: true,
      skipperAvailable: true,
      navigationMode: 'WITH_CAPTAIN',
      cancellationPolicy: 'FLEXIBLE',
      features: [
        'Taud de soleil', 'Douche extérieure', 'Table extérieure', 'Enceintes extérieures',
        'Pont en teck', 'Bain de soleil avant', 'Bain de soleil arrière', 'Plateforme de bain',
        'Échelle de bain', 'Eau chaude', 'Dessalinisateur', 'Air conditionné', 'Ventilateurs',
        'Chauffage', 'Lave-linge', 'WC électrique', 'Literie', 'Serviettes de bain',
        'Serviettes de plage', 'Wi-Fi', 'Prise USB', 'Annexe', "Propulseur d'étrave",
        'Guindeau électrique', 'Pilote automatique', 'GPS', 'Sondeur', 'VHF',
        'Guides & Cartes', 'Réfrigérateur', 'Congélateur', 'Four/cuisinière', 'Barbecue',
        'Micro-ondes', 'Machine à café', 'Machine à glaçons', 'Lave-vaisselle', 'Paddle',
        'Masques et tubas', 'Matériel de plongée', 'Jacuzzi', 'Ski nautique', 'Monoski',
        'Wakeboard', 'Bouée tractable'
      ],
      owner: {
        connect: { id: owner.id }
      },
      services: {
        create: [
          { name: 'Seabob', price: 250, unit: 'PER_DAY' },
          { name: 'Jet-ski', price: 1000, unit: 'PER_DAY' }
        ]
      }
    }
  });

  console.log(`Yacht Conam créé avec l'ID: ${listing.id}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
