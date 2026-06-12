import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { order: 'asc' } },
        services: true,
        availabilities: true,
        owner: {
          select: {
            id: true, firstName: true, lastName: true,
            avatar: true, videoVerified: true, advertiserTier: true,
            languages: true, createdAt: true,
          },
        },
        reviews: {
          include: { author: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { reviews: true, bookings: true, favorites: true } },
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 })
    }

    // Increment view count
    await prisma.listing.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json({ listing })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const listing = await prisma.listing.findUnique({ where: { id: params.id } })
    if (!listing) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

    if (listing.ownerId !== (session.user as any).id && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = await req.json()
    const { images, services, availabilities, ownerId, ...data } = body;

    if (ownerId && (session.user as any).role === 'ADMIN') {
      data.ownerId = ownerId;
    }

    if (images) {
      data.images = {
        deleteMany: {},
        create: images.map((img: any, idx: number) => ({
          url: img.url,
          publicId: img.publicId,
          order: idx + 1,
        }))
      };
    }
    if (services) {
      data.services = {
        deleteMany: {},
        create: services.map((svc: any) => ({
          name: svc.name,
          price: svc.price,
          unit: svc.unit,
          description: svc.description,
          isRequired: svc.isRequired || false,
        }))
      };
    }

    const updated = await prisma.listing.update({
      where: { id: params.id },
      data: { ...data, status: (session.user as any).role === 'ADMIN' ? data.status || listing.status : 'PENDING' },
    })

    return NextResponse.json({ listing: updated })
  } catch (error: any) {
    console.error('Error updating listing:', error);
    const msg = error?.message || 'Erreur serveur';
    const lines = msg.split('\n');
    const reason = lines.slice(-5).join('\n');
    return NextResponse.json({ error: reason }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const listing = await prisma.listing.findUnique({ where: { id: params.id } })
    if (!listing) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

    if (listing.ownerId !== (session.user as any).id && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    await prisma.listing.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
