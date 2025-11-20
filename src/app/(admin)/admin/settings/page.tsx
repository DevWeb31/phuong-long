/**
 * Admin Settings Page - Paramètres généraux du site
 * 
 * Page de gestion des paramètres généraux du site
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import { useState, useEffect } from 'react';

interface SiteSetting {
  id: string;
  key: string;
  value: unknown;
  label: string;
  description?: string;
  category: string;
  type: 'boolean' | 'string' | 'number' | 'json';
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/site-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (setting: SiteSetting, newValue: boolean) => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: setting.key,
          value: newValue,
          label: setting.label,
          description: setting.description,
          category: setting.category,
          type: setting.type,
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');

      await loadSettings();
    } catch (error) {
      console.error('Error updating setting:', error);
      alert('Une erreur est survenue lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  // Grouper les settings par catégorie
  const groupedSettings = settings.reduce((acc, setting) => {
    const category = setting.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(setting);
    return acc;
  }, {} as Record<string, SiteSetting[]>);

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

      {Object.entries(groupedSettings).map(([category, categorySettings]) => (
        <div key={category} className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800 p-6">
          <h2 className="text-xl font-semibold dark:text-gray-100 mb-4 capitalize">
            {category === 'general' ? 'Général' : category}
          </h2>
          
          <div className="space-y-4">
            {categorySettings.map((setting) => (
              <div key={setting.id} className="flex items-start justify-between gap-4 py-4 border-b dark:border-gray-800 last:border-0">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold dark:text-gray-100 mb-1">
                    {setting.label}
                  </h3>
                  {setting.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {setting.description}
                    </p>
                  )}
                </div>
                
                {setting.type === 'boolean' && (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={setting.value === true}
                      onChange={(e) => handleToggle(setting, e.target.checked)}
                      disabled={isSaving}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {settings.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-500">Aucun paramètre disponible</p>
        </div>
      )}
    </div>
  );
}

