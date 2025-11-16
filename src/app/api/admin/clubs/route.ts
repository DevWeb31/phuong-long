/**
 * Admin Clubs API Routes
 * 
 * CRUD operations for clubs
 * 
 * @version 1.0
 * @date 2025-11-05
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { checkAdminRole } from '@/lib/utils/check-admin-role';

export const runtime = 'nodejs';

// GET - List all clubs
export async function GET() {
  try {
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

    const { data: clubs, error } = await supabase
      .from('clubs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Compter les membres pour chaque club
    const clubsWithMembers = await Promise.all(
      (clubs || []).map(async (club) => {
        // Compter les utilisateurs ayant un rôle associé à ce club
        const { count, error: countError } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('club_id', club.id);

        if (countError) {
          console.error(`Error counting members for club ${club.id}:`, countError);
          return { ...club, members_count: 0 };
        }

        return {
          ...club,
          members_count: count || 0,
        };
      })
    );

    return NextResponse.json(clubsWithMembers);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Create new club
export async function POST(request: Request) {
  try {
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

    // @ts-ignore - Supabase insert type incompatibility
    const { data, error } = await supabase.from('clubs').insert([body]).select().single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating club:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

