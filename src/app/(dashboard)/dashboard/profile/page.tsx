/**
 * Profile Page - Mon Profil
 * 
 * Page de profil utilisateur avec modification des informations
 * 
 * @version 1.0
 * @date 2025-11-05 00:20
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/common';
import { UserIcon } from '@heroicons/react/24/outline';
import { Loader2, Edit, CheckCircle2, XCircle, Save } from 'lucide-react';

interface ProfileData {
  fullName: string;
  username: string;
  bio: string;
  phone: string;
  birthdate: string;
  club: string;
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  
  // DEBUG: Log au montage du composant
  useEffect(() => {
    console.log('[PROFILE PAGE DEBUG] Component mounted', {
      hasUser: !!user,
      loading,
      currentPath: typeof window !== 'undefined' ? window.location.pathname : 'SSR',
      currentUrl: typeof window !== 'undefined' ? window.location.href : 'SSR',
    });
  }, [user, loading]);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    username: '',
    bio: '',
    phone: '',
    birthdate: '',
    club: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.user_metadata?.full_name || '',
        username: user.user_metadata?.username || '',
        bio: user.user_metadata?.bio || '',
        phone: user.user_metadata?.phone || '',
        birthdate: user.user_metadata?.birthdate || '',
        club: user.user_metadata?.club || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // TODO: Implémenter la mise à jour du profil via Supabase
      // const { error } = await supabase.auth.updateUser({
      //   data: profileData
      // });

      // Simulation
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
      setIsEditing(false);
      setSaving(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' });
      setSaving(false);
    }
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
    console.log('[PROFILE PAGE DEBUG] No user, showing message');
    console.log('[PROFILE PAGE DEBUG] Current URL:', typeof window !== 'undefined' ? window.location.href : 'SSR');
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 dark:text-gray-500">Vous devez être connecté pour accéder à cette page.</p>
      </div>
    );
  }

  console.log('[PROFILE PAGE DEBUG] User is present, rendering profile page', {
    userId: user.id,
    email: user.email,
    currentUrl: typeof window !== 'undefined' ? window.location.href : 'SSR',
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold dark:text-gray-100 mb-2">Mon Profil</h1>
        <p className="text-gray-600 dark:text-gray-500">
          Gérez vos informations personnelles et votre présence sur la plateforme.
        </p>
      </div>

      {/* Profile Card */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{profileData.fullName || 'Utilisateur'}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
            <Button
              variant={isEditing ? 'ghost' : 'primary'}
              onClick={() => {
                if (isEditing) {
                  // Reset to original values
                  setProfileData({
                    fullName: user.user_metadata?.full_name || '',
                    username: user.user_metadata?.username || '',
                    bio: user.user_metadata?.bio || '',
                    phone: user.user_metadata?.phone || '',
                    birthdate: user.user_metadata?.birthdate || '',
                    club: user.user_metadata?.club || '',
                  });
                }
                setIsEditing(!isEditing);
                setMessage(null);
              }}
              className="flex items-center gap-2"
            >
              {isEditing ? 'Annuler' : <><Edit className="w-4 h-4" /> Modifier</>}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message.type === 'success' ? (
                <><CheckCircle2 className="w-4 h-4" /> {message.text}</>
              ) : (
                <><XCircle className="w-4 h-4" /> {message.text}</>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium dark:text-gray-300 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={profileData.fullName}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 dark:bg-gray-900 disabled:text-gray-500 dark:text-gray-500"
                placeholder="Jean Dupont"
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium dark:text-gray-300 mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={profileData.username}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 dark:bg-gray-900 disabled:text-gray-500 dark:text-gray-500"
                placeholder="jeandupont"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium dark:text-gray-300 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 dark:bg-gray-900 disabled:text-gray-500 dark:text-gray-500"
                placeholder="06 12 34 56 78"
              />
            </div>

            {/* Birthdate */}
            <div>
              <label htmlFor="birthdate" className="block text-sm font-medium dark:text-gray-300 mb-2">
                Date de naissance
              </label>
              <input
                type="date"
                id="birthdate"
                name="birthdate"
                value={profileData.birthdate}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 dark:bg-gray-900 disabled:text-gray-500 dark:text-gray-500"
              />
            </div>

            {/* Club */}
            <div className="md:col-span-2">
              <label htmlFor="club" className="block text-sm font-medium dark:text-gray-300 mb-2">
                Club
              </label>
              <select
                id="club"
                name="club"
                value={profileData.club}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 dark:bg-gray-900 disabled:text-gray-500 dark:text-gray-500"
              >
                <option value="">-- Sélectionnez un club --</option>
                <option value="marseille-centre">Marseille Centre</option>
                <option value="paris-bastille">Paris Bastille</option>
                <option value="nice-promenade">Nice Promenade</option>
                <option value="creteil-universite">Créteil Université</option>
                <option value="strasbourg-centre">Strasbourg Centre</option>
              </select>
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label htmlFor="bio" className="block text-sm font-medium dark:text-gray-300 mb-2">
                Bio / Présentation
              </label>
              <textarea
                id="bio"
                name="bio"
                value={profileData.bio}
                onChange={handleChange}
                disabled={!isEditing}
                rows={4}
                className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 dark:bg-gray-900 disabled:text-gray-500 dark:text-gray-500 resize-none"
                placeholder="Parlez-nous de vous..."
              />
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end">
              <Button
                variant="primary"
                size="lg"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center gap-2"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</>
                ) : (
                  <><Save className="w-4 h-4" /> Enregistrer les modifications</>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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

