/**
 * useIsStudent Hook
 * 
 * Hook React pour vérifier si l'utilisateur connecté est un élève
 * 
 * @version 1.0
 * @date 2025-11-08
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface UseIsStudentReturn {
  isStudent: boolean;
  clubId: string | null;
  loading: boolean;
  error: Error | null;
}

export function useIsStudent(user: User | null): UseIsStudentReturn {
  const [isStudent, setIsStudent] = useState(false);
  const [clubId, setClubId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function checkStudentRole() {
      if (!user) {
        setIsStudent(false);
        setClubId(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const supabase = createClient();

        const { data: userRole, error: roleError } = await supabase
          .from('user_roles')
          .select('club_id, role_id, roles(name)')
          .eq('user_id', user.id)
          .maybeSingle();

        if (roleError) {
          throw new Error(`Error checking student role: ${roleError.message}`);
        }

        const isStudentRole = !!(userRole && (userRole as any).roles?.name === 'student');
        setIsStudent(isStudentRole);
        setClubId(isStudentRole ? ((userRole as any)?.club_id || null) : null);
      } catch (err) {
        console.error('Error in useIsStudent:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsStudent(false);
        setClubId(null);
      } finally {
        setLoading(false);
      }
    }

    checkStudentRole();
  }, [user]);

  return { isStudent, clubId, loading, error };
}

/**
 * Hook simplifié qui retourne seulement un booléen
 */
export function useStudentStatus(user: User | null): boolean {
  const { isStudent } = useIsStudent(user);
  return isStudent;
}

