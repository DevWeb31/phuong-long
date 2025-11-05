/**
 * useIsAdmin Hook
 * 
 * Hook pour vérifier si l'utilisateur connecté a le rôle admin
 * 
 * @version 1.0
 * @date 2025-11-05
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { createClient } from '@/lib/supabase/client';

export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [checkedUserId, setCheckedUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminRole = async () => {
      // Si pas d'utilisateur
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        setCheckedUserId(null);
        return;
      }

      // Si déjà vérifié pour cet utilisateur, ne pas refaire la requête
      if (checkedUserId === user.id) {
        return;
      }

      try {
        setIsLoading(true);
        const supabase = createClient();
        
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role_id, roles(name)')
          .eq('user_id', user.id)
          .maybeSingle();

        setIsAdmin(!!(userRole && (userRole as any).roles?.name === 'admin'));
        setCheckedUserId(user.id);
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminRole();
  }, [user?.id]); // Utiliser user?.id au lieu de user complet

  return { isAdmin, isLoading };
}

