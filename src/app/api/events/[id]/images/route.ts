/**
 * Event Images API Routes
 * 
 * CRUD operations for event images
 * 
 * @version 1.0
 * @date 2025-11-08
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { checkAdminRole } from '@/lib/utils/check-admin-role';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET - List all images for an event
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('event_images')
      .select('*')
      .eq('event_id', id)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('[ERROR] Error fetching event images:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Add new image to event
export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
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
    
    // Déterminer le prochain display_order
    // @ts-ignore - Supabase select type incompatibility
    const { data: existingImages } = await supabase
      .from('event_images')
      .select('display_order')
      .eq('event_id', id)
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = existingImages && existingImages.length > 0 
      ? existingImages[0].display_order + 1 
      : 0;

    const imageData = {
      event_id: id,
      image_url: body.image_url,
      caption: body.caption || null,
      alt_text: body.alt_text || null,
      is_cover: body.is_cover || false,
      display_order: body.display_order ?? nextOrder,
    };

    // @ts-ignore - Supabase insert type incompatibility
    const { data, error } = await supabase.from('event_images').insert([imageData]).select().single();

    if (error) {
      console.error('[ERROR] Supabase insert error:', error);
      return NextResponse.json({ 
        error: 'Erreur lors de l\'ajout', 
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[ERROR] Error adding image:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

