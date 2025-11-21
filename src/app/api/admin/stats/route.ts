/**
 * Admin Stats API Route
 * 
 * Retourne les statistiques du dashboard admin
 * 
 * @version 1.0
 * @date 2025-11-05
 */

import { NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import { checkAdminRole } from '@/lib/utils/check-admin-role';

export const runtime = 'nodejs';

// GET - Get dashboard statistics
export async function GET() {
  try {
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const isAdmin = await checkAdminRole(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Utiliser le client admin pour accéder à auth.users
    const adminSupabase = createAdminClient();

    // Récupérer tous les utilisateurs depuis auth.users
    const { data: authUsers, error: authError } = await adminSupabase.auth.admin.listUsers();

    if (authError) throw authError;

    // Filtrer les utilisateurs (exclure les développeurs)
    const userIds = authUsers.users.map((u: { id: string }) => u.id);
    
    // Récupérer les rôles de tous les utilisateurs pour filtrer les développeurs
    const { data: userRolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        roles!inner(name)
      `)
      .in('user_id', userIds);

    if (rolesError) throw rolesError;

    // Créer un set des IDs des utilisateurs avec le rôle developer
    const developerUserIds = new Set(
      (userRolesData || [])
        .filter((ur: any) => ur.roles?.name === 'developer')
        .map((ur: any) => ur.user_id)
    );

    // Compter les utilisateurs (exclure les développeurs)
    const usersCount = authUsers.users.filter(
      (u: { id: string }) => !developerUserIds.has(u.id)
    ).length;

    // Récupérer les autres statistiques
    const [clubsResult, eventsResult, blogPostsResult] = await Promise.all([
      supabase
        .from('clubs')
        .select('id', { count: 'exact', head: true })
        .eq('active', true),
      supabase
        .from('events')
        .select('id, start_date, end_date')
        .eq('active', true),
      supabase
        .from('blog_posts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published'),
    ]);

    if (eventsResult.error) throw eventsResult.error;

    // Catégoriser les événements
    const now = new Date();
    let upcomingCount = 0;
    let ongoingCount = 0;
    let pastCount = 0;

    (eventsResult.data || []).forEach((event: { start_date: string; end_date: string | null }) => {
      const startDate = new Date(event.start_date);
      // Si pas de date de fin, on utilise la date de début comme date de fin
      const endDate = event.end_date ? new Date(event.end_date) : startDate;

      if (startDate > now) {
        // Événement à venir
        upcomingCount++;
      } else if (startDate <= now && endDate >= now) {
        // Événement en cours (a commencé et pas encore terminé)
        ongoingCount++;
      } else {
        // Événement passé (date de fin < maintenant)
        pastCount++;
      }
    });

    return NextResponse.json({
      users: {
        total: usersCount,
      },
      clubs: {
        active: clubsResult.count || 0,
      },
      events: {
        upcoming: upcomingCount,
        ongoing: ongoingCount,
        past: pastCount,
      },
      blogPosts: {
        published: blogPostsResult.count || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

