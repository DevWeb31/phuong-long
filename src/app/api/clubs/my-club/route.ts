/**
 * API Route - Get User's Club Information
 * 
 * Récupère les informations du club associé à l'utilisateur
 * avec les événements à venir
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAPIClient } from '@/lib/supabase/server';

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

    // Récupérer le profil utilisateur pour obtenir le club favori
    const { data: profile, error: _profileError } = await supabase
      .from('user_profiles')
      .select('favorite_club_id')
      .eq('id', user.id)
      .single();

    type UserProfile = { favorite_club_id: string | null };
    const typedProfile = profile as UserProfile | null;

    let clubId: string | null = null;

    // Essayer d'abord avec favorite_club_id
    if (typedProfile?.favorite_club_id) {
      clubId = typedProfile.favorite_club_id;
    } else {
      // Sinon, chercher dans les demandes approuvées
      const { data: approvedRequest } = await supabase
        .from('club_membership_requests')
        .select('club_id')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .order('requested_at', { ascending: false })
        .limit(1)
        .single();

      type ApprovedRequest = { club_id: string };
      const typedApprovedRequest = approvedRequest as ApprovedRequest | null;

      if (typedApprovedRequest?.club_id) {
        clubId = typedApprovedRequest.club_id;
      }
    }

    if (!clubId) {
      return NextResponse.json({
        success: true,
        data: null, // Pas de club associé
      });
    }

    // Récupérer les informations du club
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', clubId)
      .eq('active', true)
      .single();

    if (clubError || !club) {
      return NextResponse.json(
        { success: false, error: 'Club introuvable' },
        { status: 404 }
      );
    }

    type Club = {
      id: string;
      name: string;
      slug: string;
      city: string;
      address: string | null;
      postal_code: string | null;
      phone: string | null;
      email: string | null;
      description: string | null;
      cover_image_url: string | null;
      social_media: Record<string, unknown> | null;
    };
    const typedClub = club as Club;

    // Récupérer les événements à venir du club (limité à 3)
    const now = new Date().toISOString();
    const { data: upcomingEvents, error: eventsError } = await supabase
      .from('events')
      .select('id, title, slug, description, event_type, start_date, end_date, location, cover_image_url')
      .eq('club_id', clubId)
      .eq('active', true)
      .gte('start_date', now)
      .order('start_date', { ascending: true })
      .limit(3);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
    }

    return NextResponse.json({
      success: true,
      data: {
        club: {
          id: typedClub.id,
          name: typedClub.name,
          slug: typedClub.slug,
          city: typedClub.city,
          address: typedClub.address,
          postal_code: typedClub.postal_code,
          phone: typedClub.phone,
          email: typedClub.email,
          description: typedClub.description,
          cover_image_url: typedClub.cover_image_url,
          social_media: typedClub.social_media || {},
        },
        upcomingEvents: upcomingEvents || [],
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

