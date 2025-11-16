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
import { checkAdminRole } from '@/lib/utils/check-admin-role';

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
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
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

    // Récupérer les rôles de tous les utilisateurs
    const { data: userRolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        role_id,
        club_id,
        roles!inner(name),
        clubs(name)
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

        // Récupérer le club du premier rôle (ou null)
        const clubName = roles[0]?.clubs?.name || null;

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
          })),
          primary_role: roleNames[0] || 'user',
          club: clubName,
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

