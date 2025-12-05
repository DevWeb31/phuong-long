/**
 * Profile Page - Mon Profil
 * 
 * Page de profil utilisateur avec modification des informations
 * 
 * @version 1.0
 * @date 2025-11-05 00:20
 */

'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading } = useAuth();

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
        <h1 className="text-3xl font-bold dark:text-gray-100 mb-2">Mon Profil</h1>
        <p className="text-gray-600 dark:text-gray-500">
          Consultez les informations de votre compte.
        </p>
      </div>

      {/* Additional Info */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Informations du compte</CardTitle>
          <CardDescription>Informations techniques et dates</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium dark:text-gray-500 mb-1">Email</dt>
              <dd className="text-base dark:text-gray-100">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium dark:text-gray-500 mb-1">ID Utilisateur</dt>
              <dd className="text-base dark:text-gray-100 font-mono">{user.id.substring(0, 16)}...</dd>
            </div>
            <div>
              <dt className="text-sm font-medium dark:text-gray-500 mb-1">Date d'inscription</dt>
              <dd className="text-base dark:text-gray-100">
                {new Date(user.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium dark:text-gray-500 mb-1">Dernière connexion</dt>
              <dd className="text-base dark:text-gray-100">
                {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }) : 'Jamais'}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

