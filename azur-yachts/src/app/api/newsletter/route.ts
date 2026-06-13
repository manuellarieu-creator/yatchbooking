import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    const existing = await prisma.newsletter.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: 'Déjà inscrit' });
    }

    await prisma.newsletter.create({ data: { email } });

    // Notifier les administrateurs
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          type: 'ACCOUNT_APPROVED',
          title: 'Nouvel abonné Newsletter',
          body: `${email} vient de s'abonner à la newsletter.`,
          userId: admin.id,
          link: '/admin/newsletter'
        }
      });
    }

    return NextResponse.json({ message: 'Inscription réussie' });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
