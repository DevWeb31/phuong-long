/**
 * Admin Events API Routes
 * 
 * CRUD operations for events
 * 
 * @version 1.0
 * @date 2025-11-05
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { checkAdminRole } from '@/lib/utils/check-admin-role';

export const runtime = 'nodejs';

// GET - List all events
export async function GET() {
  try {
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const isAdmin = await checkAdminRole(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('events')
      .select('*, club:clubs(name, city)')
      .order('start_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Create new event
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const isAdmin = await checkAdminRole(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    
    // @ts-ignore - Supabase insert type incompatibility
    const { data, error } = await supabase.from('events').insert([body]).select().single();

    if (error) {
      console.error('[ERROR] Supabase insert error:', error);
      return NextResponse.json({ 
        error: 'Erreur lors de la création', 
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[ERROR] Error creating event:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

