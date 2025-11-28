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
import { hasRoleLevel } from '@/lib/utils/check-admin-role';

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

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  // Vérifier le mode maintenance (sauf pour les routes admin, API, signin et maintenance)
  if (!request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.startsWith('/api') &&
      request.nextUrl.pathname !== '/maintenance' &&
      request.nextUrl.pathname !== '/signin') {
    try {
      const { data: maintenanceSetting } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'maintenance.enabled')
        .maybeSingle();

      const isMaintenanceEnabled = maintenanceSetting?.value === true || 
                                   maintenanceSetting?.value === 'true' || 
                                   maintenanceSetting?.value === '"true"';

      if (isMaintenanceEnabled) {
        // Vérifier si l'utilisateur a un rôle de niveau <= 1 (admin/développeur)
        let canAccess = false;
        if (user) {
          // Vérifier si l'utilisateur a un rôle de niveau <= 1
          canAccess = await hasRoleLevel(user.id, 1);
          
          // Si l'utilisateur n'a pas de rôle de niveau <= 1, vérifier s'il a un niveau >= 2
          if (!canAccess) {
            // Récupérer tous les rôles de l'utilisateur pour vérifier le niveau minimum
            const { data: userRoles } = await supabase
              .from('user_roles')
              .select('role_id, roles(name, level)')
              .eq('user_id', user.id);
            
            const roles = (userRoles as any[]) || [];
            const hasLevel2OrHigher = roles.some((ur: any) => {
              const roleLevel = ur.roles?.level;
              return roleLevel !== undefined && roleLevel >= 2;
            });
            
            // Si l'utilisateur a un niveau >= 2, refuser l'accès
            if (hasLevel2OrHigher) {
              const url = request.nextUrl.clone();
              url.pathname = '/maintenance';
              return NextResponse.redirect(url);
            }
          }
        }

        // Si l'utilisateur n'est pas connecté ou n'a pas de rôle de niveau <= 1, rediriger vers la maintenance
        if (!canAccess) {
          const url = request.nextUrl.clone();
          url.pathname = '/maintenance';
          return NextResponse.redirect(url);
        }
      }
    } catch (error) {
      // En cas d'erreur (table n'existe pas encore, etc.), continuer normalement
      console.error('Error checking maintenance mode:', error);
    }
  }

  // Protéger les routes /dashboard/*
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Vérifier que la session existe, n'est pas expirée, a un access_token, et qu'il n'y a pas d'erreur
    const now = Math.floor(Date.now() / 1000);
    const isSessionValid = session && 
                           session.expires_at && 
                           session.expires_at > now &&
                           session.access_token &&
                           !sessionError;
    // IMPORTANT: Vérifier explicitement que TOUS les critères sont remplis
    const isAuthenticated = !!(user && session && isSessionValid && !userError);
    
    // Si PAS authentifié, rediriger vers signin
    if (!isAuthenticated) {
      // Rediriger vers signin avec redirect URL
      const url = request.nextUrl.clone();
      url.pathname = '/signin';
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protéger les routes /admin/* (admin, developer ou coach)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Vérifier à la fois l'utilisateur ET la session valide
    if (!user || !session || userError) {
      const url = request.nextUrl.clone();
      url.pathname = '/signin';
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Vérifier le rôle admin, developer ou coach (jointure avec table roles)
    try {
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', user.id);

      // Vérifier si l'utilisateur a le rôle admin, developer ou coach
      const roles = (userRoles as any[])?.map(ur => ur.roles?.name).filter(Boolean) || [];
      const isAdminOrDeveloper = roles.includes('admin') || roles.includes('developer');
      const isCoach = roles.includes('coach');

      // Si l'utilisateur est coach, vérifier qu'il accède uniquement au dashboard, à la page Utilisateurs ou à la page FAQ
      if (isCoach && 
          !request.nextUrl.pathname.match(/^\/admin\/?$/) && 
          !request.nextUrl.pathname.match(/^\/admin\/users\/?$/) &&
          !request.nextUrl.pathname.match(/^\/admin\/faq\/?$/)) {
        // Les coaches ne peuvent accéder qu'à /admin (dashboard), /admin/users et /admin/faq
        const url = request.nextUrl.clone();
        url.pathname = '/admin';
        return NextResponse.redirect(url);
      }

      // Si pas de rôle admin, developer ou coach, rediriger vers le dashboard user
      if (roleError || (!isAdminOrDeveloper && !isCoach)) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        url.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(url);
      }

      // Access OK (admin, developer ou coach)
    } catch (error) {
      console.error('Error checking admin/coach role:', error);
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
  // Mais permettre /auth/confirm même si connecté (pour renvoyer l'email)
  // Vérifier à la fois l'utilisateur ET la session valide ET que la session n'est pas expirée
  if (request.nextUrl.pathname === '/signin' || request.nextUrl.pathname === '/signup') {
    // Vérifier que la session existe, n'est pas expirée, a un access_token, et qu'il n'y a pas d'erreur
    const now = Math.floor(Date.now() / 1000);
    const isSessionValid = session && 
                           session.expires_at && 
                           session.expires_at > now &&
                           session.access_token &&
                           !sessionError;
    // IMPORTANT: Vérifier explicitement que TOUS les critères sont remplis
    const isAuthenticated = !!(user && session && isSessionValid && !userError);
    
    // SEULEMENT si vraiment authentifié avec une session VALIDE, rediriger vers /dashboard
    // Si la session n'est pas valide, on laisse l'utilisateur accéder à la page de connexion
    // pour qu'il puisse se reconnecter
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      // Ne pas rediriger - laisser l'accès à la page de connexion
      // Continuer normalement sans redirection
    }
  }

  // Permettre /auth/confirm pour tous (nécessaire pour la confirmation d'email)
  if (request.nextUrl.pathname === '/auth/confirm') {
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/admin/:path*', 
    '/shop/:path*', 
    '/signin', 
    '/signup',
    '/((?!api|_next/static|_next/image|favicon.ico|logo.*|maintenance).*)',
  ],
};

