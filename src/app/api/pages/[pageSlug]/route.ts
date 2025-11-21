/**
 * Public Pages Content API Route
 * 
 * Récupération publique du contenu des pages statiques
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// GET - Récupérer le contenu d'une page (public)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pageSlug: string }> }
) {
  try {
    const supabase = await createServerClient();

    const { pageSlug } = await params;

    const { data, error } = await supabase
      .from('page_content')
      .select('section_key, content_type, content')
      .eq('page_slug', pageSlug)
      .order('display_order', { ascending: true });

    if (error) throw error;

    // Transformer en objet pour faciliter l'utilisation côté client
    const contentMap: Record<string, string> = {};
    data.forEach((item: { section_key: string; content: string | null }) => {
      contentMap[item.section_key] = item.content || '';
    });

    return NextResponse.json(contentMap);
  } catch (error) {
    console.error('Error fetching page content:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

