/**
 * useCookieConsent Hook
 * 
 * Hook pour gérer les consentements de cookies
 * 
 * @version 1.0
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Database } from '@/lib/supabase/database.types';

type UserConsentInsert = Database['public']['Tables']['user_consents']['Insert'];

export type CookieConsentType = 'essential' | 'analytics' | 'marketing';

export interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

const CONSENT_STORAGE_KEY = 'cookie-consent';
const CONSENT_VERSION = '1.0';
const CONSENT_EXPIRY_DAYS = 365; // 13 mois en jours arrondis

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger le consentement depuis localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored) {
        const parsed: CookieConsent & { version?: string; expiry?: number } = JSON.parse(stored);
        
        // Vérifier si le consentement est toujours valide
        if (parsed.expiry && parsed.expiry > Date.now()) {
          setConsent({
            essential: parsed.essential ?? true,
            analytics: parsed.analytics ?? false,
            marketing: parsed.marketing ?? false,
            timestamp: parsed.timestamp ?? Date.now(),
          });
        } else {
          // Consentement expiré, le supprimer
          localStorage.removeItem(CONSENT_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading cookie consent:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sauvegarder le consentement
  const saveConsent = useCallback(async (
    essential: boolean,
    analytics: boolean,
    marketing: boolean
  ) => {
    const newConsent: CookieConsent = {
      essential,
      analytics,
      marketing,
      timestamp: Date.now(),
    };

    // Sauvegarder dans localStorage avec expiration
    const expiry = Date.now() + (CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
      ...newConsent,
      version: CONSENT_VERSION,
      expiry,
    }));

    setConsent(newConsent);

    // Sauvegarder dans la base de données si l'utilisateur est connecté
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Enregistrer dans user_consents
        const essentialConsent: UserConsentInsert = {
          user_id: user.id,
          consent_type: 'cookies_essential',
          version: CONSENT_VERSION,
          granted: essential,
          ip_address: null, // Ne pas stocker l'IP côté client pour la confidentialité
          granted_at: new Date().toISOString(),
        };
        await (supabase.from('user_consents') as any).upsert(essentialConsent);

        const analyticsConsent: UserConsentInsert = {
          user_id: user.id,
          consent_type: 'cookies_analytics',
          version: CONSENT_VERSION,
          granted: analytics,
          ip_address: null,
          granted_at: new Date().toISOString(),
        };
        await (supabase.from('user_consents') as any).upsert(analyticsConsent);

        const marketingConsent: UserConsentInsert = {
          user_id: user.id,
          consent_type: 'cookies_marketing',
          version: CONSENT_VERSION,
          granted: marketing,
          ip_address: null,
          granted_at: new Date().toISOString(),
        };
        await (supabase.from('user_consents') as any).upsert(marketingConsent);
      }
    } catch (error) {
      console.error('Error saving consent to database:', error);
      // Ne pas bloquer si la sauvegarde en base échoue
    }

    // Appliquer les scripts selon les consentements
    applyConsentScripts(essential, analytics, marketing);
  }, []);

  // Vérifier si un type de cookie est autorisé
  const hasConsent = useCallback((type: CookieConsentType): boolean => {
    if (!consent) return false;
    if (type === 'essential') return true; // Toujours autorisé
    return consent[type] ?? false;
  }, [consent]);

  return {
    consent,
    isLoaded,
    hasConsent,
    saveConsent,
  };
}

// Appliquer les scripts selon les consentements
function applyConsentScripts(_essential: boolean, analytics: boolean, marketing: boolean) {
  // Analytics scripts (Vercel Analytics, Google Analytics, etc.)
  if (analytics) {
    // Vercel Analytics se charge automatiquement via le composant Analytics
    // Google Analytics et autres trackers peuvent être ajoutés ici
    console.log('Analytics cookies enabled');
  } else {
    // Désactiver les trackers analytics
    console.log('Analytics cookies disabled');
  }

  // Marketing scripts (Facebook Pixel, etc.)
  if (marketing) {
    // Activer les scripts marketing
    console.log('Marketing cookies enabled');
  } else {
    // Désactiver les scripts marketing
    console.log('Marketing cookies disabled');
  }
}

