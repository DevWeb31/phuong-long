/**
 * API Route - Get Discord Invite Link
 * 
 * Récupère le lien d'invitation Discord global depuis les paramètres du site
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPublicSupabaseClient } from '@/lib/supabase/server';

export async function GET(_request: NextRequest) {
  try {
    const supabase = getPublicSupabaseClient();
    
    const { data: setting, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'discord.invite_link')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération du paramètre' },
        { status: 500 }
      );
    }

    type SiteSetting = { value: unknown };
    const typedSetting = setting as SiteSetting | null;
    const discordLink = typedSetting?.value ? String(typedSetting.value) : null;

    return NextResponse.json({
      success: true,
      data: {
        discordLink,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

