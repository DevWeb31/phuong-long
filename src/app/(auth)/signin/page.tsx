/**
 * Sign In Page - Connexion
 * 
 * Page de connexion avec email/password
 * 
 * @version 1.0
 * @date 2025-11-04 23:40
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common';
import { useAuth } from '@/lib/hooks/useAuth';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { XCircle, Loader2, Lock, Sparkles } from 'lucide-react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const router = useRouter();

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

      // Redirection vers dashboard avec refresh
      router.refresh();
      window.location.href = '/dashboard';
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
                  className="block w-full pl-10 pr-3 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                  className="block w-full pl-10 pr-3 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
              <div className="bg-red-50 border rounded-lg p-4 text-sm flex items-start gap-2">
                <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
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
            <Button variant="ghost" size="lg" className="w-full flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Créer un compte
            </Button>
          </Link>

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

