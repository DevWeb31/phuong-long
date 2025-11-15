/**
 * Event Image API Routes
 * 
 * Update/Delete operations for individual event images
 * 
 * @version 1.0
 * @date 2025-11-08
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { checkAdminRole } from '@/lib/utils/check-admin-role';

interface RouteContext {
  params: Promise<{ imageId: string }>;
}

// PATCH - Update image
export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const { imageId } = await context.params;
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const isAdmin = await checkAdminRole(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = await _request.json();

    // @ts-ignore - Supabase update type incompatibility
    const { data, error } = await supabase.from('event_images').update({
      image_url: body.image_url,
      caption: body.caption || null,
      alt_text: body.alt_text || null,
      is_cover: body.is_cover || false,
      display_order: body.display_order,
    }).eq('id', imageId).select().single();

    if (error) {
      console.error('[ERROR] Supabase update error:', error);
      return NextResponse.json({ 
        error: 'Erreur lors de la modification', 
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[ERROR] Error updating image:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Remove image
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { imageId } = await context.params;
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
      .from('event_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      console.error('[ERROR] Supabase delete error:', error);
      return NextResponse.json({ 
        error: 'Erreur lors de la suppression', 
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ERROR] Error deleting image:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

