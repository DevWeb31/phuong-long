/**
 * ShopNavLink - Lien Boutique conditionnel dans le menu admin
 * 
 * Masque le lien Boutique si le paramètre shop.hidden est activé
 * (sauf pour les développeurs)
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { createClient } from '@/lib/supabase/client';

export function ShopNavLink() {
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

          // Vérifier le paramètre shop.hidden
          const { data: settings } = await supabase
            .from('developer_settings')
            .select('value')
            .eq('key', 'shop.hidden')
            .maybeSingle() as { data: { value: unknown } | null };

          // Vérifier si value est true (booléen) ou "true" (string JSON)
          const isHidden = (settings?.value === true || settings?.value === 'true' || settings?.value === '"true"') ?? false;
          setIsShopHidden(isHidden);

          // Si développeur, toujours afficher (même si masquée)
          if (isDev) {
            setLoading(false);
            return;
          }

          // Si pas développeur et boutique masquée, ne rien afficher
          if (isHidden && !isDev) {
            setLoading(false);
            return;
          }
        } else {
          // Pas d'utilisateur connecté, vérifier quand même le paramètre
          const { data: settings } = await supabase
            .from('developer_settings')
            .select('value')
            .eq('key', 'shop.hidden')
            .maybeSingle() as { data: { value: unknown } | null };

          const isHidden = (settings?.value === true || settings?.value === 'true' || settings?.value === '"true"') ?? false;
          setIsShopHidden(isHidden);
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
        href="/admin/shop"
        className={`
          flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl 
          transition-all duration-300 group
          ${isHiddenForDev 
            ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300' 
            : 'dark:text-gray-300 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:shadow-md'
          }
        `}
        title={isHiddenForDev ? '⚠️ La boutique est actuellement masquée pour les autres utilisateurs' : undefined}
      >
        <ShoppingBagIcon className={`w-5 h-5 transition-transform ${isHiddenForDev ? 'text-red-600 dark:text-red-400' : ''} group-hover:scale-110`} />
        <span className={isHiddenForDev ? 'text-red-600 dark:text-red-400' : ''}>Boutique</span>
      </Link>
      
      {/* Tooltip personnalisé pour développeur */}
      {isHiddenForDev && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
          ⚠️ La boutique est masquée pour les autres utilisateurs
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-800"></div>
        </div>
      )}
    </div>
  );
}

