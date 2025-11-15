/**
 * Event Session API Routes
 * 
 * Update/Delete operations for individual sessions
 * 
 * @version 1.0
 * @date 2025-11-08
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { checkAdminRole } from '@/lib/utils/check-admin-role';

interface RouteContext {
  params: Promise<{ sessionId: string }>;
}

// PATCH - Update session
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { sessionId } = await context.params;
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

    // @ts-ignore - Supabase update type incompatibility
    const { data, error } = await supabase.from('event_sessions').update({
      session_date: body.session_date,
      start_time: body.start_time,
      end_time: body.end_time || null,
      location: body.location || null,
      max_attendees: body.max_attendees || null,
      notes: body.notes || null,
    }).eq('id', sessionId).select().single();

    if (error) {
      console.error('[ERROR] Supabase update error:', error);
      return NextResponse.json({ 
        error: 'Erreur lors de la modification', 
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[ERROR] Error updating session:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Remove session
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { sessionId } = await context.params;
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const isAdmin = await checkAdminRole(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { error } = await supabase
      .from('event_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('[ERROR] Supabase delete error:', error);
      return NextResponse.json({ 
        error: 'Erreur lors de la suppression', 
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ERROR] Error deleting session:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

