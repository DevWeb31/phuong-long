/**
 * Single Club API Route
 * 
 * API pour récupérer un club spécifique avec toutes ses données
 * 
 * @version 1.0
 * @date 2025-11-06
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    
    const { data: club, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching club:', error);
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }
    
    return NextResponse.json(club);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

