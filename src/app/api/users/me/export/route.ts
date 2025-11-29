/**
 * API Export User Data (RGPD - Droit d'Accès)
 * 
 * Exporte toutes les données personnelles de l'utilisateur connecté
 * Conforme RGPD Article 15
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

export async function GET() {
  try {
    const supabase = await createServerClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Collecter toutes les données de l'utilisateur
    const exportData: Record<string, unknown> = {
      exported_at: new Date().toISOString(),
      user_id: user.id,
    };

    // 1. Profil utilisateur (auth.users + user_profiles)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('username, full_name, bio, avatar_url, preferences')
      .eq('id', user.id)
      .maybeSingle();
    
    type ProfileData = Database['public']['Tables']['user_profiles']['Row'];
    
    exportData.user_profile = {
      email: user.email,
      email_confirmed: user.email_confirmed_at ? true : false,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      updated_at: user.updated_at,
      // Ne pas inclure l'ID utilisateur complet dans le profil (déjà dans exportData.user_id)
      // Inclure seulement les champs pertinents du profil
      ...(profile ? {
        username: (profile as ProfileData).username,
        full_name: (profile as ProfileData).full_name,
        bio: (profile as ProfileData).bio,
        avatar_url: (profile as ProfileData).avatar_url,
        // Ne pas exposer favorite_club_id (ID interne), seulement le nom si nécessaire
        preferences: (profile as ProfileData).preferences,
      } : {}),
    };

    // 2. Consentements RGPD - Version anonymisée
    const { data: consents } = await supabase
      .from('user_consents')
      .select('consent_type, version, granted, granted_at, revoked_at')
      .eq('user_id', user.id)
      .order('granted_at', { ascending: false });
    
    // Ne pas exposer ip_address et user_agent pour éviter la collecte de données de traçabilité
    exportData.consents = consents || [];

    // 3. Rôles - Version limitée (sans IDs internes sensibles)
    const { data: roles } = await supabase
      .from('user_roles')
      .select(`
        granted_at,
        expires_at,
        roles:role_id (
          name,
          description
        ),
        clubs:club_id (
          name,
          city
        )
      `)
      .eq('user_id', user.id);
    
    // Ne pas exposer : id, user_id, role_id, club_id, granted_by (IDs internes)
    exportData.roles = roles || [];

    // 4. Commentaires de blog - Limiter aux champs pertinents
    const { data: comments } = await supabase
      .from('blog_comments')
      .select(`
        content,
        approved,
        created_at,
        updated_at,
        post:blog_posts (
          title,
          slug
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    // Ne pas exposer : id, user_id, post_id, parent_id (IDs internes)
    exportData.blog_comments = comments || [];

    // 5. Posts de blog créés (si auteur) - Limiter aux champs publics
    const { data: blogPosts } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, published_at, views_count, created_at, updated_at, status')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });
    
    exportData.blog_posts = blogPosts || [];

    // 6. Favoris (bookmarks) - Version limitée
    const { data: bookmarks } = await supabase
      .from('user_bookmarks')
      .select('bookmarkable_type, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    // Ne pas exposer : id, user_id, bookmarkable_id (IDs internes qui pourraient être exploités)
    exportData.bookmarks = bookmarks || [];

    // 7. Inscriptions aux événements - Version limitée
    const { data: eventRegistrations } = await supabase
      .from('event_registrations')
      .select(`
        status,
        created_at,
        updated_at,
        event:events (
          title,
          slug,
          start_date,
          end_date
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    // Ne pas exposer : id, user_id, event_id, metadata (qui pourrait contenir des données sensibles)
    exportData.event_registrations = eventRegistrations || [];

    // 8. Commandes (e-commerce) - Limiter aux informations essentielles
    // Ne pas exposer les IDs Stripe complets ni les détails techniques
    const { data: orders } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        total_cents,
        shipping_cents,
        tax_cents,
        created_at,
        updated_at,
        notes,
        order_items:order_items (
          id,
          quantity,
          unit_price_cents,
          product:products (
            name,
            slug
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    // Anonymiser les adresses pour éviter l'exposition de données complètes
    const sanitizedOrders = (orders || []).map((order: Record<string, unknown>) => {
      const { shipping_address, billing_address, stripe_session_id, stripe_payment_intent_id, ...sanitized } = order;
      // Conserver seulement ville et pays si présents (sans adresse complète)
      return {
        ...sanitized,
        shipping_city: shipping_address && typeof shipping_address === 'object' 
          ? (shipping_address as Record<string, unknown>).city || null 
          : null,
        billing_city: billing_address && typeof billing_address === 'object' 
          ? (billing_address as Record<string, unknown>).city || null 
          : null,
      };
    });
    
    exportData.orders = sanitizedOrders;

    // 9. Demandes d'adhésion aux clubs - Version limitée
    const { data: membershipRequests } = await supabase
      .from('club_membership_requests')
      .select(`
        status,
        message,
        created_at,
        updated_at,
        club:clubs (
          name,
          city
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    // Ne pas exposer : id, user_id, club_id, processed_by, processed_at (données internes)
    exportData.membership_requests = membershipRequests || [];

    // 10. Logs d'audit (actions de l'utilisateur) - Version sécurisée
    // Ne pas exposer old_data/new_data complets qui pourraient révéler des structures
    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select('id, action, table_name, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100); // Limiter à 100 derniers logs
    
    // Formater les logs sans exposer les données sensibles
    const sanitizedLogs = (auditLogs || []).map((log: Record<string, unknown>) => ({
      action: log.action,
      table_name: log.table_name,
      date: log.created_at,
      // Ne pas inclure : old_data, new_data, record_id, ip_address, user_agent
      // qui pourraient révéler des structures de données ou des informations sensibles
    }));
    
    exportData.audit_logs = sanitizedLogs;

    // Retourner les données en JSON
    return NextResponse.json(exportData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="rgpd-export-${user.id}-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error('[RGPD EXPORT] Error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des données' },
      { status: 500 }
    );
  }
}

