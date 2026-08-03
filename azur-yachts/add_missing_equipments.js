const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const equipments = [
  // EXTERIEUR
  { name: 'Taud de soleil', category: 'EXTERIEUR', iconName: 'Tent' },
  { name: 'Douche extérieure', category: 'EXTERIEUR', iconName: 'ShowerHead' },
  { name: 'Table extérieure', category: 'EXTERIEUR', iconName: 'Grid2X2' },
  { name: 'Enceintes extérieures', category: 'EXTERIEUR', iconName: 'Speaker' },
  { name: 'Pont en teck', category: 'EXTERIEUR', iconName: 'Layers' },
  { name: 'Bain de soleil avant', category: 'EXTERIEUR', iconName: 'Sun' },
  { name: 'Bain de soleil arrière', category: 'EXTERIEUR', iconName: 'Sun' },
  { name: 'Plateforme de bain', category: 'EXTERIEUR', iconName: 'Waves' },
  { name: 'Échelle de bain', category: 'EXTERIEUR', iconName: 'Check' },
  
  // A_BORD
  { name: 'Eau chaude', category: 'A_BORD', iconName: 'Thermometer' },
  { name: 'Dessalinisateur', category: 'A_BORD', iconName: 'Droplets' },
  { name: 'Air conditionné', category: 'A_BORD', iconName: 'Snowflake' },
  { name: 'Ventilateurs', category: 'A_BORD', iconName: 'AirVent' },
  { name: 'Chauffage', category: 'A_BORD', iconName: 'Flame' },
  { name: 'Lave-linge', category: 'A_BORD', iconName: 'Activity' },
  { name: 'WC électrique', category: 'A_BORD', iconName: 'Check' },
  { name: 'Literie', category: 'A_BORD', iconName: 'Check' },
  { name: 'Serviettes de bain', category: 'A_BORD', iconName: 'Check' },
  { name: 'Serviettes de plage', category: 'A_BORD', iconName: 'Check' },
  { name: 'Wi-Fi', category: 'A_BORD', iconName: 'Wifi' },
  { name: 'Prise USB', category: 'A_BORD', iconName: 'Usb' },
  { name: 'Annexe', category: 'A_BORD', iconName: 'LifeBuoy' },
  { name: 'Propulseur d\'étrave', category: 'A_BORD', iconName: 'Zap' },
  { name: 'Guindeau électrique', category: 'A_BORD', iconName: 'Zap' },
  { name: 'Pilote automatique', category: 'A_BORD', iconName: 'Navigation' },
  { name: 'GPS', category: 'A_BORD', iconName: 'Compass' },
  { name: 'Sondeur', category: 'A_BORD', iconName: 'Radio' },
  { name: 'VHF', category: 'A_BORD', iconName: 'Radio' },
  { name: 'Guides & Cartes', category: 'A_BORD', iconName: 'Map' },
  { name: 'Réfrigérateur', category: 'A_BORD', iconName: 'Snowflake' },
  { name: 'Congélateur', category: 'A_BORD', iconName: 'Snowflake' },
  { name: 'Four/cuisinière', category: 'A_BORD', iconName: 'Flame' },
  { name: 'Barbecue', category: 'A_BORD', iconName: 'Flame' },
  { name: 'Micro-ondes', category: 'A_BORD', iconName: 'Zap' },
  { name: 'Machine à café', category: 'A_BORD', iconName: 'Coffee' },
  { name: 'Machine à glaçons', category: 'A_BORD', iconName: 'Snowflake' },
  { name: 'Lave-vaisselle', category: 'A_BORD', iconName: 'Check' },
  { name: 'Gilets de sauvetage', category: 'A_BORD', iconName: 'LifeBuoy' },
  { name: 'Ancre', category: 'A_BORD', iconName: 'Anchor' },
  { name: 'Glacière', category: 'A_BORD', iconName: 'Snowflake' },
  
  // LOISIR
  { name: 'Paddle', category: 'LOISIR', iconName: 'Waves' },
  { name: 'Masques et tubas', category: 'LOISIR', iconName: 'Glasses' },
  { name: 'Matériel de plongée', category: 'LOISIR', iconName: 'Glasses' },
  { name: 'Jacuzzi', category: 'LOISIR', iconName: 'Waves' },
  { name: 'Ski nautique', category: 'LOISIR', iconName: 'Activity' },
  { name: 'Monoski', category: 'LOISIR', iconName: 'Activity' },
  { name: 'Wakeboard', category: 'LOISIR', iconName: 'Activity' },
  { name: 'Bouée tractable', category: 'LOISIR', iconName: 'LifeBuoy' },
  { name: 'Matériel de pêche', category: 'LOISIR', iconName: 'Fish' }
];

async function main() {
  console.log("Ajout des équipements manquants dans la base de données...");
  
  for (const eq of equipments) {
    await prisma.equipment.upsert({
      where: { name: eq.name },
      update: { category: eq.category, iconName: eq.iconName },
      create: { name: eq.name, category: eq.category, iconName: eq.iconName }
    });
  }
  
  console.log("Tous les équipements ont été ajoutés avec succès !");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
