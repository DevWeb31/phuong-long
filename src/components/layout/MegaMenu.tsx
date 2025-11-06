/**
 * MegaMenu Component
 * 
 * Mega menu moderne avec glassmorphism et animations stagger
 * 
 * @version 1.0
 * @date 2025-11-05
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import {
  TrendingUp,
  Sparkles,
  Shield,
  Tag,
  ChevronRight,
  ShoppingBag,
  Shirt,
  Award,
  Target
} from 'lucide-react';

// Types pour les sections du mega menu
export interface MegaMenuSection {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  items: Array<{
    name: string;
    href: string;
    description?: string;
    icon?: React.ComponentType<{ className?: string }>;
    badge?: string;
    isNew?: boolean;
    isFeatured?: boolean;
  }>;
}

interface MegaMenuProps {
  sections: MegaMenuSection[];
  isOpen: boolean;
  onClose: () => void;
}

export function MegaMenu({ sections, isOpen, onClose }: MegaMenuProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      return;
    } else {
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted && !isOpen) return null;

  return (
    <div
      className={cn(
        'absolute left-0 right-0 top-full mt-2',
        'transition-all duration-300 ease-out',
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      )}
    >
      <div className="container mx-auto px-4">
        <div
          className={cn(
            'relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl',
            'border border-gray-200/80 dark:border-gray-700/80 rounded-2xl shadow-2xl',
            'overflow-hidden'
          )}
        >
          {/* Gradient overlay pour effet glassmorphism */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 dark:from-gray-800/50 via-transparent to-primary/5 pointer-events-none" />

          <div className="relative p-8">
            <div className={cn(
              'grid gap-8',
              sections.length === 2 ? 'grid-cols-2' : sections.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
            )}>
              {sections.map((section, sectionIdx) => {
                const SectionIcon = section.icon;
                
                return (
                  <div
                    key={section.title}
                    className="space-y-4"
                    style={{
                      animation: isOpen ? `slideInStagger 0.3s ease-out ${sectionIdx * 0.1}s both` : 'none'
                    }}
                  >
                    {/* Section Header */}
                    <div className="flex items-center gap-2 mb-4">
                      {SectionIcon && (
                        <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                          <SectionIcon className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <h3 className="font-semibold text-sm dark:text-gray-100">
                        {section.title}
                      </h3>
                    </div>

                    {/* Section Items */}
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const ItemIcon = item.icon;
                        
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                              'group flex items-start gap-3 p-3 rounded-xl',
                              'hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent',
                              'transition-all duration-200',
                              item.isFeatured && 'bg-gradient-to-r from-gold/10 dark:from-gold/20 to-transparent'
                            )}
                          >
                            {/* Icon */}
                            {ItemIcon && (
                              <div className={cn(
                                'mt-0.5 p-1.5 rounded-lg transition-all duration-200',
                                'bg-gray-100 dark:bg-gray-800 bg-gray-800 group-hover:bg-primary/10',
                                'group-hover:scale-110'
                              )}>
                                <ItemIcon className="w-4 h-4 text-gray-600 dark:text-gray-500 group-hover:text-primary transition-colors" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  'text-sm font-medium dark:text-gray-100',
                                  'group-hover:text-primary transition-colors'
                                )}>
                                  {item.name}
                                </span>
                                
                                {item.isNew && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-700 font-semibold rounded">
                                    <Sparkles className="w-3 h-3" />
                                    Nouveau
                                  </span>
                                )}
                                
                                {item.isFeatured && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gold/20 text-gold-dark font-semibold rounded">
                                    <Award className="w-3 h-3" />
                                    Premium
                                  </span>
                                )}

                                {item.badge && !item.isNew && !item.isFeatured && (
                                  <span className="px-1.5 py-0.5 bg-primary/10 text-primary font-medium rounded">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              
                              {item.description && (
                                <p className="text-xs dark:text-gray-500 mt-0.5 line-clamp-1">
                                  {item.description}
                                </p>
                              )}
                            </div>

                            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideInStagger {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// Configuration du mega menu boutique
export const shopMegaMenu: MegaMenuSection[] = [
  {
    title: 'Équipements',
    icon: ShoppingBag,
    items: [
      {
        name: 'Kimonos',
        href: '/shop?category=kimonos',
        description: 'Du débutant au confirmé',
        icon: Shirt,
        isFeatured: true,
      },
      {
        name: 'Protections',
        href: '/shop?category=protections',
        description: 'Sécurité optimale',
        icon: Shield,
      },
      {
        name: 'Armes',
        href: '/shop?category=armes',
        description: 'Bâtons, sabres...',
        icon: Target,
      },
      {
        name: 'Accessoires',
        href: '/shop?category=accessoires',
        description: 'Sacs, ceintures...',
        icon: Tag,
      },
    ],
  },
  {
    title: 'Collections',
    icon: Sparkles,
    items: [
      {
        name: 'Nouveautés',
        href: '/shop?filter=new',
        description: 'Derniers arrivages',
        icon: Sparkles,
        isNew: true,
      },
      {
        name: 'Promotions',
        href: '/shop?filter=promo',
        description: 'Jusqu\'à -30%',
        icon: Tag,
        badge: '-30%',
      },
      {
        name: 'Best-Sellers',
        href: '/shop?filter=bestsellers',
        description: 'Les plus populaires',
        icon: TrendingUp,
      },
      {
        name: 'Pack Débutant',
        href: '/shop/pack-debutant',
        description: 'Kit complet',
        icon: Award,
      },
    ],
  },
];

