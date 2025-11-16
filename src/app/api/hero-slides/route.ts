/**
 * Public Hero Slides API Route
 * 
 * Récupère uniquement les slides actifs pour la page d'accueil
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// GET - Liste les hero slides actifs uniquement
export async function GET() {
  try {
    const supabase = await createServerClient();
    
    const { data: slides, error } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('active', true)
      .order('display_order');
    
    if (error) {
      console.error('Error fetching hero slides:', error);
      return NextResponse.json({ error: 'Failed to fetch hero slides' }, { status: 500 });
    }
    
    return NextResponse.json(slides || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

