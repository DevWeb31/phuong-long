/**
 * Admin Site Settings API Routes
 * 
 * GET - List all site settings
 * POST - Create/Update site setting
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { checkAdminRole } from '@/lib/utils/check-admin-role';

export const runtime = 'nodejs';

// GET - List all site settings
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
      .from('site_settings')
      .select('*')
      .order('category', { ascending: true })
      .order('key', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Create/Update site setting
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
    const { key, value, label, description, category, type } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'key et value sont requis' }, { status: 400 });
    }

    // Convertir la valeur en JSONB selon le type
    let jsonbValue: unknown;
    if (type === 'boolean') {
      jsonbValue = value === true || value === 'true';
    } else if (type === 'number') {
      jsonbValue = typeof value === 'number' ? value : Number(value);
    } else if (type === 'string') {
      jsonbValue = String(value);
    } else {
      jsonbValue = typeof value === 'object' ? value : JSON.parse(JSON.stringify(value));
    }

    const updateData: Record<string, unknown> = {
      key,
      value: jsonbValue,
      description: description || null,
      category: category || 'general',
    };

    // Ajouter label et type seulement s'ils sont fournis (colonnes optionnelles)
    if (label !== undefined) {
      updateData.label = label;
    }
    if (type !== undefined) {
      updateData.type = type;
    }

    const { data, error } = await supabase
      .from('site_settings')
      .upsert(updateData as any, {
        onConflict: 'key',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error upserting site setting:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

