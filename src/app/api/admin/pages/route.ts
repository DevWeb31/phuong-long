/**
 * Admin Pages Content API Route
 * 
 * Gestion du contenu des pages statiques (Accueil, Contact, Notre Histoire)
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { checkAdminRole } from '@/lib/utils/check-admin-role';

export const runtime = 'nodejs';

// GET - Récupérer le contenu d'une page ou toutes les pages
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const pageSlug = searchParams.get('page_slug');

    let query = supabase
      .from('page_content')
      .select('*')
      .order('display_order', { ascending: true });

    if (pageSlug) {
      query = query.eq('page_slug', pageSlug);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching page content:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour le contenu d'une page
export async function PUT(request: Request) {
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

    const body = await request.json();
    const { page_slug, section_key, content, content_type } = body;

    if (!page_slug || !section_key || content === undefined) {
      return NextResponse.json(
        { error: 'page_slug, section_key et content sont requis' },
        { status: 400 }
      );
    }

    // Si content_type n'est pas fourni, récupérer celui existant
    let finalContentType = content_type;
    if (!finalContentType) {
      const { data: existing } = await supabase
        .from('page_content')
        .select('content_type')
        .eq('page_slug', page_slug)
        .eq('section_key', section_key)
        .single();
      
      if (existing) {
        finalContentType = (existing as { content_type: 'text' | 'html' | 'json' }).content_type;
      } else {
        // Par défaut, utiliser 'text' si c'est une nouvelle section
        finalContentType = 'text';
      }
    }

    const { data, error } = await supabase
      .from('page_content')
      .upsert({
        page_slug,
        section_key,
        content,
        content_type: finalContentType,
        updated_at: new Date().toISOString(),
      } as any, {
        onConflict: 'page_slug,section_key',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating page content:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

