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
    
    const { data: userRole, error } = await supabase
      .from('user_roles')
      .select('role_id, roles(name)')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking admin role:', error);
      return false;
    }

    return !!(userRole && (userRole as any).roles?.name === 'admin');
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

