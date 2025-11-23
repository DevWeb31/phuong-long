/**
 * Confirm Email Change Page
 * 
 * Page pour confirmer le changement d'email avec le nouveau flux personnalisé
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

function ConfirmEmailChangeContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const token = searchParams.get('token');
    const success = searchParams.get('success');

    // Si on vient de la redirection après succès
    if (success === 'true') {
      setStatus('success');
      return;
    }

    // Si on a un token, rediriger vers l'API pour le traiter
    if (token) {
      const baseUrl = typeof window !== 'undefined' 
        ? (process.env.NEXT_PUBLIC_APP_URL || window.location.origin)
        : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      // Rediriger vers l'API qui gère la confirmation
      window.location.href = `${baseUrl}/api/auth/confirm-email-change?token=${token}`;
      return;
    }

    // Pas de token ni de succès = erreur
    setStatus('error');
    setErrorMessage('Lien de confirmation invalide. Token manquant.');
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <Card variant="bordered" className="w-full max-w-md">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-gray-600 dark:text-gray-400">Confirmation de votre changement d'email en cours...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <Card variant="bordered" className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle2 className="w-20 h-20 text-green-600" />
            </div>
            <CardTitle className="text-3xl">Email changé avec succès !</CardTitle>
            <CardDescription>
              Votre nouvelle adresse email a été confirmée et activée
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              Votre adresse email a été mise à jour avec succès. Vous pouvez maintenant vous connecter avec votre nouvelle adresse email.
            </p>
            <Link href="/dashboard/account">
              <Button variant="primary" size="lg" className="w-full">
                Retour aux paramètres
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card variant="bordered" className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <XCircle className="w-20 h-20 text-red-600" />
          </div>
          <CardTitle className="text-3xl">Erreur</CardTitle>
          <CardDescription>
            Impossible de confirmer le changement d'email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-center text-gray-600 dark:text-gray-400">
              {errorMessage || 'Une erreur est survenue lors de la confirmation.'}
            </p>
            <Link href="/dashboard/account">
              <Button variant="primary" size="lg" className="w-full">
                Retour aux paramètres
              </Button>
            </Link>
            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                ← Retour à l'accueil
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfirmEmailChangePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    }>
      <ConfirmEmailChangeContent />
    </Suspense>
  );
}


