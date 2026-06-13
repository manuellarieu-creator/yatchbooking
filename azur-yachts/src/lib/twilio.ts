import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const twilioNumber = process.env.TWILIO_PHONE_NUMBER || '';

let client: any = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

export async function send2faSms(phone: string, otp: string) {
  if (!client) {
    console.warn('Twilio is not configured. SMS not sent. OTP:', otp);
    return;
  }
  
  if (!phone) {
    throw new Error("Numéro de téléphone manquant pour la 2FA.");
  }

  try {
    await client.messages.create({
      body: `Votre code de sécurité Azur Yachts est : ${otp}. Ne le partagez avec personne.`,
      from: twilioNumber,
      to: phone
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du SMS via Twilio:', error);
    throw new Error("Impossible d'envoyer le SMS de sécurité.");
  }
}
