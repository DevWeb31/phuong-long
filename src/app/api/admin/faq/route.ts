/**
 * Admin FAQ API Routes
 * 
 * CRUD operations for FAQ items
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { checkAdminRole } from '@/lib/utils/check-admin-role';

export const runtime = 'nodejs';

// GET - List FAQ items (optionally filtered by club_id)
export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier les permissions (admin, moderator ou coach)
    const isAdmin = await checkAdminRole(user.id);
    
    // Si ce n'est pas un admin/moderator, vérifier si c'est un coach
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

    // Récupérer le paramètre club_id depuis l'URL
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('club_id');

    let query = supabase
      .from('faq')
      .select('*')
      .order('display_order', { ascending: true });

    // Si un coach, ne peut voir que les FAQ de son club
    if (isCoach && coachClubId) {
      query = query.eq('club_id', coachClubId);
    } else if (clubId) {
      // Si club_id est fourni, filtrer par club (ou général si null)
      if (clubId === 'general' || clubId === 'null') {
        query = query.is('club_id', null);
      } else {
        query = query.eq('club_id', clubId);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Create new FAQ item
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    
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

    const body = await request.json();
    const { question, answer, display_order = 0, club_id } = body;

    // Validation
    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question et réponse sont requises' },
        { status: 400 }
      );
    }

    // Validation de la longueur
    if (question.trim().length > 150) {
      return NextResponse.json(
        { error: 'La question ne peut pas dépasser 150 caractères' },
        { status: 400 }
      );
    }

    if (answer.trim().length > 500) {
      return NextResponse.json(
        { error: 'La réponse ne peut pas dépasser 500 caractères' },
        { status: 400 }
      );
    }

    // Si coach, vérifier qu'il ne peut créer que pour son club
    if (isCoach && coachClubId) {
      if (club_id !== coachClubId) {
        return NextResponse.json(
          { error: 'Vous ne pouvez créer des FAQ que pour votre club' },
          { status: 403 }
        );
      }
    }

    // Déterminer le club_id final
    const finalClubId = club_id === 'general' || club_id === null || club_id === '' ? null : club_id;

    // Vérifier la limite de 10 FAQ par onglet
    let countQuery = supabase
      .from('faq')
      .select('id', { count: 'exact', head: true });

    if (finalClubId === null) {
      countQuery = countQuery.is('club_id', null);
    } else {
      countQuery = countQuery.eq('club_id', finalClubId);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error counting FAQ:', countError);
      return NextResponse.json(
        { error: 'Erreur lors de la vérification' },
        { status: 500 }
      );
    }

    if (count !== null && count >= 10) {
      return NextResponse.json(
        { error: 'La limite de 10 FAQ par onglet est atteinte. Veuillez supprimer une FAQ existante avant d\'en ajouter une nouvelle.' },
        { status: 400 }
      );
    }

    const faqData = {
      question: question.trim(),
      answer: answer.trim(),
      display_order: display_order || 0,
      club_id: finalClubId,
    };

    const { data, error } = await supabase
      .from('faq')
      .insert([faqData] as never)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

