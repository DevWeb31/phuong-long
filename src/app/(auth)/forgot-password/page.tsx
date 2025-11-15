/**
 * Forgot Password Page - Mot de passe oublié
 * 
 * Page de demande de réinitialisation du mot de passe
 * 
 * @version 1.0
 * @date 2025-11-04 23:50
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common';
import { useAuth } from '@/lib/hooks/useAuth';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { Mail, XCircle, Loader2, Lock } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: resetError } = await resetPassword(email);
      
      if (resetError) {
        setError('Une erreur est survenue. Vérifiez votre email.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError('Une erreur est survenue');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md">
        <Card variant="bordered">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <Mail className="w-20 h-20 text-green-600" />
            </div>
            <CardTitle className="text-3xl">Email envoyé !</CardTitle>
            <CardDescription>
              Vérifiez votre boîte de réception
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="bg-blue-50 border rounded-lg p-4 mb-6">
              <p className="text-sm">
                Si un compte existe avec l'email <strong>{email}</strong>, vous recevrez un lien 
                pour réinitialiser votre mot de passe dans quelques minutes.
              </p>
            </div>

            <div className="space-y-3">
              <Link href="/signin">
                <Button variant="primary" size="lg" className="w-full">
                  Retour à la connexion
                </Button>
              </Link>

              <button
                onClick={() => setSuccess(false)}
                className="w-full text-sm dark:text-gray-500 hover:text-gray-900 transition-colors"
              >
                Renvoyer un email
              </button>
            </div>

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

  return (
    <div className="w-full max-w-md">
      <Card variant="bordered">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Mot de passe oublié</CardTitle>
          <CardDescription>
            Entrez votre email pour recevoir un lien de réinitialisation
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
                <><Loader2 className="w-4 h-4 animate-spin" /> Envoi...</>
              ) : (
                <><Mail className="w-4 h-4" /> Envoyer le lien</>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-500">ou</span>
            </div>
          </div>

          {/* Back to Sign In */}
          <Link href="/signin">
            <Button variant="ghost" size="lg" className="w-full flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />
              Retour à la connexion
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

