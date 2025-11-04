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
import {
  HomeIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  NewspaperIcon,
  UsersIcon,
  ShoppingBagIcon,
  Cog6ToothIcon,
  ChartBarIcon,
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
  { name: 'Événements', href: '/admin/events', icon: CalendarIcon },
  { name: 'Blog', href: '/admin/blog', icon: NewspaperIcon },
  { name: 'Utilisateurs', href: '/admin/users', icon: UsersIcon },
  { name: 'Boutique', href: '/admin/shop', icon: ShoppingBagIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Paramètres', href: '/admin/settings', icon: Cog6ToothIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <Container>
          <div className="flex items-center justify-between h-16">
            <Link href="/admin" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">PL</span>
              </div>
              <div>
                <div className="text-base font-bold text-gray-900 leading-tight">
                  Admin Panel
                </div>
                <div className="text-xs font-semibold text-secondary uppercase tracking-wide leading-tight">
                  Phuong Long
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                target="_blank"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                🌐 Voir le site
              </Link>
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                👤 Mon compte
              </Link>
            </div>
          </div>
        </Container>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 min-h-[calc(100vh-4rem)] bg-white border-r border-gray-200">
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}

            {/* Separator */}
            <div className="pt-4 mt-4 border-t border-gray-200">
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

