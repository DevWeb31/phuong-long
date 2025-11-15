/**
 * Event Attendance API Route
 * 
 * Gérer la participation à un événement (authentification requise)
 * 
 * @version 1.0
 * @date 2025-11-06
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// POST - S'inscrire à un événement (Je serai là !)
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const supabase = await createServerClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Vérifier si l'événement est complet
    // @ts-ignore - Supabase select type incompatibility
    const { data: event } = await supabase
      .from('events')
      .select('max_attendees')
      .eq('id', eventId)
      .single();
    
    // @ts-ignore - Supabase select type incompatibility
    if ((event as any)?.max_attendees) {
      const { count } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'confirmed');
      
      if (count && count >= (event as any).max_attendees) {
        return NextResponse.json({ error: 'Événement complet' }, { status: 400 });
      }
    }
    
    // Ajouter la participation
    // @ts-ignore - Supabase insert type incompatibility
    const { error } = await supabase.from('event_registrations').insert([{
      event_id: eventId,
      user_id: user.id,
      status: 'confirmed',
    }]);
    
    if (error) {
      // Si déjà inscrit, ignorer l'erreur
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Déjà inscrit' }, { status: 200 });
      }
      console.error('Error adding registration:', error);
      return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Se désinscrire d'un événement
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const supabase = await createServerClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Retirer la participation
    const { error } = await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error removing registration:', error);
      return NextResponse.json({ error: 'Failed to unregister' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

