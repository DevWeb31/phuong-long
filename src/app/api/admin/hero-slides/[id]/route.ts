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
    
    console.log('Mise à jour hero slide:', { id, body });
    
    // @ts-ignore - Supabase update type incompatibility
    const { data: slide, error } = await supabase
      .from('hero_slides')
      .update(body)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating hero slide:', error);
      return NextResponse.json({ error: 'Failed to update hero slide' }, { status: 500 });
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
    
    const { error } = await supabase
      .from('hero_slides')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting hero slide:', error);
      return NextResponse.json({ error: 'Failed to delete hero slide' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

