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

    // IMPORTANT: Déconnecter l'utilisateur s'il est connecté pour forcer la reconnexion avec l'ancien email
    const supabase = await createAPIClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
    if (!session?.user) {
      let baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      if (process.env.NODE_ENV === 'production' && !baseUrl.includes('phuong-long-vo-dao.com')) {
        baseUrl = 'https://phuong-long-vo-dao.com';
      }
      const signinUrl = `${baseUrl}/signin?redirectTo=${encodeURIComponent(`/auth/confirm-email-change?token=${token}`)}&message=${encodeURIComponent('Veuillez vous connecter avec votre ancienne adresse email (' + tokenData.old_email + ') pour confirmer le changement d\'email.')}`;
      return NextResponse.redirect(signinUrl);
    }

    // Si l'utilisateur est connecté, vérifier qu'il s'est connecté avec l'ancienne adresse email
    // Si ce n'est pas le cas, le déconnecter et rediriger vers la page de connexion
    if (session.user.email?.toLowerCase() !== tokenData.old_email.toLowerCase()) {
      // Déconnecter l'utilisateur
      await supabase.auth.signOut();
      
      // Rediriger vers la page de connexion avec un message explicite
      let baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      if (process.env.NODE_ENV === 'production' && !baseUrl.includes('phuong-long-vo-dao.com')) {
        baseUrl = 'https://phuong-long-vo-dao.com';
      }
      const signinUrl = `${baseUrl}/signin?redirectTo=${encodeURIComponent(`/auth/confirm-email-change?token=${token}`)}&message=${encodeURIComponent('Vous devez vous connecter avec votre ancienne adresse email (' + tokenData.old_email + ') pour confirmer le changement.')}`;
      return NextResponse.redirect(signinUrl);
    }

    // Vérifier que l'utilisateur connecté correspond au token
    if (session.user.id !== tokenData.user_id) {
      return NextResponse.json(
        { success: false, error: 'Token ne correspond pas à l\'utilisateur connecté' },
        { status: 403 }
      );
    }

    // L'utilisateur est connecté avec l'ancienne adresse email, procéder à la confirmation
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
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    if (process.env.NODE_ENV === 'production' && !baseUrl.includes('phuong-long-vo-dao.com')) {
      baseUrl = 'https://phuong-long-vo-dao.com';
    }
    return NextResponse.redirect(`${baseUrl}/auth/confirm-email-change?success=true&refresh=true`);

  } catch (error) {
    console.error('[EMAIL CHANGE] Erreur confirmation:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}


