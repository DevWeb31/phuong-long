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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables in middleware');
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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

    // Vérifier le rôle admin ou developer (jointure avec table roles)
    try {
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', user.id);

      // Vérifier si l'utilisateur a le rôle admin OU developer
      const roles = (userRoles as any[])?.map(ur => ur.roles?.name).filter(Boolean) || [];
      const isAdminOrDeveloper = roles.includes('admin') || roles.includes('developer');

      // Si pas de rôle admin ou developer, rediriger vers le dashboard user
      if (roleError || !isAdminOrDeveloper) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        url.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(url);
      }

      // Admin access OK (log removed for clean console)
    } catch (error) {
      console.error('Error checking admin role:', error);
      // En cas d'erreur, on redirige par sécurité
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Protéger les routes /shop/* si la boutique est masquée
  if (request.nextUrl.pathname.startsWith('/shop')) {
    try {
      // Vérifier si l'utilisateur est développeur
      let isDeveloper = false;
      if (user) {
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role_id, roles!inner(name)')
          .eq('user_id', user.id);
        
        const roles = (userRoles as any[])?.map(ur => ur.roles?.name).filter(Boolean) || [];
        isDeveloper = roles.includes('developer');
      }

      // Si développeur, toujours autoriser l'accès
      if (!isDeveloper) {
        // Vérifier le paramètre shop.hidden
        const { data: shopSetting } = await supabase
          .from('developer_settings')
          .select('value')
          .eq('key', 'shop.hidden')
          .maybeSingle();

        // Si la boutique est masquée, rediriger vers la page d'accueil
        // Vérifier si value est true (booléen) ou "true" (string JSON)
        const isHidden = shopSetting?.value === true || shopSetting?.value === 'true' || shopSetting?.value === '"true"';
        
        if (isHidden) {
          const url = request.nextUrl.clone();
          url.pathname = '/';
          return NextResponse.redirect(url);
        }
      }
    } catch (error) {
      // En cas d'erreur (table n'existe pas encore, etc.), autoriser l'accès
      console.error('Error checking shop visibility:', error);
    }
  }

  // Rediriger les utilisateurs connectés qui vont sur /signin ou /signup
  if (user && (request.nextUrl.pathname === '/signin' || request.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/shop/:path*', '/signin', '/signup'],
};

