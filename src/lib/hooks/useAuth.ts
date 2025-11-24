/**
 * useAuth Hook
 * 
 * Hook personnalisé pour gérer l'authentification
 * 
 * @version 1.0
 * @date 2025-11-04 23:35
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Récupérer la session initiale
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setAuthState({
        user: session?.user ?? null,
        session: session ?? null,
        loading: false,
      });
    };

    getSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAuthState({
          user: session?.user ?? null,
          session: session ?? null,
          loading: false,
        });
        router.refresh();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    const fullName =
      typeof metadata?.full_name === 'string' && metadata.full_name.trim().length > 0
        ? metadata.full_name
        : undefined;

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: {
            message: result.error || 'Impossible de créer le compte',
            status: response.status,
          },
        };
      }

      return {
        data: result,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Impossible de créer le compte',
        },
      };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push('/');
    }
    return { error };
  };

  const resetPassword = async (email: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const result = await response.json();
        return {
          data: null,
          error: {
            message: result.error || 'Impossible d\'envoyer l\'email de réinitialisation',
            status: response.status,
          },
        };
      }

      return { data: { success: true }, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Impossible d\'envoyer l\'email de réinitialisation',
        },
      };
    }
  };

  const updatePassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { data, error };
  };

  const updateEmail = async (newEmail: string) => {
    try {
      // Utiliser la nouvelle API personnalisée pour le changement d'email
      const response = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newEmail }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: {
            message: result.error || 'Erreur lors du changement d\'email',
            status: response.status,
          },
        };
      }

      return {
        data: result,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Erreur lors du changement d\'email',
        },
      };
    }
  };

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateEmail,
    isAuthenticated: !!authState.user,
  };
}

