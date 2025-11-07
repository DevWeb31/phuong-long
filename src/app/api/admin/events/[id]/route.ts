/**
 * Admin Single Event API Routes
 * 
 * Update and delete operations for a specific event
 * 
 * @version 1.0
 * @date 2025-11-05
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { checkAdminRole } from '@/lib/utils/check-admin-role';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PATCH - Update event
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Mettre à jour sans récupérer les relations
    const { error } = await supabase
      .from('events')
      .update(body)
      .eq('id', id);

    if (error) {
      console.error('Error updating event:', error);
      throw error;
    }

    // Récupérer l'événement mis à jour (sans relations pour éviter erreurs de cache)
    const { data: updatedEvent } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    return NextResponse.json(updatedEvent || { success: true });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Delete event
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
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
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

