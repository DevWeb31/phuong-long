/**
 * Event Like API Route
 * 
 * Gérer les likes sur un événement (authentification requise)
 * 
 * @version 1.0
 * @date 2025-11-06
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// POST - Ajouter un like
export async function POST(
  request: NextRequest,
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
    
    // Ajouter le like
    const { error } = await supabase
      .from('event_likes')
      .insert([{ event_id: eventId, user_id: user.id }]);
    
    if (error) {
      // Si déjà liké, ignorer l'erreur
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Déjà liké' }, { status: 200 });
      }
      console.error('Error adding like:', error);
      return NextResponse.json({ error: 'Failed to add like' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Retirer un like
export async function DELETE(
  request: NextRequest,
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
    
    // Retirer le like
    const { error } = await supabase
      .from('event_likes')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error removing like:', error);
      return NextResponse.json({ error: 'Failed to remove like' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

