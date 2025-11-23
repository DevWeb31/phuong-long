/**
 * Change Email API Route
 * 
 * Endpoint pour initier un changement d'email
 * Génère un token et envoie un email de confirmation à la nouvelle adresse
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAPIClient, createAdminClient } from '@/lib/supabase/server';
import { sendEmailChangeConfirmation } from '@/lib/services/email';
import { randomBytes } from 'crypto';

// Schema de validation
const changeEmailSchema = z.object({
  newEmail: z.string().email('Email invalide'),
});

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification via les cookies de session
    const supabase = await createAPIClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    const currentUser = session.user;

    // Valider les données
    const body = await request.json();
    const { newEmail } = changeEmailSchema.parse(body);

    // Vérifier que la nouvelle adresse est différente
    if (currentUser.email?.toLowerCase() === newEmail.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'La nouvelle adresse email doit être différente de l\'actuelle' },
        { status: 400 }
      );
    }

    // Vérifier qu'il n'y a pas déjà un token en attente pour cet utilisateur
    const adminSupabase = createAdminClient();
    const { data: existingToken } = await adminSupabase
      .from('email_change_tokens')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('new_email', newEmail.toLowerCase())
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (existingToken) {
      return NextResponse.json(
        { success: false, error: 'Un email de confirmation a déjà été envoyé. Vérifiez votre boîte de réception.' },
        { status: 400 }
      );
    }

    // Générer un token sécurisé
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expire dans 24h

    // Stocker le token dans la base de données (utiliser admin client pour bypass RLS)
    const { error: dbError } = await adminSupabase
      .from('email_change_tokens')
      .insert({
        user_id: currentUser.id,
        old_email: currentUser.email || '',
        new_email: newEmail.toLowerCase(),
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (dbError) {
      console.error('[EMAIL CHANGE] Erreur DB:', dbError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création du token' },
        { status: 500 }
      );
    }

    // Construire l'URL de confirmation
    // Utiliser le domaine de production si disponible, sinon NEXT_PUBLIC_APP_URL
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // En production, forcer l'utilisation du domaine personnalisé
    if (process.env.NODE_ENV === 'production' && !baseUrl.includes('phuong-long-vo-dao.com')) {
      baseUrl = 'https://phuong-long-vo-dao.com';
    }
    
    const confirmationUrl = `${baseUrl}/auth/confirm-email-change?token=${token}`;

    // Envoyer l'email de confirmation à la nouvelle adresse
    try {
      await sendEmailChangeConfirmation(
        newEmail,
        currentUser.email || '',
        newEmail,
        confirmationUrl
      );
    } catch (emailError) {
      console.error('[EMAIL CHANGE] Erreur envoi email:', emailError);
      // Supprimer le token si l'email n'a pas pu être envoyé
      await adminSupabase
        .from('email_change_tokens')
        .delete()
        .eq('token', token);

      return NextResponse.json(
        { success: false, error: 'Erreur lors de l\'envoi de l\'email de confirmation' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Un email de confirmation a été envoyé à votre nouvelle adresse email',
      },
      { status: 200 }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[EMAIL CHANGE] Erreur:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

