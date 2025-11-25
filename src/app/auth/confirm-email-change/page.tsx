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
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function ConfirmEmailChangeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const token = searchParams.get('token');
    const success = searchParams.get('success');

    // Si on vient de la redirection après succès
    if (success === 'true') {
      // Forcer un refresh de la session pour récupérer le nouvel email
      const refreshSession = async () => {
        try {
          // Étape 1: Récupérer la session actuelle
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          
          if (currentSession?.refresh_token) {
            // Étape 2: Forcer un refresh de la session pour obtenir le nouvel email
            const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession({
              refresh_token: currentSession.refresh_token,
            });

            if (refreshError) {
              console.error('Erreur lors du refresh de la session:', refreshError);
              // Essayer avec getUser() comme fallback
              const { data: { user }, error: userError } = await supabase.auth.getUser();
              if (userError) {
                console.error('Erreur lors de la récupération de l\'utilisateur:', userError);
              } else if (user) {
                console.log('Email mis à jour via getUser():', user.email);
              }
            } else if (refreshedSession?.user) {
              console.log('✅ Session rafraîchie avec nouvel email:', refreshedSession.user.email);
            }
          } else {
            // Pas de refresh token, utiliser getUser() comme fallback
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) {
              console.error('Erreur lors de la récupération de l\'utilisateur:', userError);
            } else if (user) {
              console.log('Email mis à jour via getUser():', user.email);
            }
          }
          
          // Étape 3: Forcer un refresh du router pour mettre à jour l'UI
          router.refresh();
          
          // Étape 4: Attendre un peu puis rediriger vers la page account
          setTimeout(() => {
            setStatus('success');
            // Rediriger vers la page account avec un rechargement complet pour forcer la mise à jour
            setTimeout(() => {
              // Utiliser window.location.href pour forcer un rechargement complet de la page
              // Ajouter un paramètre pour indiquer que l'email a été mis à jour
              // Cela garantit que useAuth récupère la session mise à jour
              window.location.href = '/dashboard/account?emailUpdated=true';
            }, 800);
          }, 500);
        } catch (error) {
          console.error('Erreur lors du refresh:', error);
          setStatus('success');
          // Rediriger quand même après un délai
          setTimeout(() => {
            window.location.href = '/dashboard/account';
          }, 1000);
        }
      };
      
      refreshSession();
      return;
    }

    // Si on a un token, rediriger vers l'API pour le traiter
    // IMPORTANT: Ne rediriger qu'une seule fois pour éviter les boucles
    if (token) {
      // Utiliser le domaine de production si on est en production
      let baseUrl = typeof window !== 'undefined' 
        ? window.location.origin
        : 'http://localhost:3000';
      
      // En production, forcer l'utilisation du domaine personnalisé
      if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
        baseUrl = 'https://phuong-long-vo-dao.com';
      } else if (typeof window !== 'undefined' && !window.location.hostname.includes('phuong-long-vo-dao.com') && !window.location.hostname.includes('localhost')) {
        baseUrl = 'https://phuong-long-vo-dao.com';
      }
      
      // Rediriger vers l'API qui gère la confirmation
      // L'API vérifiera si l'utilisateur est connecté et redirigera vers /signin si nécessaire
      window.location.href = `${baseUrl}/api/auth/confirm-email-change?token=${token}`;
      return;
    }

    // Pas de token ni de succès = erreur
    setStatus('error');
    setErrorMessage('Lien de confirmation invalide. Token manquant.');
  }, [searchParams, router, supabase]);

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


