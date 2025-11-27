/**
 * API Route - Get User Role
 * 
 * Récupère le rôle de l'utilisateur et son club_id si coach
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAPIClient } from '@/lib/supabase/server';
import { checkCoachRole, getCoachClubId } from '@/lib/utils/check-admin-role';

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createAPIClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const isCoach = await checkCoachRole(user.id);
    const coachClubId = isCoach ? await getCoachClubId(user.id) : null;

    return NextResponse.json({
      success: true,
      isCoach,
      coachClubId,
    });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

