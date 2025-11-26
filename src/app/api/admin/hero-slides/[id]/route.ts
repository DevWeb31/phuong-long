/**
 * Admin Single Hero Slide API Routes
 * 
 * PUT/DELETE pour un hero slide spécifique
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

const PUBLIC_STORAGE_PREFIX = '/storage/v1/object/public/';

function getStorageObjectInfo(url?: string | null) {
  if (!url) {
    return null;
  }
  const prefixIndex = url.indexOf(PUBLIC_STORAGE_PREFIX);
  if (prefixIndex === -1) {
    return null;
  }
  const pathWithBucket = url.substring(prefixIndex + PUBLIC_STORAGE_PREFIX.length);
  const [bucket, ...rest] = pathWithBucket.split('/');
  if (!bucket || rest.length === 0) {
    return null;
  }
  return {
    bucket,
    path: rest.join('/'),
  };
}

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

async function deleteStorageObject(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  url?: string | null,
) {
  const info = getStorageObjectInfo(url);
  if (!info) {
    return;
  }
  try {
    await supabase
      .storage
      .from(info.bucket)
      .remove([info.path]);
  } catch (error) {
    console.error('Error deleting storage object:', { error, url });
  }
}

export const runtime = 'nodejs';

// PUT - Mettre à jour un hero slide
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    const body = await request.json();
    const media = normalizeHeroSlideMedia(body);
    
    if ('error' in media) {
      return NextResponse.json({ error: media.error }, { status: 400 });
    }
    const { data: existingSlide } = await supabase
      .from('hero_slides')
      .select('image_url')
      .eq('id', id)
      .single();
    const previousImageUrl = (existingSlide as { image_url: string | null } | null)?.image_url ?? null;
    const payload = {
      ...body,
      ...media.values,
    };
    
    // @ts-ignore - Supabase update type incompatibility
    const { data: slide, error } = await supabase
      .from('hero_slides')
      // @ts-expect-error - hero_slides table not yet in database types
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating hero slide:', error);
      return NextResponse.json({ error: 'Failed to update hero slide' }, { status: 500 });
    }
    
    if (previousImageUrl && previousImageUrl !== payload.image_url) {
      await deleteStorageObject(supabase, previousImageUrl);
    }
    
    return NextResponse.json(slide);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Supprimer un hero slide
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    const { data: existingSlide } = await supabase
      .from('hero_slides')
      .select('image_url')
      .eq('id', id)
      .single();
    const previousImageUrl = (existingSlide as { image_url: string | null } | null)?.image_url ?? null;
    
    const { error } = await supabase
      .from('hero_slides')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting hero slide:', error);
      return NextResponse.json({ error: 'Failed to delete hero slide' }, { status: 500 });
    }
    
    if (previousImageUrl) {
      await deleteStorageObject(supabase, previousImageUrl);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

