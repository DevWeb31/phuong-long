/**
 * Public Developer Settings API Route
 * 
 * Route publique pour vérifier certains paramètres développeur
 * (sans authentification, pour le middleware et les pages publiques)
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { NextResponse } from 'next/server';
import { getPublicSupabaseClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// GET - Get public developer settings (read-only)
export async function GET() {
  try {
    const supabase = getPublicSupabaseClient();
    
    // Récupérer uniquement les paramètres nécessaires pour le public
    const { data, error } = await supabase
      .from('developer_settings')
      .select('key, value')
      .in('key', ['shop.hidden']); // Seulement les paramètres publics nécessaires

    if (error) {
      // Si la table n'existe pas encore, retourner des valeurs par défaut
      if (error.code === '42P01') {
        return NextResponse.json({
          'shop.hidden': false,
        });
      }
      throw error;
    }

    // Convertir en objet simple
    const settings: Record<string, any> = {};
    (data || []).forEach((setting: { key: string; value: unknown }) => {
      settings[setting.key] = setting.value;
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching public developer settings:', error);
    // En cas d'erreur, retourner des valeurs par défaut
    return NextResponse.json({
      'shop.hidden': false,
    });
  }
}

