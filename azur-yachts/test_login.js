const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function authorize(credentials) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email }
    });

    if (!user || !user.password) {
      console.log('No user or password');
      return null;
    }

    const passwordsMatch = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (passwordsMatch) {
      if (user.twoFactorEmailEnabled && !credentials.otp) {
         console.log('2FA_REQUIRED');
         return;
      }
      const sessionToken = crypto.randomUUID();
      
      const sess = await prisma.session.create({
        data: {
          sessionToken,
          userId: user.id,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
        }
      });
      console.log('Session created', sess.id);
      
      const { password, ...userWithoutPassword } = user;
      return { ...userWithoutPassword, sessionToken };
    }
    
    console.log('Password mismatch');
    return null;
  } catch (err) {
    console.error('Authorize error', err);
    throw err;
  }
}

async function main() {
  console.log('Testing Admin login');
  const adminRes = await authorize({ email: 'heroelijha@gmail.com', password: 'eLITe213@@??' });
  console.log('Admin res:', adminRes ? 'Success' : 'Failed');
  await prisma.$disconnect();
}
main();
