/**
 * Admin Single Club API Routes
 * 
 * Update and delete operations for a specific club
 * 
 * @version 1.0
 * @date 2025-11-05
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { checkAdminRole, checkCoachRole, getCoachClubId } from '@/lib/utils/check-admin-role';

export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET - Get club by ID
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    
    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin ou coach
    const isAdmin = await checkAdminRole(user.id);
    const isCoach = await checkCoachRole(user.id);
    
    if (!isAdmin && !isCoach) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Si coach, vérifier que le club_id correspond à son club
    if (isCoach) {
      const coachClubId = await getCoachClubId(user.id);
      if (!coachClubId || coachClubId !== id) {
        return NextResponse.json({ error: 'Accès non autorisé à ce club' }, { status: 403 });
      }
    }

    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { 
          error: 'Erreur lors de la récupération',
          details: error.message,
          code: error.code 
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: 'Club introuvable' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching club:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json(
      { error: 'Erreur serveur', details: errorMessage },
      { status: 500 }
    );
  }
}

// PATCH - Update club
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    
    // Vérifier l'authentification et le rôle admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const isAdmin = await checkAdminRole(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = await request.json();

    // Filtrer les champs qui ne sont pas dans le schéma de la table ou qui sont gérés automatiquement
    const { members_count, created_at, updated_at, id: _id, ...clubData } = body;

    // @ts-ignore - Supabase update type incompatibility
    const { data, error } = await supabase.from('clubs').update(clubData).eq('id', id).select().single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { 
          error: 'Erreur lors de la mise à jour',
          details: error.message,
          code: error.code 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating club:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json(
      { error: 'Erreur serveur', details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE - Delete club
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    
    // Vérifier l'authentification et le rôle admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const isAdmin = await checkAdminRole(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { error } = await supabase
      .from('clubs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting club:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

