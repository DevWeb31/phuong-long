/**
 * Admin Layout Client Component
 * 
 * Client component pour gérer l'état du menu mobile dans le layout admin
 * 
 * @version 1.0
 * @date 2025-11-05
 */

'use client';

import { useState } from 'react';
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

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 dark:from-gray-900 to-gray-100 dark:to-gray-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-40">
        <Container>
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>

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
                    Admin Panel
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

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed lg:static inset-y-0 left-0 z-50 w-64 min-h-[calc(100vh-4rem)] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-r border-gray-200 dark:border-gray-800 shadow-sm transform transition-transform duration-300 ease-in-out overflow-hidden',
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
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
                  onClick={() => setMobileMenuOpen(false)}
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
            <div onClick={() => setMobileMenuOpen(false)}>
              <ShopNavLink />
            </div>

            {/* Analytics - Conditionnel selon paramètre développeur */}
            <div onClick={() => setMobileMenuOpen(false)}>
              <AnalyticsNavLink />
            </div>

            {/* Separator */}
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
              <div onClick={() => setMobileMenuOpen(false)}>
                <DeveloperNavLink />
              </div>
            </div>

            {/* Separator */}
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
              <div onClick={() => setMobileMenuOpen(false)}>
                <LogoutButton />
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 py-6 lg:py-8 px-4 lg:px-6">
          <Container className="max-w-full" padding={false}>
            {children}
          </Container>
        </main>
      </div>
    </div>
  );
}

