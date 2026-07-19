import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET() {
  try {
    const equipments = await prisma.equipment.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(equipments);
  } catch (error) {
    console.error('Failed to fetch equipments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
