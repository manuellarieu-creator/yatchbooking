import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Exécuter une requête très légère pour maintenir la connexion active
    // et empêcher Supabase de mettre en pause la base de données gratuite.
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      { message: 'Keep-alive réussi. La base de données est active.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors du keep-alive:', error);
    return NextResponse.json(
      { error: 'Échec du keep-alive de la base de données.' },
      { status: 500 }
    );
  }
}
