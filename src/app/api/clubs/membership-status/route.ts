/**
 * API Route - Get Club Membership Status
 * 
 * Récupère le statut d'adhésion d'un utilisateur à un club
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAPIClient } from '@/lib/supabase/server';

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createAPIClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer le profil utilisateur pour voir s'il a un club favori
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('favorite_club_id')
      .eq('id', user.id)
      .single();

    type UserProfile = { favorite_club_id: string | null };
    const typedProfile = profile as UserProfile | null;

    // Récupérer les demandes d'adhésion en attente
    const { data: pendingRequests } = await supabase
      .from('club_membership_requests')
      .select('id, club_id, status, requested_at, clubs(name, slug)')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });

    // Récupérer les adhésions approuvées
    const { data: approvedRequests } = await supabase
      .from('club_membership_requests')
      .select('id, club_id, status, requested_at, clubs(name, slug)')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .order('requested_at', { ascending: false });

    return NextResponse.json({
      success: true,
      data: {
        hasClub: !!typedProfile?.favorite_club_id,
        favoriteClubId: typedProfile?.favorite_club_id || null,
        pendingRequests: pendingRequests || [],
        approvedRequests: approvedRequests || [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

