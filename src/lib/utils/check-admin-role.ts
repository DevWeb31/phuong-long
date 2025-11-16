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

