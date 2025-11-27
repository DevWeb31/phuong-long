/**
 * API Route - Get Club Membership Requests Statistics
 * 
 * Récupère le nombre de demandes d'adhésion en attente par club
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAPIClient } from '@/lib/supabase/server';
import { checkAdminRole } from '@/lib/utils/check-admin-role';

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

    // Vérifier que l'utilisateur est admin
    const isAdmin = await checkAdminRole(user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    // Récupérer les demandes d'adhésion en attente groupées par club
    const { data: requests, error: requestsError } = await supabase
      .from('club_membership_requests')
      .select('club_id, clubs(id, name, city, slug)')
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });

    if (requestsError) {
      // Si la table n'existe pas encore, retourner une réponse vide
      if (requestsError.code === '42P01' || requestsError.message?.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          data: {
            totalPending: 0,
            byClub: [],
          },
        });
      }
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des demandes' },
        { status: 500 }
      );
    }

    // Grouper par club et compter
    const clubStats = new Map<string, {
      clubId: string;
      clubName: string;
      clubCity: string;
      clubSlug: string;
      count: number;
    }>();

    type MembershipRequestWithClub = { 
      club_id: string; 
      clubs: { id: string; name: string; city: string; slug: string } | null 
    };
    const typedRequests = (requests || []) as MembershipRequestWithClub[];

    typedRequests.forEach((request) => {
      const club = request.clubs;
      if (club) {
        const key = request.club_id;
        if (clubStats.has(key)) {
          const existing = clubStats.get(key)!;
          existing.count += 1;
        } else {
          clubStats.set(key, {
            clubId: request.club_id,
            clubName: club.name,
            clubCity: club.city,
            clubSlug: club.slug,
            count: 1,
          });
        }
      }
    });

    // Convertir en tableau et trier par nombre de demandes (décroissant)
    const stats = Array.from(clubStats.values()).sort((a, b) => b.count - a.count);

    return NextResponse.json({
      success: true,
      data: {
        totalPending: requests?.length || 0,
        byClub: stats,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

