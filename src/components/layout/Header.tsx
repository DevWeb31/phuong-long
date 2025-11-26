/**
 * Header Component
 * 
 * Header principal du site avec navigation avancée
 * Mega menus, recherche intégrée, animations sophistiquées
 * 
 * @version 3.0
 * @date 2025-11-05 (Ultra Modern UX)
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container } from '@/components/common';
import { UserMenu } from './UserMenu';
import { CartButton } from './CartButton';
// import { SearchBar } from './SearchBar'; // Désactivé
import { ThemeToggle } from './ThemeToggle';
import { MegaMenu, MegaMenuSection } from './MegaMenu';
import { cn } from '@/lib/utils/cn';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  Mail,
  History,
  Menu,
  X,
  ChevronDown,
  MapPin,
  Clock,
  Award,
  Phone,
  Sparkles,
  Shield
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  hasMegaMenu?: boolean;
}

const navigation: NavItem[] = [
  { name: 'Clubs', href: '/clubs', icon: Users, hasMegaMenu: true },
  { name: 'Événements', href: '/events', icon: Calendar },
  { name: 'Blog', href: '/blog', icon: BookOpen },
  { name: 'Contact', href: '/contact', icon: Mail },
  { name: 'Notre histoire', href: '/notre-histoire', icon: History },
];

interface Club {
  id: string;
  name: string;
  slug: string;
  city: string;
  postal_code: string | null;
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const pathname = usePathname();
  const megaMenuTimeout = useRef<NodeJS.Timeout>();


  // Charger les clubs depuis l'API
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch('/api/clubs');
        if (response.ok) {
          const data = await response.json();
          setClubs(data);
        }
      } catch (error) {
        console.error('Failed to fetch clubs:', error);
      }
    };
    
    fetchClubs();
  }, []);

  // Détection du scroll pour effet visuel
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveMegaMenu(null);
  }, [pathname]);

  // Empêcher le scroll du body quand le menu mobile est ouvert
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  // Gestion hover mega menu avec délai
  const handleMouseEnter = (itemName: string) => {
    if (megaMenuTimeout.current) {
      clearTimeout(megaMenuTimeout.current);
    }
    setHoveredItem(itemName);
    if (itemName === 'Clubs') {
      setActiveMegaMenu(itemName);
    }
  };

  const handleMouseLeave = () => {
    megaMenuTimeout.current = setTimeout(() => {
      setActiveMegaMenu(null);
      setHoveredItem(null);
    }, 150);
  };

  const getMegaMenuData = (itemName: string): MegaMenuSection[] => {
    if (itemName === 'Clubs') {
      // Construire dynamiquement le mega menu des clubs
      return [
        {
          title: 'Nos Clubs',
          icon: MapPin,
          items: clubs.map(club => ({
            name: club.name,
            href: `/clubs/${club.slug}`,
            description: `${club.postal_code || ''} - ${club.city}`.trim(),
            icon: MapPin,
          })),
        },
        {
          title: 'Informations',
          icon: Clock,
          items: [
            {
              name: 'Horaires & Tarifs',
              href: '/horaires-tarifs',
              description: 'Planning complet',
              icon: Clock,
            },
            {
              name: 'Cours Essai Gratuit',
              href: '/signup',
              description: 'Réservez maintenant',
              icon: Sparkles,
              isNew: true,
            },
            {
              name: 'Nos Professeurs',
              href: '/professeurs',
              description: 'Équipe pédagogique',
              icon: Award,
            },
            {
              name: 'Nous Contacter',
              href: '/contact',
              description: 'Questions ?',
              icon: Phone,
            },
          ],
        },
      ];
    }
    return [];
  };

  // Navigation filtrée
  const filteredNavigation = navigation;

  return (
    <>
      <header 
        className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled 
          ? 'bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 border-gray-800 shadow-lg' 
          : 'bg-white/60 dark:bg-gray-950/60 backdrop-blur-lg border-b border-gray-200/60 dark:border-gray-800/60 shadow-sm'
      )}
    >
      <Container>
        <div className={cn(
          'flex items-center justify-between transition-all duration-300',
          scrolled ? 'h-14' : 'h-16'
        )}>
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2.5 group relative z-10"
          >
            <picture>
              <source srcSet="/logo.webp" type="image/webp" />
              <img
                src="/logo.png"
                alt="Phuong Long Vo Dao"
                className={cn(
                  'w-auto object-contain transition-all duration-300 group-hover:scale-105',
                  scrolled ? 'h-9' : 'h-12'
                )}
              />
            </picture>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" onMouseLeave={handleMouseLeave}>
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const isHovered = hoveredItem === item.name;
              const hasMega = item.hasMegaMenu;
              
              return (
                <div
                  key={item.href}
                  className="relative group"
                  onMouseEnter={() => handleMouseEnter(item.name)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'group relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      active
                        ? 'text-primary bg-gradient-to-r from-primary/10 to-transparent'
                        : 'text-slate-900 dark:text-gray-300 hover:text-primary hover:bg-gradient-to-r hover:from-gray-50 dark:hover:from-gray-800 hover:to-transparent',
                      isHovered && 'bg-gradient-to-r from-gray-50 dark:from-gray-800 to-transparent'
                    )}
                  >
                    <Icon 
                      className={cn(
                        'w-4 h-4 transition-all duration-200',
                        active 
                          ? 'scale-110' 
                          : 'group-hover:scale-110',
                        isHovered && 'scale-110 text-primary'
                      )} 
                    />
                    <span>{item.name}</span>
                    
                    {hasMega && (
                      <ChevronDown 
                        className={cn(
                          'w-3 h-3 transition-transform duration-200',
                          isHovered && 'rotate-180'
                        )} 
                      />
                    )}
                    
                    {/* Indicateur actif avec effet shimmer */}
                    {active && (
                      <span 
                        className={cn(
                          'absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full',
                          'bg-gradient-to-r from-primary via-primary-dark to-primary',
                          'animate-pulse'
                        )} 
                      />
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Mega Menus */}
          {activeMegaMenu && (
            <div
              className="absolute left-0 right-0 top-full"
              onMouseEnter={() => {
                if (megaMenuTimeout.current) {
                  clearTimeout(megaMenuTimeout.current);
                }
              }}
              onMouseLeave={handleMouseLeave}
            >
              <MegaMenu
                sections={getMegaMenuData(activeMegaMenu)}
                isOpen={!!activeMegaMenu}
                onClose={() => setActiveMegaMenu(null)}
              />
            </div>
          )}

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <CartButton />
            <UserMenu />
          </div>

          {/* Tablet/Mobile Actions */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <CartButton />
            
            {/* Mobile menu button */}
            <button
              type="button"
              className={cn(
                'relative p-2 rounded-lg transition-all duration-200',
                mobileMenuOpen 
                  ? 'text-primary bg-primary/10' 
                  : 'text-slate-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 transition-transform rotate-90" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

      </Container>
      </header>

      {/* Mobile menu overlay - Outside header for proper z-index */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu - Slide from left - Outside header for proper z-index */}
      <div
        className={cn(
          'lg:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto',
          mobileMenuOpen 
            ? 'translate-x-0' 
            : '-translate-x-full'
        )}
      >
        {/* Mobile menu header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
          <h2 className="text-lg font-bold dark:text-gray-100">Menu</h2>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            aria-label="Fermer le menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4">
          <nav className="flex flex-col space-y-1">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <div key={item.href} className="relative">
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200',
                      active
                        ? 'bg-gradient-to-r from-primary/10 to-transparent text-primary'
                        : 'text-slate-900 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 dark:hover:from-gray-800 hover:to-transparent'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className={cn(
                      'p-1.5 rounded-lg transition-all',
                      active 
                        ? 'bg-primary/10' 
                        : 'bg-gray-100 dark:bg-gray-800'
                    )}>
                      <Icon className={cn(
                        'w-5 h-5 transition-transform',
                        active && 'scale-110 text-primary'
                      )} />
                    </div>
                    <span className="flex-1">{item.name}</span>
                    
                    {active && (
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-primary-dark animate-pulse shadow-lg shadow-primary/50" />
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>
          
          {/* Mobile Auth Actions */}
          <div className="mt-6 pt-6 border-t dark:border-gray-800 space-y-3">
            <Link
              href="/signin"
              className="block px-4 py-2.5 text-center font-medium dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/30 hover:scale-105 transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Shield className="w-4 h-4" />
              <span>Essai Gratuit</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

