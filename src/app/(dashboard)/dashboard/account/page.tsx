/**
 * Account Settings Page - Paramètres du compte
 * 
 * Page de gestion du compte (email, mot de passe, suppression)
 * 
 * @version 1.0
 * @date 2025-11-05 00:25
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/common';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';
import { Loader2, CheckCircle2, AlertTriangle, XCircle, Lock, Trash2 } from 'lucide-react';

export default function AccountPage() {
  const { user, loading, updateEmail, deleteAccount } = useAuth();
  const [emailData, setEmailData] = useState({
    newEmail: '',
    confirmEmail: '',
  });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [emailChangeStatus, setEmailChangeStatus] = useState<{
    canChange: boolean;
    lastChangeDate: string | null;
    nextChangeDate: string | null;
    daysRemaining: number | null;
  } | null>(null);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Gérer le cooldown avec un timer
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(cooldownSeconds - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [cooldownSeconds]);

  // Récupérer le statut du changement d'email
  useEffect(() => {
    const fetchEmailChangeStatus = async () => {
      try {
        const response = await fetch('/api/auth/email-change-status');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setEmailChangeStatus(result.data);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du statut:', error);
      }
    };

    if (user) {
      fetchEmailChangeStatus();
    }
  }, [user]);

  // Forcer un refresh de la session au chargement de la page pour s'assurer que l'email est à jour
  useEffect(() => {
    const refreshSessionIfNeeded = async () => {
      if (!user) return;
      
      try {
        // Vérifier si on vient d'une redirection après changement d'email
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('emailUpdated') === 'true') {
          // Forcer un refresh de la session
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.refresh_token) {
            await supabase.auth.refreshSession({
              refresh_token: session.refresh_token,
            });
            // Nettoyer l'URL
            window.history.replaceState({}, '', window.location.pathname);
          }
        }
      } catch (error) {
        console.error('Erreur lors du refresh de la session:', error);
      }
    };

    refreshSessionIfNeeded();
  }, [user]);

  const handleEmailChange = async () => {
    setEmailMessage(null);

    if (!emailData.newEmail || !emailData.newEmail.includes('@')) {
      setEmailMessage({ type: 'error', text: 'Veuillez entrer une adresse email valide' });
      return;
    }

    if (!emailData.confirmEmail) {
      setEmailMessage({ type: 'error', text: 'Veuillez confirmer votre nouvelle adresse email' });
      return;
    }

    if (emailData.newEmail !== emailData.confirmEmail) {
      setEmailMessage({ type: 'error', text: 'Les adresses email ne correspondent pas' });
      return;
    }

    if (emailData.newEmail === user?.email) {
      setEmailMessage({ type: 'error', text: 'La nouvelle adresse email doit être différente de l\'actuelle' });
      return;
    }

    if (cooldownSeconds > 0) {
      setEmailMessage({ 
        type: 'error', 
        text: `Veuillez attendre ${cooldownSeconds} seconde${cooldownSeconds > 1 ? 's' : ''} avant de réessayer.` 
      });
      return;
    }

    setEmailLoading(true);

    try {
      const { error } = await updateEmail(emailData.newEmail, emailData.confirmEmail);

      if (error) {
        // Gérer spécifiquement les erreurs de rate limit (429) ou limite mensuelle
        const isRateLimit = error.message?.toLowerCase().includes('rate limit') || 
                           error.message?.toLowerCase().includes('too many requests') ||
                           error.message?.toLowerCase().includes('email rate limit') ||
                           error.message?.toLowerCase().includes('une fois par mois') ||
                           (error as { status?: number }).status === 429 ||
                           (error as { code?: string }).code === '429';

        // Gérer les erreurs serveur (500) et les erreurs Resend (403)
        const isServerError = (error as { status?: number }).status === 500 ||
                             error.message?.toLowerCase().includes('internal server error') ||
                             error.message?.toLowerCase().includes('error sending email');

        // Détecter spécifiquement l'erreur Resend "testing emails only"
        const isResendTestModeError = error.message?.toLowerCase().includes('only send testing emails') ||
                                     error.message?.toLowerCase().includes('verify a domain') ||
                                     (error as { status?: number }).status === 403;

        if (isRateLimit) {
          // Définir un cooldown de 60 secondes
          setCooldownSeconds(60);
          setEmailMessage({ 
            type: 'error', 
            text: 'Trop de tentatives. Le bouton sera réactivé dans 60 secondes. Si le problème persiste, vérifiez vos emails de confirmation précédents ou contactez le support.' 
          });
        } else if (isResendTestModeError) {
          setEmailMessage({ 
            type: 'error', 
            text: '⚠️ Resend est en mode test : vous ne pouvez envoyer qu\'à votre adresse vérifiée. Pour envoyer à d\'autres adresses, vous devez vérifier un domaine dans Resend Dashboard (resend.com/domains), puis configurer RESEND_FROM_EMAIL dans les variables d\'environnement (ex: noreply@phuong-long-vo-dao.com).' 
          });
        } else if (isServerError) {
          setEmailMessage({ 
            type: 'error', 
            text: 'Erreur serveur lors de l\'envoi de l\'email. Vérifiez que RESEND_API_KEY est correctement configurée dans les variables d\'environnement (Vercel ou .env.local).' 
          });
        } else {
          setEmailMessage({ type: 'error', text: error.message || 'Une erreur est survenue lors du changement d\'email' });
        }
      } else {
        setEmailMessage({ 
          type: 'success', 
          text: 'Un email de confirmation a été envoyé à votre nouvelle adresse email. Veuillez cliquer sur le lien dans cet email. Vous devrez ensuite vous connecter avec votre ancienne adresse email et votre mot de passe pour finaliser le changement.' 
        });
        setEmailData({ newEmail: '', confirmEmail: '' });
        // Réinitialiser le cooldown en cas de succès
        setCooldownSeconds(0);
        // Rafraîchir le statut du changement d'email
        try {
          const statusResponse = await fetch('/api/auth/email-change-status');
          if (statusResponse.ok) {
            const statusResult = await statusResponse.json();
            if (statusResult.success) {
              setEmailChangeStatus(statusResult.data);
            }
          }
        } catch (statusError) {
          console.error('Erreur lors du rafraîchissement du statut:', statusError);
        }
      }
    } catch (err) {
      setEmailMessage({ type: 'error', text: 'Une erreur est survenue' });
    }

    setEmailLoading(false);
  };

  // Fonction de validation du mot de passe
  const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Au moins 8 caractères');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Au moins une lettre minuscule');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Au moins une lettre majuscule');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Au moins un chiffre');
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      errors.push('Au moins un symbole (ex: !@#$%^&*)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  };

  const handlePasswordChange = async () => {
    console.log('[PASSWORD CHANGE] Starting password change process');
    setPasswordMessage(null);

    // Vérifier que l'ancien mot de passe est fourni
    if (!passwordData.oldPassword) {
      setPasswordMessage({ type: 'error', text: 'Veuillez entrer votre ancien mot de passe' });
      return;
    }

    // Valider le nouveau mot de passe d'abord
    const passwordValidation = validatePassword(passwordData.newPassword);
    if (!passwordValidation.valid) {
      setPasswordMessage({ 
        type: 'error', 
        text: `Le mot de passe doit contenir : ${passwordValidation.errors.join(', ')}` 
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }

    if (passwordData.oldPassword === passwordData.newPassword) {
      setPasswordMessage({ type: 'error', text: 'Le nouveau mot de passe doit être différent de l\'ancien' });
      return;
    }

    console.log('[PASSWORD CHANGE] Validation passed, setting loading to true');
    setPasswordLoading(true);

    try {
      console.log('[PASSWORD CHANGE] Verifying old password...');
      
      // Vérifier d'abord que l'utilisateur est bien connecté
      if (!user || !user.email) {
        console.error('[PASSWORD CHANGE] No user or email found');
        setPasswordMessage({ type: 'error', text: 'Vous devez être connecté pour changer votre mot de passe' });
        setPasswordLoading(false);
        return;
      }

      // Vérifier l'ancien mot de passe via une API route pour ne pas perturber la session
      console.log('[PASSWORD CHANGE] Calling verify-password API...');
      const verifyResponse = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: passwordData.oldPassword }),
      });

      const verifyResult = await verifyResponse.json();
      console.log('[PASSWORD CHANGE] Verify result:', verifyResult);

      if (!verifyResult.success) {
        console.log('[PASSWORD CHANGE] Old password incorrect, stopping');
        setPasswordMessage({ type: 'error', text: verifyResult.error || 'Ancien mot de passe incorrect' });
        setPasswordLoading(false);
        return;
      }

      console.log('[PASSWORD CHANGE] Old password verified, updating password...');
      
      // Mettre à jour le mot de passe via une API route pour éviter les problèmes de session
      console.log('[PASSWORD CHANGE] Calling update-password API...');
      const updateResponse = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword: passwordData.newPassword }),
      });

      const updateResult = await updateResponse.json();
      console.log('[PASSWORD CHANGE] Update result:', updateResult);

      if (!updateResult.success) {
        console.log('[PASSWORD CHANGE] Update error:', updateResult.error);
        setPasswordMessage({ type: 'error', text: updateResult.error || 'Erreur lors de la mise à jour du mot de passe' });
        setPasswordLoading(false);
        return;
      }

      // Succès
      console.log('[PASSWORD CHANGE] Password updated successfully!');
      setPasswordMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès !' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      
      // Rafraîchir la session côté client pour s'assurer qu'elle est à jour (non-bloquant)
      // On le fait dans un try/catch séparé pour ne pas bloquer le finally
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        // Ne pas await pour ne pas bloquer, mais on peut quand même essayer
        supabase.auth.refreshSession().catch((refreshErr) => {
          console.warn('[PASSWORD CHANGE] Session refresh failed (non-critical):', refreshErr);
        });
      } catch (refreshErr) {
        console.warn('[PASSWORD CHANGE] Could not refresh session (non-critical):', refreshErr);
      }
    } catch (err) {
      console.error('[PASSWORD CHANGE] Unexpected error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors du changement de mot de passe';
      setPasswordMessage({ type: 'error', text: errorMessage });
    } finally {
      // Toujours réinitialiser le loading, même en cas d'erreur
      console.log('[PASSWORD CHANGE] Finally block: setting loading to false');
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteMessage(null);

    if (!deleteConfirmEmail || !user?.email) {
      setDeleteMessage({ type: 'error', text: 'Veuillez entrer votre adresse email' });
      return;
    }

    if (deleteConfirmEmail.toLowerCase() !== user.email.toLowerCase()) {
      setDeleteMessage({ type: 'error', text: 'L\'email ne correspond pas à votre adresse email' });
      return;
    }

    setDeleteLoading(true);

    try {
      const { error } = await deleteAccount(deleteConfirmEmail);

      if (error) {
        setDeleteMessage({ type: 'error', text: error.message || 'Erreur lors de la suppression du compte' });
      } else {
        setDeleteMessage({ type: 'success', text: 'Votre compte a été supprimé avec succès. Vous allez être redirigé...' });
        // La redirection est gérée dans deleteAccount
      }
    } catch (err) {
      setDeleteMessage({ type: 'error', text: 'Une erreur est survenue' });
    }

    setDeleteLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
          </div>
          <p className="text-gray-600 dark:text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 dark:text-gray-500">Vous devez être connecté pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold dark:text-gray-100 mb-2">Paramètres du compte</h1>
        <p className="text-gray-600 dark:text-gray-500">
          Gérez votre email, mot de passe et options de compte.
        </p>
      </div>

      {/* Email Section */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <EnvelopeIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Adresse email</CardTitle>
              <CardDescription>Votre email de connexion</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-base font-medium dark:text-gray-100 mb-1">Email actuel</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
              <p className="text-sm dark:text-gray-500 mt-2">
                {user.email_confirmed_at 
                  ? <span className="flex items-center gap-1 text-green-600 dark:text-green-400"><CheckCircle2 className="w-3.5 h-3.5" /> Email vérifié</span>
                  : <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400"><AlertTriangle className="w-3.5 h-3.5" /> Email non vérifié - Consultez vos emails</span>}
              </p>
              {emailChangeStatus && !emailChangeStatus.canChange && emailChangeStatus.nextChangeDate && (
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Vous pourrez changer votre email le{' '}
                      <strong>
                        {new Date(emailChangeStatus.nextChangeDate).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </strong>
                      {emailChangeStatus.daysRemaining !== null && emailChangeStatus.daysRemaining > 0 && (
                        <span> (dans {emailChangeStatus.daysRemaining} jour{emailChangeStatus.daysRemaining > 1 ? 's' : ''})</span>
                      )}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {emailMessage && (
              <div className={`p-4 rounded-lg flex items-center gap-2 ${
                emailMessage.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' 
                  : 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
              }`}>
                {emailMessage.type === 'success' ? (
                  <><CheckCircle2 className="w-4 h-4" /> {emailMessage.text}</>
                ) : (
                  <><XCircle className="w-4 h-4" /> {emailMessage.text}</>
                )}
              </div>
            )}

            <div>
              <label htmlFor="newEmail" className="block text-sm font-medium dark:text-gray-300 mb-2">
                Nouvelle adresse email
              </label>
              <input
                type="email"
                id="newEmail"
                value={emailData.newEmail}
                onChange={(e) => setEmailData(prev => ({ ...prev, newEmail: e.target.value }))}
                disabled={emailChangeStatus !== null && !emailChangeStatus.canChange}
                className={`w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-gray-100 ${
                  emailChangeStatus !== null && !emailChangeStatus.canChange
                    ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-900'
                    : ''
                }`}
                placeholder="nouvelle@email.com"
              />
            </div>

            <div>
              <label htmlFor="confirmEmail" className="block text-sm font-medium dark:text-gray-300 mb-2">
                Confirmer la nouvelle adresse email
              </label>
              <input
                type="email"
                id="confirmEmail"
                value={emailData.confirmEmail}
                onChange={(e) => setEmailData(prev => ({ ...prev, confirmEmail: e.target.value }))}
                disabled={emailChangeStatus !== null && !emailChangeStatus.canChange}
                className={`w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-gray-100 ${
                  emailChangeStatus !== null && !emailChangeStatus.canChange
                    ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-900'
                    : ''
                }`}
                placeholder="nouvelle@email.com"
              />
              <p className="mt-1 text-xs dark:text-gray-500">
                Un email de confirmation sera envoyé à la nouvelle adresse uniquement. Après avoir cliqué sur le lien, vous devrez vous connecter avec votre ancienne adresse email pour finaliser le changement. Vous ne pouvez changer votre email qu'une fois par mois maximum.
              </p>
            </div>

            <Button
              variant="primary"
              onClick={handleEmailChange}
              disabled={
                emailLoading || 
                !emailData.newEmail || 
                !emailData.confirmEmail || 
                emailData.newEmail !== emailData.confirmEmail || 
                emailData.newEmail === user.email || 
                cooldownSeconds > 0 ||
                (emailChangeStatus !== null && !emailChangeStatus.canChange)
              }
              className="flex items-center justify-center gap-2"
            >
              {emailLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours...</>
              ) : cooldownSeconds > 0 ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Attente... ({cooldownSeconds}s)</>
              ) : emailChangeStatus !== null && !emailChangeStatus.canChange ? (
                <><EnvelopeIcon className="w-4 h-4" /> Changement d'email indisponible</>
              ) : (
                <><EnvelopeIcon className="w-4 h-4" /> Changer l'email</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
              <LockClosedIcon className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <CardTitle>Mot de passe</CardTitle>
              <CardDescription>Changez votre mot de passe</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {passwordMessage && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              passwordMessage.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {passwordMessage.type === 'success' ? (
                <><CheckCircle2 className="w-4 h-4" /> {passwordMessage.text}</>
              ) : (
                <><XCircle className="w-4 h-4" /> {passwordMessage.text}</>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="oldPassword" className="block text-sm font-medium dark:text-gray-300 mb-2">
                Ancien mot de passe
              </label>
              <input
                type="password"
                id="oldPassword"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium dark:text-gray-300 mb-2">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                id="newPassword"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                placeholder="••••••••"
                minLength={8}
              />
              <p className="mt-1 text-xs dark:text-gray-500">
                Le mot de passe doit contenir : au moins 8 caractères, une lettre minuscule, une lettre majuscule, un chiffre et un symbole
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium dark:text-gray-300 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                placeholder="••••••••"
              />
            </div>

            <Button
              variant="primary"
              onClick={handlePasswordChange}
              disabled={passwordLoading || !passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              className="flex items-center justify-center gap-2"
            >
              {passwordLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Mise à jour...</>
              ) : (
                <><Lock className="w-4 h-4" /> Changer le mot de passe</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card variant="bordered" className="border-red-200 dark:border-red-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-red-600 dark:text-red-400">Zone de danger</CardTitle>
              <CardDescription>Actions irréversibles sur votre compte</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 dark:bg-red-900/20 border dark:border-red-800 rounded-lg p-4">
            <p className="text-sm mb-4 flex items-start gap-2 dark:text-gray-200">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <span><strong>Attention :</strong> La suppression de votre compte est définitive et irréversible.</span> 
              Toutes vos données (profil, inscriptions, commandes) seront supprimées.
            </p>

            {!showDeleteConfirm ? (
              <Button 
                variant="danger" 
                size="sm" 
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer mon compte
              </Button>
            ) : (
              <div className="space-y-4">
                {deleteMessage && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                    deleteMessage.type === 'success' 
                      ? 'bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' 
                      : 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                  }`}>
                    {deleteMessage.type === 'success' ? (
                      <><CheckCircle2 className="w-4 h-4" /> {deleteMessage.text}</>
                    ) : (
                      <><XCircle className="w-4 h-4" /> {deleteMessage.text}</>
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor="deleteConfirmEmail" className="block text-sm font-medium dark:text-gray-300 mb-2">
                    Pour confirmer, entrez votre adresse email : <span className="font-mono text-xs">{user?.email}</span>
                  </label>
                  <input
                    type="email"
                    id="deleteConfirmEmail"
                    value={deleteConfirmEmail}
                    onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                    className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                    placeholder="votre@email.com"
                    disabled={deleteLoading}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading || !deleteConfirmEmail || deleteConfirmEmail.toLowerCase() !== user?.email?.toLowerCase()}
                    className="flex items-center gap-2"
                  >
                    {deleteLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Suppression...</>
                    ) : (
                      <><Trash2 className="w-4 h-4" /> Confirmer la suppression</>
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmEmail('');
                      setDeleteMessage(null);
                    }}
                    disabled={deleteLoading}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

