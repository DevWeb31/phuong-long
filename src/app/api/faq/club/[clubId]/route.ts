/**
 * Public Club FAQ API Route
 * 
 * API publique pour récupérer les FAQ d'un club spécifique
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { NextResponse } from 'next/server';
import { getPublicSupabaseClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// GET - Get FAQ for a specific club
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const { clubId } = await params;
    const supabase = getPublicSupabaseClient();
    
    const { data, error } = await supabase
      .from('faq')
      .select('*')
      .eq('club_id', clubId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching club FAQ:', error);
      return NextResponse.json({ error: 'Failed to fetch club FAQ' }, { status: 500 });
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

