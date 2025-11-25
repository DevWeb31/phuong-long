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
import { getAppBaseUrl } from '@/lib/utils/get-app-base-url';
import { sendEmailChangeConfirmation } from '@/lib/services/email';
import { randomBytes } from 'crypto';

// Schema de validation
const changeEmailSchema = z.object({
  newEmail: z.string().email('Email invalide'),
  confirmEmail: z.string().email('Email de confirmation invalide'),
}).refine((data) => data.newEmail === data.confirmEmail, {
  message: 'Les adresses email ne correspondent pas',
  path: ['confirmEmail'],
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
    const { newEmail, confirmEmail } = changeEmailSchema.parse(body);

    // Vérifier que les deux emails correspondent (double vérification côté serveur)
    if (newEmail.toLowerCase() !== confirmEmail.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Les adresses email ne correspondent pas' },
        { status: 400 }
      );
    }

    // Vérifier que la nouvelle adresse est différente
    if (currentUser.email?.toLowerCase() === newEmail.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'La nouvelle adresse email doit être différente de l\'actuelle' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // Vérifier qu'il n'y a pas déjà un token en attente pour cet utilisateur
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

    // Vérifier qu'il n'y a pas eu de changement d'email dans le dernier mois
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const { data: recentChanges } = await adminSupabase
      .from('email_change_tokens')
      .select('used_at')
      .eq('user_id', currentUser.id)
      .not('used_at', 'is', null)
      .gte('used_at', oneMonthAgo.toISOString())
      .order('used_at', { ascending: false })
      .limit(1);

    if (recentChanges && recentChanges.length > 0) {
      const lastChangeDate = new Date(recentChanges[0].used_at);
      const daysSinceLastChange = Math.ceil((Date.now() - lastChangeDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = 30 - daysSinceLastChange;
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Vous ne pouvez changer votre email qu'une fois par mois. Dernier changement il y a ${daysSinceLastChange} jour${daysSinceLastChange > 1 ? 's' : ''}. Réessayez dans ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}.` 
        },
        { status: 429 }
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

    const baseUrl = getAppBaseUrl();
    const confirmationUrl = `${baseUrl}/auth/confirm-email-change?token=${token}`;

    // Envoyer l'email de confirmation à la nouvelle adresse uniquement
    try {
      await sendEmailChangeConfirmation({
        to: newEmail,
        oldEmail: currentUser.email || '',
        newEmail,
        confirmationUrl,
        templateId: process.env.RESEND_EMAIL_CHANGE_TEMPLATE_ID,
        templateData: {
          oldEmail: currentUser.email || '',
          newEmail,
          confirmationUrl,
          expiryHours: 24,
        },
      });
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

