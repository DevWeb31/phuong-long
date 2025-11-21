/**
 * Email Confirmation Page
 * 
 * Page pour gérer la confirmation d'email après inscription
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2, XCircle, Loader2, Mail, RefreshCw } from 'lucide-react';

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const confirmEmail = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      const supabase = createClient();

      // Vérifier d'abord si l'utilisateur est déjà connecté (lien peut avoir été déjà cliqué)
      const { data: existingSession } = await supabase.auth.getSession();
      if (existingSession?.session?.user) {
        // L'utilisateur est déjà confirmé et connecté
        setStatus('success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
        return;
      }

      // Vérifier que nous avons les paramètres nécessaires
      if (!token_hash || type !== 'email') {
        setStatus('error');
        setErrorMessage('Lien de confirmation invalide. Paramètres manquants.');
        return;
      }

      try {
        // Confirmer l'email avec le token_hash
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'email',
        });

        if (error) {
          // Vérifier si l'erreur est due à un token expiré ou déjà utilisé
          const errorMessage = error.message.toLowerCase();
          if (errorMessage.includes('expired') || 
              errorMessage.includes('already been used') ||
              errorMessage.includes('invalid') ||
              errorMessage.includes('token')) {
            setStatus('expired');
            setErrorMessage('Ce lien de confirmation a expiré ou a déjà été utilisé.');
          } else {
            setStatus('error');
            setErrorMessage(error.message || 'Une erreur est survenue lors de la confirmation.');
          }
          return;
        }

        // Succès
        if (data?.user) {
          setStatus('success');
          
          // Rediriger vers le dashboard après 3 secondes
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        } else {
          setStatus('error');
          setErrorMessage('Impossible de confirmer votre email. Veuillez réessayer.');
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage('Une erreur inattendue est survenue.');
      }
    };

    confirmEmail();
  }, [searchParams, router]);

  const handleResendEmail = async () => {
    // Récupérer l'email depuis l'URL ou demander à l'utilisateur
    const email = searchParams.get('email');
    
    if (!email) {
      setErrorMessage('Impossible de renvoyer l\'email. Veuillez réessayer depuis la page d\'inscription.');
      return;
    }

    const supabase = createClient();
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        setErrorMessage('Erreur lors de l\'envoi de l\'email: ' + error.message);
      } else {
        setStatus('loading');
        setErrorMessage('');
        // Afficher un message de succès
        alert('Un nouvel email de confirmation a été envoyé. Veuillez vérifier votre boîte de réception.');
      }
    } catch (err) {
      setErrorMessage('Une erreur est survenue lors de l\'envoi de l\'email.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="w-full max-w-md">
        <Card variant="bordered">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl">Confirmation en cours...</CardTitle>
            <CardDescription>
              Veuillez patienter pendant que nous confirmons votre email.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="w-full max-w-md">
        <Card variant="bordered">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle2 className="w-20 h-20 text-green-600" />
            </div>
            <CardTitle className="text-3xl">Email confirmé !</CardTitle>
            <CardDescription>
              Votre compte a été activé avec succès.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800 dark:text-green-200">
                Votre adresse email a été vérifiée. Vous pouvez maintenant accéder à toutes les fonctionnalités de votre compte.
              </p>
            </div>

            <Link href="/dashboard">
              <Button variant="primary" size="lg" className="w-full">
                Aller au tableau de bord
              </Button>
            </Link>

            <div className="mt-4 text-center text-sm dark:text-gray-500">
              Redirection automatique dans 3 secondes...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="w-full max-w-md">
        <Card variant="bordered">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <Mail className="w-20 h-20 text-orange-500" />
            </div>
            <CardTitle className="text-3xl">Lien expiré</CardTitle>
            <CardDescription>
              Ce lien de confirmation a expiré ou a déjà été utilisé.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                {errorMessage || 'Les liens de confirmation expirent après 24 heures pour des raisons de sécurité.'}
              </p>
            </div>

            <div className="space-y-4">
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full flex items-center justify-center gap-2"
                onClick={handleResendEmail}
              >
                <RefreshCw className="w-4 h-4" />
                Renvoyer l'email de confirmation
              </Button>

              <Link href="/signin">
                <Button variant="ghost" size="lg" className="w-full">
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Status: error
  return (
    <div className="w-full max-w-md">
      <Card variant="bordered">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <XCircle className="w-20 h-20 text-red-600" />
          </div>
          <CardTitle className="text-3xl">Erreur de confirmation</CardTitle>
          <CardDescription>
            Impossible de confirmer votre email.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800 dark:text-red-200">
              {errorMessage || 'Une erreur est survenue lors de la confirmation de votre email.'}
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              variant="primary" 
              size="lg" 
              className="w-full flex items-center justify-center gap-2"
              onClick={handleResendEmail}
            >
              <Mail className="w-4 h-4" />
              Renvoyer l'email de confirmation
            </Button>

            <Link href="/signup">
              <Button variant="ghost" size="lg" className="w-full">
                Réessayer l'inscription
              </Button>
            </Link>

            <Link href="/signin">
              <Button variant="ghost" size="lg" className="w-full">
                Retour à la connexion
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md">
        <Card variant="bordered">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl">Chargement...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  );
}

