/**
 * Email Change Status API Route
 * 
 * Endpoint pour récupérer le statut du changement d'email
 * Retourne la date du dernier changement et la date du prochain changement possible
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAPIClient, createAdminClient } from '@/lib/supabase/server';

export async function GET(_request: NextRequest) {
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
    const adminSupabase = createAdminClient();

    // Récupérer le dernier changement d'email utilisé
    const { data: lastChange } = await adminSupabase
      .from('email_change_tokens')
      .select('used_at')
      .eq('user_id', currentUser.id)
      .not('used_at', 'is', null)
      .order('used_at', { ascending: false })
      .limit(1)
      .single();

    if (!lastChange || !lastChange.used_at) {
      // Aucun changement d'email précédent, l'utilisateur peut changer maintenant
      return NextResponse.json({
        success: true,
        data: {
          canChange: true,
          lastChangeDate: null,
          nextChangeDate: null,
          daysRemaining: null,
        },
      });
    }

    const lastChangeDate = new Date(lastChange.used_at);
    const nextChangeDate = new Date(lastChangeDate);
    nextChangeDate.setDate(nextChangeDate.getDate() + 30); // 30 jours après le dernier changement

    const now = new Date();
    const canChange = now >= nextChangeDate;
    const daysRemaining = canChange ? 0 : Math.ceil((nextChangeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return NextResponse.json({
      success: true,
      data: {
        canChange,
        lastChangeDate: lastChangeDate.toISOString(),
        nextChangeDate: nextChangeDate.toISOString(),
        daysRemaining,
      },
    });

  } catch (error) {
    console.error('[EMAIL CHANGE STATUS] Erreur:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

