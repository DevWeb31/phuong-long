/**
 * User Menu Component
 * 
 * Menu utilisateur avec dropdown (avatar, profil, déconnexion)
 * 
 * @version 1.0
 * @date 2025-11-05 00:30
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useIsAdmin } from '@/lib/hooks/useIsAdmin';
import { 
  UserIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
          className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
        >
          Connexion
        </Link>
        <Link
          href="/signup"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg text-sm font-semibold hover:shadow-md hover:shadow-primary/20 transition-all"
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
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        {/* Avatar */}
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {userInitials}
        </div>

        {/* User Info */}
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900">{userName}</div>
          <div className="text-xs text-gray-500">Mon compte</div>
        </div>

        {/* Chevron */}
        <ChevronDownIcon 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info in Dropdown */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="text-sm font-medium text-gray-900">{userName}</div>
            <div className="text-xs text-gray-500 truncate">{user.email}</div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <UserIcon className="w-5 h-5" />
              Tableau de bord
            </Link>

            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <UserIcon className="w-5 h-5" />
              Mon profil
            </Link>

            <Link
              href="/dashboard/account"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Cog6ToothIcon className="w-5 h-5" />
              Paramètres
            </Link>

            {/* Admin Panel - Conditionnel */}
            {isAdmin && (
              <>
                <div className="border-t border-gray-200 my-2" />
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors group"
                  onClick={() => setIsOpen(false)}
                >
                  <ShieldCheckIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Panel Administrateur
                </Link>
              </>
            )}
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200 my-2" />

          {/* Logout */}
          <button
            onClick={() => {
              signOut();
              setIsOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}

