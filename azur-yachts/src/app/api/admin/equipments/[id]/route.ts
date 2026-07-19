import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;

    await prisma.equipment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete equipment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
