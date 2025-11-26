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

  // Vérifier si la session est vraiment valide en vérifiant l'access_token
  const isSessionReallyValid = session && 
                                session.access_token && 
                                session.expires_at && 
                                session.expires_at > Math.floor(Date.now() / 1000) &&
                                !sessionError;

  // DEBUG: Log des informations d'authentification
  console.log('[MIDDLEWARE DEBUG]', {
    pathname: request.nextUrl.pathname,
    hasUser: !!user,
    hasSession: !!session,
    isSessionReallyValid,
    hasAccessToken: !!session?.access_token,
    userError: userError?.message || null,
    sessionError: sessionError?.message || null,
    userId: user?.id || null,
    sessionExpiresAt: session?.expires_at || null,
  });

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
    
    console.log('[MIDDLEWARE DEBUG] /dashboard check', {
      pathname: request.nextUrl.pathname,
      isAuthenticated,
      hasUser: !!user,
      hasSession: !!session,
      isSessionValid,
      hasAccessToken: !!session?.access_token,
      sessionExpiresAt: session?.expires_at || null,
      currentTime: now,
      timeUntilExpiry: session?.expires_at ? session.expires_at - now : null,
      hasError: !!userError,
      hasSessionError: !!sessionError,
      userError: userError?.message || null,
      sessionError: sessionError?.message || null,
    });
    
    // Si PAS authentifié, rediriger vers signin
    if (!isAuthenticated) {
      // Rediriger vers signin avec redirect URL
      const url = request.nextUrl.clone();
      url.pathname = '/signin';
      url.searchParams.set('redirect', request.nextUrl.pathname);
      console.log('[MIDDLEWARE DEBUG] ❌ NOT authenticated, redirecting to signin:', url.toString());
      console.log('[MIDDLEWARE DEBUG] Reason:', {
        noUser: !user,
        noSession: !session,
        sessionExpired: session && session.expires_at && session.expires_at <= now,
        noAccessToken: session && !session.access_token,
        hasUserError: !!userError,
        hasSessionError: !!sessionError,
      });
      return NextResponse.redirect(url);
    } else {
      console.log('[MIDDLEWARE DEBUG] ✅ Authenticated, allowing access to', request.nextUrl.pathname);
    }
  }

  // Protéger les routes /admin/* (admin uniquement)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Vérifier à la fois l'utilisateur ET la session valide
    if (!user || !session || userError) {
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
    
    console.log('[MIDDLEWARE DEBUG] /signin or /signup check', {
      pathname: request.nextUrl.pathname,
      isAuthenticated,
      hasUser: !!user,
      hasSession: !!session,
      isSessionValid,
      hasAccessToken: !!session?.access_token,
      sessionExpiresAt: session?.expires_at || null,
      currentTime: now,
      timeUntilExpiry: session?.expires_at ? session.expires_at - now : null,
      hasError: !!userError,
      hasSessionError: !!sessionError,
      userError: userError?.message || null,
      sessionError: sessionError?.message || null,
    });
    
    // SEULEMENT si vraiment authentifié avec une session VALIDE, rediriger vers /dashboard
    // Si la session n'est pas valide, on laisse l'utilisateur accéder à la page de connexion
    // pour qu'il puisse se reconnecter
    if (isAuthenticated) {
      console.log('[MIDDLEWARE DEBUG] ✅ User is authenticated with valid session, redirecting to /dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      console.log('[MIDDLEWARE DEBUG] ❌ User is NOT authenticated or session invalid, ALLOWING access to', request.nextUrl.pathname);
      console.log('[MIDDLEWARE DEBUG] Reason:', {
        noUser: !user,
        noSession: !session,
        sessionExpired: session && session.expires_at && session.expires_at <= now,
        noAccessToken: session && !session.access_token,
        hasUserError: !!userError,
        hasSessionError: !!sessionError,
      });
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

