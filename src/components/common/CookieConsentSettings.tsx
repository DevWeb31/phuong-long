/**
 * CookieConsentSettings Component
 * 
 * Composant pour gérer les préférences de cookies (page dédiée)
 * 
 * @version 1.0
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from './Button';
import { useCookieConsent } from '@/lib/hooks/useCookieConsent';

export function CookieConsentSettings() {
  const { consent, isLoaded, saveConsent } = useCookieConsent();
  const [settings, setSettings] = useState({
    essential: true,
    analytics: false,
    marketing: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (consent) {
      setSettings({
        essential: consent.essential,
        analytics: consent.analytics,
        marketing: consent.marketing,
      });
    }
  }, [consent]);

  const handleSave = async () => {
    await saveConsent(settings.essential, settings.analytics, settings.marketing);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!isLoaded) {
    return <div className="text-sm text-gray-600 dark:text-gray-400">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Cookies Essentiels */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Cookies Essentiels
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Ces cookies sont nécessaires au fonctionnement du site. Ils incluent :
            </p>
            <ul className="text-xs text-gray-500 dark:text-gray-500 list-disc list-inside space-y-1">
              <li>Authentification et session utilisateur</li>
              <li>Sécurité et protection CSRF</li>
              <li>Préférences de langue et d'affichage</li>
            </ul>
          </div>
          <input
            type="checkbox"
            checked={settings.essential}
            disabled
            className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary ml-4"
          />
        </div>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
          ⚠️ Ces cookies sont obligatoires et ne peuvent pas être désactivés.
        </p>
      </div>

      {/* Cookies Analytics */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Cookies Analytics
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Ces cookies nous aident à comprendre comment les visiteurs utilisent le site :
            </p>
            <ul className="text-xs text-gray-500 dark:text-gray-500 list-disc list-inside space-y-1">
              <li>Vercel Analytics (statistiques anonymisées)</li>
              <li>Google Analytics (si activé)</li>
            </ul>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Les données sont anonymisées et ne permettent pas de vous identifier personnellement.
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.analytics}
            onChange={(e) => setSettings(prev => ({ ...prev, analytics: e.target.checked }))}
            className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary ml-4 cursor-pointer"
          />
        </div>
      </div>

      {/* Cookies Marketing */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Cookies Marketing
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Ces cookies permettent d'afficher des publicités personnalisées :
            </p>
            <ul className="text-xs text-gray-500 dark:text-gray-500 list-disc list-inside space-y-1">
              <li>Facebook Pixel (suivi des conversions)</li>
              <li>Remarketing et publicités ciblées</li>
            </ul>
          </div>
          <input
            type="checkbox"
            checked={settings.marketing}
            onChange={(e) => setSettings(prev => ({ ...prev, marketing: e.target.checked }))}
            className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary ml-4 cursor-pointer"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        {saved && (
          <p className="text-sm text-green-600 dark:text-green-400">
            ✓ Préférences sauvegardées
          </p>
        )}
        <div className="ml-auto">
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
          >
            Enregistrer les préférences
          </Button>
        </div>
      </div>
    </div>
  );
}

