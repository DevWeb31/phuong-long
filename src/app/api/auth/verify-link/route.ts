/**
 * Redirect endpoint utilisé dans les emails Supabase.
 * Permet d'exposer une URL sur notre domaine (évite les avertissements spam)
 * puis redirige vers l'endpoint officiel Supabase en injectant le bon redirect_to.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAppBaseUrl } from '@/lib/utils/get-app-base-url';

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  const type = searchParams.get('type') ?? 'signup';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.redirect(`${getAppBaseUrl()}/auth/confirm?error=supabase_url_missing`);
  }

  if (!token) {
    return NextResponse.redirect(`${getAppBaseUrl()}/auth/confirm?error=missing_token`);
  }

  const verifyUrl = new URL(`${supabaseUrl}/auth/v1/verify`);
  verifyUrl.searchParams.set('token', token);
  verifyUrl.searchParams.set('type', type);
  verifyUrl.searchParams.set('redirect_to', `${getAppBaseUrl()}/api/auth/verify`);

  return NextResponse.redirect(verifyUrl.toString());
}


