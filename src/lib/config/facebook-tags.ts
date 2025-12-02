/**
 * Facebook Tags Configuration
 * 
 * Mapping des balises Facebook vers les valeurs de la base de données
 * Permet la synchronisation automatique des événements Facebook vers le site
 * 
 * @version 2.0
 * @date 2025-12-02
 */

// ============================================
// BALISES STRUCTURELLES
// ============================================

/**
 * Balise pour indiquer qu'un événement doit être publié sur le site
 */
export const SITE_TAG = '[SITE]';

/**
 * Mapping des balises de type d'événement vers les valeurs DB
 */
export const EVENT_TYPE_TAGS = {
  '[STAGE]': 'stage',
  '[SEMINAIRE]': 'seminar',
  '[SEMINAR]': 'seminar',
  '[COMPETITION]': 'competition',
  '[DEMONSTRATION]': 'demonstration',
  '[DEMO]': 'demonstration',
} as const;

/**
 * Mapping des balises de club vers les slugs de club
 * 
 * Clubs réels Phuong Long Vo Dao:
 * - Cublize
 * - Lanester
 * - Montaigut Sur Save
 * - Trégueux
 * - Wimille
 */
export const CLUB_TAGS = {
  '[CUBLIZE]': 'cublize',
  '[LANESTER]': 'lanester',
  '[MONTAIGUT]': 'montaigut-sur-save',
  '[MONTAIGUTSURSAVE]': 'montaigut-sur-save', // Variante sans espaces
  '[TREGUEUX]': 'tregueux',
  '[TRÉGUEUX]': 'tregueux', // Avec accent
  '[WIMILLE]': 'wimille',
} as const;

/**
 * Balises indiquant que l'événement concerne tous les clubs
 */
export const ALL_CLUBS_TAGS = ['[TOUS]', '[ALL]', '[TOUS LES CLUBS]'] as const;

// ============================================
// BALISES PRIX
// ============================================

/**
 * Balise pour événement gratuit
 */
export const FREE_TAG = '[GRATUIT]';
export const FREE_TAG_EN = '[FREE]';

// ============================================
// REGEX PATTERNS
// ============================================

/**
 * Pattern pour extraire les dates
 * Formats acceptés:
 * - [DATE:2025-12-15]
 * - [DATE:15/12/2025]
 * - [DATE:15-12-2025]
 */
export const DATE_PATTERN = /\[DATE:(\d{4}-\d{2}-\d{2}|\d{2}[/-]\d{2}[/-]\d{4})\]/gi;

/**
 * Pattern pour extraire les horaires
 * Formats acceptés:
 * - [HORAIRE:14:00-17:00]
 * - [HORAIRE:14h00-17h00]
 * - [HORAIRE:14:00]
 */
export const TIME_PATTERN = /\[HORAIRE:(\d{1,2}[h:]?\d{2}(?:-\d{1,2}[h:]?\d{2})?)\]/gi;

/**
 * Pattern pour extraire les sessions complètes (date + horaire)
 * Format: [SESSION:2025-12-15|14:00-17:00]
 */
export const SESSION_PATTERN = /\[SESSION:(\d{4}-\d{2}-\d{2}|\d{2}[/-]\d{2}[/-]\d{4})\|(\d{1,2}[h:]?\d{2})-(\d{1,2}[h:]?\d{2})\]/gi;

/**
 * Pattern pour extraire les prix simples
 * Formats acceptés:
 * - [PRIX:25€]
 * - [PRIX:25]
 * - [PRIX:25 EUR]
 */
export const PRICE_PATTERN = /\[PRIX:(\d+(?:[.,]\d{2})?)\s*(?:€|EUR)?\]/gi;

/**
 * Pattern pour extraire les tarifs avec label
 * Format: [TARIF:Adulte|25€]
 */
export const TARIFF_PATTERN = /\[TARIF:([^|]+)\|(\d+(?:[.,]\d{2})?)\s*(?:€|EUR)?\]/gi;

/**
 * Pattern pour extraire les lieux
 * Format: [LIEU:Dojo Municipal, 123 Rue de Paris, Lyon]
 */
export const LOCATION_PATTERN = /\[LIEU:([^\]]+)\]/gi;

/**
 * Pattern pour extraire les adresses (alias de LIEU)
 * Format: [ADRESSE:...]
 */
export const ADDRESS_PATTERN = /\[ADRESSE:([^\]]+)\]/gi;

/**
 * Pattern pour extraire la capacité maximale
 * Formats acceptés:
 * - [CAPACITE:50]
 * - [CAPACITÉ:50]
 * - [PLACES:50]
 * - [ILLIMITE] ou [ILLIMITÉ]
 */
export const CAPACITY_PATTERN = /\[(?:CAPACITE|CAPACITÉ|PLACES):(\d+)\]/gi;

/**
 * Balises indiquant une capacité illimitée
 */
export const UNLIMITED_CAPACITY_TAGS = ['[ILLIMITE]', '[ILLIMITÉ]', '[UNLIMITED]'] as const;

// ============================================
// TYPES TYPESCRIPT
// ============================================

export type EventTypeTag = keyof typeof EVENT_TYPE_TAGS;
export type ClubTag = keyof typeof CLUB_TAGS;
export type AllClubsTag = typeof ALL_CLUBS_TAGS[number];

/**
 * Type pour une session extraite
 */
export interface ParsedSession {
  date: string; // Format ISO: YYYY-MM-DD
  startTime?: string; // Format: HH:MM
  endTime?: string; // Format: HH:MM
  notes?: string;
}

/**
 * Type pour un tarif extrait
 */
export interface ParsedPrice {
  label: string;
  priceCents: number;
}

/**
 * Type pour un lieu extrait
 */
export interface ParsedLocation {
  raw: string; // Texte brut
  name?: string;
  address?: string;
  city?: string;
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Vérifie si le contenu contient la balise [SITE]
 */
export function shouldPublishToSite(content: string): boolean {
  return content.toUpperCase().includes(SITE_TAG);
}

/**
 * Récupère le type d'événement depuis une balise
 */
export function getEventTypeFromTag(tag: string): string | null {
  const normalizedTag = tag.toUpperCase() as EventTypeTag;
  return EVENT_TYPE_TAGS[normalizedTag] || null;
}

/**
 * Récupère le slug du club depuis une balise
 */
export function getClubSlugFromTag(tag: string): string | null {
  const normalizedTag = tag.toUpperCase() as ClubTag;
  return CLUB_TAGS[normalizedTag] || null;
}

/**
 * Vérifie si une balise indique tous les clubs
 */
export function isAllClubsTag(tag: string): boolean {
  return ALL_CLUBS_TAGS.includes(tag.toUpperCase() as AllClubsTag);
}

/**
 * Vérifie si l'événement est gratuit
 */
export function isFreeEvent(content: string): boolean {
  const upper = content.toUpperCase();
  return upper.includes(FREE_TAG) || upper.includes(FREE_TAG_EN);
}

/**
 * Normalise une date au format ISO (YYYY-MM-DD)
 */
export function normalizeDate(dateStr: string): string | null {
  // Déjà au format ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Format DD/MM/YYYY ou DD-MM-YYYY
  const match = dateStr.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  }

  return null;
}

/**
 * Normalise un horaire au format HH:MM
 */
export function normalizeTime(timeStr: string): string | null {
  // Format HH:MM déjà bon
  if (/^\d{2}:\d{2}$/.test(timeStr)) {
    return timeStr;
  }

  // Format HHhMM ou HH:MM
  const match = timeStr.match(/^(\d{1,2})[h:](\d{2})$/);
  if (match && match[1] && match[2]) {
    const hours = match[1];
    const minutes = match[2];
    return `${hours.padStart(2, '0')}:${minutes}`;
  }

  return null;
}

/**
 * Parse un montant en centimes
 * @param priceStr - Prix au format "25", "25.50", "25,50"
 * @returns Prix en centimes
 */
export function parsePriceToCents(priceStr: string): number {
  const normalized = priceStr.replace(',', '.');
  const amount = parseFloat(normalized);
  return Math.round(amount * 100);
}

/**
 * Parse un lieu en composants
 * Format attendu: "Nom du lieu, Adresse, Ville"
 */
export function parseLocation(locationStr: string): ParsedLocation {
  const parts = locationStr.split(',').map(p => p.trim());
  
  return {
    raw: locationStr,
    name: parts[0] || undefined,
    address: parts[1] || undefined,
    city: parts[2] || undefined,
  };
}

/**
 * Vérifie si l'événement a une capacité illimitée
 */
export function isUnlimitedCapacity(content: string): boolean {
  const upper = content.toUpperCase();
  return UNLIMITED_CAPACITY_TAGS.some(tag => upper.includes(tag));
}

/**
 * Extrait la capacité maximale depuis le contenu
 * @returns Nombre de places max, ou null si illimité/non spécifié
 */
export function extractMaxCapacity(content: string): number | null {
  // Vérifier d'abord si c'est illimité
  if (isUnlimitedCapacity(content)) {
    return null;
  }

  // Chercher une capacité spécifiée
  const match = CAPACITY_PATTERN.exec(content);
  if (match && match[1]) {
    const capacity = parseInt(match[1], 10);
    return !isNaN(capacity) && capacity > 0 ? capacity : null;
  }

  return null;
}

