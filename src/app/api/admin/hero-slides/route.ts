/**
 * Admin Hero Slides API Routes
 * 
 * CRUD pour la gestion des slides du carousel hero
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

function normalizeHeroSlideMedia(body: Record<string, any>) {
  const youtubeInput = typeof body.youtube_video_id === 'string' ? body.youtube_video_id.trim() : '';
  const imageInput = typeof body.image_url === 'string' ? body.image_url.trim() : '';

  const youtubeId = youtubeInput || null;
  const imageUrl = imageInput || null;

  const hasVideo = Boolean(youtubeId);
  const hasImage = Boolean(imageUrl);

  if ((hasVideo && hasImage) || (!hasVideo && !hasImage)) {
    return {
      error: 'Veuillez renseigner soit une vidéo YouTube, soit une image (mais pas les deux).',
    };
  }

  return {
    values: {
      youtube_video_id: youtubeId,
      image_url: imageUrl,
    },
  };
}

export const runtime = 'nodejs';

// GET - Liste tous les hero slides
export async function GET() {
  try {
    const supabase = await createServerClient();
    
    const { data: slides, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('display_order');
    
    if (error) {
      console.error('Error fetching hero slides:', error);
      return NextResponse.json({ error: 'Failed to fetch hero slides' }, { status: 500 });
    }
    
    return NextResponse.json(slides || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Créer un nouveau hero slide
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();
    const media = normalizeHeroSlideMedia(body);
    
    if ('error' in media) {
      return NextResponse.json({ error: media.error }, { status: 400 });
    }
    
    if (!body.title) {
      return NextResponse.json(
        { error: 'Le titre est obligatoire' },
        { status: 400 }
      );
    }
    
    const payload = {
      ...body,
      ...media.values,
    };

    // @ts-ignore - Supabase insert type incompatibility
    const { data: slide, error } = await supabase
      .from('hero_slides')
      // @ts-expect-error - hero_slides table not yet in database types
      .insert([payload])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating hero slide:', error);
      return NextResponse.json({ error: 'Failed to create hero slide' }, { status: 500 });
    }
    
    return NextResponse.json(slide);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

