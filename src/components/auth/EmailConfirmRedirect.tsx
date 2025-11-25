'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

/**
 * Intercepte les paramètres Supabase (query ou hash) après clic sur
 * l'email d'activation et redirige vers /auth/confirm.
 */
export function EmailConfirmRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = () => {
      const code = searchParams.get('code');
      const token = searchParams.get('token');
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const error = searchParams.get('error');

      // 1. Nouveau flux PKCE via query params ?code=...
      if (code || error) {
        const params = new URLSearchParams();
        if (code) params.set('code', code);
        if (error) params.set('error', error);
        const errorCode = searchParams.get('error_code');
        const errorDescription = searchParams.get('error_description');
        if (errorCode) params.set('error_code', errorCode);
        if (errorDescription) params.set('error_description', errorDescription);

        router.replace(`/auth/confirm?${params.toString()}`);
        return true;
      }

      // 2. Ancien format ?token=...&type=...
      if ((token || tokenHash) && type) {
        const params = new URLSearchParams();
        params.set('token_hash', tokenHash || token || '');
        params.set('type', type);

        const redirectTo = searchParams.get('redirect_to');
        if (redirectTo) params.set('redirect_to', redirectTo);

        router.replace(`/auth/confirm?${params.toString()}`);
        return true;
      }

      // 3. Flux PKCE via hash (#access_token=...&type=signup)
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash.replace(/^#/, '');
        if (!hash) {
          return false;
        }

        const hashParams = new URLSearchParams(hash);
        const hashCode = hashParams.get('code');
        const hashError = hashParams.get('error');
        const hashErrorDescription = hashParams.get('error_description');
        const hashType = hashParams.get('type');
        const accessToken = hashParams.get('access_token');

        if (hashCode || hashError || accessToken) {
          const params = new URLSearchParams();

          if (hashCode) {
            params.set('code', hashCode);
          } else if (accessToken) {
            // La session est déjà créée, passer par /auth/confirm sans code
            params.set('type', hashType === 'email_change' ? 'email_change' : 'email');
          }

          if (hashError) {
            params.set('error', hashError);
          }
          if (hashErrorDescription) {
            params.set('error_description', hashErrorDescription);
          }

          router.replace(
            params.toString() ? `/auth/confirm?${params.toString()}` : '/auth/confirm'
          );

          // Nettoyer le hash pour éviter d'exposer les tokens
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          return true;
        }
      }

      return false;
    };

    handleRedirect();
  }, [router, searchParams]);

  return null;
}

