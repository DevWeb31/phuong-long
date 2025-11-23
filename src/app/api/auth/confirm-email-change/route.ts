/**
 * Confirm Email Change API Route
 * 
 * Endpoint pour confirmer un changement d'email avec un token
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAPIClient, createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token manquant' },
        { status: 400 }
      );
    }

    // Récupérer le token depuis la base de données
    const adminSupabase = createAdminClient();
    const { data: tokenData, error: tokenError } = await adminSupabase
      .from('email_change_tokens')
      .select('*')
      .eq('token', token)
      .is('used_at', null)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 400 }
      );
    }

    // Vérifier que le token n'est pas expiré
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    if (now > expiresAt) {
      return NextResponse.json(
        { success: false, error: 'Token expiré' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur est connecté (via cookies)
    const supabase = await createAPIClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      // Rediriger vers la page de connexion avec le token préservé
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const signinUrl = `${baseUrl}/signin?redirectTo=${encodeURIComponent(`/auth/confirm-email-change?token=${token}`)}&message=${encodeURIComponent('Veuillez vous connecter avec votre ancienne adresse email pour confirmer le changement.')}`;
      
      return NextResponse.redirect(signinUrl);
    }

    // Vérifier que l'utilisateur connecté correspond au token
    if (session.user.id !== tokenData.user_id) {
      return NextResponse.json(
        { success: false, error: 'Token ne correspond pas à l\'utilisateur connecté' },
        { status: 403 }
      );
    }

    // Vérifier que l'utilisateur se connecte avec l'ancienne adresse email
    if (session.user.email?.toLowerCase() !== tokenData.old_email.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Vous devez vous connecter avec votre ancienne adresse email pour confirmer le changement' },
        { status: 403 }
      );
    }

    // Mettre à jour l'email dans Supabase Auth via Admin Client
    // IMPORTANT: Utiliser admin client pour éviter les emails automatiques de Supabase
    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
      tokenData.user_id,
      {
        email: tokenData.new_email,
        email_confirm: true, // Marquer l'email comme confirmé directement
      }
    );

    if (updateError) {
      console.error('[EMAIL CHANGE] Erreur mise à jour email:', updateError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour de l\'email' },
        { status: 500 }
      );
    }

    // Marquer le token comme utilisé
    await adminSupabase
      .from('email_change_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);

    // IMPORTANT: Après la mise à jour de l'email, on doit forcer un refresh de la session
    // Le JWT dans la session contient toujours l'ancien email
    // On va forcer le client à rafraîchir en invalidant la session actuelle
    // et en forçant un nouveau getSession() qui récupérera les infos à jour
    
    // Rediriger vers la page de succès avec un paramètre pour forcer le refresh
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/auth/confirm-email-change?success=true&refresh=true`);

  } catch (error) {
    console.error('[EMAIL CHANGE] Erreur confirmation:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

