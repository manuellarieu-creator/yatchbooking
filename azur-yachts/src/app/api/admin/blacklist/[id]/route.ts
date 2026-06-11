import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const blacklistedEmail = await prisma.blacklist.findUnique({
      where: { id: params.id }
    });

    if (!blacklistedEmail) {
      return NextResponse.json({ error: 'Entrée introuvable dans la liste noire' }, { status: 404 });
    }

    await prisma.blacklist.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Admin blacklist delete error:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la suppression' }, { status: 500 });
  }
}
