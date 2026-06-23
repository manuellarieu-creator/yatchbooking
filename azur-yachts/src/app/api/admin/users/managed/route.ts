import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { auth } from '@/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    // Check if user is logged in and is an ADMIN
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json()
    const { firstName, lastName, email, phone, languages, countryResidence, advertiserTier, avatar } = body

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'Le prénom et le nom sont requis' }, { status: 400 })
    }

    // Si pas d'email fourni, générer un email factice pour que Prisma ne plante pas sur @unique
    const safeEmail = email || `managed-${Date.now()}@voyyacht-managed.com`

    // Vérifier si l'email existe déjà (si fourni)
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      
      if (existingUser) {
        return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 })
      }
    }

    // Generate a random password for managed accounts since they don't log in
    const randomPassword = Math.random().toString(36).slice(-10)
    const hashedPassword = await bcrypt.hash(randomPassword, 10)

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: safeEmail,
        phone: phone || null,
        languages: languages || [],
        countryResidence: countryResidence || null,
        advertiserTier: advertiserTier || 'STANDARD',
        avatar: avatar || null,
        password: hashedPassword,
        role: 'ADVERTISER', // Un profil géré est toujours un annonceur
        status: 'ACTIVE', // On l'active directement
        isManagedByAdmin: true,
        isEmailVerified: true // Pas besoin de vérifier un faux email
      }
    })

    // Return the new user without password
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({ user: userWithoutPassword }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/users/managed error:', error)
    return NextResponse.json({ error: 'Erreur serveur interne' }, { status: 500 })
  }
}
