import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { name, imageUrl, gradient, isLarge, isActive, order } = body;

    const destination = await prisma.destination.update({
      where: { id: params.id },
      data: {
        name,
        imageUrl,
        gradient,
        isLarge,
        isActive,
        order
      }
    });

    return NextResponse.json({ destination });
  } catch (err) {
    console.error('PUT /api/admin/destinations/[id] error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await prisma.destination.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/admin/destinations/[id] error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
