/**
 * Account Settings Page - Paramètres du compte
 * 
 * Page de gestion du compte (email, mot de passe, notifications, suppression)
 * 
 * @version 1.0
 * @date 2025-11-05 00:25
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/common';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  BellIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';

export default function AccountPage() {
  const { user, loading, updatePassword } = useAuth();
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Vous devez être connecté pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Paramètres du compte</h1>
        <p className="text-gray-600">
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium text-gray-900">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                {user.email_confirmed_at 
                  ? '✅ Email vérifié' 
                  : '⚠️ Email non vérifié - Consultez vos emails'}
              </p>
            </div>
            <Button variant="ghost" size="sm" disabled>
              Modifier l'email (bientôt)
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
            <div className={`mb-6 p-4 rounded-lg ${
              passwordMessage.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {passwordMessage.type === 'success' ? '✅' : '❌'} {passwordMessage.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                id="newPassword"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
                minLength={8}
              />
              <p className="mt-1 text-xs text-gray-500">Minimum 8 caractères</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <Button
              variant="primary"
              onClick={handlePasswordChange}
              disabled={passwordLoading || !passwordData.newPassword || !passwordData.confirmPassword}
            >
              {passwordLoading ? '⏳ Mise à jour...' : '🔒 Changer le mot de passe'}
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
                <p className="font-medium text-gray-900">Événements</p>
                <p className="text-sm text-gray-500">Recevoir des emails sur les nouveaux événements</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Blog</p>
                <p className="text-sm text-gray-500">Recevoir les nouveaux articles du blog</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Promotions</p>
                <p className="text-sm text-gray-500">Recevoir les offres spéciales et promotions</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
              />
            </label>

            <Button variant="primary" size="sm" disabled>
              💾 Enregistrer les préférences (bientôt)
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700 mb-4">
              ⚠️ <strong>Attention :</strong> La suppression de votre compte est définitive et irréversible. 
              Toutes vos données (profil, inscriptions, commandes) seront supprimées.
            </p>
            <Button variant="danger" size="sm" disabled>
              🗑️ Supprimer mon compte (bientôt)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

