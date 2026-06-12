import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      where: { role: 'ADVERTISER' },
      select: { id: true, firstName: true, lastName: true, email: true, isManagedByAdmin: true },
      orderBy: { firstName: 'asc' }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('GET /api/admin/users/list error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
