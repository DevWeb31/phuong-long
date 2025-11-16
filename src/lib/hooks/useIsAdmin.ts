/**
 * useIsAdmin Hook
 * 
 * Hook pour vérifier si l'utilisateur connecté a le rôle admin
 * 
 * @version 1.0
 * @date 2025-11-05
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { createClient } from '@/lib/supabase/client';

export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const checkedUserIdRef = useRef<string | null>(null);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      // Si pas d'utilisateur
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        checkedUserIdRef.current = null;
        hasCheckedRef.current = false;
        return;
      }

      // Si déjà vérifié pour cet utilisateur, ne pas refaire la requête
      if (hasCheckedRef.current && checkedUserIdRef.current === user.id) {
        return;
      }

      // Marquer comme en cours de vérification pour éviter les doublons
      if (checkedUserIdRef.current === user.id) {
        return;
      }

      try {
        setIsLoading(true);
        checkedUserIdRef.current = user.id; // Marquer immédiatement pour éviter doubles requêtes
        
        const supabase = createClient();
        
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role_id, roles(name)')
          .eq('user_id', user.id);

        // Vérifier si l'utilisateur a le rôle admin OU developer
        const roles = (userRoles as any[])?.map(ur => ur.roles?.name).filter(Boolean) || [];
        setIsAdmin(roles.includes('admin') || roles.includes('developer'));
        hasCheckedRef.current = true;
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
        hasCheckedRef.current = true;
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminRole();
  }, [user?.id]);

  return { isAdmin, isLoading };
}

