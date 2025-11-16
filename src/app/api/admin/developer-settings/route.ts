/**
 * Developer Settings API Routes
 * 
 * Routes pour gérer les paramètres développeur (accès réservé aux développeurs)
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { checkDeveloperRole } from '@/lib/utils/check-admin-role';

export const runtime = 'nodejs';

// GET - List all developer settings
export async function GET() {
  try {
    const supabase = await createServerClient();
    
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
      .order('category', { ascending: true })
      .order('key', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching developer settings:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Create or update a developer setting
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const isDeveloper = await checkDeveloperRole(user.id);
    if (!isDeveloper) {
      return NextResponse.json({ error: 'Accès réservé aux développeurs' }, { status: 403 });
    }

    const body = await request.json();
    const { key, value, label, description, category, type } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'key et value sont requis' }, { status: 400 });
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

    const { data, error } = await supabase
      .from('developer_settings')
      .upsert({
        key,
        value: jsonValue,
        label: label || key,
        description: description || null,
        category: category || 'general',
        type: type || 'string',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'key',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error saving developer setting:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
