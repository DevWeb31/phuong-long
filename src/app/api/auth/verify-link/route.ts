/**
 * Verify Link Endpoint - Vérifie directement le token et redirige vers la page de confirmation
 * 
 * Cette route vérifie le token d'email directement avec Supabase (sans passer par leur endpoint)
 * puis redirige vers /auth/confirm avec les bons paramètres.
 * 
 * @version 2.0
 * @date 2025-01-XX
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAppBaseUrl } from '@/lib/utils/get-app-base-url';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const type = searchParams.get('type') ?? 'signup';
    const baseUrl = getAppBaseUrl();

    if (!token) {
      return NextResponse.redirect(`${baseUrl}/auth/confirm?error=missing_token`);
    }

    // Vérifier le token directement avec Supabase
    const supabase = await createServerClient();
    
    // Utiliser verifyOtp pour vérifier le token
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as 'signup' | 'email_change' | 'email',
    });

    if (error) {
      console.error('[VERIFY-LINK] Erreur vérification token:', error);
      
      // Vérifier si l'erreur est due à un token expiré ou déjà utilisé
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('expired') || 
          errorMessage.includes('already been used') ||
          errorMessage.includes('invalid')) {
        return NextResponse.redirect(`${baseUrl}/auth/confirm?error=token_expired&type=${type}`);
      }
      
      // Pour les autres erreurs, rediriger vers /auth/confirm avec le token pour que la page gère
      const confirmUrl = new URL(`${baseUrl}/auth/confirm`);
      confirmUrl.searchParams.set('token_hash', token);
      confirmUrl.searchParams.set('type', type);
      confirmUrl.searchParams.set('error', 'verification_failed');
      return NextResponse.redirect(confirmUrl.toString());
    }

    // Succès : le token est valide et l'email est confirmé
    if (data?.user) {
      // Vérifier que l'email est bien confirmé
      if (data.user.email_confirmed_at) {
        // Rediriger vers la page de confirmation avec le statut de succès
        return NextResponse.redirect(`${baseUrl}/auth/confirm?verified=true&type=${type}`);
      }
    }

    // Si on arrive ici, rediriger vers /auth/confirm avec le token pour traitement
    const confirmUrl = new URL(`${baseUrl}/auth/confirm`);
    confirmUrl.searchParams.set('token_hash', token);
    confirmUrl.searchParams.set('type', type);
    return NextResponse.redirect(confirmUrl.toString());
    
  } catch (error) {
    console.error('[VERIFY-LINK] Erreur inattendue:', error);
    const baseUrl = getAppBaseUrl();
    return NextResponse.redirect(`${baseUrl}/auth/confirm?error=verification_failed`);
  }
}


