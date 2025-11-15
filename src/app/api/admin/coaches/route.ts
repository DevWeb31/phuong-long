/**
 * Admin Coaches API Routes
 * 
 * CRUD pour la gestion des coaches
 * 
 * @version 1.0
 * @date 2025-11-06
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// GET - Liste tous les coaches
export async function GET() {
  try {
    const supabase = await createServerClient();
    
    const { data: coaches, error } = await supabase
      .from('coaches')
      .select('*')
      .order('display_order');
    
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

// POST - Créer un nouveau coach
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();
    
    console.log('Création coach:', body);
    
    // @ts-ignore - Supabase insert type incompatibility
    const { data: coach, error } = await supabase.from('coaches').insert([body]).select().single();
    
    if (error) {
      console.error('Error creating coach:', error);
      return NextResponse.json({ error: 'Failed to create coach' }, { status: 500 });
    }
    
    return NextResponse.json(coach);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

