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
    console.log('[UPDATE PASSWORD API] Starting password update...');
    
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

    console.log('[UPDATE PASSWORD API] User authenticated:', { userId: user.id, email: user.email });

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

    console.log('[UPDATE PASSWORD API] Calling supabase.auth.updateUser...');
    
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

    console.log('[UPDATE PASSWORD API] Password updated successfully, refreshing session...');
    
    // Rafraîchir la session pour s'assurer qu'elle est à jour
    const { error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
      console.warn('[UPDATE PASSWORD API] Warning: Session refresh failed:', refreshError);
      // On continue quand même car le mot de passe a été mis à jour
    } else {
      console.log('[UPDATE PASSWORD API] Session refreshed successfully');
    }

    console.log('[UPDATE PASSWORD API] ✅ Password update completed successfully');
    
    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );

  } catch (error) {
    console.error('[UPDATE PASSWORD API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

