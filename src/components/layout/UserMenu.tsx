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

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  ShieldCheck,
  LayoutDashboard,
  Shield
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';

export function UserMenu() {
  const { user, signOut, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [forceShow, setForceShow] = useState(false);
  const [localUser, setLocalUser] = useState(user);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const checkedRef = useRef(false);
  // Créer le client Supabase une seule fois
  const supabase = useMemo(() => createClient(), []);

  // Synchroniser localUser avec user du hook
  useEffect(() => {
    setLocalUser(user);
  }, [user]);


  // Fallback : vérifier directement la session Supabase si le hook ne répond pas
  // Vérifier aussi si loading est false mais user est null (cas où le hook n'a pas propagé la session)
  useEffect(() => {
    // Vérifier la session si :
    // 1. On est en train de charger ET pas de user ET pas de localUser
    // 2. OU si le chargement est terminé mais qu'on n'a toujours pas de user ET pas de localUser
    if ((loading || (!loading && !user)) && !localUser) {
      const checkSession = async () => {
        try {
          // Essayer d'abord getSession (rapide)
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            setLocalUser(session.user);
          } else {
            // Si pas de session, essayer getUser() qui force une vérification serveur
            const { data: { user: serverUser } } = await supabase.auth.getUser();
            
            if (serverUser) {
              setLocalUser(serverUser);
            }
          }
        } catch (err) {
          // Ignorer les erreurs silencieusement
        }
      };
      checkSession();
    }
  }, [loading, user, localUser, supabase]);

  // Écouter directement les changements d'authentification Supabase comme fallback
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setLocalUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setLocalUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Timeout de sécurité : forcer l'affichage après 2 secondes même si loading est true
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        setForceShow(true);
      }, 2000);
      return () => clearTimeout(timeout);
    } else {
      setForceShow(false);
      return undefined;
    }
  }, [loading]);

  // Vérifier le rôle admin ou developer une seule fois
  useEffect(() => {
    const currentUser = localUser || user;
    if (!currentUser || checkedRef.current) return;

    const checkAdmin = async () => {
      try {
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role_id, roles(name)')
          .eq('user_id', currentUser.id);

        // Vérifier si l'utilisateur a le rôle admin OU developer
        const roles = (userRoles as any[])?.map(ur => ur.roles?.name).filter(Boolean) || [];
        setIsAdmin(roles.includes('admin') || roles.includes('developer'));
        checkedRef.current = true;
      } catch {
        setIsAdmin(false);
        checkedRef.current = true;
      }
    };

    checkAdmin();
  }, [localUser?.id, user?.id, supabase]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Pendant le chargement initial, afficher un placeholder discret pour éviter le flash
  // Mais seulement si on n'a pas forcé l'affichage
  if (loading && !forceShow) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  // Utiliser localUser comme fallback si user n'est pas disponible
  const currentUser = localUser || user;

  if (!currentUser) {
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
            'inline-flex items-center gap-2 px-4 py-2',
            'bg-gradient-to-r from-primary to-primary-dark text-white',
            'rounded-lg text-sm font-semibold',
            'hover:shadow-lg hover:shadow-primary/30 hover:scale-105',
            'transition-all duration-200'
          )}
        >
          <Shield className="w-4 h-4" />
          <span>Essai Gratuit</span>
        </Link>
      </div>
    );
  }

  const userName = currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Utilisateur';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 p-1.5 rounded-lg transition-all duration-200',
          isOpen ? 'bg-gray-50 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
        )}
        aria-label="Menu utilisateur"
        aria-expanded={isOpen}
      >
        {/* User Info */}
        <div className="hidden md:block text-left pr-1">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{userName}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Mon compte</div>
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
            <div className="px-4 py-3 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 border-b dark:border-gray-700">
              <div className="flex flex-col">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{userName}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link
                href="/dashboard/home"
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
                    target="_blank"
                    rel="noopener noreferrer"
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
              onClick={async () => {
                setIsOpen(false);
                const result = await signOut();
                if (result?.error) {
                  console.error('[UserMenu] Erreur logout', result.error);
                }
              }}
              className={cn(
                'flex items-center gap-3 px-4 py-3 text-sm font-medium w-full',
                'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200',
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

