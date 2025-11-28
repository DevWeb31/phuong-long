/**
 * Public FAQ API Route
 * 
 * API publique pour récupérer les FAQ générales (club_id IS NULL)
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { NextResponse } from 'next/server';
import { getPublicSupabaseClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// GET - Get general FAQ (club_id IS NULL)
export async function GET() {
  try {
    const supabase = getPublicSupabaseClient();
    
    const { data, error } = await supabase
      .from('faq')
      .select('*')
      .is('club_id', null)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching FAQ:', error);
      return NextResponse.json({ error: 'Failed to fetch FAQ' }, { status: 500 });
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

