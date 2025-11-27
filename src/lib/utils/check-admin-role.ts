/**
 * Check Admin Role Utility
 * 
 * Helper pour vérifier si un utilisateur a le rôle admin
 * 
 * @version 1.0
 * @date 2025-11-05 01:35
 */

import { createServerClient } from '@/lib/supabase/server';

export async function checkAdminRole(userId: string): Promise<boolean> {
  try {
    const supabase = await createServerClient();
    
    const { data: userRoles, error } = await supabase
      .from('user_roles')
      .select('role_id, roles(name)')
      .eq('user_id', userId);

    if (error) {
      console.error('Error checking admin role:', error);
      return false;
    }

    // Vérifier si l'utilisateur a le rôle admin OU developer
    const roles = (userRoles as any[])?.map(ur => ur.roles?.name).filter(Boolean) || [];
    return roles.includes('admin') || roles.includes('developer');
  } catch (error) {
    console.error('Exception checking admin role:', error);
    return false;
  }
}

export async function getUserRoles(userId: string): Promise<string[]> {
  try {
    const supabase = await createServerClient();
    
    const { data: userRoles, error } = await supabase
      .from('user_roles')
      .select('role_id, roles(name)')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }

    return (userRoles as any[])?.map(ur => ur.roles?.name).filter(Boolean) || [];
  } catch (error) {
    console.error('Exception fetching user roles:', error);
    return [];
  }
}

export async function hasRole(userId: string, roleName: string): Promise<boolean> {
  try {
    const supabase = await createServerClient();
    
    const { data: userRoles, error } = await supabase
      .from('user_roles')
      .select('role_id, roles(name)')
      .eq('user_id', userId);

    if (error) {
      console.error(`Error checking role ${roleName}:`, error);
      return false;
    }

    return (userRoles as any[])?.some(ur => ur.roles?.name === roleName) || false;
  } catch (error) {
    console.error(`Exception checking role ${roleName}:`, error);
    return false;
  }
}

export async function checkStudentRole(userId: string): Promise<boolean> {
  return hasRole(userId, 'student');
}

export async function checkDeveloperRole(userId: string): Promise<boolean> {
  return hasRole(userId, 'developer');
}

export async function checkAdminOrDeveloperRole(userId: string): Promise<boolean> {
  const roles = await getUserRoles(userId);
  return roles.includes('admin') || roles.includes('developer');
}

export async function getStudentClubId(userId: string): Promise<string | null> {
  try {
    const supabase = await createServerClient();
    
    const { data: userRole, error } = await supabase
      .from('user_roles')
      .select('club_id, role_id, roles(name)')
      .eq('user_id', userId)
      .eq('roles.name', 'student')
      .maybeSingle();

    if (error) {
      console.error('Error fetching student club:', error);
      return null;
    }

    return (userRole as any)?.club_id || null;
  } catch (error) {
    console.error('Exception fetching student club:', error);
    return null;
  }
}

/**
 * Récupère le club principal d'un utilisateur
 * Priorité : user_roles.club_id (rôle student) > favorite_club_id > null
 * 
 * Cette fonction centralise la logique de récupération du club pour éviter
 * les incohérences entre favorite_club_id et user_roles.club_id
 */
export async function getUserClubId(userId: string): Promise<string | null> {
  try {
    const supabase = await createServerClient();
    
    // 1. Priorité : Récupérer le club depuis le rôle student
    const studentClubId = await getStudentClubId(userId);
    if (studentClubId) {
      return studentClubId;
    }
    
    // 2. Fallback : Récupérer le favorite_club_id depuis le profil
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('favorite_club_id')
      .eq('id', userId)
      .single();
    
    type UserProfile = { favorite_club_id: string | null };
    const typedProfile = profile as UserProfile | null;
    
    if (!profileError && typedProfile?.favorite_club_id) {
      return typedProfile.favorite_club_id;
    }
    
    return null;
  } catch (error) {
    console.error('[getUserClubId] Exception:', error);
    return null;
  }
}

export async function hasRoleLevel(userId: string, maxLevel: number): Promise<boolean> {
  try {
    const supabase = await createServerClient();
    
    const { data: userRoles, error } = await supabase
      .from('user_roles')
      .select('role_id, roles(name, level)')
      .eq('user_id', userId);

    if (error) {
      console.error('Error checking role level:', error);
      return false;
    }

    // Vérifier si l'utilisateur a au moins un rôle avec level <= maxLevel
    return (userRoles as any[])?.some((ur: any) => {
      const roleLevel = ur.roles?.level;
      return roleLevel !== undefined && roleLevel <= maxLevel;
    }) || false;
  } catch (error) {
    console.error('Exception checking role level:', error);
    return false;
  }
}

export async function checkCoachRole(userId: string): Promise<boolean> {
  return hasRole(userId, 'coach');
}

export async function getCoachClubId(userId: string): Promise<string | null> {
  try {
    const supabase = await createServerClient();
    
    // Méthode 1: Récupérer le club_id depuis user_roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('club_id, role_id, roles(name)')
      .eq('user_id', userId);

    if (!rolesError && userRoles && userRoles.length > 0) {
      // Filtrer pour trouver le rôle coach avec un club_id
      const coachRoles = (userRoles as any[]).filter((ur: any) => {
        const roleName = ur.roles?.name;
        return roleName === 'coach' && ur.club_id !== null;
      });

      if (coachRoles.length > 0) {
        const clubId = (coachRoles[0] as any)?.club_id;
        console.log('[getCoachClubId] Found club_id from user_roles:', clubId);
        return clubId || null;
      }
    }

    // Méthode 2: Si pas trouvé dans user_roles, essayer de trouver via le profil utilisateur
    // Récupérer le profil utilisateur pour obtenir favorite_club_id
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('full_name, favorite_club_id')
      .eq('id', userId)
      .single();

    if (!profileError && userProfile) {
      // Si le profil a un favorite_club_id, l'utiliser
      if (userProfile.favorite_club_id) {
        console.log('[getCoachClubId] Using favorite_club_id from profile:', userProfile.favorite_club_id);
        return userProfile.favorite_club_id;
      }

      // Si le profil a un full_name, chercher dans la table coaches
      if (userProfile.full_name) {
        const { data: coaches, error: coachesError } = await supabase
          .from('coaches')
          .select('club_id, name')
          .ilike('name', `%${userProfile.full_name}%`)
          .eq('active', true)
          .limit(1);

        if (!coachesError && coaches && coaches.length > 0) {
          const clubId = (coaches[0] as any)?.club_id;
          if (clubId) {
            console.log('[getCoachClubId] Found club_id from coaches table:', clubId);
            return clubId;
          }
        }
      }
    }

    console.log('[getCoachClubId] No club_id found for coach user:', userId);
    return null;
  } catch (error) {
    console.error('[getCoachClubId] Exception fetching coach club:', error);
    return null;
  }
}

