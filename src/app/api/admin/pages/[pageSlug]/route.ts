/**
 * Admin Page Content by Slug API Route
 * 
 * Récupérer le contenu d'une page spécifique
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { checkAdminRole } from '@/lib/utils/check-admin-role';

export const runtime = 'nodejs';

// GET - Récupérer le contenu d'une page spécifique
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pageSlug: string }> }
) {
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

    const { pageSlug } = await params;

    const { data, error } = await supabase
      .from('page_content')
      .select('*')
      .eq('page_slug', pageSlug)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching page content:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

