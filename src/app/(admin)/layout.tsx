/**
 * Admin Layout
 * 
 * Layout pour le panel d'administration avec sidebar avancée
 * 
 * @version 1.0
 * @date 2025-11-05 00:40
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/common';
import { LogoutButton } from '@/components/layout';
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
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: {
    template: '%s | Admin - Phuong Long Vo Dao',
    default: 'Admin Panel',
  },
};

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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 dark:from-gray-900 to-gray-100 dark:to-gray-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-40">
        <Container>
          <div className="flex items-center justify-between h-16">
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
                <div className="text-sm font-bold dark:text-gray-100 leading-tight">
                  Admin Panel
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                target="_blank"
                className="text-sm dark:text-gray-500 hover:text-gray-900 transition-colors"
              >
                🌐 Voir le site
              </Link>
              <Link
                href="/dashboard"
                className="text-sm dark:text-gray-500 hover:text-gray-900 transition-colors"
              >
                👤 Mon compte
              </Link>
            </div>
          </div>
        </Container>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 min-h-[calc(100vh-4rem)] bg-white/95 backdrop-blur-sm border-r shadow-sm">
          <nav className="p-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold dark:text-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:shadow-md transition-all duration-300 group"
                >
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {item.name}
                </Link>
              );
            })}

            {/* Boutique - Conditionnel selon paramètre développeur */}
            <ShopNavLink />

            {/* Analytics - Conditionnel selon paramètre développeur */}
            <AnalyticsNavLink />

            {/* Separator */}
            <div className="pt-4 mt-4 border-t dark:border-gray-800">
              <DeveloperNavLink />
            </div>

            {/* Separator */}
            <div className="pt-4 mt-4 border-t dark:border-gray-800">
              <LogoutButton />
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <Container className="max-w-7xl">
            {children}
          </Container>
        </main>
      </div>
    </div>
  );
}

