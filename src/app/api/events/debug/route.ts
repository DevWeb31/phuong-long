/**
 * Events Debug API Route
 * 
 * Endpoint de debug pour vérifier les événements
 * 
 * @version 1.0
 * @date 2025-11-06
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const supabase = await createServerClient();
    
    // Récupérer TOUS les événements (sans filtre)
    // @ts-ignore - Supabase select type incompatibility
    const { data: allEvents, error } = await supabase
      .from('events')
      .select('id, title, start_date, active, event_type')
      .order('start_date', { ascending: false });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const now = new Date().toISOString();
    const activeEvents = (allEvents as any[])?.filter((e: any) => e.active) || [];
    const upcomingEvents = (allEvents as any[])?.filter((e: any) => e.start_date >= now) || [];
    const activeAndUpcoming = (allEvents as any[])?.filter((e: any) => e.active && e.start_date >= now) || [];

    return NextResponse.json({
      total: (allEvents as any[])?.length || 0,
      active: activeEvents.length,
      upcoming: upcomingEvents.length,
      activeAndUpcoming: activeAndUpcoming.length,
      now: now,
      allEvents: (allEvents as any[]) || [],
      message: (allEvents as any[])?.length === 0 
        ? "Aucun événement dans la base de données. Créez-en un dans /admin/events"
        : activeAndUpcoming.length === 0
        ? "Des événements existent mais ne sont pas affichés car ils sont soit inactifs, soit passés"
        : "OK"
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

