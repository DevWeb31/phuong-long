/**
 * Cart Button Component
 * 
 * Bouton panier avec compteur dans le Header
 * 
 * @version 1.0
 * @date 2025-11-05 02:15
 */

'use client';

import Link from 'next/link';
import { useCart } from '@/lib/contexts/CartContext';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

export function CartButton() {
  const { itemsCount } = useCart();

  return (
    <Link
      href="/cart"
      className="relative p-2 text-gray-700 hover:text-primary transition-colors rounded-lg hover:bg-gray-100"
      title="Panier"
    >
      <ShoppingCartIcon className="w-6 h-6" />
      {itemsCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
          {itemsCount > 9 ? '9+' : itemsCount}
        </span>
      )}
    </Link>
  );
}

