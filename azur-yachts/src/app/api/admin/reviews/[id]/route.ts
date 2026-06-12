import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { status } = await req.json();
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    const review = await prisma.review.update({
      where: { id: params.id },
      data: { status }
    });

    // Optionnel : Si l'avis est approuvé ou modifié, on pourrait recalculer la moyenne du listing
    // Mais pour faire simple, la moyenne peut être calculée dynamiquement ou par un trigger.
    // Mettons à jour le listing si on approuve
    if (status === 'APPROVED' || status === 'REJECTED') {
      const allApproved = await prisma.review.findMany({
        where: { listingId: review.listingId, status: 'APPROVED' }
      });
      
      const avg = allApproved.length > 0 
        ? allApproved.reduce((acc, r) => acc + r.rating, 0) / allApproved.length 
        : 0;

      await prisma.listing.update({
        where: { id: review.listingId },
        data: { averageRating: avg, reviewCount: allApproved.length }
      });
    }

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('PATCH /api/admin/reviews/[id] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const review = await prisma.review.delete({
      where: { id: params.id }
    });

    // Recalcul de la moyenne après suppression
    const allApproved = await prisma.review.findMany({
      where: { listingId: review.listingId, status: 'APPROVED' }
    });
    
    const avg = allApproved.length > 0 
      ? allApproved.reduce((acc, r) => acc + r.rating, 0) / allApproved.length 
      : 0;

    await prisma.listing.update({
      where: { id: review.listingId },
      data: { averageRating: avg, reviewCount: allApproved.length }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/reviews/[id] error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
