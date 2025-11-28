/**
 * Admin FAQ Item API Routes
 * 
 * Update and delete operations for a specific FAQ item
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { checkAdminRole } from '@/lib/utils/check-admin-role';

export const runtime = 'nodejs';

// PUT - Update FAQ item
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { id } = await params;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier les permissions
    const isAdmin = await checkAdminRole(user.id);
    
    let isCoach = false;
    let coachClubId: string | null = null;
    
    if (!isAdmin) {
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role_id, club_id, roles!inner(name)')
        .eq('user_id', user.id);
      
      const roles = (userRoles as any[])?.map(ur => ur.roles?.name) || [];
      isCoach = roles.includes('coach');
      
      if (isCoach && userRoles && userRoles.length > 0) {
        coachClubId = (userRoles[0] as any).club_id;
      }
    }

    if (!isAdmin && !isCoach) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Récupérer la FAQ existante pour vérifier les permissions
    const { data: existingFAQ, error: fetchError } = await supabase
      .from('faq')
      .select('club_id')
      .eq('id', id)
      .single<{ club_id: string | null }>();

    if (fetchError || !existingFAQ) {
      return NextResponse.json({ error: 'FAQ non trouvée' }, { status: 404 });
    }

    // Si coach, vérifier qu'il peut modifier cette FAQ
    if (isCoach && coachClubId) {
      if (existingFAQ.club_id !== coachClubId) {
        return NextResponse.json(
          { error: 'Vous ne pouvez modifier que les FAQ de votre club' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { question, answer, display_order, club_id } = body;

    // Validation
    if (question !== undefined && !question.trim()) {
      return NextResponse.json(
        { error: 'La question ne peut pas être vide' },
        { status: 400 }
      );
    }

    if (question !== undefined && question.trim().length > 150) {
      return NextResponse.json(
        { error: 'La question ne peut pas dépasser 150 caractères' },
        { status: 400 }
      );
    }

    if (answer !== undefined && !answer.trim()) {
      return NextResponse.json(
        { error: 'La réponse ne peut pas être vide' },
        { status: 400 }
      );
    }

    if (answer !== undefined && answer.trim().length > 500) {
      return NextResponse.json(
        { error: 'La réponse ne peut pas dépasser 500 caractères' },
        { status: 400 }
      );
    }

    // Si coach, s'assurer qu'il ne change pas le club_id
    const updateData: {
      question?: string;
      answer?: string;
      display_order?: number;
      club_id?: string | null;
    } = {};
    if (question !== undefined) updateData.question = question.trim();
    if (answer !== undefined) updateData.answer = answer.trim();
    if (display_order !== undefined) updateData.display_order = display_order;
    
    // Seuls les admins/moderators peuvent changer le club_id
    if (isAdmin && club_id !== undefined) {
      updateData.club_id = club_id === 'general' || club_id === null || club_id === '' ? null : club_id;
    }

    const { data, error } = await supabase
      .from('faq')
      .update(updateData as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Delete FAQ item
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { id } = await params;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier les permissions
    const isAdmin = await checkAdminRole(user.id);
    
    let isCoach = false;
    let coachClubId: string | null = null;
    
    if (!isAdmin) {
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role_id, club_id, roles!inner(name)')
        .eq('user_id', user.id);
      
      const roles = (userRoles as any[])?.map(ur => ur.roles?.name) || [];
      isCoach = roles.includes('coach');
      
      if (isCoach && userRoles && userRoles.length > 0) {
        coachClubId = (userRoles[0] as any).club_id;
      }
    }

    if (!isAdmin && !isCoach) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Récupérer la FAQ existante pour vérifier les permissions
    const { data: existingFAQ, error: fetchError } = await supabase
      .from('faq')
      .select('club_id')
      .eq('id', id)
      .single<{ club_id: string | null }>();

    if (fetchError || !existingFAQ) {
      return NextResponse.json({ error: 'FAQ non trouvée' }, { status: 404 });
    }

    // Si coach, vérifier qu'il peut supprimer cette FAQ
    if (isCoach && coachClubId) {
      if (existingFAQ.club_id !== coachClubId) {
        return NextResponse.json(
          { error: 'Vous ne pouvez supprimer que les FAQ de votre club' },
          { status: 403 }
        );
      }
    }

    const { error } = await supabase
      .from('faq')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

