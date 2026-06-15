import { db } from '@/lib/db';

// ── MAPPING : NotificationType → clé de préférence utilisateur ──
// Les types absents de ce mapping ne sont pas configurables par l'utilisateur
// et seront toujours envoyés (emails transactionnels, sécurité, décisions admin).
const TYPE_TO_PREF_KEY: Record<string, string> = {
  BOOKING_NEW: 'resa',
  BOOKING_CONFIRMED: 'resa',
  BOOKING_REJECTED: 'resa',
  PAYMENT_RECEIVED: 'paiement',
  NEW_MESSAGE: 'msg',
};

/**
 * Vérifie si un utilisateur accepte un canal donné pour un type de notification.
 * 
 * Logique opt-out :
 * - Si le type n'est pas dans le mapping → toujours notifier (transactionnel)
 * - Si l'utilisateur n'a pas de préférences → toujours notifier (défaut)
 * - Si la clé de préférence n'existe pas → toujours notifier (défaut)
 * - Seul un `false` explicite bloque l'envoi
 * 
 * @param userId - ID de l'utilisateur cible
 * @param notificationType - Type de notification (ex: 'BOOKING_NEW', 'NEW_MESSAGE')
 * @param channel - Canal de communication ('email' | 'push' | 'sms')
 * @returns true si l'envoi est autorisé, false sinon
 */
export async function shouldNotify(
  userId: string,
  notificationType: string,
  channel: 'email' | 'push'
): Promise<boolean> {
  const prefKey = TYPE_TO_PREF_KEY[notificationType];
  if (!prefKey) return true; // Type non configurable → toujours notifier

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { notificationPreferences: true }
    });

    const prefs = user?.notificationPreferences as Record<string, Record<string, boolean>> | null;
    if (!prefs || !prefs[prefKey]) return true; // Pas de préférences → défaut = notifier

    return prefs[prefKey][channel] !== false; // opt-out : seul false explicite bloque
  } catch (error) {
    console.error(`shouldNotify error for user ${userId}:`, error);
    return true; // En cas d'erreur, on envoie quand même (fail-open)
  }
}
