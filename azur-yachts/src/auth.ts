import NextAuth, { CredentialsSignin } from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { send2faEmail } from '@/lib/resend';
import crypto from 'crypto';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  trustHost: true,
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  events: {
    async signOut(message: any) {
      if (message?.token?.sessionToken) {
        try {
          await db.session.deleteMany({
            where: { sessionToken: message.token.sessionToken as string }
          });
          console.log("Session cleared from DB on logout");
        } catch (error) {
          console.error("Error clearing session on logout:", error);
        }
      }
    }
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        otp: { label: 'OTP', type: 'text' }
      },
      async authorize(credentials) {
        try {
          console.log("Authorize called for:", credentials?.email);
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            return null;
          }

          const emailStr = (credentials.email as string).toLowerCase().trim();
          const user = await db.user.findUnique({
            where: { email: emailStr }
          });

          if (!user) {
            class UserNotFoundError extends CredentialsSignin { code = "UserNotFound"; }
            throw new UserNotFoundError();
          }
          if (!user.password) {
            class NoPasswordError extends CredentialsSignin { code = "UserHasNoPassword"; }
            throw new NoPasswordError();
          }

          const passwordsMatch = await bcrypt.compare(
            credentials.password as string,
            user.password
          );
          
          if (!passwordsMatch) {
            class InvalidPasswordError extends CredentialsSignin { code = "InvalidPassword"; }
            throw new InvalidPasswordError();
          }

          if (passwordsMatch) {
          // Check 2FA
          if (user.twoFactorEmailEnabled && !credentials.otp) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            await db.user.update({
              where: { id: user.id },
              data: { twoFactorSecret: otp }
            });
            
            await send2faEmail(user.email, user.firstName, otp);
            
            throw new Error('2FA_REQUIRED');
          }

          if (credentials.otp) {
            if (user.twoFactorSecret !== credentials.otp) {
               throw new Error('OTP_INVALID');
            }
            await db.user.update({ where: { id: user.id }, data: { twoFactorSecret: null } });
          }

          // Generate a custom session token for DB tracking
          const sessionToken = crypto.randomUUID();
          
          try {
            // Create a session in DB to track active logins
            await db.session.create({
              data: {
                sessionToken,
                userId: user.id,
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              }
            });
            console.log("Session created successfully in DB");
          } catch (sessionErr) {
            console.error("Error creating session in DB:", sessionErr);
            throw sessionErr;
          }

          // On retourne l'utilisateur sans le mot de passe, avec son nouveau sessionToken
          const { password, ...userWithoutPassword } = user;
          return { ...userWithoutPassword, sessionToken };
        }
        
        return null;
      } catch (err: any) {
        console.error("Authorize catastrophic error:", err);
        class CustomAuthError extends CredentialsSignin {
          code = err.message || "Unknown error";
        }
        throw new CustomAuthError();
      }
      }
    })
  ]
});
