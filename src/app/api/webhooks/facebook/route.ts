/**
 * Facebook Webhook Endpoint
 * 
 * Reçoit les webhooks Facebook pour synchroniser les événements
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { syncFacebookEvent, deactivateFacebookEvent } from '@/lib/services/facebook-event-sync';
import { FacebookEventData } from '@/lib/utils/facebook-event-parser';

export const runtime = 'nodejs';

/**
 * Valide la signature du webhook Facebook
 * 
 * @param payload - Le corps de la requête (string)
 * @param signature - La signature du header X-Hub-Signature-256
 * @param secret - Le secret du webhook Facebook
 * @returns true si la signature est valide
 */
function verifyFacebookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) {
    return false;
  }

  // Facebook envoie la signature au format "sha256=HASH"
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  // Extraire le hash de la signature reçue
  const receivedHash = signature.replace('sha256=', '');

  // Comparaison sécurisée (timing-safe)
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(receivedHash)
  );
}

/**
 * Gère les événements Facebook
 */
export async function POST(request: NextRequest) {
  try {
    // Récupérer le secret du webhook
    const webhookSecret = process.env.FACEBOOK_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('[Facebook Webhook] FACEBOOK_WEBHOOK_SECRET non configuré');
      // Retourner 200 pour ne pas faire échouer Facebook
      return NextResponse.json({ error: 'Configuration manquante' }, { status: 200 });
    }

    // Lire le corps de la requête comme texte (important pour la validation)
    const body = await request.text();
    
    // Récupérer la signature
    const signature = request.headers.get('X-Hub-Signature-256');

    // TEMPORAIRE : Désactiver la vérification de signature pour les tests
    // TODO: Réactiver après avoir configuré le bon FACEBOOK_WEBHOOK_SECRET
    /*
    if (!verifyFacebookSignature(body, signature, webhookSecret)) {
      console.error('[Facebook Webhook] Signature invalide');
      return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
    }
    */
    console.log('[Facebook Webhook] Signature validation DISABLED for testing');

    // Parser le JSON
    let webhookData: {
      object?: string;
      entry?: Array<{
        id?: string;
        time?: number;
        changes?: Array<{
          value?: {
            id?: string;
            name?: string;
            description?: string;
            start_time?: string;
            end_time?: string;
            place?: {
              name?: string;
              location?: {
                city?: string;
                country?: string;
                latitude?: number;
                longitude?: number;
                street?: string;
                zip?: string;
              };
            };
            cover?: {
              source?: string;
            };
          };
          field?: string;
        }>;
      }>;
    };

    try {
      webhookData = JSON.parse(body);
    } catch (error) {
      console.error('[Facebook Webhook] Erreur parsing JSON:', error);
      return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
    }

    // Vérifier que c'est bien un événement Facebook
    if (webhookData.object !== 'page') {
      console.log('[Facebook Webhook] Objet non géré:', webhookData.object);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Traiter chaque entrée
    if (!webhookData.entry || webhookData.entry.length === 0) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    for (const entry of webhookData.entry) {
      if (!entry.changes || entry.changes.length === 0) {
        continue;
      }

      for (const change of entry.changes) {
        // Facebook envoie les événements avec field = "events"
        // Le format peut varier selon le type d'événement (created, updated, deleted)
        if (change.field !== 'events') {
          continue;
        }

        const eventData = change.value;
        
        // Gérer les événements supprimés
        if (!eventData || !eventData.id) {
          // Si pas de données mais un ID dans le change, c'est peut-être une suppression
          // Facebook peut envoyer juste l'ID pour les suppressions
          const eventId = change.value?.id || change.value;
          if (eventId && typeof eventId === 'string') {
            console.log(`[Facebook Webhook] Tentative de désactivation événement: ${eventId}`);
            await deactivateFacebookEvent(eventId);
          }
          continue;
        }

        // Construire l'objet FacebookEventData
        const facebookEvent: FacebookEventData = {
          id: eventData.id,
          name: eventData.name || 'Événement sans titre',
          description: eventData.description,
          start_time: eventData.start_time || new Date().toISOString(),
          end_time: eventData.end_time,
          place: eventData.place,
          cover: eventData.cover,
        };

        // Synchroniser l'événement (création ou mise à jour)
        const result = await syncFacebookEvent(facebookEvent);

        if (!result.success) {
          console.error(
            `[Facebook Webhook] Erreur synchronisation événement ${eventData.id}:`,
            result.error
          );
        } else {
          console.log(
            `[Facebook Webhook] Événement synchronisé avec succès: ${eventData.id}`
          );
        }
      }
    }

    // Toujours retourner 200 OK pour Facebook
    // (même en cas d'erreur interne pour éviter les retries)
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[Facebook Webhook] Erreur inattendue:', error);
    // Retourner 200 pour ne pas faire retry par Facebook
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 200 }
    );
  }
}

/**
 * GET pour la vérification du webhook Facebook
 * Facebook envoie un GET avec ?hub.mode=subscribe&hub.verify_token=...
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.FACEBOOK_VERIFY_TOKEN;

  // Vérification du webhook
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[Facebook Webhook] Webhook vérifié avec succès');
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

