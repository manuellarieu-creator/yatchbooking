import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const destinations = await prisma.destination.findMany({
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ destinations });
  } catch (err) {
    console.error('GET /api/admin/destinations error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { name, imageUrl, gradient, isLarge, isActive, order } = body;

    if (!name) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
    }

    const destination = await prisma.destination.create({
      data: {
        name,
        imageUrl,
        gradient,
        isLarge: isLarge ?? false,
        isActive: isActive ?? true,
        order: order ?? 0
      }
    });

    return NextResponse.json({ destination }, { status: 201 });
  } catch (err) {
    console.error('POST /api/admin/destinations error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
