/**
 * Coaches API Route
 * 
 * API pour récupérer la liste des coaches/instructeurs
 * 
 * @version 1.0
 * @date 2025-11-06
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerClient();
    
    const { data: coaches, error } = await supabase
      .from('coaches')
      .select('id, name, club_id, active')
      .eq('active', true)
      .order('name');
    
    if (error) {
      console.error('Error fetching coaches:', error);
      return NextResponse.json({ error: 'Failed to fetch coaches' }, { status: 500 });
    }
    
    return NextResponse.json(coaches || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

