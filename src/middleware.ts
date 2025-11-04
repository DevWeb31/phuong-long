/**
 * Middleware - Protection des routes
 * 
 * Middleware Next.js pour protéger les routes authentifiées
 * 
 * @version 1.0
 * @date 2025-11-05 00:00
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protéger les routes /dashboard/*
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      // Rediriger vers signin avec redirect URL
      const url = request.nextUrl.clone();
      url.pathname = '/signin';
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protéger les routes /admin/* (admin uniquement)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/signin';
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // TODO: Vérifier le rôle admin
    // const { data: roles } = await supabase
    //   .from('user_roles')
    //   .select('role')
    //   .eq('user_id', user.id)
    //   .eq('role', 'admin')
    //   .single();
    // 
    // if (!roles) {
    //   return NextResponse.redirect(new URL('/dashboard', request.url));
    // }
  }

  // Rediriger les utilisateurs connectés qui vont sur /signin ou /signup
  if (user && (request.nextUrl.pathname === '/signin' || request.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/signin', '/signup'],
};

