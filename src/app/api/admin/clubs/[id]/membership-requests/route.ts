/**
 * API Route - Get Club Membership Requests by Club ID
 * 
 * Récupère toutes les demandes d'adhésion en attente pour un club spécifique
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAPIClient, createAdminClient } from '@/lib/supabase/server';
import { checkAdminRole } from '@/lib/utils/check-admin-role';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createAPIClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est admin
    const isAdmin = await checkAdminRole(user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const { id: clubId } = await params;

    // Récupérer les demandes d'adhésion en attente pour ce club
    const { data: requests, error: requestsError } = await supabase
      .from('club_membership_requests')
      .select(`
        id,
        user_id,
        status,
        requested_at
      `)
      .eq('club_id', clubId)
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });

    if (requestsError) {
      console.error('Error fetching membership requests:', requestsError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des demandes', details: requestsError.message },
        { status: 500 }
      );
    }

    // Si aucune demande, retourner un tableau vide
    if (!requests || requests.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Récupérer les profils utilisateurs et les emails
    const adminSupabase = createAdminClient();
    type MembershipRequest = { id: string; user_id: string; status: string; requested_at: string };
    const typedRequests = requests as MembershipRequest[];
    const userIds = typedRequests.map(r => r.user_id);
    
    // Récupérer les profils utilisateurs
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, full_name, username')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError);
    }

    type UserProfile = { id: string; full_name: string | null; username: string | null };
    const typedProfiles = (profiles || []) as UserProfile[];

    // Récupérer les emails depuis auth.users
    const usersWithEmail = await Promise.all(
      userIds.map(async (userId) => {
        try {
          const { data: authUser, error: authError } = await adminSupabase.auth.admin.getUserById(userId);
          if (authError) {
            console.error(`Error fetching user ${userId}:`, authError);
            return {
              id: userId,
              email: '',
            };
          }
          return {
            id: userId,
            email: authUser?.user?.email || '',
          };
        } catch (err) {
          console.error(`Exception fetching user ${userId}:`, err);
          return {
            id: userId,
            email: '',
          };
        }
      })
    );

    // Combiner les données
    const requestsWithEmail = typedRequests.map((request) => {
      const userEmail = usersWithEmail.find(u => u.id === request.user_id)?.email || '';
      const profile = typedProfiles.find(p => p.id === request.user_id);
      
      return {
        id: request.id,
        userId: request.user_id,
        fullName: profile?.full_name || profile?.username || 'Utilisateur',
        email: userEmail,
        requestedAt: request.requested_at,
      };
    });

    return NextResponse.json({
      success: true,
      data: requestsWithEmail,
    });
  } catch (error) {
    console.error('Unexpected error in membership requests API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

