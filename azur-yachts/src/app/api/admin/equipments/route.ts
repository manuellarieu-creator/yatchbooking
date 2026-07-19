import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { name, category, iconName } = body;

    if (!name || !category || !iconName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existing = await prisma.equipment.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: 'Un équipement avec ce nom existe déjà' }, { status: 400 });
    }

    const equipment = await prisma.equipment.create({
      data: { name, category, iconName },
    });

    return NextResponse.json(equipment, { status: 201 });
  } catch (error) {
    console.error('Failed to create equipment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
