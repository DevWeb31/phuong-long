/**
 * Admin Settings Page - Paramètres généraux du site
 * 
 * Page de gestion des paramètres généraux du site
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/common';
import { X, MessageCircle, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

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
      name: 'Bandeau d\'information',
      description: 'Contrôlez l\'affichage du bandeau informant les visiteurs du statut du site.',
      keys: [
        'development.banner.enabled',
        'development.banner.text',
        'development.banner.color',
      ],
    },
    {
      name: 'État du site',
      description: 'Activez le mode maintenance pour limiter l\'accès au site public.',
      keys: ['maintenance.enabled'],
    },
    {
      name: 'Discord',
      description: 'Lien d\'invitation Discord partagé par tous les clubs. Ce lien sera visible dans le dashboard des membres.',
      keys: ['discord.invite_link'],
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

  const baseCategories = Object.keys(groupedSettings);
  const categories = [
    'general',
    ...baseCategories.filter((category) => category !== 'general' && category !== 'developer'),
    'developer',
  ].filter((category, index, self) => self.indexOf(category) === index);

  useEffect(() => {
    if (!categories.length) {
      return;
    }

    const hasActiveCategory = categories.includes(activeCategory);
    if (!hasActiveCategory) {
      setActiveCategory(categories[0] || 'general');
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Paramètres
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            Gérez les paramètres généraux de votre site
          </p>
        </div>
      </div>

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
              {category === 'general' ? 'Général' : category === 'developer' ? 'Développeur' : category}
            </button>
          ))}
        </div>
      )}

      {/* Active category content */}
      {activeCategory === 'developer' ? (
        <DeveloperInfoSection />
      ) : activeCategory && groupedSettings[activeCategory] && (
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
                    
                    {setting.type === 'string' && setting.key === 'discord.invite_link' && (
                      <div className="w-full md:min-w-[400px]">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">Lien d'invitation Discord</span>
                        </div>
                        <input
                          type="url"
                          value={String(currentValue ?? '')}
                          onChange={(e) => updatePendingValue(setting, e.target.value)}
                          disabled={disabled}
                          className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                          placeholder="https://discord.gg/phuonglongvodao"
                        />
                      </div>
                    )}
                    
                    {setting.type === 'string' && setting.key !== 'development.banner.color' && setting.key !== 'development.banner.text' && setting.key !== 'discord.invite_link' && (
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
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                      {title}
                    </h3>
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

// Composant pour la section développeur avec un design moderne, sophistiqué et élégant
function DeveloperInfoSection() {
  const developerInfo = {
    firstName: 'Damien',
    lastName: 'Oriente',
    job: 'Concepteur Développeur d\'Applications',
    company: 'DevWeb31',
    companyUrl: 'https://www.devweb31.fr',
    address: '21 route de Toulouse',
    postalCode: '31530',
    city: 'Montaigut sur Save',
    phone: '07 84 97 64 00',
    siret: '880 100 268 00023',
  };

  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorInnerRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<Array<HTMLDivElement>>([]);
  const positionsRef = useRef<Array<{ x: number; y: number }>>([]);
  const animationFrameRef = useRef<number | null>(null);
  const currentPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Créer les éléments de traînée dans le DOM
    const createTrailElements = () => {
      if (!containerRef.current) return;
      
      const trailContainer = document.createElement('div');
      trailContainer.className = 'fixed pointer-events-none z-[9998]';
      trailContainer.style.cssText = 'top: 0; left: 0; width: 100%; height: 100%;';
      containerRef.current.appendChild(trailContainer);

      // Créer 10 éléments de traînée
      for (let i = 0; i < 10; i++) {
        const trailElement = document.createElement('div');
        trailElement.className = 'fixed pointer-events-none rounded-full bg-gradient-to-br from-indigo-400/60 to-purple-400/60 blur-sm';
        trailElement.style.cssText = `
          transform: translate(-50%, -50%);
          will-change: transform, opacity;
          opacity: 0;
        `;
        trailContainer.appendChild(trailElement);
        trailRefs.current.push(trailElement);
      }

      return trailContainer;
    };

    const trailContainer = createTrailElements();

    const updateCursor = () => {
      const { x, y } = currentPosRef.current;
      
      // Mettre à jour le curseur principal directement dans le DOM
      if (cursorRef.current) {
        cursorRef.current.style.left = `${x}px`;
        cursorRef.current.style.top = `${y}px`;
      }
      if (cursorInnerRef.current) {
        cursorInnerRef.current.style.left = `${x}px`;
        cursorInnerRef.current.style.top = `${y}px`;
      }
      if (cursorDotRef.current) {
        cursorDotRef.current.style.left = `${x}px`;
        cursorDotRef.current.style.top = `${y}px`;
      }

      // Mettre à jour la traînée avec interpolation fluide
      positionsRef.current.forEach((pos, index) => {
        const trailElement = trailRefs.current[index];
        if (trailElement) {
          const opacity = (positionsRef.current.length - index) / positionsRef.current.length;
          const scale = 0.3 + (opacity * 0.7);
          const pulseDelay = index * 0.1;
          
          trailElement.style.left = `${pos.x}px`;
          trailElement.style.top = `${pos.y}px`;
          trailElement.style.width = `${8 * scale}px`;
          trailElement.style.height = `${8 * scale}px`;
          trailElement.style.opacity = `${opacity * 0.5}`;
          trailElement.style.animation = `pulse-heart 1.2s ease-in-out infinite`;
          trailElement.style.animationDelay = `${pulseDelay}s`;
          trailElement.style.boxShadow = `0 0 ${8 * scale}px rgba(99, 102, 241, ${opacity * 0.6}), 0 0 ${16 * scale}px rgba(139, 92, 246, ${opacity * 0.4})`;
        }
      });

      animationFrameRef.current = requestAnimationFrame(updateCursor);
    };

    const handleMouseMove = (e: MouseEvent) => {
      currentPosRef.current = { x: e.clientX, y: e.clientY };
      
      // Ajouter la position à la traînée
      positionsRef.current = [
        { x: e.clientX, y: e.clientY },
        ...positionsRef.current
      ].slice(0, 10);
    };

    const handleMouseEnter = () => {
      setIsHovering(true);
      document.body.style.cursor = 'none';
      animationFrameRef.current = requestAnimationFrame(updateCursor);
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      document.body.style.cursor = 'auto';
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      positionsRef.current = [];
      // Cacher les éléments de traînée
      trailRefs.current.forEach(el => {
        if (el) el.style.opacity = '0';
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove, { passive: true });
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (trailContainer && trailContainer.parentNode) {
        trailContainer.parentNode.removeChild(trailContainer);
      }
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-[600px] overflow-hidden"
    >
      {/* Curseur personnalisé élégant avec traînée - géré directement dans le DOM */}
      {isHovering && (
        <>
          {/* Cercle extérieur avec gradient et pulsation */}
          <div
            ref={cursorRef}
            className="fixed pointer-events-none z-[9999] mix-blend-difference"
            style={{
              transform: 'translate(-50%, -50%)',
              willChange: 'left, top',
            }}
          >
            <div 
              className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 opacity-80 blur-sm"
              style={{
                animation: 'pulse-heart-cursor 1.2s ease-in-out infinite',
                boxShadow: '0 0 12px rgba(99, 102, 241, 0.6), 0 0 24px rgba(139, 92, 246, 0.4)',
              }}
            />
          </div>
          
          {/* Cercle intérieur avec glassmorphism et pulsation */}
          <div
            ref={cursorInnerRef}
            className="fixed pointer-events-none z-[9999]"
            style={{
              transform: 'translate(-50%, -50%)',
              willChange: 'left, top',
            }}
          >
            <div 
              className="w-4 h-4 rounded-full bg-white/90 dark:bg-gray-100/90 backdrop-blur-sm border border-indigo-200/50 dark:border-indigo-800/50 shadow-lg"
              style={{
                animation: 'pulse-heart-cursor 1.2s ease-in-out infinite',
                animationDelay: '0.1s',
              }}
            />
          </div>
          
          {/* Point central avec pulsation */}
          <div
            ref={cursorDotRef}
            className="fixed pointer-events-none z-[10000]"
            style={{
              transform: 'translate(-50%, -50%)',
              willChange: 'left, top',
            }}
          >
            <div 
              className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
              style={{
                animation: 'pulse-heart-cursor 1.2s ease-in-out infinite',
                animationDelay: '0.2s',
              }}
            />
          </div>
        </>
      )}
      {/* Arrière-plan minimaliste avec effets subtils */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient de fond élégant */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/20" />
        
        {/* Formes géométriques subtiles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-100/40 to-transparent dark:from-indigo-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-100/40 to-transparent dark:from-purple-900/10 rounded-full blur-3xl" />
        
        {/* Lignes décoratives subtiles */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.1) 50%, transparent 100%),
            linear-gradient(0deg, transparent 0%, rgba(139, 92, 246, 0.1) 50%, transparent 100%)
          `,
          backgroundSize: '100% 2px, 2px 100%',
          backgroundPosition: 'center',
        }} />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête élégant avec layout asymétrique */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            {/* Section gauche - Nom et titre avec animations */}
            <div className="flex-1 group/name">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-1 h-12 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full transition-all duration-500 group-hover/name:h-16 group-hover/name:shadow-lg group-hover/name:shadow-indigo-500/50" />
                <div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-gray-900 dark:text-white mb-2 transition-all duration-500 group-hover/name:tracking-tighter">
                    <span className="font-medium inline-block transition-all duration-500 group-hover/name:bg-gradient-to-r group-hover/name:from-indigo-600 group-hover/name:to-purple-600 group-hover/name:bg-clip-text group-hover/name:text-transparent">
                      {developerInfo.firstName}
                    </span>{' '}
                    <span className="font-light text-gray-600 dark:text-gray-400 inline-block transition-all duration-500 group-hover/name:text-gray-700 dark:group-hover/name:text-gray-300 group-hover/name:translate-x-1">
                      {developerInfo.lastName}
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-light tracking-wide transition-all duration-500 group-hover/name:text-indigo-600 dark:group-hover/name:text-indigo-400 group-hover/name:translate-x-1">
                    {developerInfo.job}
                  </p>
                </div>
              </div>
            </div>

            {/* Section droite - Logo société avec glassmorphism et animations */}
            <div className="relative group">
              {/* Effet de glow animé */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse" />
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500" />
              
              {/* Carte avec transformation 3D */}
              <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 shadow-xl transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:-translate-y-1 group-hover:rotate-1">
                {/* Effet shimmer */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer bg-[length:200%_auto]" />
                
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 flex items-center justify-center p-3 border border-indigo-100/50 dark:border-indigo-900/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg">
                  <img
                    src="/logo-dw31-high-quality-light.webp"
                    alt={`Logo ${developerInfo.company}`}
                    className="w-full h-full object-contain dark:hidden transition-transform duration-500 group-hover:scale-110"
                  />
                  <img
                    src="/logo-dw31-high-quality-dark.webp"
                    alt={`Logo ${developerInfo.company}`}
                    className="w-full h-full object-contain hidden dark:block transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent">
                    {developerInfo.company}
                  </h3>
                  <a
                    href={developerInfo.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-all duration-300 hover:gap-2 group/link"
                  >
                    <span className="relative">
                      Visiter le site
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover/link:w-full" />
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 group-hover/link:rotate-12" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grille d'informations moderne et épurée */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-stretch">
          {/* Adresse */}
          <div className="group relative flex flex-col">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute -inset-px bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Carte avec animations */}
            <div className="relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 hover:border-blue-300/50 dark:hover:border-blue-700/50 transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:-translate-y-1 flex-1 flex flex-col">
              {/* Shimmer effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer bg-[length:200%_auto]" />
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-blue-500/20 dark:group-hover:bg-blue-500/30 group-hover:shadow-lg">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    Adresse
                  </p>
                  <p className="text-base text-gray-900 dark:text-gray-100 font-light leading-relaxed transition-all duration-300 group-hover:translate-x-1">
                    {developerInfo.address}<br />
                    {developerInfo.postalCode} {developerInfo.city}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Téléphone */}
          <div className="group relative flex flex-col">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute -inset-px bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Carte avec animations */}
            <div className="relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 hover:border-emerald-300/50 dark:hover:border-emerald-700/50 transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:-translate-y-1 flex-1 flex flex-col">
              {/* Shimmer effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer bg-[length:200%_auto]" />
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-emerald-500/20 dark:group-hover:bg-emerald-500/30 group-hover:shadow-lg">
                  <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 transition-colors duration-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    Téléphone
                  </p>
                  <a
                    href={`tel:${developerInfo.phone.replace(/\s/g, '')}`}
                    className="text-base text-gray-900 dark:text-gray-100 font-light hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 inline-block group-hover:translate-x-1 relative"
                  >
                    <span className="relative">
                      {developerInfo.phone}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-300 group-hover:w-full" />
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="group relative flex flex-col">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-rose-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute -inset-px bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Carte avec animations */}
            <div className="relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 hover:border-purple-300/50 dark:hover:border-purple-700/50 transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:-translate-y-1 flex-1 flex flex-col">
              {/* Shimmer effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer bg-[length:200%_auto]" />
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-purple-500/20 dark:group-hover:bg-purple-500/30 group-hover:shadow-lg">
                  <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 transition-colors duration-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    Contact
                  </p>
                  <a
                    href={`mailto:contact@${developerInfo.companyUrl.replace('https://www.', '').replace('http://www.', '').replace('https://', '').replace('http://', '')}`}
                    className="text-base text-gray-900 dark:text-gray-100 font-light hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 inline-block group-hover:translate-x-1 break-all relative"
                  >
                    <span className="relative">
                      contact@{developerInfo.companyUrl.replace('https://www.', '').replace('http://www.', '').replace('https://', '').replace('http://', '')}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full" />
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* SIRET */}
          <div className="group relative flex flex-col">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-yellow-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute -inset-px bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Carte avec animations */}
            <div className="relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 hover:border-amber-300/50 dark:hover:border-amber-700/50 transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:-translate-y-1 flex-1 flex flex-col">
              {/* Shimmer effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer bg-[length:200%_auto]" />
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-amber-500/20 dark:group-hover:bg-amber-500/30 group-hover:shadow-lg">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 transition-transform duration-500 group-hover:scale-110">SIRET</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 transition-colors duration-300 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    Numéro SIRET
                  </p>
                  <p className="text-base text-gray-900 dark:text-gray-100 font-mono font-light transition-all duration-300 group-hover:translate-x-1">
                    {developerInfo.siret}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Signature élégante en bas */}
        <div className="text-center pt-8 border-t border-gray-200/50 dark:border-gray-800/50">
          <p className="text-sm text-gray-400 dark:text-gray-500 font-light italic">
            Conçu avec passion et créativité
          </p>
        </div>
      </div>
    </div>
  );
}

