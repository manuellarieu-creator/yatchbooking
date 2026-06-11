import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';
import { v2 as cloudinary } from 'cloudinary';

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { name, imageUrl, imageBase64, gradient, isLarge, isActive, order } = body;

    let finalImageUrl = imageUrl;

    if (imageBase64) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
          folder: 'azur_yachts_destinations',
        });
        finalImageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error('Erreur upload Cloudinary:', uploadError);
        return NextResponse.json({ error: 'Erreur lors du téléchargement de l\'image' }, { status: 500 });
      }
    }

    const destination = await prisma.destination.update({
      where: { id: params.id },
      data: {
        name,
        imageUrl: finalImageUrl,
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
