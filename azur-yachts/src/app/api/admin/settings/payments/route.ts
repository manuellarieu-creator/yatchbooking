import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    let settings = await prisma.paymentSettings.findFirst();
    if (!settings) {
      settings = await prisma.paymentSettings.create({
        data: { activeMethod: 'STRIPE' }
      });
    }

    return NextResponse.json(settings);
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

    const body = await req.json();
    let settings = await prisma.paymentSettings.findFirst();

    if (settings) {
      settings = await prisma.paymentSettings.update({
        where: { id: settings.id },
        data: body
      });
    } else {
      settings = await prisma.paymentSettings.create({
        data: body
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
