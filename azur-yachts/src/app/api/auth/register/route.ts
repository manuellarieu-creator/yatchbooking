import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '@/lib/resend';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password, role } = await req.json();

    // Validation basique
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: 'Tous les champs sont requis.' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Un utilisateur avec cet email existe déjà.' },
        { status: 409 }
      );
    }

    // Vérifier si l'email est blacklisté
    const blacklisted = await db.blacklist.findUnique({
      where: { email }
    });

    if (blacklisted) {
      return NextResponse.json(
        { message: 'Cet email ne peut pas être utilisé pour créer un compte.' },
        { status: 403 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    const isAdvertiser = role === 'ADVERTISER';
    const token = isAdvertiser ? Math.floor(100000 + Math.random() * 900000).toString() : crypto.randomUUID();

    // Créer le nouvel utilisateur
    const newUser = await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: isAdvertiser ? 'ADVERTISER' : 'CLIENT',
        status: isAdvertiser ? 'PENDING' : 'ACTIVE',
        isEmailVerified: false, // On force la vérification pour tout le monde
        emailVerifyToken: token,
      },
    });

    if (isAdvertiser) {
      await sendOtpEmail(email, firstName, token);
    } else {
      const { emailVerification } = await import('@/lib/email');
      await emailVerification(email, firstName, token);
    }

    return NextResponse.json(
      { message: 'Utilisateur créé avec succès', user: { id: newUser.id, email: newUser.email, role: newUser.role } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de la création du compte:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la création du compte.' },
      { status: 500 }
    );
  }
}
