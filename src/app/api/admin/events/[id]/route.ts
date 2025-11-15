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

export const runtime = 'nodejs';

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

    // Nettoyer les données : supprimer les relations et champs non-colonnes
    const { club, created_at, updated_at, id: _, ...cleanData } = body;

    // Mettre à jour sans récupérer les relations
    // @ts-ignore - Supabase update type incompatibility
    const { error } = await supabase.from('events').update(cleanData).eq('id', id);

    if (error) {
      console.error('Error updating event:', error);
      return NextResponse.json({ 
        error: 'Erreur lors de la mise à jour', 
        details: error.message
      }, { status: 500 });
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

