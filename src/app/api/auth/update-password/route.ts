/**
 * API Route - Update Password
 * 
 * Met à jour le mot de passe de l'utilisateur connecté
 * sans perturber la session actuelle
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAPIClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createAPIClient();
    // Utiliser getUser() au lieu de getSession() pour authentifier les données
    // getUser() contacte le serveur Supabase Auth pour vérifier l'authenticité
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('[UPDATE PASSWORD API] Not authenticated:', { userError: userError?.message, hasUser: !!user });
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { newPassword } = await request.json();

    if (!newPassword) {
      console.error('[UPDATE PASSWORD API] Missing newPassword');
      return NextResponse.json(
        { success: false, error: 'Nouveau mot de passe requis' },
        { status: 400 }
      );
    }

    // Validation basique du mot de passe
    if (newPassword.length < 8) {
      console.error('[UPDATE PASSWORD API] Password too short');
      return NextResponse.json(
        { success: false, error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    // Mettre à jour le mot de passe
    const { data, error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error('[UPDATE PASSWORD API] Erreur Supabase:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message || 'Erreur lors de la mise à jour du mot de passe' },
        { status: 400 }
      );
    }

    // Rafraîchir la session pour s'assurer qu'elle est à jour
    const { error: refreshError } = await supabase.auth.refreshSession();

    const responsePayload = refreshError
      ? { success: true, data, warning: 'Session refresh failed' }
      : { success: true, data };

    return NextResponse.json(responsePayload, { status: 200 });

  } catch (error) {
    console.error('[UPDATE PASSWORD API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

