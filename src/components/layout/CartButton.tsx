/**
 * Cart Button Component
 * 
 * Bouton panier avec compteur dans le Header
 * Design amélioré avec animations fluides
 * 
 * @version 2.0
 * @date 2025-11-05 (Enhanced UX)
 */

'use client';

import Link from 'next/link';
import { useCart } from '@/lib/contexts/CartContext';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function CartButton() {
  const { itemsCount } = useCart();

  return (
    <Link
      href="/cart"
      className={cn(
        'group relative p-2 rounded-lg transition-all duration-200',
        'text-gray-700 dark:text-gray-300 text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800',
        itemsCount > 0 && 'hover:scale-105'
      )}
      title={itemsCount > 0 ? `${itemsCount} article(s) dans le panier` : 'Panier vide'}
      aria-label={`Panier: ${itemsCount} article(s)`}
    >
      <ShoppingCart className="w-6 h-6 transition-transform group-hover:scale-110" />
      
      {itemsCount > 0 && (
        <span 
          className={cn(
            'absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1',
            'bg-gradient-to-br from-primary to-primary-dark',
            'text-white text-xs font-bold rounded-full',
            'flex items-center justify-center',
            'shadow-md shadow-primary/30',
            'animate-in zoom-in-50 duration-200'
          )}
        >
          {itemsCount > 9 ? '9+' : itemsCount}
        </span>
      )}
    </Link>
  );
}

