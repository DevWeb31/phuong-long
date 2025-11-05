/**
 * Dashboard Layout
 * 
 * Layout pour l'espace utilisateur avec sidebar
 * 
 * @version 1.0
 * @date 2025-11-05 00:05
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/common';
import { LogoutButton } from '@/components/layout/LogoutButton';
import {
  HomeIcon,
  UserIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: {
    template: '%s | Dashboard - Phuong Long Vo Dao',
    default: 'Dashboard',
  },
};

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon },
  { name: 'Mon profil', href: '/dashboard/profile', icon: UserIcon },
  { name: 'Paramètres', href: '/dashboard/account', icon: Cog6ToothIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200">
        <Container>
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center group">
              <img
                src="/logo.png"
                alt="Phuong Long Vo Dao"
                className="h-12 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                ← Retour au site
              </Link>
            </nav>
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
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
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
          <Container className="max-w-6xl">
            {children}
          </Container>
        </main>
      </div>
    </div>
  );
}

