/**
 * API Signup - Crée un utilisateur Supabase et envoie l'email via Resend.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { getAppBaseUrl } from '@/lib/utils/get-app-base-url';
import { sendSignupVerificationEmail } from '@/lib/services/email';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  fullName: z.string().trim().min(2).max(120).optional(),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { email, password, fullName } = signupSchema.parse(payload);

    const adminSupabase = createAdminClient();
    const baseUrl = getAppBaseUrl();
    const redirectTo = `${baseUrl}/api/auth/verify?email=${encodeURIComponent(email)}`;

    const { data, error } = await adminSupabase.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      data: fullName ? { full_name: fullName } : undefined,
      redirectTo,
    });

    if (error) {
      if (error.message?.toLowerCase().includes('already registered')) {
        return NextResponse.json(
          { success: false, error: 'Cet email est déjà utilisé' },
          { status: 400 }
        );
      }

      console.error('[SIGNUP] Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Impossible de créer le compte pour le moment' },
        { status: 500 }
      );
    }

    const confirmationUrl =
      data?.properties?.action_link || redirectTo;

    await sendSignupVerificationEmail({
      to: email,
      fullName,
      confirmationUrl,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.flatten() },
        { status: 400 }
      );
    }

    console.error('[SIGNUP] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}


