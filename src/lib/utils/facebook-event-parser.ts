/**
 * Facebook Event Parser
 * 
 * Parse les événements Facebook et extrait les informations pertinentes
 * avec support des balises enrichies pour multi-dates, multi-prix, multi-lieux
 * 
 * @version 2.0
 * @date 2025-12-02
 */

// @ts-nocheck - Temporary: Regex match type issues
import {
  DATE_PATTERN,
  TIME_PATTERN,
  SESSION_PATTERN,
  PRICE_PATTERN,
  TARIFF_PATTERN,
  LOCATION_PATTERN,
  ADDRESS_PATTERN,
  CAPACITY_PATTERN,
  getEventTypeFromTag,
  getClubSlugFromTag,
  isAllClubsTag,
  shouldPublishToSite,
  isFreeEvent,
  normalizeDate,
  normalizeTime,
  parsePriceToCents,
  parseLocation,
  extractMaxCapacity,
  type ParsedSession,
  type ParsedPrice,
  type ParsedLocation,
} from '@/lib/config/facebook-tags';

/**
 * Interface pour les données d'un événement Facebook
 */
export interface FacebookEventData {
  id: string;
  name: string;
  description?: string;
  start_time: string;
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
  event_times?: Array<{
    start_time: string;
    end_time?: string;
  }>;
}

/**
 * Résultat du parsing des balises
 */
export interface ParsedTags {
  shouldPublish: boolean;
  eventType: string | null;
  clubSlugs: string[];
  isAllClubs: boolean;
  isFree: boolean;
  maxCapacity: number | null; // null = illimité
  sessions: ParsedSession[];
  prices: ParsedPrice[];
  locations: ParsedLocation[];
  cleanedContent: string;
}

/**
 * Résultat complet du parsing d'un événement Facebook
 */
export interface ExtractedEventData {
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  location: string | null;
  coverImageUrl: string | null;
  parsedTags: ParsedTags;
}

// ============================================
// FONCTIONS D'EXTRACTION
// ============================================

/**
 * Extrait les sessions (dates + horaires) depuis le contenu
 */
function extractSessions(content: string): ParsedSession[] {
  const sessions: ParsedSession[] = [];

  // 1. Chercher les sessions complètes [SESSION:DATE|TIME-TIME]
  const sessionMatches = content.matchAll(SESSION_PATTERN);
  for (const match of sessionMatches) {
    const dateStr = match[1];
    const startTimeStr = match[2];
    const endTimeStr = match[3];

    if (dateStr && startTimeStr) {
      const date = normalizeDate(dateStr);
      const startTime = normalizeTime(startTimeStr);
      const endTime = endTimeStr ? normalizeTime(endTimeStr) : null;

      if (date) {
        sessions.push({
          date,
          startTime: startTime || undefined,
          endTime: endTime || undefined,
        });
      }
    }
  }

  // 2. Si pas de sessions complètes, chercher dates et horaires séparés
  if (sessions.length === 0) {
    const dates: string[] = [];
    const times: { start?: string; end?: string }[] = [];

    // Extraire toutes les dates
    const dateMatches = content.matchAll(DATE_PATTERN);
    for (const match of dateMatches) {
      const normalized = normalizeDate(match[1]);
      if (normalized) {
        dates.push(normalized);
      }
    }

    // Extraire tous les horaires
    const timeMatches = content.matchAll(TIME_PATTERN);
    for (const match of timeMatches) {
      const timeStr = match[1];
      
      // Horaire avec plage (14:00-17:00)
      if (timeStr.includes('-')) {
        const [startStr, endStr] = timeStr.split('-');
        const start = normalizeTime(startStr.trim());
        const end = normalizeTime(endStr.trim());
        times.push({ start: start || undefined, end: end || undefined });
      } else {
        // Horaire simple (14:00)
        const start = normalizeTime(timeStr);
        times.push({ start: start || undefined });
      }
    }

    // Combiner dates et horaires
    // Si nombre égal, on fait une correspondance 1:1
    // Sinon, on applique les mêmes horaires à toutes les dates
    if (dates.length > 0) {
      if (times.length === dates.length) {
        // Correspondance 1:1
        for (let i = 0; i < dates.length; i++) {
          sessions.push({
            date: dates[i],
            startTime: times[i].start,
            endTime: times[i].end,
          });
        }
      } else if (times.length === 1) {
        // Mêmes horaires pour toutes les dates
        for (const date of dates) {
          sessions.push({
            date,
            startTime: times[0].start,
            endTime: times[0].end,
          });
        }
      } else {
        // Pas d'horaires ou mismatch : juste les dates
        for (const date of dates) {
          sessions.push({ date });
        }
      }
    }
  }

  return sessions;
}

/**
 * Extrait les prix depuis le contenu
 */
function extractPrices(content: string, isFree: boolean): ParsedPrice[] {
  const prices: ParsedPrice[] = [];

  // Si événement gratuit, ajouter un prix à 0
  if (isFree) {
    prices.push({
      label: 'Gratuit',
      priceCents: 0,
    });
    return prices;
  }

  // 1. Chercher les tarifs avec label [TARIF:Label|Prix]
  const tariffMatches = content.matchAll(TARIFF_PATTERN);
  for (const match of tariffMatches) {
    const label = match[1].trim();
    const priceStr = match[2];
    const priceCents = parsePriceToCents(priceStr);

    prices.push({ label, priceCents });
  }

  // 2. Chercher les prix simples [PRIX:25€]
  if (prices.length === 0) {
    const priceMatches = content.matchAll(PRICE_PATTERN);
    for (const match of priceMatches) {
      const priceStr = match[1];
      const priceCents = parsePriceToCents(priceStr);

      prices.push({
        label: 'Tarif unique',
        priceCents,
      });
    }
  }

  return prices;
}

/**
 * Extrait les lieux depuis le contenu
 */
function extractLocations(content: string): ParsedLocation[] {
  const locations: ParsedLocation[] = [];

  // Chercher [LIEU:...]
  const locationMatches = content.matchAll(LOCATION_PATTERN);
  for (const match of locationMatches) {
    const locationStr = match[1].trim();
    const parsed = parseLocation(locationStr);
    locations.push(parsed);
  }

  // Chercher aussi [ADRESSE:...] (alias)
  const addressMatches = content.matchAll(ADDRESS_PATTERN);
  for (const match of addressMatches) {
    const locationStr = match[1].trim();
    const parsed = parseLocation(locationStr);
    locations.push(parsed);
  }

  return locations;
}

/**
 * Extrait les clubs depuis les balises
 */
function extractClubs(content: string): {
  clubSlugs: string[];
  isAllClubs: boolean;
} {
  const clubSlugs: string[] = [];
  let isAllClubs = false;

  // Regex pour trouver toutes les balises [XXX]
  const tagRegex = /\[([A-Z\sÀ-ÿ]+)\]/gi;
  const matches = content.matchAll(tagRegex);

  for (const match of matches) {
    const tag = `[${match[1].toUpperCase().trim()}]`;

    // Vérifier si c'est une balise "tous les clubs"
    if (isAllClubsTag(tag)) {
      isAllClubs = true;
      continue;
    }

    // Vérifier si c'est un club spécifique
    const clubSlug = getClubSlugFromTag(tag);
    if (clubSlug && !clubSlugs.includes(clubSlug)) {
      clubSlugs.push(clubSlug);
    }
  }

  return { clubSlugs, isAllClubs };
}

/**
 * Extrait le type d'événement depuis les balises
 */
function extractEventType(content: string): string | null {
  const tagRegex = /\[([A-Z\sÀ-ÿ]+)\]/gi;
  const matches = content.matchAll(tagRegex);

  for (const match of matches) {
    const tag = `[${match[1].toUpperCase().trim()}]`;
    const eventType = getEventTypeFromTag(tag);
    if (eventType) {
      return eventType;
    }
  }

  return null;
}

/**
 * Nettoie le contenu en supprimant toutes les balises
 */
function cleanContent(content: string): string {
  return content
    .replace(/\[SITE\]/gi, '')
    .replace(/\[GRATUIT\]/gi, '')
    .replace(/\[FREE\]/gi, '')
    .replace(/\[ILLIMITE\]/gi, '')
    .replace(/\[ILLIMITÉ\]/gi, '')
    .replace(/\[UNLIMITED\]/gi, '')
    .replace(SESSION_PATTERN, '')
    .replace(DATE_PATTERN, '')
    .replace(TIME_PATTERN, '')
    .replace(TARIFF_PATTERN, '')
    .replace(PRICE_PATTERN, '')
    .replace(LOCATION_PATTERN, '')
    .replace(ADDRESS_PATTERN, '')
    .replace(CAPACITY_PATTERN, '')
    .replace(/\[[A-Z\sÀ-ÿ]+\]/gi, '') // Autres balises
    .trim()
    .replace(/\s+/g, ' ') // Normaliser les espaces
    .replace(/\n{3,}/g, '\n\n'); // Max 2 sauts de ligne
}

// ============================================
// FONCTION PRINCIPALE
// ============================================

/**
 * Parse les balises et extrait toutes les informations d'un événement
 * 
 * @param content - Le contenu à parser (titre + description)
 * @returns Les balises extraites et parsées
 */
export function parseEventTags(content: string): ParsedTags {
  const shouldPublish = shouldPublishToSite(content);
  const eventType = extractEventType(content);
  const { clubSlugs, isAllClubs } = extractClubs(content);
  const isFree = isFreeEvent(content);
  const maxCapacity = extractMaxCapacity(content);
  const sessions = extractSessions(content);
  const prices = extractPrices(content, isFree);
  const locations = extractLocations(content);
  const cleanedContent = cleanContent(content);

  return {
    shouldPublish,
    eventType,
    clubSlugs,
    isAllClubs,
    isFree,
    maxCapacity,
    sessions,
    prices,
    locations,
    cleanedContent,
  };
}

/**
 * Extrait les données complètes d'un événement Facebook
 * 
 * @param facebookEvent - Les données brutes de l'événement Facebook
 * @returns Les données parsées pour la base de données
 */
export function extractEventData(facebookEvent: FacebookEventData): ExtractedEventData {
  // Construire le contenu complet pour le parsing
  const titleContent = facebookEvent.name || '';
  const descriptionContent = facebookEvent.description || '';
  const fullContent = `${titleContent}\n${descriptionContent}`;

  // Parser toutes les balises
  const parsedTags = parseEventTags(fullContent);

  // Nettoyer le titre (supprimer les balises)
  let title = parsedTags.cleanedContent.split('\n')[0] || titleContent.trim();
  
  // Si le titre nettoyé est vide, utiliser le titre original
  if (!title || title.length < 3) {
    title = titleContent.replace(/\[[^\]]+\]/g, '').trim();
  }
  
  if (!title) {
    title = 'Événement sans titre';
  }

  // Nettoyer la description
  const descriptionLines = parsedTags.cleanedContent.split('\n').slice(1);
  const description = descriptionLines.join('\n').trim() || descriptionContent.trim() || null;

  // Extraire les dates
  const startDate = facebookEvent.start_time;
  const endDate = facebookEvent.end_time || null;

  // Extraire le lieu depuis Facebook (fallback si pas de balise [LIEU:])
  let location: string | null = null;
  if (parsedTags.locations.length > 0) {
    // Utiliser le premier lieu extrait des balises
    location = parsedTags.locations[0].raw;
  } else if (facebookEvent.place) {
    // Fallback: utiliser le lieu Facebook
    const placeParts: string[] = [];
    if (facebookEvent.place.name) {
      placeParts.push(facebookEvent.place.name);
    }
    if (facebookEvent.place.location) {
      const loc = facebookEvent.place.location;
      if (loc.street) placeParts.push(loc.street);
      if (loc.city) placeParts.push(loc.city);
      if (loc.zip) placeParts.push(loc.zip);
    }
    location = placeParts.length > 0 ? placeParts.join(', ') : null;
  }

  // Extraire l'image de couverture
  const coverImageUrl = facebookEvent.cover?.source || null;

  return {
    title,
    description,
    startDate,
    endDate,
    location,
    coverImageUrl,
    parsedTags,
  };
}

