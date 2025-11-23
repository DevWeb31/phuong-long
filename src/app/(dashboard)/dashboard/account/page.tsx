/**
 * Account Settings Page - Paramètres du compte
 * 
 * Page de gestion du compte (email, mot de passe, notifications, suppression)
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
  BellIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';
import { Loader2, CheckCircle2, AlertTriangle, XCircle, Lock, Trash2, Save } from 'lucide-react';

export default function AccountPage() {
  const { user, loading, updatePassword, updateEmail } = useAuth();
  const [emailData, setEmailData] = useState({
    newEmail: '',
  });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleEmailChange = async () => {
    setEmailMessage(null);

    if (!emailData.newEmail || !emailData.newEmail.includes('@')) {
      setEmailMessage({ type: 'error', text: 'Veuillez entrer une adresse email valide' });
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
      const { error } = await updateEmail(emailData.newEmail);

      if (error) {
        // Gérer spécifiquement les erreurs de rate limit
        const isRateLimit = error.message?.toLowerCase().includes('rate limit') || 
                           error.message?.toLowerCase().includes('too many requests') ||
                           error.message?.toLowerCase().includes('email rate limit') ||
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
            text: '⚠️ Resend est en mode test : vous ne pouvez envoyer qu\'à votre adresse vérifiée. Pour envoyer à d\'autres adresses, vous devez vérifier un domaine dans Resend Dashboard (resend.com/domains), puis changer le sender email dans Supabase SMTP Settings pour utiliser votre domaine vérifié (ex: noreply@votre-domaine.fr).' 
          });
        } else if (isServerError) {
          setEmailMessage({ 
            type: 'error', 
            text: 'Erreur serveur lors de l\'envoi de l\'email. Cela peut être dû à un problème de configuration SMTP. Vérifiez la configuration Resend dans Supabase Dashboard (Settings → Auth → SMTP Settings) et assurez-vous que l\'API Key est correcte.' 
          });
        } else {
          setEmailMessage({ type: 'error', text: error.message || 'Une erreur est survenue lors du changement d\'email' });
        }
      } else {
        setEmailMessage({ 
          type: 'success', 
          text: 'Un email de confirmation a été envoyé à votre nouvelle adresse email. Veuillez cliquer sur le lien dans cet email. Vous devrez ensuite vous connecter avec votre ancienne adresse email et votre mot de passe pour finaliser le changement.' 
        });
        setEmailData({ newEmail: '' });
        // Réinitialiser le cooldown en cas de succès
        setCooldownSeconds(0);
      }
    } catch (err) {
      setEmailMessage({ type: 'error', text: 'Une erreur est survenue' });
    }

    setEmailLoading(false);
  };

  const handlePasswordChange = async () => {
    setPasswordMessage(null);

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }

    setPasswordLoading(true);

    try {
      const { error } = await updatePassword(passwordData.newPassword);

      if (error) {
        setPasswordMessage({ type: 'error', text: error.message });
      } else {
        setPasswordMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès !' });
        setPasswordData({ newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordMessage({ type: 'error', text: 'Une erreur est survenue' });
    }

    setPasswordLoading(false);
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
          Gérez votre email, mot de passe, notifications et options de compte.
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
                onChange={(e) => setEmailData({ newEmail: e.target.value })}
                className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                placeholder="nouvelle@email.com"
              />
              <p className="mt-1 text-xs dark:text-gray-500">
                Un email de confirmation sera envoyé à la nouvelle adresse. Après avoir cliqué sur le lien, vous devrez vous connecter avec votre ancienne adresse email pour finaliser le changement.
              </p>
            </div>

            <Button
              variant="primary"
              onClick={handleEmailChange}
              disabled={emailLoading || !emailData.newEmail || emailData.newEmail === user.email || cooldownSeconds > 0}
              className="flex items-center justify-center gap-2"
            >
              {emailLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours...</>
              ) : cooldownSeconds > 0 ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Attente... ({cooldownSeconds}s)</>
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
              <label htmlFor="newPassword" className="block text-sm font-medium dark:text-gray-300 mb-2">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                id="newPassword"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
                minLength={8}
              />
              <p className="mt-1 text-xs dark:text-gray-500">Minimum 8 caractères</p>
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
                className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <Button
              variant="primary"
              onClick={handlePasswordChange}
              disabled={passwordLoading || !passwordData.newPassword || !passwordData.confirmPassword}
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

      {/* Notifications Section */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <BellIcon className="w-6 h-6 text-accent" />
            </div>
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Gérez vos préférences de notifications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Événements</p>
                <p className="text-sm dark:text-gray-500">Recevoir des emails sur les nouveaux événements</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Blog</p>
                <p className="text-sm dark:text-gray-500">Recevoir les nouveaux articles du blog</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Promotions</p>
                <p className="text-sm dark:text-gray-500">Recevoir les offres spéciales et promotions</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
            </label>

            <Button variant="primary" size="sm" disabled className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Enregistrer les préférences (bientôt)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card variant="bordered" className="border-red-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <TrashIcon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-red-600">Zone de danger</CardTitle>
              <CardDescription>Actions irréversibles sur votre compte</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border rounded-lg p-4">
            <p className="text-sm mb-4 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span><strong>Attention :</strong> La suppression de votre compte est définitive et irréversible.</span> 
              Toutes vos données (profil, inscriptions, commandes) seront supprimées.
            </p>
            <Button variant="danger" size="sm" disabled className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Supprimer mon compte (bientôt)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

