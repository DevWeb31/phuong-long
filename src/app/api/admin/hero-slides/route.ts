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
    
    console.log('Création hero slide:', body);
    
    // Validation basique
    if (!body.title || !body.youtube_video_id) {
      return NextResponse.json(
        { error: 'Title and youtube_video_id are required' },
        { status: 400 }
      );
    }
    
    // @ts-ignore - Supabase insert type incompatibility
    const { data: slide, error } = await supabase
      .from('hero_slides')
      .insert([body])
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

