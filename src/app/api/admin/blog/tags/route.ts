/**
 * Admin Blog Tags API Route
 * 
 * Récupère tous les tags uniques utilisés dans les articles de blog
 * 
 * @version 1.0
 * @date 2025-11-11
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { checkAdminRole } from '@/lib/utils/check-admin-role';

export const runtime = 'nodejs';

// GET - List all unique tags
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

    // Récupérer tous les articles avec leurs tags
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('tags')
      .not('tags', 'is', null);

    if (error) throw error;

    // Extraire tous les tags uniques
    const allTags = new Set<string>();
    (posts || []).forEach((post: { tags?: string[] }) => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => {
          if (tag && typeof tag === 'string') {
            allTags.add(tag);
          }
        });
      }
    });

    // Trier par ordre alphabétique
    const sortedTags = Array.from(allTags).sort();

    return NextResponse.json(sortedTags);
  } catch (error) {
    console.error('Error fetching blog tags:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

