import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const emailStr = email.toLowerCase().trim();
    const user = await db.user.findUnique({
      where: { email: emailStr }
    });

    if (!user) {
      return NextResponse.json({ error: 'UserNotFound', details: `No user with email ${emailStr}` });
    }

    if (!user.password) {
      return NextResponse.json({ error: 'UserHasNoPassword' });
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordsMatch) {
      return NextResponse.json({ error: 'InvalidPassword', details: 'bcrypt.compare returned false' });
    }

    try {
      const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
      await db.session.create({
        data: {
          sessionToken,
          userId: user.id,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        }
      });
      return NextResponse.json({ success: true, message: 'Login simulation successful!', sessionToken });
    } catch (sessionErr: any) {
      return NextResponse.json({ error: 'SessionCreationError', details: sessionErr.message });
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'CatastrophicError', details: err.message, stack: err.stack });
  }
}
