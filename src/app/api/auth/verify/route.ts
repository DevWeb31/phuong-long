/**
 * API Verify - Intercepte les redirections de Supabase après vérification d'email
 * 
 * Cette route intercepte les redirections depuis Supabase Auth et redirige
 * vers la page de confirmation d'email avec les bons paramètres.
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAppBaseUrl } from '@/lib/utils/get-app-base-url';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    const redirectTo = searchParams.get('redirect_to');
    
    // Si on a un token et un type, c'est une redirection depuis Supabase
    if (token && type) {
      const baseUrl = getAppBaseUrl();
      
      // Construire l'URL de redirection vers /auth/confirm avec tous les paramètres
      const confirmUrl = new URL(`${baseUrl}/auth/confirm`);
      confirmUrl.searchParams.set('token_hash', token);
      confirmUrl.searchParams.set('type', type);
      
      // Si redirect_to est présent, l'ajouter aussi
      if (redirectTo) {
        confirmUrl.searchParams.set('redirect_to', redirectTo);
      }
      
      // Rediriger vers la page de confirmation
      return NextResponse.redirect(confirmUrl.toString());
    }
    
    // Si pas de token, rediriger vers la page de confirmation quand même
    // (pour gérer les cas où Supabase redirige sans token)
    const baseUrl = getAppBaseUrl();
    const confirmUrl = new URL(`${baseUrl}/auth/confirm`);
    
    // Copier tous les paramètres de la requête
    searchParams.forEach((value, key) => {
      confirmUrl.searchParams.set(key, value);
    });
    
    return NextResponse.redirect(confirmUrl.toString());
  } catch (error) {
    console.error('[AUTH/VERIFY] Erreur:', error);
    
    // En cas d'erreur, rediriger vers la page de confirmation quand même
    const baseUrl = getAppBaseUrl();
    return NextResponse.redirect(`${baseUrl}/auth/confirm`);
  }
}

