/**
 * Facebook Event Sync Service
 * 
 * Service de synchronisation des événements Facebook vers la base de données
 * Gère la création/mise à jour des événements avec toutes leurs relations:
 * - Sessions multiples (dates/horaires)
 * - Prix multiples
 * - Lieux multiples
 * - Images multiples
 * - Clubs multiples
 * 
 * @version 2.0
 * @date 2025-12-02
 */

// @ts-nocheck - Temporary: Supabase type inference issues with new schema
import { createServerClient } from '@/lib/supabase/server';
import { extractEventData, type FacebookEventData } from '@/lib/utils/facebook-event-parser';
import { generateUniqueEventSlug } from '@/lib/utils/slug-generator';
import type { Database } from '@/lib/supabase/database.types';

/**
 * Résultat de la synchronisation
 */
interface SyncResult {
  success: boolean;
  eventId?: string;
  error?: string;
  details?: {
    sessionsCreated?: number;
    pricesCreated?: number;
    locationsCreated?: number;
    imagesCreated?: number;
    clubsLinked?: number;
  };
}

/**
 * Trouve un club par son slug
 */
async function findClubBySlug(clubSlug: string): Promise<string | null> {
  const supabase = await createServerClient();
  
  const { data: club } = await supabase
    .from('clubs')
    .select('id')
    .eq('slug', clubSlug)
    .eq('active', true)
    .maybeSingle<{ id: string }>();

  return club?.id || null;
}

/**
 * Construit l'URL Facebook d'un événement
 */
function buildFacebookEventUrl(eventId: string): string {
  return `https://www.facebook.com/events/${eventId}`;
}

/**
 * Crée ou met à jour un événement et toutes ses relations
 */
export async function syncFacebookEvent(
  facebookEventData: FacebookEventData
): Promise<SyncResult> {
  try {
    const supabase = await createServerClient();

    // 1. EXTRACTION ET PARSING
    const extracted = extractEventData(facebookEventData);
    const { parsedTags } = extracted;

    // Vérifier si l'événement doit être publié sur le site
    if (!parsedTags.shouldPublish) {
      console.log('[Facebook Sync] Événement sans balise [SITE], non publié');
      return { 
        success: true, 
        error: 'Événement non marqué pour publication (balise [SITE] manquante)' 
      };
    }

    // 2. DÉTERMINER LE CLUB PRINCIPAL (pour rétrocompatibilité)
    let mainClubId: string | null = null;
    
    if (parsedTags.isAllClubs) {
      // Événement pour tous les clubs
      mainClubId = null;
    } else if (parsedTags.clubSlugs.length > 0) {
      // Prendre le premier club comme club principal
      const firstClubSlug = parsedTags.clubSlugs[0];
      if (firstClubSlug) {
        mainClubId = await findClubBySlug(firstClubSlug);
        
        if (!mainClubId) {
          console.warn(`[Facebook Sync] Club non trouvé: ${firstClubSlug}`);
        }
      }
    }

    // 3. VÉRIFIER SI L'ÉVÉNEMENT EXISTE DÉJÀ
    const facebookEventId = facebookEventData.id;
    const { data: existingEvent } = await supabase
      .from('events')
      .select('id, slug')
      .eq('facebook_event_id', facebookEventId)
      .maybeSingle<{ id: string; slug: string }>();

    // 4. GÉNÉRER LE SLUG
    const slug = await generateUniqueEventSlug(
      extracted.title,
      existingEvent?.slug
    );

    // 5. PRÉPARER LES DONNÉES DE L'ÉVÉNEMENT PRINCIPAL
    // Déterminer le prix principal (pour rétrocompatibilité)
    let mainPriceCents = 0;
    if (parsedTags.prices.length > 0 && parsedTags.prices[0]) {
      // Prendre le premier prix comme prix principal
      mainPriceCents = parsedTags.prices[0].priceCents;
    }

    const eventData: Database['public']['Tables']['events']['Update'] = {
      title: extracted.title,
      slug,
      description: extracted.description,
      event_type: (parsedTags.eventType || 'other') as 'competition' | 'stage' | 'demonstration' | 'seminar' | 'other',
      club_id: mainClubId,
      is_all_clubs: parsedTags.isAllClubs,
      start_date: extracted.startDate,
      end_date: extracted.endDate,
      location: extracted.location,
      max_attendees: parsedTags.maxCapacity,
      cover_image_url: extracted.coverImageUrl,
      price_cents: mainPriceCents,
      facebook_event_id: facebookEventId,
      facebook_url: buildFacebookEventUrl(facebookEventId),
      synced_from_facebook: true,
      facebook_raw_data: facebookEventData as unknown as Record<string, unknown>,
      facebook_synced_at: new Date().toISOString(),
      active: true,
    };

    let eventId: string;

    // 6. CRÉER OU METTRE À JOUR L'ÉVÉNEMENT
    if (existingEvent) {
      // MISE À JOUR
      const updateData = {
        title: eventData.title,
        slug: eventData.slug,
        description: eventData.description,
        event_type: eventData.event_type,
        club_id: eventData.club_id,
        is_all_clubs: eventData.is_all_clubs,
        start_date: eventData.start_date,
        end_date: eventData.end_date,
        location: eventData.location,
        max_attendees: eventData.max_attendees,
        cover_image_url: eventData.cover_image_url,
        price_cents: eventData.price_cents,
        facebook_event_id: eventData.facebook_event_id,
        facebook_url: eventData.facebook_url,
        synced_from_facebook: eventData.synced_from_facebook,
        facebook_raw_data: eventData.facebook_raw_data,
        facebook_synced_at: eventData.facebook_synced_at,
        active: eventData.active,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedEvent, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', existingEvent.id)
        .select('id')
        .single();

      if (error) {
        console.error('[Facebook Sync] Erreur mise à jour événement:', error);
        return { success: false, error: error.message };
      }

      eventId = updatedEvent!.id;
      console.log(`[Facebook Sync] Événement mis à jour: ${eventId}`);
    } else {
      // CRÉATION
      const { data: newEvent, error } = await supabase
        .from('events')
        .insert([eventData])
        .select('id')
        .single();

      if (error) {
        console.error('[Facebook Sync] Erreur création événement:', error);
        return { success: false, error: error.message };
      }

      eventId = newEvent!.id;
      console.log(`[Facebook Sync] Événement créé: ${eventId}`);
    }

    // 7. SYNCHRONISER LES RELATIONS
    const details = {
      sessionsCreated: 0,
      pricesCreated: 0,
      locationsCreated: 0,
      imagesCreated: 0,
      clubsLinked: 0,
    };

    // 7.1 SESSIONS (dates/horaires multiples)
    if (parsedTags.sessions.length > 0) {
      // Supprimer les anciennes sessions
      await supabase
        .from('event_sessions')
        .delete()
        .eq('event_id', eventId);

      // Créer les nouvelles sessions
      const sessionsToInsert = parsedTags.sessions.map((session, index) => ({
        event_id: eventId,
        session_date: session.date,
        start_time: session.startTime || null,
        end_time: session.endTime || null,
        notes: session.notes || null,
        status: 'scheduled' as const,
      }));

      const { data: insertedSessions, error: sessionsError } = await supabase
        .from('event_sessions')
        .insert(sessionsToInsert)
        .select('id');

      if (sessionsError) {
        console.error('[Facebook Sync] Erreur création sessions:', sessionsError);
      } else {
        details.sessionsCreated = insertedSessions?.length || 0;
        console.log(`[Facebook Sync] ${details.sessionsCreated} sessions créées`);
      }
    }

    // 7.2 PRIX (tarifs multiples)
    if (parsedTags.prices.length > 0) {
      // Supprimer les anciens prix
      await supabase
        .from('event_prices')
        .delete()
        .eq('event_id', eventId);

      // Créer les nouveaux prix
      const pricesToInsert = parsedTags.prices.map((price, index) => ({
        event_id: eventId,
        label: price.label,
        price_cents: price.priceCents,
        currency: 'EUR',
        display_order: index,
      }));

      const { data: insertedPrices, error: pricesError } = await supabase
        .from('event_prices')
        .insert(pricesToInsert)
        .select('id');

      if (pricesError) {
        console.error('[Facebook Sync] Erreur création prix:', pricesError);
      } else {
        details.pricesCreated = insertedPrices?.length || 0;
        console.log(`[Facebook Sync] ${details.pricesCreated} prix créés`);
      }
    }

    // 7.3 LIEUX (multiples)
    if (parsedTags.locations.length > 0) {
      // Supprimer les anciens lieux
      await supabase
        .from('event_locations')
        .delete()
        .eq('event_id', eventId);

      // Créer les nouveaux lieux
      const locationsToInsert = parsedTags.locations.map((location, index) => ({
        event_id: eventId,
        name: location.name || location.raw,
        address: location.address || null,
        city: location.city || null,
        country: 'France',
        is_primary: index === 0, // Premier lieu = principal
        display_order: index,
      }));

      const { data: insertedLocations, error: locationsError } = await supabase
        .from('event_locations')
        .insert(locationsToInsert)
        .select('id');

      if (locationsError) {
        console.error('[Facebook Sync] Erreur création lieux:', locationsError);
      } else {
        details.locationsCreated = insertedLocations?.length || 0;
        console.log(`[Facebook Sync] ${details.locationsCreated} lieux créés`);
      }
    }

    // 7.4 IMAGE DE COUVERTURE
    // Si une image de couverture existe, l'ajouter dans event_images
    if (extracted.coverImageUrl) {
      // Vérifier si elle existe déjà
      const { data: existingImage } = await supabase
        .from('event_images')
        .select('id')
        .eq('event_id', eventId)
        .eq('is_cover', true)
        .maybeSingle();

      if (!existingImage) {
        const { error: imageError } = await supabase
          .from('event_images')
          .insert([{
            event_id: eventId,
            image_url: extracted.coverImageUrl,
            title: `Couverture - ${extracted.title}`,
            alt_text: extracted.title,
            is_cover: true,
            display_order: 0,
          }]);

        if (imageError) {
          console.error('[Facebook Sync] Erreur création image couverture:', imageError);
        } else {
          details.imagesCreated = 1;
          console.log('[Facebook Sync] Image de couverture créée');
        }
      }
    }

    // 7.5 CLUBS (relation many-to-many)
    if (parsedTags.clubSlugs.length > 0 && !parsedTags.isAllClubs) {
      // Supprimer les anciennes associations
      await supabase
        .from('event_clubs')
        .delete()
        .eq('event_id', eventId);

      // Récupérer les IDs de tous les clubs
      const clubIds: string[] = [];
      for (const clubSlug of parsedTags.clubSlugs) {
        const clubId = await findClubBySlug(clubSlug);
        if (clubId) {
          clubIds.push(clubId);
        }
      }

      // Créer les nouvelles associations
      if (clubIds.length > 0) {
        const clubsToInsert = clubIds.map(clubId => ({
          event_id: eventId,
          club_id: clubId,
        }));

        const { data: insertedClubs, error: clubsError } = await supabase
          .from('event_clubs')
          .insert(clubsToInsert)
          .select('id');

        if (clubsError) {
          console.error('[Facebook Sync] Erreur liaison clubs:', clubsError);
        } else {
          details.clubsLinked = insertedClubs?.length || 0;
          console.log(`[Facebook Sync] ${details.clubsLinked} clubs liés`);
        }
      }
    }

    // 8. RÉSULTAT FINAL
    console.log('[Facebook Sync] Synchronisation complète:', details);
    return { 
      success: true, 
      eventId,
      details,
    };
  } catch (error) {
    console.error('[Facebook Sync] Erreur inattendue:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Désactive un événement synchronisé depuis Facebook
 */
export async function deactivateFacebookEvent(
  facebookEventId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('events')
      .update({ 
        active: false, 
        updated_at: new Date().toISOString() 
      })
      .eq('facebook_event_id', facebookEventId)
      .eq('synced_from_facebook', true);

    if (error) {
      console.error('[Facebook Sync] Erreur désactivation:', error);
      return { success: false, error: error.message };
    }

    console.log(`[Facebook Sync] Événement désactivé: ${facebookEventId}`);
    return { success: true };
  } catch (error) {
    console.error('[Facebook Sync] Erreur inattendue:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Synchronise plusieurs événements en batch
 */
export async function syncMultipleFacebookEvents(
  events: FacebookEventData[]
): Promise<{
  success: boolean;
  results: SyncResult[];
  successCount: number;
  errorCount: number;
}> {
  const results: SyncResult[] = [];
  let successCount = 0;
  let errorCount = 0;

  for (const event of events) {
    const result = await syncFacebookEvent(event);
    results.push(result);
    
    if (result.success) {
      successCount++;
    } else {
      errorCount++;
    }
  }

  console.log(`[Facebook Sync Batch] ${successCount} succès, ${errorCount} échecs`);

  return {
    success: errorCount === 0,
    results,
    successCount,
    errorCount,
  };
}

