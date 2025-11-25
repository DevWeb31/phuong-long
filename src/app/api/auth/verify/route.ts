/**
 * API Verify - Intercepte les redirections de Supabase après vérification d'email
 * 
 * Cette route intercepte les redirections depuis Supabase Auth et redirige
 * vers la page de confirmation d'email avec les bons paramètres.
 * 
 * Après vérification, Supabase peut rediriger :
 * - Avec token + type (ancien format)
 * - Avec code (PKCE format)
 * - Sans paramètres (vérification réussie, session créée)
 * 
 * @version 1.1
 * @date 2025-01-XX
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAppBaseUrl } from '@/lib/utils/get-app-base-url';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    const code = searchParams.get('code');
    const redirectTo = searchParams.get('redirect_to');
    const baseUrl = getAppBaseUrl();
    
    // Cas 1: Format avec token + type (ancien format)
    if (token && type) {
      const confirmUrl = new URL(`${baseUrl}/auth/confirm`);
      confirmUrl.searchParams.set('token_hash', token);
      confirmUrl.searchParams.set('type', type);
      if (redirectTo) {
        confirmUrl.searchParams.set('redirect_to', redirectTo);
      }
      return NextResponse.redirect(confirmUrl.toString());
    }
    
    // Cas 2: Format PKCE avec code
    if (code) {
      const confirmUrl = new URL(`${baseUrl}/auth/confirm`);
      confirmUrl.searchParams.set('code', code);
      if (type) {
        confirmUrl.searchParams.set('type', type);
      }
      if (redirectTo) {
        confirmUrl.searchParams.set('redirect_to', redirectTo);
      }
      return NextResponse.redirect(confirmUrl.toString());
    }
    
    // Cas 3: Supabase a redirigé sans paramètres (vérification réussie)
    // Vérifier si une session existe (l'email a été confirmé)
    try {
      const supabase = await createServerClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.user && session.user.email_confirmed_at) {
        // L'email est confirmé, rediriger vers la page de succès
        const confirmUrl = new URL(`${baseUrl}/auth/confirm`);
        confirmUrl.searchParams.set('type', type || 'signup');
        confirmUrl.searchParams.set('verified', 'true');
        return NextResponse.redirect(confirmUrl.toString());
      }
    } catch (sessionCheckError) {
      // Ignorer les erreurs de session, continuer avec le fallback
      console.error('[AUTH/VERIFY] Erreur vérification session:', sessionCheckError);
    }
    
    // Fallback: Rediriger vers /auth/confirm avec tous les paramètres disponibles
    const confirmUrl = new URL(`${baseUrl}/auth/confirm`);
    searchParams.forEach((value, key) => {
      confirmUrl.searchParams.set(key, value);
    });
    
    return NextResponse.redirect(confirmUrl.toString());
  } catch (error) {
    console.error('[AUTH/VERIFY] Erreur:', error);
    
    // En cas d'erreur, rediriger vers la page de confirmation
    const baseUrl = getAppBaseUrl();
    return NextResponse.redirect(`${baseUrl}/auth/confirm?error=verification_failed`);
  }
}

