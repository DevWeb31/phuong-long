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

    // Vérifier le rôle admin (jointure avec table roles)
    try {
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', user.id)
        .maybeSingle();

      // Vérifier si l'utilisateur a le rôle admin
      const isAdmin = userRole && 
        (userRole as any).roles?.name === 'admin';

      // Si pas de rôle admin, rediriger vers le dashboard user
      if (roleError || !isAdmin) {
        console.warn(`User ${user.id} attempted to access admin panel without admin role`);
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        url.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(url);
      }

      console.log(`Admin access granted for user ${user.id}`);
    } catch (error) {
      console.error('Error checking admin role:', error);
      // En cas d'erreur, on redirige par sécurité
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
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

