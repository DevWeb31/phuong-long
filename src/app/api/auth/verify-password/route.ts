/**
 * API Route - Verify Password
 * 
 * Vérifie si le mot de passe fourni correspond au mot de passe de l'utilisateur
 * sans perturber la session actuelle
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAPIClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createAPIClient();
    // Utiliser getUser() au lieu de getSession() pour authentifier les données
    // getUser() contacte le serveur Supabase Auth pour vérifier l'authenticité
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Mot de passe requis' },
        { status: 400 }
      );
    }

    // Créer un client Supabase avec service_role pour vérifier le mot de passe
    // sans affecter la session de l'utilisateur
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('[VERIFY PASSWORD] Missing Supabase environment variables');
      return NextResponse.json(
        { success: false, error: 'Configuration serveur manquante' },
        { status: 500 }
      );
    }

    // Créer un client temporaire avec service_role pour vérifier le mot de passe
    // Ce client n'utilise pas les cookies, donc ne perturbe pas la session
    const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Vérifier le mot de passe en tentant une connexion
    // Cela ne perturbe pas la session car on utilise un client séparé sans cookies
    const { error: signInError } = await serviceClient.auth.signInWithPassword({
      email: user.email!,
      password: password,
    });

    if (signInError) {
      return NextResponse.json(
        { success: false, error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );

  } catch (error) {
    console.error('[VERIFY PASSWORD] Erreur:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

