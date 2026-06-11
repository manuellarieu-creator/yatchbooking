import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET() {
  try {
    const totalYachts = await prisma.listing.count({ where: { status: 'ACTIVE' } });
    
    // Fetch all active destinations from DB, ordered by order field
    const activeDestinations = await prisma.destination.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    const destinations = await Promise.all(activeDestinations.map(async (dest) => {
      // Count listings where country or location contains the destination name
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

    return NextResponse.json({ totalYachts, destinations });
  } catch (error) {
    console.error('Home stats API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
