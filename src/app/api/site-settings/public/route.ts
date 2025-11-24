/**
 * Public Site Settings API Route
 * 
 * GET - Fetch specific site settings without authentication
 * Used by middleware to check maintenance mode
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { NextResponse } from 'next/server';
import { getPublicSupabaseClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// GET - Fetch public site settings (maintenance.enabled, development.banner.*)
export async function GET() {
  try {
    const supabase = getPublicSupabaseClient();
    
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['maintenance.enabled', 'development.banner.enabled', 'development.banner.color', 'development.banner.text']);

    if (error) {
      // Si la table n'existe pas encore, retourner valeurs par défaut
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        return NextResponse.json({ 
          'maintenance.enabled': false,
          'development.banner.enabled': true,
          'development.banner.color': 'warning',
        });
      }
      throw error;
    }

    const settings: Record<string, unknown> = {
      'maintenance.enabled': false,
      'development.banner.enabled': true,
      'development.banner.color': 'warning',
      'development.banner.text': 'Site en cours de développement - Les informations affichées ne sont pas factuelles',
    };

    if (data) {
      data.forEach((setting: { key: string; value: unknown }) => {
        settings[setting.key] = setting.value;
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching public site settings:', error);
    // En cas d'erreur, retourner valeurs par défaut pour ne pas bloquer le site
    return NextResponse.json({
      'maintenance.enabled': false,
      'development.banner.enabled': true,
      'development.banner.color': 'warning',
      'development.banner.text': 'Site en cours de développement - Les informations affichées ne sont pas factuelles',
    });
  }
}

