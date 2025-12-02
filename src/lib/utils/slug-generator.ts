/**
 * Slug Generator Utility
 * 
 * Génération de slugs uniques pour les événements avec gestion des doublons
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { createServerClient } from '@/lib/supabase/server';

/**
 * Génère un slug à partir d'un titre
 * 
 * @param title - Le titre à convertir en slug
 * @returns Le slug généré
 */
export function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD') // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Garde seulement lettres, chiffres, espaces et tirets
    .replace(/\s+/g, '-') // Remplace espaces par tirets
    .replace(/-+/g, '-') // Remplace tirets multiples par un seul
    .replace(/^-|-$/g, ''); // Supprime tirets en début/fin
}

/**
 * Génère un slug unique pour un événement en vérifiant l'unicité dans la DB
 * 
 * @param title - Le titre de l'événement
 * @param existingSlug - Slug existant à ignorer (pour les mises à jour)
 * @returns Le slug unique
 */
export async function generateUniqueEventSlug(
  title: string,
  existingSlug?: string
): Promise<string> {
  const baseSlug = generateSlugFromTitle(title);
  
  if (!baseSlug) {
    // Fallback si le slug est vide
    const timestamp = Date.now();
    return `evenement-${timestamp}`;
  }

  const supabase = await createServerClient();
  
  // Vérifier si le slug de base existe déjà
  const { data: existingEvent } = await supabase
    .from('events')
    .select('slug')
    .eq('slug', baseSlug)
    .maybeSingle<{ slug: string }>();

  // Si le slug existe et que ce n'est pas l'événement qu'on met à jour
  if (existingEvent && existingEvent.slug !== existingSlug) {
    // Ajouter un suffixe numérique
    let counter = 1;
    let uniqueSlug = `${baseSlug}-${counter}`;
    
    while (true) {
      const { data: checkEvent } = await supabase
        .from('events')
        .select('slug')
        .eq('slug', uniqueSlug)
        .maybeSingle<{ slug: string }>();
      
      if (!checkEvent || checkEvent.slug === existingSlug) {
        break;
      }
      
      counter++;
      uniqueSlug = `${baseSlug}-${counter}`;
    }
    
    return uniqueSlug;
  }

  return baseSlug;
}

