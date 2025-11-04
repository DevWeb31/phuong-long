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
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (error) {
      console.error('Error checking admin role:', error);
      return false;
    }

    return !!userRole;
  } catch (error) {
    console.error('Exception checking admin role:', error);
    return false;
  }
}

export async function getUserRoles(userId: string): Promise<string[]> {
  try {
    const supabase = await createServerClient();
    
    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }

    return (roles as unknown as { role: string }[])?.map(r => r.role) || [];
  } catch (error) {
    console.error('Exception fetching user roles:', error);
    return [];
  }
}

export async function hasRole(userId: string, role: string): Promise<boolean> {
  try {
    const supabase = await createServerClient();
    
    const { data: userRole, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', role)
      .maybeSingle();

    if (error) {
      console.error(`Error checking role ${role}:`, error);
      return false;
    }

    return !!userRole;
  } catch (error) {
    console.error(`Exception checking role ${role}:`, error);
    return false;
  }
}

