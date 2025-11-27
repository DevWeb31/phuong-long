/**
 * API Route - Update Club Membership Request Status
 * 
 * Accepte ou refuse une demande d'adhésion à un club
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAPIClient, createAdminClient } from '@/lib/supabase/server';
import { checkAdminRole, checkCoachRole, getCoachClubId } from '@/lib/utils/check-admin-role';
import { z } from 'zod';

const updateRequestSchema = z.object({
  action: z.enum(['approve', 'reject'], {
    errorMap: () => ({ message: 'Action doit être "approve" ou "reject"' }),
  }),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const supabase = await createAPIClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est admin ou coach
    const isAdmin = await checkAdminRole(user.id);
    const isCoach = await checkCoachRole(user.id);
    
    if (!isAdmin && !isCoach) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const { requestId } = await params;
    const body = await request.json();
    const { action } = updateRequestSchema.parse(body);

    // Récupérer la demande actuelle
    const { data: membershipRequest, error: fetchError } = await supabase
      .from('club_membership_requests')
      .select('id, user_id, club_id, status')
      .eq('id', requestId)
      .single();

    if (fetchError || !membershipRequest) {
      return NextResponse.json(
        { success: false, error: 'Demande introuvable' },
        { status: 404 }
      );
    }

    type MembershipRequest = { id: string; user_id: string; club_id: string; status: string };
    const typedRequest = membershipRequest as MembershipRequest;

    // Si coach, vérifier que la demande appartient à son club
    if (isCoach) {
      const coachClubId = await getCoachClubId(user.id);
      if (!coachClubId || coachClubId !== typedRequest.club_id) {
        return NextResponse.json(
          { success: false, error: 'Accès non autorisé à cette demande' },
          { status: 403 }
        );
      }
    }

    if (typedRequest.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Cette demande a déjà été traitée' },
        { status: 400 }
      );
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // Mettre à jour le statut de la demande (utiliser admin client pour contourner RLS)
    const adminSupabase = createAdminClient();
    const { data: updatedRequest, error: updateError } = await adminSupabase
      .from('club_membership_requests')
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      } as any)
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour de la demande' },
        { status: 500 }
      );
    }

    // Si la demande est approuvée, mettre à jour le favorite_club_id et créer le rôle student
    if (action === 'approve') {
      // 1. Mettre à jour le favorite_club_id dans user_profiles
      const { error: profileError } = await adminSupabase
        .from('user_profiles')
        .update({
          favorite_club_id: typedRequest.club_id,
        } as any)
        .eq('id', typedRequest.user_id);

      if (profileError) {
        console.error('Error updating user profile:', profileError);
      }

      // 2. Récupérer l'ID du rôle "student"
      const { data: studentRole, error: roleError } = await adminSupabase
        .from('roles')
        .select('id')
        .eq('name', 'student')
        .single();

      if (roleError || !studentRole) {
        console.error('Error fetching student role:', roleError);
        // Ne pas bloquer si le rôle student n'existe pas encore
      } else {
        // 3. Créer ou mettre à jour le rôle student avec le club_id
        const { error: userRoleError } = await adminSupabase
          .from('user_roles')
          .upsert({
            user_id: typedRequest.user_id,
            role_id: studentRole.id,
            club_id: typedRequest.club_id,
            granted_by: user.id,
          } as any, {
            onConflict: 'user_id,role_id,club_id',
          });

        if (userRoleError) {
          console.error('Error creating student role:', userRoleError);
          // Log l'erreur mais ne bloque pas la réponse
        } else {
          console.log('Student role created successfully for user:', typedRequest.user_id, 'club:', typedRequest.club_id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        requestId: updatedRequest.id,
        status: updatedRequest.status,
        message: action === 'approve' 
          ? 'Demande approuvée avec succès' 
          : 'Demande refusée',
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

