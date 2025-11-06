/**
 * User Menu Component
 * 
 * Menu utilisateur avec dropdown (avatar, profil, déconnexion)
 * Design amélioré avec animations fluides
 * 
 * @version 2.0
 * @date 2025-11-05 (Enhanced UX)
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const checkedRef = useRef(false);

  // Vérifier le rôle admin une seule fois
  useEffect(() => {
    if (!user || checkedRef.current) return;

    const checkAdmin = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('user_roles')
          .select('role_id, roles(name)')
          .eq('user_id', user.id)
          .maybeSingle();

        setIsAdmin(!!(data && (data as any).roles?.name === 'admin'));
        checkedRef.current = true;
      } catch {
        setIsAdmin(false);
        checkedRef.current = true;
      }
    };

    checkAdmin();
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/signin"
          className="text-sm font-medium dark:text-gray-300 hover:text-primary transition-colors"
        >
          Connexion
        </Link>
        <Link
          href="/signup"
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2',
            'bg-gradient-to-r from-primary to-primary-dark text-white',
            'rounded-lg text-sm font-semibold',
            'hover:shadow-lg hover:shadow-primary/30 hover:scale-105',
            'transition-all duration-200'
          )}
        >
          <span className="text-base">🥋</span>
          <span>Essai Gratuit</span>
        </Link>
      </div>
    );
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur';
  const userInitials = userName.substring(0, 2).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 p-1.5 rounded-lg transition-all duration-200',
          isOpen ? 'bg-gray-50 dark:bg-gray-900' : 'hover:bg-gray-50'
        )}
        aria-label="Menu utilisateur"
        aria-expanded={isOpen}
      >
        {/* Avatar */}
        <div className={cn(
          'w-10 h-10 bg-gradient-to-br from-primary to-primary-dark',
          'rounded-full flex items-center justify-center',
          'text-white font-semibold text-sm',
          'ring-2 ring-white shadow-md',
          'transition-transform duration-200',
          isOpen && 'scale-110'
        )}>
          {userInitials}
        </div>

        {/* User Info */}
        <div className="hidden md:block text-left pr-1">
          <div className="text-sm font-medium dark:text-gray-100">{userName}</div>
          <div className="text-xs dark:text-gray-500">Mon compte</div>
        </div>

        {/* Chevron */}
        <ChevronDown 
          className={cn(
            'hidden md:block w-4 h-4 text-gray-500 dark:text-gray-500 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown - Animation fluide */}
      {isOpen && (
        <>
          <div className={cn(
            'absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-xl border dark:border-gray-800 z-50',
            'animate-in fade-in slide-in-from-top-2 duration-200',
            'overflow-hidden'
          )}>
            {/* User Info in Dropdown */}
            <div className="px-4 py-3 bg-gradient-to-br from-gray-50 to-white border-b dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-semibold">
                  {userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold dark:text-gray-100 truncate">{userName}</div>
                  <div className="text-xs dark:text-gray-500 truncate">{user.email}</div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link
                href="/dashboard"
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 text-sm',
                  'hover:bg-primary/5 hover:text-primary transition-all duration-200',
                  'group'
                )}
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Tableau de bord</span>
              </Link>

              <Link
                href="/dashboard/profile"
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 text-sm',
                  'hover:bg-primary/5 hover:text-primary transition-all duration-200',
                  'group'
                )}
                onClick={() => setIsOpen(false)}
              >
                <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Mon profil</span>
              </Link>

              <Link
                href="/dashboard/account"
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 text-sm',
                  'hover:bg-primary/5 hover:text-primary transition-all duration-200',
                  'group'
                )}
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Paramètres</span>
              </Link>

              {/* Admin Panel - Conditionnel */}
              {isAdmin && (
                <>
                  <div className="border-t dark:border-gray-800 my-2" />
                  <Link
                    href="/admin"
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 text-sm font-semibold',
                      'text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5',
                      'transition-all duration-200 group'
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Panel Administrateur</span>
                  </Link>
                </>
              )}
            </div>

            {/* Separator */}
            <div className="border-t dark:border-gray-800" />

            {/* Logout */}
            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className={cn(
                'flex items-center gap-3 px-4 py-3 text-sm font-medium w-full',
                'text-red-600 hover:bg-red-50 transition-all duration-200',
                'group'
              )}
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Déconnexion</span>
            </button>
          </div>

          {/* Backdrop pour fermer au clic */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        </>
      )}
    </div>
  );
}

