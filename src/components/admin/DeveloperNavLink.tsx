/**
 * DeveloperNavLink - Lien de navigation visible uniquement pour les développeurs
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CodeBracketIcon } from '@heroicons/react/24/outline';
import { createClient } from '@/lib/supabase/client';

export function DeveloperNavLink() {
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRole() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Vérifier si l'utilisateur a le rôle developer
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role_id, roles!inner(name)')
            .eq('user_id', user.id);

          const roles = (userRoles as any[])?.map(ur => ur.roles?.name) || [];
          setIsDeveloper(roles.includes('developer'));
        }
      } catch (error) {
        console.error('Error checking developer role:', error);
      } finally {
        setLoading(false);
      }
    }

    checkRole();
  }, []);

  if (loading || !isDeveloper) {
    return null;
  }

  return (
    <Link
      href="/admin/settings/developer"
      className="flex items-center gap-3 px-4 py-3 text-sm font-semibold dark:text-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-purple-500/5 hover:text-purple-600 dark:hover:text-purple-400 hover:shadow-md transition-all duration-300 group"
    >
      <CodeBracketIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
      Paramètres développeur
    </Link>
  );
}

