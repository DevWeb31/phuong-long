/**
 * Logout Button Component
 * 
 * Bouton de déconnexion client
 * 
 * @version 1.0
 * @date 2025-11-05 00:15
 */

'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export function LogoutButton() {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors w-full"
    >
      <ArrowRightOnRectangleIcon className="w-5 h-5" />
      Déconnexion
    </button>
  );
}

