import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';
import { sendAccountApproved } from '@/lib/resend';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { status } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { status }
    });

    // Envoi de l'email si approbation
    if (status === 'ACTIVE' && user.status === 'PENDING') {
      try {
        await sendAccountApproved(user.email, user.firstName);
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email d\'approbation:', emailError);
        // On ne bloque pas la réponse si l'email échoue
      }
    }

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const blacklist = searchParams.get('blacklist') === 'true';

    const user = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    if (blacklist) {
      await prisma.blacklist.create({
        data: {
          email: user.email,
          reason: 'Bloqué par un administrateur'
        }
      });
    }

    await prisma.user.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Admin user delete error:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la suppression' }, { status: 500 });
  }
}
