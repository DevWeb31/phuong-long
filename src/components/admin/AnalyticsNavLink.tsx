/**
 * AnalyticsNavLink - Lien Analytics conditionnel dans le menu admin
 * 
 * Masque le lien Analytics si le paramètre analytics.hidden est activé
 * (sauf pour les développeurs)
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { createClient } from '@/lib/supabase/client';

export function AnalyticsNavLink() {
  const [isAnalyticsHidden, setIsAnalyticsHidden] = useState(false);
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAnalyticsVisibility() {
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

          // Vérifier le paramètre analytics.hidden
          const { data: settings } = await supabase
            .from('developer_settings')
            .select('value')
            .eq('key', 'analytics.hidden')
            .maybeSingle();

          // Vérifier si value est true (booléen) ou "true" (string JSON)
          const isHidden = settings?.value === true || settings?.value === 'true' || settings?.value === '"true"';
          setIsAnalyticsHidden(isHidden);

          // Si développeur, toujours afficher (même si masquée)
          if (isDev) {
            setLoading(false);
            return;
          }

          // Si pas développeur et analytics masquée, ne rien afficher
          if (isHidden && !isDev) {
            setLoading(false);
            return;
          }
        } else {
          // Pas d'utilisateur connecté, vérifier quand même le paramètre
          const { data: settings } = await supabase
            .from('developer_settings')
            .select('value')
            .eq('key', 'analytics.hidden')
            .maybeSingle();

          const isHidden = settings?.value === true || settings?.value === 'true' || settings?.value === '"true"';
          setIsAnalyticsHidden(isHidden);
        }
      } catch (error) {
        console.error('Error checking analytics visibility:', error);
        setIsAnalyticsHidden(false);
      } finally {
        setLoading(false);
      }
    }

    checkAnalyticsVisibility();
  }, []);

  // Si analytics est masquée et que l'utilisateur n'est pas développeur, ne rien afficher
  if (loading || (isAnalyticsHidden && !isDeveloper)) {
    return null;
  }

  // Si développeur et analytics masquée, afficher en rouge avec tooltip
  const isHiddenForDev = isAnalyticsHidden && isDeveloper;

  return (
    <div className="relative group">
      <Link
        href="/admin/analytics"
        className={`
          flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl 
          transition-all duration-300 group
          ${isHiddenForDev 
            ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300' 
            : 'dark:text-gray-300 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:shadow-md'
          }
        `}
        title={isHiddenForDev ? '⚠️ Analytics est actuellement masqué pour les autres utilisateurs' : undefined}
      >
        <ChartBarIcon className={`w-5 h-5 transition-transform ${isHiddenForDev ? 'text-red-600 dark:text-red-400' : ''} group-hover:scale-110`} />
        <span className={isHiddenForDev ? 'text-red-600 dark:text-red-400' : ''}>Analytics</span>
      </Link>
      
      {/* Tooltip personnalisé pour développeur */}
      {isHiddenForDev && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
          ⚠️ Analytics est masqué pour les autres utilisateurs
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-800"></div>
        </div>
      )}
    </div>
  );
}

