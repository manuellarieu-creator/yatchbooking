import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    let settings = await prisma.platformSettings.findUnique({ where: { id: 'default' } });
    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: { id: 'default', satisfiedClients: '12K+', yearsOfExcellence: '15' }
      });
    }

    const totalYachts = await prisma.listing.count({ where: { status: 'ACTIVE' } });
    const uniqueCountries = await prisma.listing.findMany({
      where: { status: 'ACTIVE' },
      select: { country: true },
      distinct: ['country']
    });
    const totalDestinations = uniqueCountries.length;

    return NextResponse.json({
      ...settings,
      totalYachts,
      totalDestinations
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { satisfiedClients, yearsOfExcellence } = await req.json();

    const settings = await prisma.platformSettings.upsert({
      where: { id: 'default' },
      update: { satisfiedClients, yearsOfExcellence },
      create: { id: 'default', satisfiedClients, yearsOfExcellence }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
