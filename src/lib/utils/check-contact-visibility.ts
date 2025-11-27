/**
 * Check Contact Visibility Utility
 * 
 * Vérifie si l'utilisateur peut voir les informations de contact (email/téléphone)
 * des clubs.
 * 
 * Règles :
 * - Les utilisateurs non connectés ne peuvent pas voir les contacts
 * - Les utilisateurs avec le rôle "user" sans club ne peuvent pas voir les contacts
 * - Tous les autres utilisateurs peuvent voir les contacts
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { createServerClient } from '@/lib/supabase/server';

export async function canViewClubContact(): Promise<boolean> {
  try {
    const supabase = await createServerClient();
    
    // Vérifier si l'utilisateur est connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      // Utilisateur non connecté
      return false;
    }

    // Récupérer les rôles de l'utilisateur
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('club_id, role_id, roles(name)')
      .eq('user_id', user.id);

    if (roleError) {
      console.error('Error checking user roles:', roleError);
      // En cas d'erreur, on masque par sécurité
      return false;
    }

    // Si l'utilisateur n'a aucun rôle, on masque
    if (!userRoles || userRoles.length === 0) {
      return false;
    }

    // Vérifier si l'utilisateur a le rôle "user" sans club
    const hasUserRoleWithoutClub = (userRoles as any[]).some((ur: any) => {
      const roleName = ur.roles?.name;
      return roleName === 'user' && !ur.club_id;
    });

    // Si l'utilisateur a le rôle "user" sans club, on masque
    // (même s'il a d'autres rôles)
    if (hasUserRoleWithoutClub) {
      return false;
    }

    // Tous les autres cas : on affiche
    return true;
  } catch (error) {
    console.error('Exception checking contact visibility:', error);
    // En cas d'erreur, on masque par sécurité
    return false;
  }
}

