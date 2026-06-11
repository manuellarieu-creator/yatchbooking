import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');

  if (key !== 'azur123') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const email = 'heroelijha@gmail.com';
    const passwordHash = await bcrypt.hash('eLITe213@@??', 10);
    
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (user) {
      user = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN', password: passwordHash, status: 'ACTIVE' },
      });
      return NextResponse.json({ success: true, message: `Utilisateur mis à jour : ${user.email} -> ADMIN` });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          password: passwordHash,
          firstName: 'Elijha',
          lastName: 'Hero',
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      });
      return NextResponse.json({ success: true, message: `Nouvel utilisateur créé : ${user.email} -> ADMIN` });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
