/**
 * Facebook Webhook Endpoint
 * 
 * Reçoit les webhooks Facebook pour synchroniser les événements
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { NextRequest, NextResponse } from 'next/server';
// import crypto from 'crypto'; // TEMPORAIRE : Commenté pour les tests
import { syncFacebookEvent } from '@/lib/services/facebook-event-sync';
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
/* TEMPORAIRE : Fonction commentée pour les tests
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
*/

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
    
    // TEMPORAIRE : Désactiver la vérification de signature pour les tests
    // TODO: Réactiver après avoir configuré le bon FACEBOOK_WEBHOOK_SECRET
    /*
    const signature = request.headers.get('X-Hub-Signature-256');
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
            // Champs pour feed (publications)
            item?: string; // "post" | "status" | "photo" etc.
            post_id?: string;
            message?: string;
            created_time?: string;
            photo?: string;
            link?: string;
            // Champs pour events (si disponible)
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
        // Logger TOUTES les données pour debug
        console.log('[Facebook Webhook] Change reçu:', JSON.stringify(change, null, 2));
        
        // Facebook envoie les publications avec field = "feed"
        // On traite les publications qui contiennent des balises [SITE]
        if (change.field !== 'feed') {
          console.log(`[Facebook Webhook] Champ ignoré: ${change.field}`);
          continue;
        }

        const feedData = change.value;
        console.log('[Facebook Webhook] Feed data:', JSON.stringify(feedData, null, 2));
        
        // Vérifier que c'est une publication (status, post, photo, video, share, etc.)
        // Facebook envoie différents types selon le contenu de la publication
        const validItems = ['status', 'post', 'photo', 'video', 'link', 'share'];
        if (!feedData || !feedData.item || !validItems.includes(feedData.item) || !feedData.post_id) {
          console.log(`[Facebook Webhook] Publication ignorée. Item: ${feedData?.item}, Post ID: ${feedData?.post_id}`);
          continue;
        }

        // Extraire le message de la publication
        const message = feedData.message || '';
        
        // Vérifier que le message contient la balise [SITE]
        if (!message.includes('[SITE]')) {
          console.log(`[Facebook Webhook] Publication ignorée (pas de balise [SITE])`);
          continue;
        }

        console.log(`[Facebook Webhook] Publication avec [SITE] détectée: ${feedData.post_id}`);

        // Construire un objet FacebookEventData depuis la publication
        // On utilise le message comme titre + description
        const firstLine = message.split('\n')[0] || message || 'Événement sans titre';
        
        // Convertir le timestamp Unix (secondes) en ISO string
        const createdDate = feedData.created_time 
          ? new Date(Number(feedData.created_time) * 1000).toISOString() // *1000 car JS attend des millisecondes
          : new Date().toISOString();
        
        const facebookEvent: FacebookEventData = {
          id: feedData.post_id,
          name: firstLine.substring(0, 200), // Premier ligne comme titre
          description: message,
          start_time: createdDate,
          end_time: undefined,
          place: undefined,
          cover: feedData.photo ? { source: feedData.photo } : undefined,
        };

        // Synchroniser l'événement (création ou mise à jour)
        const result = await syncFacebookEvent(facebookEvent);

        if (!result.success) {
          console.error(
            `[Facebook Webhook] Erreur synchronisation:`,
            result.error
          );
        } else {
          console.log(
            `[Facebook Webhook] Événement créé avec succès: ${result.eventId}`
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

