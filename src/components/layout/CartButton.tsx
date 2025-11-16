/**
 * Cart Button Component
 * 
 * Bouton panier avec compteur dans le Header
 * Design amélioré avec animations fluides
 * Masqué si la boutique est masquée (sauf pour développeurs)
 * 
 * @version 2.1
 * @date 2025-11-05 (Enhanced UX)
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/contexts/CartContext';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { createClient } from '@/lib/supabase/client';

export function CartButton() {
  const { itemsCount } = useCart();
  const [isShopHidden, setIsShopHidden] = useState(false);
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkShopVisibility() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Vérifier si l'utilisateur est développeur
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role_id, roles!inner(name)')
            .eq('user_id', user.id);

          const roles = (userRoles as any[])?.map(ur => ur.roles?.name) || [];
          const isDev = roles.includes('developer');
          setIsDeveloper(isDev);
        }

        // Vérifier le paramètre shop.hidden
        const response = await fetch('/api/developer-settings/public');
        if (response.ok) {
          const settings = await response.json();
          const shopHiddenValue = settings['shop.hidden'];
          // Vérifier si value est true (booléen) ou "true" (string JSON)
          setIsShopHidden(shopHiddenValue === true || shopHiddenValue === 'true' || shopHiddenValue === '"true"');
        }
      } catch (error) {
        console.error('Error checking shop visibility:', error);
        setIsShopHidden(false);
      } finally {
        setLoading(false);
      }
    }

    checkShopVisibility();
  }, []);

  // Si la boutique est masquée et que l'utilisateur n'est pas développeur, ne rien afficher
  if (loading || (isShopHidden && !isDeveloper)) {
    return null;
  }

  // Si développeur et boutique masquée, afficher en rouge avec tooltip
  const isHiddenForDev = isShopHidden && isDeveloper;

  return (
    <div className="relative group">
      <Link
        href="/cart"
        className={cn(
          'group relative p-2 rounded-lg transition-all duration-200',
          isHiddenForDev
            ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300'
            : 'text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800',
          itemsCount > 0 && 'hover:scale-105'
        )}
        title={
          isHiddenForDev
            ? '⚠️ La boutique est actuellement masquée pour les autres utilisateurs'
            : itemsCount > 0
            ? `${itemsCount} article(s) dans le panier`
            : 'Panier vide'
        }
        aria-label={`Panier: ${itemsCount} article(s)`}
      >
        <ShoppingCart className={cn(
          'w-6 h-6 transition-transform group-hover:scale-110',
          isHiddenForDev && 'text-red-600 dark:text-red-400'
        )} />
        
        {itemsCount > 0 && (
          <span 
            className={cn(
              'absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1',
              isHiddenForDev
                ? 'bg-red-600 dark:bg-red-500'
                : 'bg-gradient-to-br from-primary to-primary-dark',
              'text-white text-xs font-bold rounded-full',
              'flex items-center justify-center',
              isHiddenForDev
                ? 'shadow-md shadow-red-500/30'
                : 'shadow-md shadow-primary/30',
              'animate-in zoom-in-50 duration-200'
            )}
          >
            {itemsCount > 9 ? '9+' : itemsCount}
          </span>
        )}
      </Link>
      
      {/* Tooltip personnalisé pour développeur */}
      {isHiddenForDev && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
          ⚠️ La boutique est masquée pour les autres utilisateurs
          <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
}

