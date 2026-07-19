import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    hasAuthSecret: !!process.env.AUTH_SECRET, 
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET 
  });
}
