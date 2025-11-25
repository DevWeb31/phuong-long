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
      const message = searchParams.get('message');
      
      const supabase = createClient();
      
      // Détecter le type de confirmation
      // Si type est explicitement défini, l'utiliser
      // Sinon, si l'utilisateur est connecté et qu'on a un code, c'est probablement un email_change
      const { data: existingSession } = await supabase.auth.getSession();
      const isUserLoggedIn = !!existingSession?.session?.user;
      
      // Déterminer si c'est un changement d'email
      // 1. Si type est explicitement 'email_change'
      // 2. Ou si l'utilisateur est connecté et qu'on a un code (changement d'email nécessite connexion)
      const isEmailChange = type === 'email_change' || (isUserLoggedIn && !!code && !type);
      
      // Log pour débogage (à retirer en production)
      if (process.env.NODE_ENV === 'development') {
        console.log('Email confirmation params:', { token_hash: !!token_hash, type, code: !!code, message, isUserLoggedIn, isEmailChange });
      }
      
      // Gérer le cas spécial du changement d'email en deux étapes
      // Si on a type=email_change mais pas de code/token_hash, c'est la première étape acceptée
      if (type === 'email_change' && !code && !token_hash) {
        // Décoder le message si nécessaire (il peut être URL-encodé)
        const decodedMessage = message ? decodeURIComponent(message) : '';
        if (decodedMessage && (decodedMessage.includes('other email') || decodedMessage.includes('other'))) {
          // Première étape acceptée : afficher un message informatif
          setStatus('success');
          setErrorMessage(''); // Pas d'erreur, juste un message informatif
          // Le message sera affiché dans l'UI de succès
          return;
        }
      }
      
      // Pour email_change, l'utilisateur DOIT être connecté
      // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
      // avec un message explicatif et le lien de confirmation préservé
      if (isEmailChange && !isUserLoggedIn) {
        // Rediriger automatiquement vers la page de connexion avec le lien de confirmation préservé
        const currentUrl = window.location.href;
        const signinUrl = `/signin?redirectTo=${encodeURIComponent(currentUrl)}&message=${encodeURIComponent('Pour finaliser le changement d\'email, veuillez vous connecter avec votre ancienne adresse email et votre mot de passe.')}`;
        router.push(signinUrl);
        return;
      }
      
      // Vérifier si on a le paramètre verified=true (vérification réussie côté serveur)
      const verified = searchParams.get('verified');
      if (verified === 'true') {
        setStatus('success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
        return;
      }
      
      // Si l'utilisateur est connecté et que son email est confirmé, c'est bon
      // (cas où Supabase a déjà vérifié le token et créé la session)
      if (isUserLoggedIn && !isEmailChange && !code && !token_hash) {
        const user = existingSession?.session?.user;
        if (user?.email_confirmed_at) {
          setStatus('success');
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
          return;
        }
      }

      // Gérer le format avec code (PKCE flow)
      // Pour email_change, Supabase gère automatiquement la mise à jour via les cookies SSR
      if (code) {
        try {
          // Pour email_change, utiliser exchangeCodeForSession pour confirmer le changement
          if (isEmailChange) {
            const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            
            if (exchangeError) {
              setStatus('error');
              setErrorMessage('Erreur lors de la confirmation : ' + exchangeError.message);
              return;
            }

            if (exchangeData?.user) {
              // Vérifier que l'email a bien été mis à jour
              const newEmail = exchangeData.user.email;
              console.log('Email après confirmation:', newEmail);
              
              // Rafraîchir la session pour s'assurer que les données sont à jour
              await supabase.auth.refreshSession();
              
              setStatus('success');
              setTimeout(() => {
                router.push('/dashboard/account');
              }, 3000);
              return;
            }
          }
          
          // Pour les autres types (signup), attendre que Supabase traite le code via les cookies SSR
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
      // Ne vérifier token_hash que si code n'existe pas (déjà traité ci-dessus)
      if (!code) {
        // Si pas de token_hash mais qu'on a verified=true ou que l'utilisateur est connecté avec email confirmé, c'est bon
        if (!token_hash) {
          // Vérifier une dernière fois si l'utilisateur est connecté avec email confirmé
          if (isUserLoggedIn && existingSession?.session?.user?.email_confirmed_at) {
            setStatus('success');
            setTimeout(() => {
              router.push('/dashboard');
            }, 3000);
            return;
          }
          
          setStatus('error');
          setErrorMessage('Lien de confirmation invalide. Paramètres manquants.');
          return;
        }
        
        // Vérifier que le type est valide pour token_hash
        if (type && type !== 'email' && type !== 'email_change') {
          setStatus('error');
          setErrorMessage('Lien de confirmation invalide. Type de confirmation non reconnu.');
          return;
        }
      }

      // À ce point, si on n'a pas de code, on doit avoir un token_hash (vérifié ci-dessus)
      // TypeScript ne le comprend pas, donc on vérifie explicitement
      if (!token_hash) {
        setStatus('error');
        setErrorMessage('Lien de confirmation invalide. Paramètres manquants.');
        return;
      }

      try {
        // Confirmer l'email avec le token_hash
        // Utiliser le type depuis l'URL (email ou email_change)
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: (type || 'email') as 'email' | 'email_change',
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
          // Pour email_change, vérifier que l'email a bien été mis à jour
          if (isEmailChange) {
            const updatedEmail = data.user.email;
            console.log('Email après confirmation (token_hash):', updatedEmail);
            
            // Rafraîchir la session pour s'assurer que les données sont à jour
            await supabase.auth.refreshSession();
          }
          
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
    const message = searchParams.get('message');
    const decodedMessage = message ? decodeURIComponent(message) : '';
    const isEmailChange = type === 'email_change';
    const isFirstStepEmailChange = isEmailChange && decodedMessage && (decodedMessage.includes('other email') || decodedMessage.includes('other'));
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <Card variant="bordered" className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle2 className="w-20 h-20 text-green-600" />
            </div>
            <CardTitle className="text-3xl">
              {isFirstStepEmailChange 
                ? 'Première étape confirmée !' 
                : isEmailChange 
                  ? 'Email changé avec succès !' 
                  : 'Email confirmé !'}
            </CardTitle>
            <CardDescription>
              {isFirstStepEmailChange
                ? 'Votre demande de changement d\'email a été acceptée'
                : isEmailChange 
                  ? 'Votre nouvelle adresse email a été confirmée et activée'
                  : 'Votre compte a été activé avec succès'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              {isFirstStepEmailChange
                ? 'Un email de confirmation a été envoyé à votre nouvelle adresse email. Veuillez cliquer sur le lien dans cet email pour finaliser le changement d\'email.'
                : isEmailChange
                  ? 'Votre adresse email a été mise à jour avec succès ! Vous pouvez maintenant vous connecter avec votre nouvelle adresse email.'
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
  const type = searchParams.get('type');
  const isEmailChangeError = type === 'email_change';
  
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
            {!isEmailChangeError && (
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full"
                onClick={handleResendEmail}
              >
                <Mail className="w-4 h-4 mr-2" />
                Renvoyer l'email de confirmation
              </Button>
            )}
            {isEmailChangeError ? (
              <Link href="/signin">
                <Button variant="primary" size="lg" className="w-full">
                  Se connecter pour confirmer
                </Button>
              </Link>
            ) : (
              <Link href="/signin">
                <Button variant="ghost" size="lg" className="w-full">
                  Aller à la connexion
                </Button>
              </Link>
            )}
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

