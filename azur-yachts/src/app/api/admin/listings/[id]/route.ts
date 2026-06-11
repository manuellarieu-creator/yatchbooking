import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';
import { sendListingApproved, sendListingRejected } from '@/lib/resend';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { status, rejectionReason } = await req.json();

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { owner: true }
    });

    if (!listing) {
      return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });
    }

    const updatedListing = await prisma.listing.update({
      where: { id: params.id },
      data: { 
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null
      }
    });

    // Envoi des emails
    if (status === 'ACTIVE' && listing.status === 'PENDING') {
      try {
        await sendListingApproved(
          listing.owner.email, 
          listing.owner.firstName, 
          listing.title, 
          `${process.env.NEXT_PUBLIC_APP_URL}/yachts/${listing.id}`
        );
      } catch (e) {
        console.error('Erreur email approbation:', e);
      }
    } else if (status === 'REJECTED' && listing.status === 'PENDING') {
      try {
        await sendListingRejected(
          listing.owner.email,
          listing.owner.firstName,
          listing.title,
          rejectionReason || 'Non respect des critères de publication'
        );
      } catch (e) {
        console.error('Erreur email rejet:', e);
      }
    }

    return NextResponse.json({ success: true, listing: updatedListing });

  } catch (error) {
    console.error('Admin listing update error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
