import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create a default owner user if not exists
  let owner = await prisma.user.findUnique({ where: { email: 'owner@azuryachts.com' } })
  if (!owner) {
    owner = await prisma.user.create({
      data: {
        email: 'owner@azuryachts.com',
        firstName: 'Fabio',
        lastName: 'Jaction',
        role: 'ADVERTISER',
        advertiserTier: 'PREMIUM',
        videoVerified: true,
      }
    })
  }

  // Yacht 1
  await prisma.listing.create({
    data: {
      title: 'Azura Prestige 68',
      description: 'Superyacht exceptionnel pour une croisière inoubliable.',
      price: 4800,
      country: 'France',
      location: 'Côte d\'Azur',
      maxAdults: 8,
      maxChildren: 0,
      boatType: 'Motor Yacht',
      boatLength: 20.7, // 68 ft
      boatYear: 2022,
      requiresCaptain: true,
      skipperAvailable: true,
      status: 'ACTIVE',
      ownerId: owner.id,
      averageRating: 4.9,
      reviewCount: 24,
      viewCount: 847,
      cleaningFee: 250,
    }
  })

  // Yacht 2
  await prisma.listing.create({
    data: {
      title: 'Liberté Bleue 52',
      description: 'Catamaran spacieux idéal pour les familles ou groupes d\'amis.',
      price: 2900,
      country: 'Grèce',
      location: 'Athènes',
      maxAdults: 10,
      maxChildren: 2,
      boatType: 'Catamaran',
      boatLength: 15.8, // 52 ft
      boatYear: 2020,
      requiresCaptain: false,
      skipperAvailable: true,
      status: 'ACTIVE',
      ownerId: owner.id,
      averageRating: 4.7,
      reviewCount: 15,
      viewCount: 612,
      cleaningFee: 150,
    }
  })

  // Yacht 3
  await prisma.listing.create({
    data: {
      title: 'Belle Époque 44',
      description: 'Voilier classique et élégant pour les puristes de la voile.',
      price: 1650,
      country: 'Italie',
      location: 'Sardaigne',
      maxAdults: 6,
      maxChildren: 0,
      boatType: 'Voilier',
      boatLength: 13.4, // 44 ft
      boatYear: 2018,
      requiresCaptain: false,
      skipperAvailable: false,
      status: 'ACTIVE',
      ownerId: owner.id,
      averageRating: 4.5,
      reviewCount: 8,
      viewCount: 320,
      cleaningFee: 100,
    }
  })

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
