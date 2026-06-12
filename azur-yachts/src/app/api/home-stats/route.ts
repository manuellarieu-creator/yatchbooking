import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const totalYachts = await prisma.listing.count({ where: { status: 'ACTIVE' } });
    
    // Distinct countries
    const uniqueCountries = await prisma.listing.findMany({
      where: { status: 'ACTIVE' },
      select: { country: true },
      distinct: ['country']
    });
    const totalDestinationsCount = uniqueCountries.length;

    // Platform settings
    let platformSettings = await prisma.platformSettings.findUnique({ where: { id: 'default' } });
    if (!platformSettings) {
      platformSettings = await prisma.platformSettings.create({
        data: { id: 'default', satisfiedClients: '12K+', yearsOfExcellence: '15' }
      });
    }

    // Fetch all active destinations from DB, ordered by order field
    const activeDestinations = await prisma.destination.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    const destinations = await Promise.all(activeDestinations.map(async (dest) => {
      const count = await prisma.listing.count({
        where: {
          status: 'ACTIVE',
          OR: [
            { country: { contains: dest.name, mode: 'insensitive' } },
            { location: { contains: dest.name, mode: 'insensitive' } }
          ]
        }
      });
      
      return {
        id: dest.id,
        name: dest.name,
        count: count,
        gradient: dest.gradient || 'linear-gradient(135deg, #1a5a80, #0a2540)',
        imageUrl: dest.imageUrl,
        isLarge: dest.isLarge
      };
    }));

    // Fetch top 3 approved reviews
    const topReviews = await prisma.review.findMany({
      where: { status: 'APPROVED', rating: { gte: 4 } },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        author: {
          select: { firstName: true, lastName: true, avatar: true, countryResidence: true }
        },
        listing: {
          select: { title: true }
        }
      }
    });

    return NextResponse.json({ 
      totalYachts, 
      totalDestinationsCount,
      settings: platformSettings,
      destinations,
      reviews: topReviews
    });
  } catch (error) {
    console.error('Home stats API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
