/**
 * Admin Users API Routes
 * 
 * Read operations for users (pas de création via API, utiliser Supabase Auth)
 * 
 * @version 1.0
 * @date 2025-11-05
 */

import { NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import { checkAdminRole, checkCoachRole, getCoachClubId } from '@/lib/utils/check-admin-role';

export const runtime = 'nodejs';

// GET - List all users
export async function GET() {
  try {
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const isAdmin = await checkAdminRole(user.id);
    const isCoach = await checkCoachRole(user.id);
    
    if (!isAdmin && !isCoach) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Si coach, récupérer son club_id pour filtrer les utilisateurs
    const coachClubId = isCoach ? await getCoachClubId(user.id) : null;
    if (isCoach && !coachClubId) {
      return NextResponse.json({ error: 'Coach non associé à un club' }, { status: 403 });
    }

    // Utiliser le client admin pour accéder à auth.users
    const adminSupabase = createAdminClient();

    // Récupérer tous les utilisateurs depuis auth.users avec leurs profils et rôles
    const { data: authUsers, error: authError } = await adminSupabase.auth.admin.listUsers();

    if (authError) throw authError;

    // Récupérer les profils utilisateurs
    const userIds = authUsers.users.map((u: { id: string }) => u.id);
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .in('id', userIds);

    if (profilesError) throw profilesError;

    // Récupérer tous les clubs référencés dans les profils
    const favoriteClubIds = (profiles || [])
      .map((p: any) => p.favorite_club_id)
      .filter((id: string | null) => id !== null) as string[];

    let clubsMap = new Map<string, { name: string; city: string }>();
    if (favoriteClubIds.length > 0) {
      const { data: clubs, error: clubsError } = await supabase
        .from('clubs')
        .select('id, name, city')
        .in('id', favoriteClubIds);

      if (clubsError) throw clubsError;
      clubsMap = new Map((clubs || []).map((c: any) => [c.id, { name: c.name, city: c.city }]));
    }

    // Récupérer les demandes d'adhésion approuvées pour les utilisateurs sans club favori
    const { data: approvedRequests, error: requestsError } = await supabase
      .from('club_membership_requests')
      .select('user_id, club_id, clubs!inner(id, name, city)')
      .eq('status', 'approved')
      .in('user_id', userIds)
      .order('requested_at', { ascending: false });

    if (requestsError) throw requestsError;

    // Créer un map pour les demandes approuvées (garder seulement la plus récente par utilisateur)
    const approvedRequestsMap = new Map<string, { club_id: string; name: string; city: string }>();
    (approvedRequests || []).forEach((req: any) => {
      if (!approvedRequestsMap.has(req.user_id) && req.clubs) {
        approvedRequestsMap.set(req.user_id, {
          club_id: req.club_id || req.clubs.id,
          name: req.clubs.name,
          city: req.clubs.city,
        });
      }
    });

    // Récupérer les rôles de tous les utilisateurs
    const { data: userRolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        role_id,
        club_id,
        roles!inner(name),
        clubs(name, city)
      `)
      .in('user_id', userIds);

    if (rolesError) throw rolesError;

    // Créer un map pour faciliter l'accès
    const profilesMap = new Map((profiles || []).map((p: { id: string }) => [p.id, p]));
    const rolesMap = new Map<string, any[]>();
    
    (userRolesData || []).forEach((ur: any) => {
      if (!rolesMap.has(ur.user_id)) {
        rolesMap.set(ur.user_id, []);
      }
      rolesMap.get(ur.user_id)!.push(ur);
    });

    // Combiner les données
    const usersData = authUsers.users
      .map((authUser: { id: string; email?: string; user_metadata?: Record<string, unknown>; last_sign_in_at?: string | null; created_at?: string }) => {
        const profile = profilesMap.get(authUser.id) as { full_name?: string; username?: string; avatar_url?: string; bio?: string; created_at?: string } | undefined;
        const roles = rolesMap.get(authUser.id) || [];
        
        // Exclure les développeurs
        const roleNames = roles.map((r: any) => r.roles?.name).filter(Boolean);
        if (roleNames.includes('developer')) {
          return null;
        }

        // Récupérer le club favori depuis le profil
        let favoriteClubId = (profile as any)?.favorite_club_id;
        let clubName = null;
        let clubCity = null;

        if (favoriteClubId) {
          const club = clubsMap.get(favoriteClubId);
          if (club) {
            clubName = club.name;
            clubCity = club.city;
          }
        }

        // Si pas de club favori, vérifier les demandes d'adhésion approuvées
        if (!clubName) {
          const approvedRequest = approvedRequestsMap.get(authUser.id);
          if (approvedRequest) {
            clubName = approvedRequest.name;
            clubCity = approvedRequest.city;
            // Utiliser le club_id de la demande approuvée comme favorite_club_id
            favoriteClubId = approvedRequest.club_id;
          }
        }

        // Si coach, filtrer uniquement les utilisateurs du même club
        if (isCoach && coachClubId) {
          // Vérifier si l'utilisateur a le même club_id
          const userHasClub = favoriteClubId === coachClubId || 
                             roles.some((r: any) => r.club_id === coachClubId) ||
                             approvedRequestsMap.get(authUser.id)?.club_id === coachClubId;
          
          // Si l'utilisateur n'a pas le même club, l'exclure
          if (!userHasClub) {
            return null;
          }
        }

        return {
          id: authUser.id,
          email: authUser.email || '',
          full_name: profile?.full_name || (authUser.user_metadata?.full_name as string | undefined) || null,
          username: profile?.username || null,
          avatar_url: profile?.avatar_url || null,
          bio: profile?.bio || null,
          last_sign_in_at: authUser.last_sign_in_at || null,
          created_at: authUser.created_at || profile?.created_at || new Date().toISOString(),
          user_roles: roles.map((r: any) => ({
            role_id: r.role_id,
            role_name: r.roles?.name,
            club_id: r.club_id,
            club_name: r.clubs?.name,
            club_city: r.clubs?.city,
          })),
          primary_role: roleNames[0] || 'user',
          club: clubName,
          club_city: clubCity,
          favorite_club_id: favoriteClubId || null,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA; // Plus récent en premier
      });

    return NextResponse.json(usersData);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

