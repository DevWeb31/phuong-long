/**
 * Developer Settings API Routes - Single Key
 * 
 * Routes pour gérer un paramètre développeur spécifique
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { checkDeveloperRole } from '@/lib/utils/check-admin-role';

export const runtime = 'nodejs';

// GET - Get a specific setting by key
export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { key } = await params;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const isDeveloper = await checkDeveloperRole(user.id);
    if (!isDeveloper) {
      return NextResponse.json({ error: 'Accès réservé aux développeurs' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('developer_settings')
      .select('*')
      .eq('key', decodeURIComponent(key))
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Paramètre non trouvé' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching developer setting:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Update a specific setting
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { key } = await params;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const isDeveloper = await checkDeveloperRole(user.id);
    if (!isDeveloper) {
      return NextResponse.json({ error: 'Accès réservé aux développeurs' }, { status: 403 });
    }

    const body = await request.json();
    const { value, label, description, category, type } = body;

    if (value === undefined) {
      return NextResponse.json({ error: 'value est requis' }, { status: 400 });
    }

    // Convertir la valeur selon le type
    let jsonValue: any;
    if (type === 'boolean') {
      jsonValue = typeof value === 'boolean' ? value : value === 'true' || value === true;
    } else if (type === 'number') {
      jsonValue = typeof value === 'number' ? value : parseFloat(value);
    } else if (type === 'json') {
      jsonValue = typeof value === 'string' ? JSON.parse(value) : value;
    } else {
      jsonValue = value;
    }

    const updateData: any = {
      value: jsonValue,
      updated_at: new Date().toISOString(),
    };

    if (label !== undefined) updateData.label = label;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (type !== undefined) updateData.type = type;

    const { data, error } = await supabase
      .from('developer_settings')
      .update(updateData)
      .eq('key', decodeURIComponent(key))
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Paramètre non trouvé' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating developer setting:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Delete a specific setting
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { key } = await params;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const isDeveloper = await checkDeveloperRole(user.id);
    if (!isDeveloper) {
      return NextResponse.json({ error: 'Accès réservé aux développeurs' }, { status: 403 });
    }

    const { error } = await supabase
      .from('developer_settings')
      .delete()
      .eq('key', decodeURIComponent(key));

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting developer setting:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
