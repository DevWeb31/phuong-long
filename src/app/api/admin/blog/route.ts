/**
 * Admin Blog API Routes
 * 
 * CRUD operations for blog posts
 * 
 * @version 1.0
 * @date 2025-11-05
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { checkAdminRole } from '@/lib/utils/check-admin-role';

// GET - List all blog posts
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

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Create new blog post
export async function POST(request: Request) {
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

    // Ajouter l'auteur
    const postData = {
      ...body,
      author_id: user.id,
    };

    // @ts-ignore - Supabase insert type incompatibility
    const { data, error } = await supabase.from('blog_posts').insert([postData]).select().single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

