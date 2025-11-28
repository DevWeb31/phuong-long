/**
 * Social Media Settings Section
 * 
 * Section pour gérer les liens des réseaux sociaux dans le footer
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/common';
import { Facebook, Instagram, Youtube, X } from 'lucide-react';

interface SocialMediaSetting {
  key: string;
  value: string;
  label: string;
}

const socialMediaConfig = [
  {
    key: 'social.facebook',
    label: 'Facebook',
    icon: Facebook,
    placeholder: 'https://www.facebook.com/phuonglongvodao',
    description: 'Lien vers votre page Facebook',
  },
  {
    key: 'social.instagram',
    label: 'Instagram',
    icon: Instagram,
    placeholder: 'https://www.instagram.com/phuonglongvodao',
    description: 'Lien vers votre compte Instagram',
  },
  {
    key: 'social.youtube',
    label: 'YouTube',
    icon: Youtube,
    placeholder: 'https://www.youtube.com/@phuonglongvodao',
    description: 'Lien vers votre chaîne YouTube',
  },
];

export function SocialMediaSettingsSection() {
  const [socialMedia, setSocialMedia] = useState<Record<string, string>>({});
  const [pendingValues, setPendingValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadSocialMedia();
  }, []);

  useEffect(() => {
    if (!snackbar) return;
    const timer = setTimeout(() => setSnackbar(null), 4000);
    return () => clearTimeout(timer);
  }, [snackbar]);

  const loadSocialMedia = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/site-settings');
      if (response.ok) {
        const settings: SocialMediaSetting[] = await response.json();
        const socialMediaData: Record<string, string> = {};
        const pendingData: Record<string, string> = {};
        
        socialMediaConfig.forEach((config) => {
          const setting = settings.find((s) => s.key === config.key);
          const value = setting?.value ? String(setting.value) : '';
          socialMediaData[config.key] = value;
          pendingData[config.key] = value;
        });
        
        setSocialMedia(socialMediaData);
        setPendingValues(pendingData);
      }
    } catch (error) {
      console.error('Error loading social media:', error);
      setSnackbar({ message: 'Erreur lors du chargement des réseaux sociaux', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialMediaChange = (key: string, newValue: string) => {
    setPendingValues((prev) => ({
      ...prev,
      [key]: newValue,
    }));
  };

  const handleSaveSocialMedia = async (key: string) => {
    const newValue = pendingValues[key]?.trim() || '';
    const currentValue = socialMedia[key] || '';

    // Vérifier si la valeur a changé
    if (newValue === currentValue) {
      return;
    }

    // Validation URL si non vide
    if (newValue && !/^https?:\/\/.+/.test(newValue)) {
      setSnackbar({ message: 'Format d\'URL invalide. Utilisez https:// ou http://', type: 'error' });
      return;
    }

    try {
      setSavingKey(key);
      const config = socialMediaConfig.find((c) => c.key === key);
      
      const response = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          value: newValue || null,
          label: config?.label || key,
          description: config?.description || '',
          category: 'social',
          type: 'string',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Erreur lors de la sauvegarde');
      }

      // Mettre à jour l'état local
      setSocialMedia((prev) => ({
        ...prev,
        [key]: newValue,
      }));

      setSnackbar({ 
        message: `${config?.label || 'Réseau social'} enregistré avec succès`, 
        type: 'success' 
      });
    } catch (error) {
      console.error('Error saving social media:', error);
      setSnackbar({
        message: 'Erreur lors de la sauvegarde du réseau social',
        type: 'error',
      });
    } finally {
      setSavingKey(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 dark:border-gray-800"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Réseaux sociaux du footer</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Gérez les liens des réseaux sociaux affichés dans le footer du site. Laissez vide pour masquer un réseau social.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {socialMediaConfig.map((config, index) => {
            const Icon = config.icon;
            const currentValue = pendingValues[config.key] || '';
            const originalValue = socialMedia[config.key] || '';
            const hasChanges = currentValue !== originalValue;
            const isSaving = savingKey === config.key;

            return (
              <div key={config.key}>
                <div className="flex flex-col gap-3 py-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {config.label}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{config.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      value={currentValue}
                      onChange={(e) => handleSocialMediaChange(config.key, e.target.value)}
                      disabled={isSaving}
                      placeholder={config.placeholder}
                      className="flex-1 px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!hasChanges || isSaving}
                      onClick={() => handleSaveSocialMedia(config.key)}
                      className="whitespace-nowrap"
                    >
                      {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                  </div>
                </div>
                {index !== socialMediaConfig.length - 1 && (
                  <div className="border-t dark:border-gray-800" />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Snackbar */}
      {snackbar && (
        <div
          className={`
            fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl shadow-lg border
            flex items-center gap-3 text-sm font-medium z-50
            ${snackbar.type === 'success'
              ? 'bg-green-500 text-white border-green-600'
              : 'bg-red-500 text-white border-red-600'}
          `}
        >
          <span>{snackbar.message}</span>
          <button
            type="button"
            onClick={() => setSnackbar(null)}
            className="p-1 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

