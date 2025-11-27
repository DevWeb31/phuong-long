/**
 * useAuth Hook
 *
 * Gestion centralisée de l'authentification (context + provider)
 */

'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { Session, User, AuthError, AuthResponse } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ data: AuthResponse['data']; error: AuthError | null }>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string; status?: number } | null }>;
  signOut: () => Promise<{ error: { message: string } | null }>;
  resetPassword: (email: string) => Promise<{ data: { success: boolean } | null; error: { message: string; status?: number } | null }>;
  updatePassword: (newPassword: string) => Promise<{ data: Session | null; error: AuthError | null }>;
  updateEmail: (newEmail: string, confirmEmail: string) => Promise<{ data: unknown; error: { message: string; status?: number } | null }>;
  deleteAccount: (confirmEmail: string) => Promise<{ data: unknown; error: { message: string; status?: number } | null }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  if (!supabaseRef.current) {
    supabaseRef.current = createClient();
  }

  const supabase = supabaseRef.current;

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (mounted) {
          if (session?.user) {
            setAuthState({
              user: session.user,
              session,
              loading: false,
            });
          } else {
            const { data: { user } } = await supabase.auth.getUser();
            if (mounted) {
              setAuthState({
                user: user ?? null,
                session: session ?? null,
                loading: false,
              });
            }
          }
        }
      } catch {
        if (mounted) {
          setAuthState({
            user: null,
            session: null,
            loading: false,
          });
        }
      }
    };

    void getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        user: session?.user ?? null,
        session: session ?? null,
        loading: false,
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({ email, password });

    if (!result.error && result.data.session) {
      setAuthState({
        user: result.data.session.user,
        session: result.data.session,
        loading: false,
      });
      router.refresh();
    }

    return result;
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
    await supabase.auth.signOut().catch(() => undefined);

    setAuthState({
      user: null,
      session: null,
      loading: false,
    });

    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        cache: 'no-store',
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        return {
          error: {
            message: data?.error || 'Impossible de terminer la déconnexion',
          },
        };
      }

      router.push('/');
      router.refresh();
      return { error: null };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Erreur lors de la déconnexion',
        },
      };
    }
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

  const updatePassword = async (newPassword: string): Promise<{ data: Session | null; error: AuthError | null }> => {
    const result = await supabase.auth.updateUser({
      password: newPassword,
    });
    // updateUser retourne { user, session }, on retourne seulement la session
    const session = (result.data as { user: User; session: Session | null } | null)?.session ?? null;
    return { data: session, error: result.error };
  };

  const updateEmail = async (newEmail: string, confirmEmail: string) => {
    try {
      const response = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newEmail, confirmEmail }),
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

  const deleteAccount = async (confirmEmail: string) => {
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmEmail }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: {
            message: result.error || 'Erreur lors de la suppression du compte',
            status: response.status,
          },
        };
      }

      await supabase.auth.signOut();
      router.push('/');

      return {
        data: result,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Erreur lors de la suppression du compte',
        },
      };
    }
  };

  const value: AuthContextValue = {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateEmail,
    deleteAccount,
    isAuthenticated: !!authState.user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

