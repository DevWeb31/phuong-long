/**
 * Sign In Page - Connexion
 * 
 * Page de connexion avec email/password
 * 
 * @version 1.0
 * @date 2025-11-04 23:40
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { XCircle, Loader2, Lock, Sparkles } from 'lucide-react';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const fromMaintenance = searchParams.get('from') === 'maintenance';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMaintenanceEnabled, setIsMaintenanceEnabled] = useState(false);
  
  const { signIn, signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  // Vérifier si le site est en maintenance
  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const response = await fetch('/api/site-settings/public');
        if (response.ok) {
          const data = await response.json();
          setIsMaintenanceEnabled(data['maintenance.enabled'] === true);
        }
      } catch (error) {
        console.error('Error checking maintenance status:', error);
      }
    };

    checkMaintenance();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        setError('Email ou mot de passe incorrect');
        setLoading(false);
        return;
      }

      // Si le site est en maintenance, vérifier le niveau de rôle
      if (isMaintenanceEnabled) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Vérifier les rôles de l'utilisateur
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role_id, roles(name, level)')
            .eq('user_id', user.id);

          const roles = (userRoles as any[]) || [];
          
          // Vérifier si l'utilisateur a un rôle de niveau <= 1 (admin/développeur)
          const hasLevel1OrLower = roles.some((ur: any) => {
            const roleLevel = ur.roles?.level;
            return roleLevel !== undefined && roleLevel <= 1;
          });

          // Vérifier si l'utilisateur a un rôle de niveau >= 2
          const hasLevel2OrHigher = roles.some((ur: any) => {
            const roleLevel = ur.roles?.level;
            return roleLevel !== undefined && roleLevel >= 2;
          });

          // Si l'utilisateur a un niveau >= 2, refuser la connexion
          if (hasLevel2OrHigher && !hasLevel1OrLower) {
            await signOut();
            setError('Connexion impossible pour l\'instant. Le site est en maintenance. Seuls les administrateurs peuvent accéder au site pendant cette période.');
            setLoading(false);
            return;
          }
        }
      }

      // Redirection vers la page d'accueil
      router.refresh();
      router.push('/');
    } catch (err) {
      setError('Une erreur est survenue');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Card variant="bordered">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Connexion</CardTitle>
          <CardDescription>
            Connectez-vous à votre compte Phuong Long Vo Dao
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium dark:text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-sm font-medium hover:text-primary-dark transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`rounded-lg p-4 text-sm flex items-start gap-2 ${
                error.includes('maintenance')
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
              }`}>
                <XCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  error.includes('maintenance')
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-red-600 dark:text-red-400'
                }`} />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Connexion...</>
              ) : (
                <><Lock className="w-4 h-4" /> Se connecter</>
              )}
            </Button>
          </form>

          {/* Divider et Sign Up Link - Masqués si on vient de la maintenance */}
          {!fromMaintenance && (
            <>
              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-500">Pas encore de compte ?</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <Link href="/signup">
                <Button variant="secondary" size="lg" className="w-full flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Créer un compte
                </Button>
              </Link>
            </>
          )}

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm dark:text-gray-500 hover:text-gray-900 transition-colors"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

