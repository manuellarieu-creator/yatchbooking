import 'dotenv/config'
import { PrismaClient, Role, UserStatus, AdvertiserTier, ListingStatus, BookingStatus, PaymentMethod, PaymentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // ── CLEAN ──────────────────────────────────────────────────
  await prisma.payment.deleteMany()
  await prisma.bookingService.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.review.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversationParticipant.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.service.deleteMany()
  await prisma.availability.deleteMany()
  await prisma.listingImage.deleteMany()
  await prisma.listing.deleteMany()
  await prisma.discountCode.deleteMany()
  await prisma.newsletter.deleteMany()
  await prisma.fAQ.deleteMany()
  await prisma.page.deleteMany()
  await prisma.paymentSettings.deleteMany()
  await prisma.user.deleteMany()

  // ── USERS ──────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('Demo@2025', 12)
  const adminPassword = await bcrypt.hash('Admin@2025', 12)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@azuryachts.com',
      password: adminPassword,
      firstName: 'Laurent',
      lastName: 'Chevalier',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      videoVerified: true,
    }
  })

  const advertiser1 = await prisma.user.create({
    data: {
      email: 'pierre@demo.com',
      password: hashedPassword,
      firstName: 'Pierre',
      lastName: 'Dupont',
      role: Role.ADVERTISER,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      videoVerified: true,
      advertiserTier: AdvertiserTier.STANDARD,
      countryResidence: 'France',
      languages: ['Français', 'Anglais'],
    }
  })

  const advertiser2 = await prisma.user.create({
    data: {
      email: 'marco@demo.com',
      password: hashedPassword,
      firstName: 'Marco',
      lastName: 'Ricci',
      role: Role.ADVERTISER,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      videoVerified: true,
      advertiserTier: AdvertiserTier.PREMIUM,
      countryResidence: 'Italie',
      languages: ['Italien', 'Français', 'Anglais'],
    }
  })

  const advertiser3 = await prisma.user.create({
    data: {
      email: 'sophia@demo.com',
      password: hashedPassword,
      firstName: 'Sophia',
      lastName: 'Marchetti',
      role: Role.ADVERTISER,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      videoVerified: true,
      advertiserTier: AdvertiserTier.PLATINIUM,
      countryResidence: 'Monaco',
      languages: ['Italien', 'Français', 'Anglais', 'Espagnol'],
    }
  })

  const client1 = await prisma.user.create({
    data: {
      email: 'client1@demo.com',
      password: hashedPassword,
      firstName: 'Sophie',
      lastName: 'Lemaire',
      role: Role.CLIENT,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      countryResidence: 'France',
    }
  })

  const client2 = await prisma.user.create({
    data: {
      email: 'client2@demo.com',
      password: hashedPassword,
      firstName: 'Jean',
      lastName: 'Dupont',
      role: Role.CLIENT,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      countryResidence: 'France',
    }
  })

  const client3 = await prisma.user.create({
    data: {
      email: 'client3@demo.com',
      password: hashedPassword,
      firstName: 'Amelia',
      lastName: 'Chen',
      role: Role.CLIENT,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      countryResidence: 'Royaume-Uni',
    }
  })

  console.log('✅ Users created')

  // ── LISTINGS ───────────────────────────────────────────────
  const listing1 = await prisma.listing.create({
    data: {
      title: 'Azura Prestige 68 — Côte d\'Azur',
      description: 'Magnifique motor yacht de 68 pieds disponible sur la Côte d\'Azur. Équipé de 4 cabines doubles, 3 salles de bains, une cuisine fully-equipped et un vaste espace de vie. Idéal pour des croisières en famille ou entre amis le long de la Riviera française et italienne.',
      price: 4800,
      country: 'France',
      location: 'Nice, Côte d\'Azur',
      latitude: 43.6961,
      longitude: 7.2719,
      status: ListingStatus.ACTIVE,
      maxAdults: 8,
      maxChildren: 4,
      boatType: 'Motor Yacht',
      boatLength: 20.73,
      boatYear: 2019,
      requiresCaptain: true,
      skipperAvailable: true,
      maxRentalHours: 24,
      deliveryAvailable: true,
      deliveryFee: 500,
      cleaningFee: 350,
      averageRating: 4.9,
      reviewCount: 24,
      viewCount: 847,
      ownerId: advertiser3.id,
    }
  })

  await prisma.listingImage.createMany({
    data: [
      { url: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200&q=80', publicId: 'azura-1', order: 1, listingId: listing1.id },
      { url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&q=80', publicId: 'azura-2', order: 2, listingId: listing1.id },
      { url: 'https://images.unsplash.com/photo-1559521783-1d1599583485?w=800&q=80', publicId: 'azura-3', order: 3, listingId: listing1.id },
    ]
  })

  await prisma.service.createMany({
    data: [
      { name: 'Nettoyage', price: 350, unit: 'PER_BOOKING', isRequired: true, listingId: listing1.id },
      { name: 'Chef à bord', price: 1400, unit: 'PER_BOOKING', description: 'Chef professionnel pour tous vos repas', listingId: listing1.id },
      { name: 'Équipement snorkeling', price: 200, unit: 'PER_BOOKING', listingId: listing1.id },
      { name: 'Livraison dans votre port', price: 500, unit: 'PER_BOOKING', listingId: listing1.id },
    ]
  })

  const listing2 = await prisma.listing.create({
    data: {
      title: 'Liberté Bleue 52 — Santorin',
      description: 'Superbe catamaran de 52 pieds idéalement situé à Santorin. 5 cabines doubles, parfait pour explorer les Cyclades. Skipper disponible sur demande.',
      price: 2900,
      country: 'Grèce',
      location: 'Santorin, Cyclades',
      latitude: 36.3932,
      longitude: 25.4615,
      status: ListingStatus.ACTIVE,
      maxAdults: 10,
      maxChildren: 4,
      boatType: 'Catamaran',
      boatLength: 15.85,
      boatYear: 2020,
      requiresCaptain: false,
      skipperAvailable: true,
      maxRentalHours: 24,
      deliveryAvailable: false,
      cleaningFee: 250,
      averageRating: 4.7,
      reviewCount: 38,
      viewCount: 612,
      ownerId: advertiser2.id,
    }
  })

  await prisma.listingImage.createMany({
    data: [
      { url: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1200&q=80', publicId: 'liberte-1', order: 1, listingId: listing2.id },
      { url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80', publicId: 'liberte-2', order: 2, listingId: listing2.id },
    ]
  })

  await prisma.service.createMany({
    data: [
      { name: 'Nettoyage', price: 250, unit: 'PER_BOOKING', isRequired: true, listingId: listing2.id },
      { name: 'Skipper', price: 800, unit: 'PER_BOOKING', listingId: listing2.id },
      { name: 'Cours de voile', price: 300, unit: 'PER_BOOKING', listingId: listing2.id },
    ]
  })

  const listing3 = await prisma.listing.create({
    data: {
      title: 'Belle Époque 44 — Sardaigne',
      description: 'Voilier classique de 44 pieds au charme indéniable, basé à Porto Cervo en Sardaigne. Idéal pour une croisière authentique dans les eaux cristallines de la Costa Smeralda.',
      price: 1650,
      country: 'Italie',
      location: 'Porto Cervo, Sardaigne',
      latitude: 41.1333,
      longitude: 9.5333,
      status: ListingStatus.ACTIVE,
      maxAdults: 6,
      maxChildren: 2,
      boatType: 'Voilier',
      boatLength: 13.4,
      boatYear: 2016,
      requiresCaptain: false,
      skipperAvailable: false,
      maxRentalHours: 12,
      deliveryAvailable: false,
      cleaningFee: 180,
      averageRating: 4.5,
      reviewCount: 17,
      viewCount: 423,
      ownerId: advertiser1.id,
    }
  })

  await prisma.listingImage.createMany({
    data: [
      { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', publicId: 'belle-1', order: 1, listingId: listing3.id },
    ]
  })

  await prisma.service.createMany({
    data: [
      { name: 'Nettoyage', price: 180, unit: 'PER_BOOKING', isRequired: true, listingId: listing3.id },
      { name: 'Panier pique-nique', price: 80, unit: 'PER_BOOKING', listingId: listing3.id },
    ]
  })

  const listing4 = await prisma.listing.create({
    data: {
      title: 'Ibiza Crown 86 — Baléares',
      description: 'Superyacht exceptionnel de 86 pieds basé à Ibiza. Le summum du luxe nautique avec 6 cabines, jacuzzi de pont, salle de cinéma et équipage professionnel complet.',
      price: 7200,
      country: 'Espagne',
      location: 'Ibiza, Baléares',
      latitude: 38.9067,
      longitude: 1.4200,
      status: ListingStatus.ACTIVE,
      maxAdults: 12,
      maxChildren: 4,
      boatType: 'Superyacht',
      boatLength: 26.2,
      boatYear: 2021,
      requiresCaptain: true,
      skipperAvailable: true,
      maxRentalHours: 24,
      deliveryAvailable: true,
      deliveryFee: 800,
      cleaningFee: 600,
      averageRating: 5.0,
      reviewCount: 9,
      viewCount: 534,
      ownerId: advertiser3.id,
    }
  })

  await prisma.service.createMany({
    data: [
      { name: 'Nettoyage', price: 600, unit: 'PER_BOOKING', isRequired: true, listingId: listing4.id },
      { name: 'Chef privé', price: 2000, unit: 'PER_BOOKING', listingId: listing4.id },
      { name: 'Jet ski (2)', price: 800, unit: 'PER_BOOKING', listingId: listing4.id },
      { name: 'Service DJ', price: 1500, unit: 'PER_BOOKING', listingId: listing4.id },
    ]
  })

  const listing5 = await prisma.listing.create({
    data: {
      title: 'Caribbean Dream 60 — Martinique',
      description: 'Grand catamaran de 60 pieds basé en Martinique. Parfait pour explorer les Caraïbes : Saint-Lucia, Les Saintes, Marie-Galante. Skipper inclus.',
      price: 5500,
      country: 'Caraïbes',
      location: 'Martinique',
      latitude: 14.6415,
      longitude: -61.0242,
      status: ListingStatus.ACTIVE,
      maxAdults: 10,
      maxChildren: 4,
      boatType: 'Catamaran',
      boatLength: 18.3,
      boatYear: 2022,
      requiresCaptain: false,
      skipperAvailable: true,
      maxRentalHours: 24,
      deliveryAvailable: false,
      cleaningFee: 400,
      averageRating: 4.8,
      reviewCount: 31,
      viewCount: 689,
      ownerId: advertiser2.id,
    }
  })

  await prisma.service.createMany({
    data: [
      { name: 'Nettoyage', price: 400, unit: 'PER_BOOKING', isRequired: true, listingId: listing5.id },
      { name: 'Skipper inclus', price: 0, unit: 'PER_BOOKING', description: 'Skipper professionnel inclus dans le prix', listingId: listing5.id },
      { name: 'Équipement plongée', price: 350, unit: 'PER_BOOKING', listingId: listing5.id },
    ]
  })

  console.log('✅ Listings created')

  // ── AVAILABILITIES ─────────────────────────────────────────
  const today = new Date()
  const in3months = new Date(today)
  in3months.setMonth(in3months.getMonth() + 3)

  for (const listing of [listing1, listing2, listing3, listing4, listing5]) {
    await prisma.availability.create({
      data: {
        startDate: today,
        endDate: in3months,
        type: 'AVAILABLE',
        listingId: listing.id,
      }
    })
  }

  console.log('✅ Availabilities created')

  // ── BOOKINGS ───────────────────────────────────────────────
  const booking1 = await prisma.booking.create({
    data: {
      startDate: new Date('2025-06-14'),
      endDate: new Date('2025-06-21'),
      totalNights: 7,
      basePrice: 33600,
      cleaningFee: 350,
      servicesTotal: 1900,
      discountAmount: 1650,
      discountCode: 'BIENVENUE10',
      totalPrice: 34200,
      adults: 4,
      children: 2,
      status: BookingStatus.PAYMENT_RECEIVED,
      listingId: listing1.id,
      clientId: client2.id,
    }
  })

  await prisma.payment.create({
    data: {
      amount: 34200,
      currency: 'EUR',
      method: PaymentMethod.BANK_TRANSFER,
      status: PaymentStatus.PROOF_SUBMITTED,
      bankTransferRef: 'REF-CK7X9M',
      paymentDeadline: new Date('2025-06-15'),
      bookingId: booking1.id,
    }
  })

  const booking2 = await prisma.booking.create({
    data: {
      startDate: new Date('2025-08-03'),
      endDate: new Date('2025-08-10'),
      totalNights: 7,
      basePrice: 20300,
      cleaningFee: 250,
      servicesTotal: 0,
      totalPrice: 20300,
      adults: 2,
      children: 0,
      status: BookingStatus.CONFIRMED,
      listingId: listing2.id,
      clientId: client1.id,
    }
  })

  await prisma.payment.create({
    data: {
      amount: 20300,
      currency: 'EUR',
      method: PaymentMethod.STRIPE,
      status: PaymentStatus.VERIFIED,
      bookingId: booking2.id,
    }
  })

  const booking3 = await prisma.booking.create({
    data: {
      startDate: new Date('2025-04-12'),
      endDate: new Date('2025-04-19'),
      totalNights: 7,
      basePrice: 16800,
      cleaningFee: 350,
      servicesTotal: 0,
      totalPrice: 16800,
      adults: 6,
      children: 0,
      status: BookingStatus.COMPLETED,
      listingId: listing1.id,
      clientId: client3.id,
    }
  })

  await prisma.payment.create({
    data: {
      amount: 16800,
      currency: 'EUR',
      method: PaymentMethod.PAYPAL,
      status: PaymentStatus.VERIFIED,
      bookingId: booking3.id,
    }
  })

  console.log('✅ Bookings created')

  // ── REVIEWS ────────────────────────────────────────────────
  await prisma.review.createMany({
    data: [
      {
        rating: 5,
        comment: 'Une semaine absolument magique à bord de l\'Azura. L\'équipage était aux petits soins, le yacht immaculé. La Côte d\'Azur depuis la mer est tout simplement inoubliable.',
        listingId: listing1.id,
        authorId: client1.id,
      },
      {
        rating: 5,
        comment: 'Service irréprochable de A à Z. Le chef à bord a préparé des repas exceptionnels. Je recommande vivement !',
        listingId: listing1.id,
        authorId: client3.id,
      },
      {
        rating: 4,
        comment: 'Très belle expérience, yacht conforme aux photos. Seul bémol : la climatisation un peu insuffisante par forte chaleur.',
        listingId: listing1.id,
        authorId: client2.id,
      },
      {
        rating: 5,
        comment: 'Le catamaran est parfait pour explorer les Cyclades. Santorin depuis la mer au coucher du soleil... inoubliable.',
        listingId: listing2.id,
        authorId: client1.id,
      },
      {
        rating: 5,
        comment: 'Nos vacances en famille les plus réussies ! Le skipper était très professionnel et connaissait parfaitement les spots secrets.',
        listingId: listing2.id,
        authorId: client3.id,
      },
    ]
  })

  console.log('✅ Reviews created')

  // ── PAYMENT SETTINGS ───────────────────────────────────────
  await prisma.paymentSettings.create({
    data: {
      activeMethod: PaymentMethod.STRIPE,
      stripeEnabled: true,
      paypalEnabled: true,
      bankEnabled: true,
      bankAccountName: 'Azur Yachts SAM',
      bankIban: 'MC93 1234 5678 9012 3456 7890 123',
      bankBic: 'CMCIMC2A',
      bankName: 'Crédit Mutuel Monaco',
      bankNotificationEmail: 'admin@azuryachts.com',
    }
  })

  // ── DISCOUNT CODES ─────────────────────────────────────────
  await prisma.discountCode.createMany({
    data: [
      { code: 'BIENVENUE10', discountPercent: 10, maxUses: 100, isActive: true },
      { code: 'ETE2025', discountPercent: 15, maxUses: 50, isActive: true },
      { code: 'AZUR20', discountPercent: 20, maxUses: 20, isActive: true },
    ]
  })

  // ── FAQ ────────────────────────────────────────────────────
  await prisma.fAQ.createMany({
    data: [
      { question: 'Comment fonctionne la réservation ?', answer: 'Choisissez votre yacht, sélectionnez vos dates, soumettez votre demande et effectuez le paiement. Notre équipe valide sous 24h.', category: 'Réservation', order: 1 },
      { question: 'Les annonceurs sont-ils vérifiés ?', answer: 'Oui, chaque annonceur passe par une vérification d\'identité vidéo validée manuellement par notre équipe.', category: 'Sécurité', order: 2 },
      { question: 'Quels modes de paiement sont acceptés ?', answer: 'Carte bancaire via Stripe, PayPal, ou virement bancaire SEPA.', category: 'Paiement', order: 3 },
      { question: 'Puis-je annuler une réservation ?', answer: 'Les conditions d\'annulation varient selon la politique définie par chaque annonceur (flexible, modérée ou stricte).', category: 'Réservation', order: 4 },
      { question: 'Comment devenir annonceur ?', answer: 'Créez un compte annonceur, passez la vérification vidéo, puis publiez votre annonce après validation de notre équipe.', category: 'Annonceurs', order: 5 },
      { question: 'Comment fonctionne le virement bancaire ?', answer: 'Après réservation, vous disposez de 24h pour effectuer le virement et soumettre votre preuve de paiement.', category: 'Paiement', order: 6 },
    ]
  })

  // ── PAGES ──────────────────────────────────────────────────
  await prisma.page.createMany({
    data: [
      {
        slug: 'about',
        title: 'À propos d\'Azur Yachts',
        content: '<h2>Notre mission</h2><p>Azur Yachts est née en 2009 d\'une passion commune pour la mer et d\'une conviction : chaque client mérite une expérience nautique d\'exception, sans compromis sur la qualité, la sécurité ou la transparence.</p><h2>Nos valeurs</h2><p>Confiance, excellence, transparence, accessibilité, durabilité et humanité guident chacune de nos décisions.</p>',
      },
      {
        slug: 'contact-info',
        title: 'Informations de contact',
        content: JSON.stringify({
          email: 'contact@azuryachts.com',
          phone: '+377 97 70 00 00',
          whatsapp: '+377 6 77 00 00 00',
          address: '3, Quai des Milliardaires, 98000 Monaco',
        }),
      },
    ]
  })

  console.log('✅ Settings, FAQ, Pages created')
  console.log('🎉 Seed completed successfully!')
  console.log('')
  console.log('📧 Comptes de test :')
  console.log('   Admin    : admin@azuryachts.com / Admin@2025')
  console.log('   Standard : pierre@demo.com / Demo@2025')
  console.log('   Premium  : marco@demo.com / Demo@2025')
  console.log('   Platinium: sophia@demo.com / Demo@2025')
  console.log('   Client   : client1@demo.com / Demo@2025')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
