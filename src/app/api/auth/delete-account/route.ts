/**
 * Delete Account API Route
 * 
 * Endpoint pour supprimer définitivement le compte utilisateur
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAPIClient, createAdminClient } from '@/lib/supabase/server';

const deleteAccountSchema = z.object({
  confirmEmail: z.string().email('Email invalide'),
});

export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est connecté
    const supabase = await createAPIClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json(
        { success: false, error: 'Vous devez être connecté pour supprimer votre compte' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Email utilisateur introuvable' },
        { status: 400 }
      );
    }

    // Valider les données de la requête
    const payload = await request.json();
    const { confirmEmail } = deleteAccountSchema.parse(payload);

    // Vérifier que l'email de confirmation correspond à l'email de l'utilisateur
    if (confirmEmail.toLowerCase() !== userEmail.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'L\'email de confirmation ne correspond pas à votre adresse email' },
        { status: 400 }
      );
    }

    // Supprimer l'utilisateur via Admin API
    // Cela supprimera automatiquement toutes les données liées grâce aux CASCADE dans la base de données
    const adminSupabase = createAdminClient();
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('[DELETE ACCOUNT] Erreur suppression utilisateur:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression du compte' },
        { status: 500 }
      );
    }

    // Déconnecter l'utilisateur (même si le compte est supprimé, on nettoie la session)
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: 'Votre compte a été supprimé avec succès',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.flatten() },
        { status: 400 }
      );
    }

    console.error('[DELETE ACCOUNT] Erreur inattendue:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

