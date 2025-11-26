/**
 * Admin Single Coach API Routes
 * 
 * PUT/DELETE pour un coach spécifique
 * 
 * @version 1.0
 * @date 2025-11-06
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// PUT - Mettre à jour un coach
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    const body = await request.json();
    
    // Exclure display_order, id, created_at, updated_at
    const { display_order, id: _id, created_at, updated_at, ...coachData } = body;
    
    // @ts-ignore - Supabase update type incompatibility
    const { data: coach, error } = await supabase.from('coaches').update(coachData).eq('id', id).select().single();
    
    if (error) {
      console.error('Error updating coach:', error);
      return NextResponse.json({ error: 'Failed to update coach' }, { status: 500 });
    }
    
    return NextResponse.json(coach);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Supprimer un coach
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    
    const { error } = await supabase
      .from('coaches')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting coach:', error);
      return NextResponse.json({ error: 'Failed to delete coach' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

