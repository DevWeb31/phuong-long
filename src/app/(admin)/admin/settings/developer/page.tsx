/**
 * Developer Settings Page
 * 
 * Page pour gérer les paramètres développeur du site
 * 
 * @version 2.0
 * @date 2025-01-XX
 */

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface DeveloperSetting {
  id: string;
  key: string;
  value: any;
  label: string;
  description: string | null;
  category: string;
  type: 'boolean' | 'string' | 'number' | 'json';
  created_at: string;
  updated_at: string;
}

export default function DeveloperSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<DeveloperSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    async function checkAccess() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/admin');
        return;
      }

      // Vérifier si l'utilisateur a le rôle developer
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role_id, roles!inner(name)')
        .eq('user_id', user.id);

      const roles = (userRoles as any[])?.map(ur => ur.roles?.name) || [];
      const isDev = roles.includes('developer');

      if (!isDev) {
        router.push('/admin');
        return;
      }

      setIsDeveloper(true);
      await loadSettings();
    }

    checkAccess();
  }, [router]);

  async function loadSettings() {
    try {
      const response = await fetch('/api/admin/developer-settings');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des paramètres');
      }
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(setting: DeveloperSetting) {
    if (setting.type !== 'boolean') return;

    setSaving(setting.key);
    try {
      const newValue = !setting.value;
      
      const response = await fetch(`/api/admin/developer-settings/${encodeURIComponent(setting.key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: newValue,
          type: 'boolean',
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      // Mettre à jour l'état local
      setSettings(prev => prev.map(s => 
        s.key === setting.key ? { ...s, value: newValue } : s
      ));
    } catch (error) {
      console.error('Error saving setting:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(null);
    }
  }

  if (loading || !isDeveloper) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    const category = acc[setting.category];
    if (category) {
      category.push(setting);
    }
    return acc;
  }, {} as Record<string, DeveloperSetting[]>);

  const categoryLabels: Record<string, string> = {
    features: 'Fonctionnalités',
    security: 'Sécurité',
    performance: 'Performance',
    general: 'Général',
  };

  return (
    <div className="space-y-6">

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
        <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <p className="font-semibold mb-1">Accès réservé aux développeurs</p>
          <p>Ces paramètres affectent le comportement global du site. Modifiez-les avec précaution.</p>
        </div>
      </div>

      {/* Settings by Category */}
      {Object.entries(groupedSettings).map(([category, categorySettings]) => (
        <div key={category} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-6 dark:text-gray-100 capitalize">
            {categoryLabels[category] || category}
          </h2>
          
          <div className="space-y-4">
            {categorySettings.map((setting) => (
              <div
                key={setting.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100">
                        {setting.label}
                      </h3>
                      {setting.type === 'boolean' && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          setting.value
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}>
                          {setting.value ? (
                            <>
                              <CheckCircleIcon className="w-3 h-3" />
                              Activé
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="w-3 h-3" />
                              Désactivé
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    {setting.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {setting.description}
                      </p>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                      {setting.key}
                    </div>
                  </div>

                  {/* Toggle Switch for Boolean */}
                  {setting.type === 'boolean' && (
                    <button
                      onClick={() => handleToggle(setting)}
                      disabled={saving === setting.key}
                      className={`
                        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                        ${setting.value 
                          ? 'bg-primary' 
                          : 'bg-gray-200 dark:bg-gray-700'
                        }
                        ${saving === setting.key ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      role="switch"
                      aria-checked={setting.value}
                      aria-label={setting.label}
                    >
                      <span
                        className={`
                          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
                          transition duration-200 ease-in-out
                          ${setting.value ? 'translate-x-5' : 'translate-x-0'}
                        `}
                      />
                    </button>
                  )}

                  {/* Display value for other types */}
                  {setting.type !== 'boolean' && (
                    <div className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 px-3 py-1 rounded">
                      {typeof setting.value === 'object' 
                        ? JSON.stringify(setting.value, null, 2)
                        : String(setting.value)
                      }
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {settings.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <ShieldCheckIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Aucun paramètre configuré</p>
        </div>
      )}
    </div>
  );
}
