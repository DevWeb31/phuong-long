/**
 * Header Component
 * 
 * Header principal du site avec navigation
 * 
 * @version 1.0
 * @date 2025-11-04 20:45
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container } from '@/components/common';
import { UserMenu } from './UserMenu';
import { CartButton } from './CartButton';
import { cn } from '@/lib/utils/cn';

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'Clubs', href: '/clubs' },
  { name: 'Événements', href: '/events' },
  { name: 'Blog', href: '/blog' },
  { name: 'Boutique', href: '/shop' },
  { name: 'Contact', href: '/contact' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:shadow-primary/20 transition-all">
              <span className="text-white font-bold text-lg">PL</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors leading-tight">
                Phuong Long
              </div>
              <div className="text-xs font-semibold text-secondary uppercase tracking-wide leading-tight">
                Vo Dao
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA / Cart / User Menu */}
          <div className="hidden md:flex items-center gap-2">
            <CartButton />
            <UserMenu />
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Ouvrir menu</span>
            {mobileMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-4 py-3 rounded-lg text-base font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <Link
                href="/signin"
                className="block px-4 py-2 text-center text-base font-medium text-gray-700 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg text-base font-semibold hover:shadow-md transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-lg">🥋</span>
                <span>Essai Gratuit</span>
              </Link>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}

