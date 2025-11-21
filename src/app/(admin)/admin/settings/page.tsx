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
import { Button } from '@/components/common';
import { X } from 'lucide-react';

interface SiteSetting {
  id: string;
  key: string;
  value: unknown;
  label: string;
  description?: string;
  category: string;
  type: 'boolean' | 'string' | 'number' | 'json';
}

interface SettingsModule {
  name: string;
  description?: string;
  keys: string[];
}

const modulesByCategory: Record<string, SettingsModule[]> = {
  general: [
    {
      name: 'Bandeau d’information',
      description: 'Contrôlez l’affichage du bandeau informant les visiteurs du statut du site.',
      keys: [
        'development.banner.enabled',
        'development.banner.text',
        'development.banner.color',
      ],
    },
    {
      name: 'État du site',
      description: 'Activez le mode maintenance pour limiter l’accès au site public.',
      keys: ['maintenance.enabled'],
    },
  ],
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingValues, setPendingValues] = useState<Record<string, unknown>>({});
  const [savingModule, setSavingModule] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('general');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/site-settings');
      if (response.ok) {
        const data: SiteSetting[] = await response.json();
        setSettings(data);
        setPendingValues((prev) => {
          const next = { ...prev };
          data.forEach((setting) => {
            if (
              Object.prototype.hasOwnProperty.call(next, setting.key) &&
              areValuesEqual(next[setting.key], setting.value)
            ) {
              delete next[setting.key];
            }
          });
          return next;
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const areValuesEqual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

  const getSettingValue = (setting: SiteSetting) => {
    if (Object.prototype.hasOwnProperty.call(pendingValues, setting.key)) {
      return pendingValues[setting.key];
    }
    return setting.value;
  };

  const updatePendingValue = (setting: SiteSetting, newValue: unknown) => {
    setPendingValues((prev) => {
      const next = { ...prev };
      if (areValuesEqual(newValue, setting.value)) {
        delete next[setting.key];
      } else {
        next[setting.key] = newValue;
      }
      return next;
    });
  };

  const handleSaveModule = async (moduleId: string, moduleSettings: SiteSetting[]) => {
    const settingsToUpdate = moduleSettings.filter((setting) =>
      Object.prototype.hasOwnProperty.call(pendingValues, setting.key)
    );

    if (settingsToUpdate.length === 0) {
      return;
    }

    try {
      setSavingModule(moduleId);
      await Promise.all(
        settingsToUpdate.map(async (setting) => {
          const newValue = pendingValues[setting.key];
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

          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || 'Erreur lors de la sauvegarde');
          }
        })
      );

      setPendingValues((prev) => {
        const next = { ...prev };
        moduleSettings.forEach((setting) => {
          delete next[setting.key];
        });
        return next;
      });

      await loadSettings();
      setSnackbar({ message: 'Paramètres enregistrés avec succès', type: 'success' });
    } catch (error) {
      console.error('Error saving module settings:', error);
      setSnackbar({
        message: 'Erreur lors de la sauvegarde du module. Merci de réessayer.',
        type: 'error',
      });
    } finally {
      setSavingModule(null);
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

  const categories = Object.keys(groupedSettings).sort((a, b) => {
    if (a === 'general') return -1;
    if (b === 'general') return 1;
    return a.localeCompare(b);
  });

  useEffect(() => {
    if (categories.length > 0 && !categories.includes(activeCategory)) {
      const firstCategory = categories[0];
      if (firstCategory) {
        setActiveCategory(firstCategory);
      }
    }
  }, [categories, activeCategory]);

  useEffect(() => {
    if (!snackbar) {
      return;
    }
    const timer = setTimeout(() => setSnackbar(null), 4000);
    return () => clearTimeout(timer);
  }, [snackbar]);

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
      {/* Tabs */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b dark:border-gray-800 pb-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-primary/10 text-primary dark:text-primary-light border-b-2 border-primary'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light'
              }`}
            >
              {category === 'general' ? 'Général' : category}
            </button>
          ))}
        </div>
      )}

      {/* Active category content */}
      {activeCategory && groupedSettings[activeCategory] && (
        <div className="space-y-6">
          {(() => {
            const categorySettings = groupedSettings[activeCategory];
            const categoryModules = modulesByCategory[activeCategory] || [];
            const renderedKeys = new Set<string>();

            const renderSettingControl = (setting: SiteSetting, moduleId: string) => {
              const currentValue = getSettingValue(setting);
              const disabled = savingModule === moduleId;
              const booleanValue =
                typeof currentValue === 'boolean' ? currentValue : currentValue === 'true';

              return (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
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
                  
                  <div className="flex items-center justify-end gap-3 w-full md:w-auto">
                    {setting.type === 'boolean' && (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!booleanValue}
                          onChange={(e) => updatePendingValue(setting, e.target.checked)}
                          disabled={disabled}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    )}
                    
                    {setting.type === 'string' && setting.key === 'development.banner.color' && (
                      <div className="flex items-center gap-3">
                        <select
                          value={String(currentValue ?? 'warning')}
                          onChange={(e) => updatePendingValue(setting, e.target.value)}
                          disabled={disabled}
                          className="px-3 py-1.5 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        >
                          <option value="info">Info</option>
                          <option value="warning">Avertissement</option>
                          <option value="danger">Danger</option>
                          <option value="success">Succès</option>
                        </select>
                        <div 
                          className={`w-8 h-8 rounded border dark:border-gray-700 ${
                            currentValue === 'info' ? 'bg-blue-500' :
                            currentValue === 'warning' ? 'bg-yellow-500' :
                            currentValue === 'danger' ? 'bg-red-500' :
                            currentValue === 'success' ? 'bg-green-500' :
                            'bg-primary'
                          }`}
                          title="Aperçu de la couleur"
                        />
                      </div>
                    )}
                    
                    {setting.type === 'string' && setting.key === 'development.banner.text' && (
                      <div className="w-full">
                        <textarea
                          value={String(currentValue ?? '')}
                          onChange={(e) => {
                            const value = e.target.value.slice(0, 150);
                            updatePendingValue(setting, value);
                          }}
                          maxLength={150}
                          disabled={disabled}
                          rows={3}
                          className="w-full md:min-w-[360px] px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus-border-transparent text-sm resize-y"
                          placeholder="Entrez le texte affiché dans le bandeau (150 caractères max)"
                        />
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                          {String(currentValue ?? '').length}/150 caractères
                        </div>
                      </div>
                    )}
                    
                    {setting.type === 'string' && setting.key !== 'development.banner.color' && setting.key !== 'development.banner.text' && (
                      <input
                        type="text"
                        value={String(currentValue ?? '')}
                        onChange={(e) => updatePendingValue(setting, e.target.value)}
                        disabled={disabled}
                        className="px-3 py-1.5 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        placeholder="Saisissez une valeur"
                      />
                    )}
                  </div>
                </div>
              );
            };

            const renderModuleCard = ({
              moduleId,
              title,
              description,
              moduleSettings,
              variant = 'solid',
            }: {
              moduleId: string;
              title: string;
              description?: string;
              moduleSettings: SiteSetting[];
              variant?: 'solid' | 'dashed';
            }) => {
              if (moduleSettings.length === 0) {
                return null;
              }

              const moduleHasChanges = moduleSettings.some((setting) =>
                Object.prototype.hasOwnProperty.call(pendingValues, setting.key)
              );
              const changesCount = moduleSettings.filter((setting) =>
                Object.prototype.hasOwnProperty.call(pendingValues, setting.key)
              ).length;
              const isSavingModule = savingModule === moduleId;

              const cardClasses =
                variant === 'dashed'
                  ? 'border-2 border-dashed dark:border-gray-800 rounded-2xl bg-gray-50/60 dark:bg-gray-900/40 overflow-hidden'
                  : 'border dark:border-gray-800 rounded-2xl shadow-sm dark:shadow-none bg-white dark:bg-gray-900 overflow-hidden';

              const headerClasses =
                variant === 'dashed'
                  ? 'px-4 py-4 border-b dark:border-gray-800 bg-transparent'
                  : 'px-4 py-4 border-b dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/60';

              return (
                <div key={moduleId} className={cardClasses}>
                  <div className={headerClasses}>
                    <h3 className="text-lg font-semibold dark:text-gray-100">{title}</h3>
                    {description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {description}
                      </p>
                    )}
                  </div>
                  <div className="p-4 space-y-4">
                    {moduleSettings.map((setting, index) => (
                      <div key={setting.id}>
                        {renderSettingControl(setting, moduleId)}
                        {index !== moduleSettings.length - 1 && (
                          <div className="border-t dark:border-gray-800 mt-4" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/50 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {moduleHasChanges
                        ? `${changesCount} modification(s) en attente`
                        : 'Aucune modification en attente'}
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!moduleHasChanges || isSavingModule}
                      onClick={() => handleSaveModule(moduleId, moduleSettings)}
                    >
                      {isSavingModule ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                  </div>
                </div>
              );
            };

            const moduleCards = categoryModules.map((module) => {
              const moduleSettings = module.keys
                .map((key) => {
                  const setting = categorySettings.find((s) => s.key === key);
                  if (setting) {
                    renderedKeys.add(setting.key);
                  }
                  return setting;
                })
                .filter(Boolean) as SiteSetting[];

              const moduleId = `${activeCategory}-${module.name}`;
              return renderModuleCard({
                moduleId,
                title: module.name,
                description: module.description,
                moduleSettings,
              });
            });

            const otherSettings = categorySettings.filter(
              (setting) => !renderedKeys.has(setting.key)
            );

            const hasModuleCards = moduleCards.some(Boolean);

            return (
              <>
                {hasModuleCards && (
                  <div className="grid gap-6 min-[1200px]:grid-cols-2">
                    {moduleCards}
                  </div>
                )}

                {otherSettings.length > 0 &&
                  renderModuleCard({
                    moduleId: `${activeCategory}-others`,
                    title: 'Autres paramètres',
                    description: 'Paramètres supplémentaires pour cette catégorie.',
                    moduleSettings: otherSettings,
                    variant: 'dashed',
                  })}
              </>
            );
          })()}
        </div>
      )}

      {settings.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-500">Aucun paramètre disponible</p>
        </div>
      )}

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

