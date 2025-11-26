/**
 * API Reset Password - Génère un lien de récupération et l'envoie via Resend.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { getAppBaseUrl } from '@/lib/utils/get-app-base-url';
import { sendPasswordResetEmail } from '@/lib/services/email';

const resetSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { email } = resetSchema.parse(payload);

    const adminSupabase = createAdminClient();
    const baseUrl = getAppBaseUrl();
    const redirectTo = `${baseUrl}/auth/reset-password`;

    const { data, error } = await adminSupabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      redirectTo,
    });

    if (error) {
      // Pour éviter l'énumération des emails on reste vague côté client.
      return NextResponse.json({ success: true });
    }

    const resetUrl = data?.properties?.action_link || redirectTo;

    await sendPasswordResetEmail({
      to: email,
      resetUrl,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Email invalide' },
        { status: 400 }
      );
    }

    console.error('[RESET PASSWORD] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}


