import webpush from 'web-push';
import { db } from '@/lib/db';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const subject = process.env.NEXT_PUBLIC_APP_URL ? `mailto:contact@${new URL(process.env.NEXT_PUBLIC_APP_URL).hostname}` : 'mailto:contact@voyyacht.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    subject,
    vapidPublicKey,
    vapidPrivateKey
  );
}

export async function sendPushNotification(userId: string, title: string, body: string, url: string = '/') {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('VAPID keys not configured, push notification not sent.');
    return;
  }

  try {
    const subscriptions = await db.pushSubscription.findMany({
      where: { userId }
    });

    const payload = JSON.stringify({ title, body, url });

    const promises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              auth: sub.auth,
              p256dh: sub.p256dh
            }
          },
          payload
        );
      } catch (error: any) {
        if (error.statusCode === 410 || error.statusCode === 404) {
          // Subscription has expired or is no longer valid
          await db.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          console.error('Error sending push notification to subscription', sub.id, error);
        }
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
  }
}
