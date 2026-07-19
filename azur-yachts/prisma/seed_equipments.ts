import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const EQUIPEMENTS_A_BORD = [
  'Eau chaude', 'Dessalinisateur', 'Air conditionné', 'WC électrique', 'Serviettes de bain', 'Prise USB', 'Wi-Fi',
  'Four/cuisinière', 'Machine à café', 'Glacière', 'Générateur', 'Panneaux solaires', 'Inverseur électrique', 'Prise 220V'
];

const EQUIPEMENTS_EXTERIEURS = [
  'Taud de soleil', 'Douche extérieure', 'Table extérieure', 'Enceintes extérieures', 'Pont en teck', 'Échelle de bain',
  'Coussins extérieurs', 'Bain de soleil avant', 'Bain de soleil arrière', 'Plateforme de bain',
  'Annexe', 'Guindeau électrique', 'Pilote automatique', 'GPS', 'Sondeur', 'VHF', 'Guides & Cartes', 'Grand-voile lattée', 'Génois', 'Filet de sécurité'
];

const AUTRES_LOISIRS = [
  'Caméra vidéo', 'Système audio', 'Matériel de pêche', 'Masques et tubas'
];

const EQUIPEMENTS_OPTIONNELS = [
  'Paddle', 'Canoë-kayak', 'Ski nautique', 'Wakeboard', 'Bouée tractable', 'Moteur hors-bord', 'Matériel de plongée', 'Literie supplémentaire'
];

const getIconName = (name: string): string => {
  const n = name.toLowerCase();
  
  if (n.includes('taud')) return 'Tent';
  if (n.includes('douche')) return 'ShowerHead';
  if (n.includes('table')) return 'Grid2X2';
  if (n.includes('enceinte')) return 'Speaker';
  if (n.includes('teck')) return 'Grip';
  if (n.includes('échelle')) return 'List';
  if (n.includes('filet')) return 'Shield';
  if (n.includes('coussin')) return 'Square';
  if (n.includes('plateforme')) return 'LayoutTemplate';
  if (n.includes('eau chaude')) return 'Thermometer';
  if (n.includes('dessalinisateur') || n.includes('wc')) return 'Droplets';
  if (n.includes('air cond') || n.includes('climatisation')) return 'AirVent';
  if (n.includes('serviette') || n.includes('literie')) return 'Layers';
  if (n.includes('usb')) return 'Usb';
  if (n.includes('wi-fi') || n.includes('wifi')) return 'Wifi';
  if (n.includes('annexe')) return 'LifeBuoy';
  if (n.includes('guindeau')) return 'Anchor';
  if (n.includes('pilote')) return 'Compass';
  if (n.includes('gps')) return 'Navigation';
  if (n.includes('vhf')) return 'Radio';
  if (n.includes('sondeur')) return 'Activity';
  if (n.includes('carte') || n.includes('guide')) return 'Map';
  if (n.includes('four') || n.includes('cuisine')) return 'Flame';
  if (n.includes('café')) return 'Coffee';
  if (n.includes('glacière')) return 'Snowflake';
  if (n.includes('caméra') || n.includes('video')) return 'Video';
  if (n.includes('ski nautique') || n.includes('wakeboard')) return 'Activity';
  if (n.includes('paddle') || n.includes('canoë') || n.includes('plongée') || n.includes('bouée')) return 'Waves';
  if (n.includes('pêche')) return 'Fish';
  if (n.includes('masque') || n.includes('tuba')) return 'Glasses';
  if (n.includes('système audio')) return 'Speaker';
  if (n.includes('moteur')) return 'Settings';
  if (n.includes('voile') || n.includes('génois')) return 'Sailboat';
  if (n.includes('générateur')) return 'Battery';
  if (n.includes('solaire')) return 'Sun';
  if (n.includes('inverseur') || n.includes('220v') || n.includes('prise')) return 'Plug';
  
  return 'Check';
};

async function main() {
  console.log('Seeding equipments...');
  
  const allEquipments = [
    ...EQUIPEMENTS_A_BORD.map(name => ({ name, category: 'A_BORD' })),
    ...EQUIPEMENTS_EXTERIEURS.map(name => ({ name, category: 'EXTERIEUR' })),
    ...AUTRES_LOISIRS.map(name => ({ name, category: 'LOISIR' })),
    ...EQUIPEMENTS_OPTIONNELS.map(name => ({ name, category: 'OPTIONNEL' }))
  ];

  for (const eq of allEquipments) {
    await prisma.equipment.upsert({
      where: { name: eq.name },
      update: {
        category: eq.category,
        iconName: getIconName(eq.name)
      },
      create: {
        name: eq.name,
        category: eq.category,
        iconName: getIconName(eq.name)
      }
    });
  }

  console.log('Equipments seeded successfully.');
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() });
