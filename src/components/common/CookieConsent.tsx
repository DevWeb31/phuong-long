/**
 * CookieConsent Component
 * 
 * Banner de consentement aux cookies conforme RGPD
 * 
 * @version 1.0
 */

'use client';

import { useEffect, useState } from 'react';
import { Button } from './Button';
import { X, Cookie, Settings } from 'lucide-react';
import Link from 'next/link';
import { useCookieConsent } from '@/lib/hooks/useCookieConsent';

export function CookieConsent() {
  const { consent, isLoaded, saveConsent } = useCookieConsent();
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Afficher le banner si aucun consentement n'a été donné
    if (isLoaded && !consent) {
      setShowBanner(true);
    }
  }, [isLoaded, consent]);

  const handleAcceptAll = () => {
    saveConsent(true, true, true);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    saveConsent(true, false, false);
    setShowBanner(false);
  };

  const handleCustomize = () => {
    setShowSettings(true);
  };

  const handleSaveSettings = () => {
    saveConsent(settings.essential, settings.analytics, settings.marketing);
    setShowBanner(false);
    setShowSettings(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
      <div className="max-w-6xl mx-auto">
        {!showSettings ? (
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Cookie className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Nous utilisons des cookies
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nous utilisons des cookies pour améliorer votre expérience de navigation, 
                analyser le trafic du site et personnaliser le contenu. 
                Les cookies essentiels sont nécessaires au fonctionnement du site.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Consultez notre{' '}
                <Link 
                  href="/legal/cookies" 
                  className="text-primary hover:underline"
                >
                  politique des cookies
                </Link>
                {' '}pour en savoir plus.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 md:flex-nowrap">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCustomize}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Personnaliser
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRejectAll}
              >
                Refuser
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAcceptAll}
              >
                Tout accepter
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Personnaliser vos préférences de cookies
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Cookies Essentiels */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      Cookies Essentiels
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Nécessaires au fonctionnement du site (authentification, sécurité)
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.essential}
                    disabled
                    className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Ces cookies sont obligatoires et ne peuvent pas être désactivés.
                </p>
              </div>

              {/* Cookies Analytics */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      Cookies Analytics
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Nous aident à améliorer le site en analysant son utilisation
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.analytics}
                    onChange={(e) => setSettings(prev => ({ ...prev, analytics: e.target.checked }))}
                    className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Cookies Marketing */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      Cookies Marketing
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Permettent d'afficher des publicités personnalisées
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.marketing}
                    onChange={(e) => setSettings(prev => ({ ...prev, marketing: e.target.checked }))}
                    className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveSettings}
              >
                Enregistrer les préférences
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

