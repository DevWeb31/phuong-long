/**
 * Clubs API Route
 * 
 * API publique pour récupérer la liste des clubs actifs
 * 
 * @version 1.0
 * @date 2025-11-06
 */

import { NextResponse } from 'next/server';
import { getPublicSupabaseClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const supabase = getPublicSupabaseClient();
    
    const { data: clubs, error } = await supabase
      .from('clubs')
      .select('id, name, slug, city, postal_code')
      .eq('active', true)
      .order('city');
    
    if (error) {
      console.error('Error fetching clubs:', error);
      return NextResponse.json({ error: 'Failed to fetch clubs' }, { status: 500 });
    }
    
    return NextResponse.json(clubs || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

