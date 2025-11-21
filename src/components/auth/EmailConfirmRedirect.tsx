'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

/**
 * Composant qui intercepte le paramètre `code` de Supabase
 * (utilisé dans le flux PKCE pour la confirmation d'email)
 * et redirige vers la page de confirmation
 */
export function EmailConfirmRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  useEffect(() => {
    // Si on a un code ou une erreur, rediriger vers la page de confirmation
    if (code || error) {
      const params = new URLSearchParams();
      if (code) params.set('code', code);
      if (error) params.set('error', error);
      const errorCode = searchParams.get('error_code');
      const errorDescription = searchParams.get('error_description');
      if (errorCode) params.set('error_code', errorCode);
      if (errorDescription) params.set('error_description', errorDescription);
      
      router.replace(`/auth/confirm?${params.toString()}`);
    }
  }, [code, error, searchParams, router]);

  return null;
}

