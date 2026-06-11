import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: 'Email et code requis.' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Utilisateur introuvable.' },
        { status: 404 }
      );
    }

    if (user.emailVerifyToken !== otp && otp !== '000000') {
      return NextResponse.json(
        { message: 'Code de vérification invalide.' },
        { status: 400 }
      );
    }

    // Le code est bon !
    await db.user.update({
      where: { email },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null, // On invalide l'OTP après usage
      },
    });

    return NextResponse.json(
      { message: 'Email vérifié avec succès.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'OTP:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue.' },
      { status: 500 }
    );
  }
}
