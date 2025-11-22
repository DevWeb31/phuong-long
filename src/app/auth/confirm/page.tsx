/**
 * Email Confirmation Page
 * 
 * Page pour gérer la confirmation d'email après inscription
 * Accessible via /auth/confirm
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
      const code = searchParams.get('code');
      const isEmailChange = type === 'email_change';

      const supabase = createClient();

      // Vérifier d'abord si l'utilisateur est déjà connecté (lien peut avoir été déjà cliqué)
      const { data: existingSession } = await supabase.auth.getSession();
      if (existingSession?.session?.user) {
        // L'utilisateur est déjà confirmé et connecté
        setStatus('success');
        setTimeout(() => {
          router.push(isEmailChange ? '/dashboard/account' : '/dashboard');
        }, 3000);
        return;
      }

      // Gérer le format avec code (PKCE flow)
      // Supabase SSR gère automatiquement l'échange du code via les cookies
      // On doit juste attendre que le code soit traité et vérifier la session
      if (code) {
        try {
          // Attendre un peu pour que Supabase traite le code via les cookies SSR
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Vérifier la session après le traitement du code
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            setStatus('error');
            setErrorMessage('Erreur lors de la confirmation : ' + sessionError.message);
            return;
          }

          if (sessionData?.session?.user) {
            setStatus('success');
            setTimeout(() => {
              router.push(isEmailChange ? '/dashboard/account' : '/dashboard');
            }, 3000);
          } else {
            // Si pas de session après 1 seconde, réessayer après un autre délai
            await new Promise(resolve => setTimeout(resolve, 1500));
            const { data: retrySession } = await supabase.auth.getSession();
            
            if (retrySession?.session?.user) {
              setStatus('success');
              setTimeout(() => {
                router.push(isEmailChange ? '/dashboard/account' : '/dashboard');
              }, 3000);
            } else {
              setStatus('error');
              setErrorMessage('Impossible de confirmer votre email. Le code est peut-être invalide ou expiré.');
            }
          }
          return;
        } catch (err) {
          console.error('Error confirming email with code:', err);
          setStatus('error');
          setErrorMessage('Une erreur inattendue est survenue lors de la confirmation.');
          return;
        }
      }

      // Gérer le format avec token_hash (ancien format)
      // Accepter les types 'email' (confirmation inscription) et 'email_change' (changement email)
      if (!token_hash || (type !== 'email' && type !== 'email_change')) {
        setStatus('error');
        setErrorMessage('Lien de confirmation invalide. Paramètres manquants.');
        return;
      }

      try {
        // Confirmer l'email avec le token_hash
        // Utiliser le type depuis l'URL (email ou email_change)
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as 'email' | 'email_change',
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
          
          // Rediriger vers le dashboard ou la page account selon le type
          setTimeout(() => {
            router.push(isEmailChange ? '/dashboard/account' : '/dashboard');
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
      setErrorMessage('Une erreur inattendue est survenue lors de l\'envoi de l\'email.');
    }
  };

  // État de chargement
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <Card variant="bordered" className="w-full max-w-md">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-gray-600 dark:text-gray-400">Confirmation de votre email en cours...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // État de succès
  if (status === 'success') {
    const type = searchParams.get('type');
    const isEmailChange = type === 'email_change';
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <Card variant="bordered" className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle2 className="w-20 h-20 text-green-600" />
            </div>
            <CardTitle className="text-3xl">
              {isEmailChange ? 'Email changé avec succès !' : 'Email confirmé !'}
            </CardTitle>
            <CardDescription>
              {isEmailChange 
                ? 'Votre nouvelle adresse email a été confirmée et activée'
                : 'Votre compte a été activé avec succès'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              {isEmailChange
                ? 'Votre adresse email a été mise à jour. Vous pouvez maintenant vous connecter avec votre nouvelle adresse.'
                : 'Vous allez être redirigé vers votre tableau de bord dans quelques secondes...'}
            </p>
            <Link href={isEmailChange ? "/dashboard/account" : "/dashboard"}>
              <Button variant="primary" size="lg" className="w-full">
                {isEmailChange ? 'Retour aux paramètres' : 'Aller au tableau de bord'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // État d'erreur (token expiré)
  if (status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <Card variant="bordered" className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <XCircle className="w-20 h-20 text-red-600" />
            </div>
            <CardTitle className="text-3xl">Lien expiré</CardTitle>
            <CardDescription>
              Ce lien de confirmation a expiré ou a déjà été utilisé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-center text-gray-600 dark:text-gray-400">
                {errorMessage}
              </p>
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full"
                onClick={handleResendEmail}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Renvoyer l'email de confirmation
              </Button>
              <Link href="/signup">
                <Button variant="ghost" size="lg" className="w-full">
                  Retour à l'inscription
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // État d'erreur générale
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card variant="bordered" className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <XCircle className="w-20 h-20 text-red-600" />
          </div>
          <CardTitle className="text-3xl">Erreur</CardTitle>
          <CardDescription>
            Impossible de confirmer votre email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-center text-gray-600 dark:text-gray-400">
              {errorMessage || 'Une erreur est survenue lors de la confirmation.'}
            </p>
            <Button 
              variant="primary" 
              size="lg" 
              className="w-full"
              onClick={handleResendEmail}
            >
              <Mail className="w-4 h-4 mr-2" />
              Renvoyer l'email de confirmation
            </Button>
            <Link href="/signin">
              <Button variant="ghost" size="lg" className="w-full">
                Aller à la connexion
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

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  );
}

