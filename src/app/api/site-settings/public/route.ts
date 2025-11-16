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
import { createServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// GET - Fetch maintenance.enabled setting
export async function GET() {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .eq('key', 'maintenance.enabled')
      .single();

    if (error) {
      // Si la table n'existe pas encore, retourner false
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        return NextResponse.json({ 'maintenance.enabled': false });
      }
      throw error;
    }

    const settings: Record<string, unknown> = {};
    if (data) {
      settings[data.key] = data.value;
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching public site settings:', error);
    // En cas d'erreur, retourner false pour ne pas bloquer le site
    return NextResponse.json({ 'maintenance.enabled': false });
  }
}

