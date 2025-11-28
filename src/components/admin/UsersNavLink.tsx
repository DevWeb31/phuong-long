/**
 * UsersNavLink - Lien Utilisateurs conditionnel dans le menu admin
 * 
 * Affiche le lien Utilisateurs pour les administrateurs, développeurs et coaches
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UsersIcon } from '@heroicons/react/24/outline';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';

export function UsersNavLink() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    async function checkUserAuthorization() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        // Vérifier si l'utilisateur est admin, développeur ou coach
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role_id, roles!inner(name)')
          .eq('user_id', user.id);

        if (rolesError) {
          console.error('Error fetching user roles:', rolesError);
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        const roles = (userRoles as any[])?.map(ur => ur.roles?.name) || [];
        const isAdminOrDeveloper = roles.includes('admin') || roles.includes('developer');
        const isCoach = roles.includes('coach');
        setIsAuthorized(isAdminOrDeveloper || isCoach);
      } catch (error) {
        console.error('Error checking user authorization:', error);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    }

    checkUserAuthorization();
  }, []);

  // Si non autorisé, ne rien afficher
  if (loading || !isAuthorized) {
    return null;
  }

  const isActive = pathname.startsWith('/admin/users');

  return (
    <Link
      href="/admin/users"
      className={cn(
        'flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 group',
        isActive
          ? 'bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 text-primary dark:text-primary-light shadow-md'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 dark:hover:from-primary/20 dark:hover:to-primary/10 hover:text-primary dark:hover:text-primary-light hover:shadow-md'
      )}
    >
      <UsersIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
      Utilisateurs
    </Link>
  );
}

