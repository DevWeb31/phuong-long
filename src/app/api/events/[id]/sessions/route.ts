/**
 * Event Sessions API Routes
 * 
 * CRUD operations for event sessions (dates/horaires)
 * 
 * @version 1.0
 * @date 2025-11-08
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { checkAdminRole } from '@/lib/utils/check-admin-role';

export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET - List all sessions for an event
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('event_sessions')
      .select('*')
      .eq('event_id', id)
      .order('session_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('[ERROR] Error fetching event sessions:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Add new session to event
export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const isAdmin = await checkAdminRole(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = await _request.json();

    const sessionData = {
      event_id: id,
      session_date: body.session_date,
      start_time: body.start_time,
      end_time: body.end_time || null,
      location: body.location || null,
      max_attendees: body.max_attendees || null,
      notes: body.notes || null,
    };

    // @ts-ignore - Supabase insert type incompatibility
    const { data, error } = await supabase.from('event_sessions').insert([sessionData]).select().single();

    if (error) {
      console.error('[ERROR] Supabase insert error:', error);
      return NextResponse.json({ 
        error: 'Erreur lors de l\'ajout', 
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[ERROR] Error adding session:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

