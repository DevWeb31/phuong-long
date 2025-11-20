/**
 * Admin Layout Client Component
 * 
 * Client component pour gérer l'état du menu mobile dans le layout admin
 * 
 * @version 1.0
 * @date 2025-11-05
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container } from '@/components/common';
import { LogoutButton } from '@/components/layout/LogoutButton';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { DeveloperNavLink } from '@/components/admin/DeveloperNavLink';
import { ShopNavLink } from '@/components/admin/ShopNavLink';
import { AnalyticsNavLink } from '@/components/admin/AnalyticsNavLink';
import {
  HomeIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  NewspaperIcon,
  UsersIcon,
  Cog6ToothIcon,
  AcademicCapIcon,
  VideoCameraIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils/cn';
import { createClient } from '@/lib/supabase/client';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Clubs', href: '/admin/clubs', icon: BuildingOfficeIcon },
  { name: 'Professeurs', href: '/admin/coaches', icon: AcademicCapIcon },
  { name: 'Carousel Hero', href: '/admin/hero-slides', icon: VideoCameraIcon },
  { name: 'Événements', href: '/admin/events', icon: CalendarIcon },
  { name: 'Blog', href: '/admin/blog', icon: NewspaperIcon },
  { name: 'Utilisateurs', href: '/admin/users', icon: UsersIcon },
  { name: 'Paramètres', href: '/admin/settings', icon: Cog6ToothIcon },
];

// Mapping des chemins vers les titres de page
const getPageTitle = (pathname: string): string => {
  const titleMap: Record<string, string> = {
    '/admin': 'Dashboard',
    '/admin/clubs': 'Clubs',
    '/admin/coaches': 'Professeurs',
    '/admin/hero-slides': 'Carousel Hero',
    '/admin/events': 'Événements',
    '/admin/blog': 'Blog',
    '/admin/users': 'Utilisateurs',
    '/admin/settings': 'Paramètres',
    '/admin/settings/developer': 'Paramètres Développeur',
    '/admin/shop/products': 'Produits',
    '/admin/shop/orders': 'Commandes',
    '/admin/analytics': 'Analytics',
  };

  // Chercher le titre exact d'abord
  if (titleMap[pathname]) {
    return titleMap[pathname];
  }

  // Sinon, chercher par préfixe (pour les sous-pages)
  for (const [path, title] of Object.entries(titleMap)) {
    if (pathname.startsWith(path) && path !== '/admin') {
      return title;
    }
  }

  // Par défaut
  return 'Admin Panel';
};

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [windowWidth, setWindowWidth] = useState(0);
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [isDeveloperLoading, setIsDeveloperLoading] = useState(true);
  const pathname = usePathname();

  // Vérifier si l'utilisateur est développeur
  useEffect(() => {
    async function checkDeveloperRole() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role_id, roles!inner(name)')
            .eq('user_id', user.id);

          const roles = (userRoles as any[])?.map(ur => ur.roles?.name) || [];
          setIsDeveloper(roles.includes('developer'));
        }
      } catch (error) {
        console.error('Error checking developer role:', error);
        setIsDeveloper(false);
      } finally {
        setIsDeveloperLoading(false);
      }
    }

    checkDeveloperRole();
  }, []);

  // Détecter la largeur de la fenêtre et ajuster la sidebar
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      // Si la largeur est inférieure à 1350px (tablette), fermer la sidebar
      // Si la largeur est inférieure à 1050px (mobile), fermer la sidebar
      if (width < 1350) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Initialiser la largeur au montage
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-b from-gray-50 dark:from-gray-900 to-gray-100 dark:to-gray-950 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm z-40 flex-shrink-0">
        <Container>
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {/* Menu button - visible si largeur < 1350px (tablette/mobile) */}
              {(windowWidth < 1350 || windowWidth === 0) && (
                <button
                  type="button"
                  onClick={() => {
                    if (windowWidth < 1350) {
                      setSidebarOpen(!sidebarOpen);
                    } else {
                      setMobileMenuOpen(!mobileMenuOpen);
                    }
                  }}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  aria-label="Toggle menu"
                >
                  {(windowWidth < 1350 ? sidebarOpen : mobileMenuOpen) ? (
                    <XMarkIcon className="h-6 w-6" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" />
                  )}
                </button>
              )}

              <Link href="/admin" className="flex items-center gap-3 group">
                <picture>
                  <source srcSet="/logo.webp" type="image/webp" />
                  <img
                    src="/logo.png"
                    alt="Phuong Long Vo Dao"
                    className="h-10 w-auto object-contain group-hover:scale-105 transition-transform"
                  />
                </picture>
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">
                    {getPageTitle(pathname)}
                  </div>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link
                href="/"
                target="_blank"
                className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                🌐 Voir le site
              </Link>
              <Link
                href="/dashboard"
                className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                👤 Mon compte
              </Link>
            </div>
          </div>
        </Container>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Overlay */}
        {((windowWidth < 1350 && sidebarOpen) || (windowWidth >= 1350 && mobileMenuOpen)) && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => {
              if (windowWidth < 1350) {
                setSidebarOpen(false);
              } else {
                setMobileMenuOpen(false);
              }
            }}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-64 h-[calc(100vh-4rem)] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-r border-gray-200 dark:border-gray-800 shadow-sm transform transition-transform duration-300 ease-in-out overflow-hidden flex-shrink-0',
            windowWidth >= 1350 && windowWidth > 0 ? 'lg:static lg:translate-x-0 lg:z-auto lg:h-full' : '',
            windowWidth < 1350 || windowWidth === 0
              ? sidebarOpen
                ? 'translate-x-0'
                : '-translate-x-full'
              : mobileMenuOpen
                ? 'translate-x-0'
                : '-translate-x-full lg:translate-x-0',
            'mt-16 lg:mt-0'
          )}
        >
          <nav className="p-6 space-y-2 h-full overflow-y-auto overflow-x-hidden">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (windowWidth < 1350) {
                      setSidebarOpen(false);
                    } else {
                      setMobileMenuOpen(false);
                    }
                  }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 group',
                    active
                      ? 'bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 text-primary dark:text-primary-light shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 dark:hover:from-primary/20 dark:hover:to-primary/10 hover:text-primary dark:hover:text-primary-light hover:shadow-md'
                  )}
                >
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {item.name}
                </Link>
              );
            })}

            {/* Boutique - Conditionnel selon paramètre développeur */}
            <div onClick={() => {
              if (windowWidth < 1300) {
                setSidebarOpen(false);
              } else {
                setMobileMenuOpen(false);
              }
            }}>
              <ShopNavLink />
            </div>

            {/* Analytics - Conditionnel selon paramètre développeur */}
            <div onClick={() => {
              if (windowWidth < 1300) {
                setSidebarOpen(false);
              } else {
                setMobileMenuOpen(false);
              }
            }}>
              <AnalyticsNavLink />
            </div>

            {/* Separator - Visible uniquement pour les développeurs */}
            {!isDeveloperLoading && isDeveloper && (
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
                <div onClick={() => {
                  if (windowWidth < 1300) {
                    setSidebarOpen(false);
                  } else {
                    setMobileMenuOpen(false);
                  }
                }}>
                  <DeveloperNavLink />
                </div>
              </div>
            )}

            {/* Separator - Visible uniquement pour les développeurs */}
            {!isDeveloperLoading && isDeveloper && (
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
                <div onClick={() => {
                  if (windowWidth < 1300) {
                    setSidebarOpen(false);
                  } else {
                    setMobileMenuOpen(false);
                  }
                }}>
                  <LogoutButton />
                </div>
              </div>
            )}

            {/* LogoutButton sans séparateur pour les non-développeurs */}
            {!isDeveloperLoading && !isDeveloper && (
              <div onClick={() => {
                if (windowWidth < 1300) {
                  setSidebarOpen(false);
                } else {
                  setMobileMenuOpen(false);
                }
              }}>
                <LogoutButton />
              </div>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-hidden py-6 lg:py-8 px-4 lg:px-6 flex flex-col">
          <div className="w-full h-full flex flex-col overflow-hidden">
            <Container size="full" padding={false} className="h-full flex flex-col overflow-hidden">
              <div className="h-full flex flex-col overflow-hidden">
                {children}
              </div>
            </Container>
          </div>
        </main>
      </div>
    </div>
  );
}

