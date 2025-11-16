/**
 * Maintenance Banner Component
 * 
 * Bandeau informatif affiché pour les admins/développeurs lorsque le site est en maintenance
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { createClient } from '@/lib/supabase/client';

export function MaintenanceBanner() {
  const [isMaintenanceEnabled, setIsMaintenanceEnabled] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        // Vérifier le statut de maintenance
        const response = await fetch('/api/site-settings/public');
        if (response.ok) {
          const data = await response.json();
          const maintenanceEnabled = data['maintenance.enabled'] === true;
          setIsMaintenanceEnabled(maintenanceEnabled);

          // Si la maintenance est activée, vérifier si l'utilisateur a accès
          if (maintenanceEnabled) {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
              // Vérifier si l'utilisateur a un rôle de niveau <= 1
              const { data: userRoles } = await supabase
                .from('user_roles')
                .select('role_id, roles(name, level)')
                .eq('user_id', user.id);

              const hasRoleLevel1 = (userRoles as any[])?.some((ur: any) => {
                const roleLevel = ur.roles?.level;
                return roleLevel !== undefined && roleLevel <= 1;
              }) || false;

              setHasAccess(hasRoleLevel1);
            } else {
              setHasAccess(false);
            }
          } else {
            setHasAccess(false);
          }
        }
      } catch (error) {
        console.error('Error checking maintenance status:', error);
      }
    };

    checkMaintenance();
    // Vérifier toutes les 30 secondes
    const interval = setInterval(checkMaintenance, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isMaintenanceEnabled || !hasAccess || !isVisible) {
    return null;
  }

  return (
    <div className="bg-yellow-500 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-100 px-4 py-3 shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm font-medium">
            Votre site est en maintenance. Vous pouvez y accéder car vous avez les droits d'administration.
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 p-1 rounded-md hover:bg-yellow-600 dark:hover:bg-yellow-700 transition-colors"
          aria-label="Fermer le bandeau"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

