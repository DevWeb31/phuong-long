'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

/**
 * Composant qui intercepte les paramètres de confirmation d'email de Supabase
 * (code, token, type) et redirige vers la page de confirmation
 * 
 * Gère plusieurs formats :
 * - PKCE flow : code (nouveau format)
 * - Token flow : token + type (ancien format)
 * - Erreurs : error, error_code, error_description
 */
export function EmailConfirmRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const error = searchParams.get('error');

  useEffect(() => {
    // Si on a un code (PKCE flow), rediriger vers la page de confirmation
    if (code || error) {
      const params = new URLSearchParams();
      if (code) params.set('code', code);
      if (error) params.set('error', error);
      const errorCode = searchParams.get('error_code');
      const errorDescription = searchParams.get('error_description');
      if (errorCode) params.set('error_code', errorCode);
      if (errorDescription) params.set('error_description', errorDescription);
      
      router.replace(`/auth/confirm?${params.toString()}`);
      return;
    }

    // Si on a un token et un type (ancien format Supabase)
    // C'est le cas quand Supabase redirige vers la racine après vérification
    // Note: Supabase utilise 'token' dans l'URL mais la page de confirmation attend 'token_hash'
    if (token && type) {
      const params = new URLSearchParams();
      params.set('token_hash', token); // Convertir 'token' en 'token_hash' pour la page de confirmation
      params.set('type', type);
      
      // Copier les autres paramètres éventuels
      const redirectTo = searchParams.get('redirect_to');
      if (redirectTo) params.set('redirect_to', redirectTo);
      
      router.replace(`/auth/confirm?${params.toString()}`);
      return;
    }
    
    // Gérer aussi le cas où on a directement token_hash (si déjà converti)
    const tokenHash = searchParams.get('token_hash');
    if (tokenHash && type) {
      const params = new URLSearchParams();
      params.set('token_hash', tokenHash);
      params.set('type', type);
      
      const redirectTo = searchParams.get('redirect_to');
      if (redirectTo) params.set('redirect_to', redirectTo);
      
      router.replace(`/auth/confirm?${params.toString()}`);
      return;
    }
  }, [code, token, type, error, searchParams, router]);

  return null;
}

