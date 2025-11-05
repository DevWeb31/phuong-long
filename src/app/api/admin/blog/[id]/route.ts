/**
 * Admin Single Blog Post API Routes
 * 
 * Update and delete operations for a specific blog post
 * 
 * @version 1.0
 * @date 2025-11-05
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { checkAdminRole } from '@/lib/utils/check-admin-role';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PATCH - Update blog post
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // @ts-ignore - Supabase update type incompatibility
    const { data, error } = await supabase.from('blog_posts').update(body).eq('id', id).select().single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Delete blog post
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const isAdmin = await checkAdminRole(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

