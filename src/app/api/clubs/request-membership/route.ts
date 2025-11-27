/**
 * API Route - Request Club Membership
 * 
 * Permet à un utilisateur de soumettre une demande d'adhésion à un club
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAPIClient } from '@/lib/supabase/server';
import { z } from 'zod';

const requestSchema = z.object({
  clubId: z.string().uuid('ID de club invalide'),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createAPIClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { clubId } = requestSchema.parse(body);

    // Vérifier que le club existe et est actif
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('id, name')
      .eq('id', clubId)
      .eq('active', true)
      .single();

    if (clubError || !club) {
      return NextResponse.json(
        { success: false, error: 'Club introuvable ou inactif' },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur a déjà une demande en cours pour ce club
    const { data: existingRequest } = await supabase
      .from('club_membership_requests')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('club_id', clubId)
      .single();

    type MembershipRequest = { id: string; status: string };
    const typedExistingRequest = existingRequest as MembershipRequest | null;

    if (typedExistingRequest) {
      if (typedExistingRequest.status === 'pending') {
        return NextResponse.json(
          { success: false, error: 'Vous avez déjà une demande en attente pour ce club' },
          { status: 400 }
        );
      } else if (typedExistingRequest.status === 'approved') {
        return NextResponse.json(
          { success: false, error: 'Vous êtes déjà membre de ce club' },
          { status: 400 }
        );
      }
      // Si rejected, on peut permettre une nouvelle demande
    }

    // Créer la demande d'adhésion
    const { data: membershipRequest, error: insertError } = await supabase
      .from('club_membership_requests')
      .insert({
        user_id: user.id,
        club_id: clubId,
        status: 'pending',
      } as any)
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création de la demande' },
        { status: 500 }
      );
    }

    type NewMembershipRequest = { id: string; status: string };
    const typedMembershipRequest = membershipRequest as NewMembershipRequest | null;
    type Club = { name: string };
    const typedClub = club as Club;

    return NextResponse.json({
      success: true,
      data: {
        requestId: typedMembershipRequest?.id || '',
        clubName: typedClub.name,
        status: typedMembershipRequest?.status || 'pending',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

