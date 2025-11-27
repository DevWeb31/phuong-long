/**
 * API Route - Get Club Membership Requests by Club ID
 * 
 * Récupère toutes les demandes d'adhésion en attente pour un club spécifique
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAPIClient, createAdminClient } from '@/lib/supabase/server';
import { checkAdminRole, checkCoachRole, getCoachClubId } from '@/lib/utils/check-admin-role';

interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
}

interface UserMetadata {
  full_name?: string;
  fullName?: string;
  name?: string;
  first_name?: string;
  firstName?: string;
  prenom?: string;
  last_name?: string;
  lastName?: string;
  nom?: string;
  [key: string]: unknown;
}

interface AuthUserSnapshot {
  id: string;
  email: string;
  metadata: UserMetadata | null;
}

const pickFirstString = (metadata: UserMetadata | null, keys: string[]): string | null => {
  if (!metadata) {
    return null;
  }

  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
};

const resolveMetadataFullName = (metadata: UserMetadata | null): string | null => {
  const directMatch = pickFirstString(metadata, ['full_name', 'fullName', 'name']);
  if (directMatch) {
    return directMatch;
  }

  const firstName = pickFirstString(metadata, ['first_name', 'firstName', 'prenom']);
  const lastName = pickFirstString(metadata, ['last_name', 'lastName', 'nom']);

  const combined = [firstName, lastName].filter(Boolean).join(' ').trim();
  return combined.length > 0 ? combined : null;
};

const buildDisplayName = (
  profile: UserProfile | undefined,
  authSnapshot: AuthUserSnapshot | undefined,
): string => {
  const profileName = profile?.full_name?.trim();
  if (profileName) {
    return profileName;
  }

  const metadataName = resolveMetadataFullName(authSnapshot?.metadata ?? null);
  if (metadataName) {
    return metadataName;
  }

  const username = profile?.username?.trim();
  if (username) {
    return username;
  }

  const emailLocalPart = authSnapshot?.email?.split('@')[0];
  if (emailLocalPart) {
    return emailLocalPart;
  }

  return 'Utilisateur';
};

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

    // Vérifier que l'utilisateur est admin ou coach
    const isAdmin = await checkAdminRole(user.id);
    const isCoach = await checkCoachRole(user.id);
    
    if (!isAdmin && !isCoach) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const { id: clubId } = await params;

    // Si coach, vérifier que le club_id correspond à son club
    if (isCoach) {
      const coachClubId = await getCoachClubId(user.id);
      if (!coachClubId || coachClubId !== clubId) {
        return NextResponse.json(
          { success: false, error: 'Accès non autorisé à ce club' },
          { status: 403 }
        );
      }
    }

    // Récupérer les demandes d'adhésion en attente pour ce club
    console.log('[API] Fetching membership requests for club:', clubId);
    const { data: requests, error: requestsError } = await supabase
      .from('club_membership_requests')
      .select(`
        id,
        user_id,
        status,
        requested_at,
        club_id
      `)
      .eq('club_id', clubId)
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });

    console.log('[API] Membership requests query result:', {
      clubId,
      requestsCount: requests?.length || 0,
      requests: requests,
      error: requestsError
    });

    if (requestsError) {
      console.error('[API] Error fetching membership requests:', requestsError);
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

    const typedProfiles = (profiles || []) as UserProfile[];

    // Récupérer les emails depuis auth.users
    const usersWithEmail = await Promise.all<AuthUserSnapshot>(
      userIds.map(async (userId) => {
        try {
          const { data: authUser, error: authError } = await adminSupabase.auth.admin.getUserById(userId);
          if (authError) {
            console.error(`Error fetching user ${userId}:`, authError);
            return {
              id: userId,
              email: '',
              metadata: null,
            };
          }
          return {
            id: userId,
            email: authUser?.user?.email || '',
            metadata: (authUser?.user?.user_metadata as UserMetadata | null) || null,
          };
        } catch (err) {
          console.error(`Exception fetching user ${userId}:`, err);
          return {
            id: userId,
            email: '',
            metadata: null,
          };
        }
      })
    );

    // Combiner les données
    const requestsWithEmail = typedRequests.map((request) => {
      const authSnapshot = usersWithEmail.find(u => u.id === request.user_id);
      const profile = typedProfiles.find(p => p.id === request.user_id);
      
      return {
        id: request.id,
        userId: request.user_id,
        fullName: buildDisplayName(profile, authSnapshot),
        email: authSnapshot?.email || '',
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

