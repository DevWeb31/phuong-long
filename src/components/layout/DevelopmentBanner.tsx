/**
 * Development Banner Component
 * 
 * Bandeau d'information pour indiquer que le site est en cours de développement
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Container } from '@/components/common';

const COLOR_CLASSES: Record<string, { bg: string; border: string; text: string }> = {
  info: {
    bg: 'bg-blue-500 dark:bg-blue-600',
    border: 'border-blue-600 dark:border-blue-700',
    text: 'text-white',
  },
  warning: {
    bg: 'bg-yellow-500 dark:bg-yellow-600',
    border: 'border-yellow-600 dark:border-yellow-700',
    text: 'text-white',
  },
  danger: {
    bg: 'bg-red-500 dark:bg-red-600',
    border: 'border-red-600 dark:border-red-700',
    text: 'text-white',
  },
  success: {
    bg: 'bg-green-500 dark:bg-green-600',
    border: 'border-green-600 dark:border-green-700',
    text: 'text-white',
  },
  primary: {
    bg: 'bg-primary dark:bg-primary-dark',
    border: 'border-primary-dark dark:border-primary',
    text: 'text-white',
  },
};

export function DevelopmentBanner() {
  const defaultMessage = 'Site en cours de développement - Les informations affichées ne sont pas factuelles';
  const [enabled, setEnabled] = useState(true);
  const [color, setColor] = useState<string>('warning');
  const [message, setMessage] = useState<string>(defaultMessage);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/site-settings/public');
        if (response.ok) {
          const data = await response.json();
          setEnabled(data['development.banner.enabled'] !== false); // true par défaut
          setColor(data['development.banner.color'] || 'warning');
          setMessage(data['development.banner.text'] || defaultMessage);
        }
      } catch (error) {
        console.error('Error fetching development banner settings:', error);
        // Valeurs par défaut en cas d'erreur
        setEnabled(true);
        setColor('warning');
        setMessage(defaultMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (loading || !enabled) {
    return null;
  }

  const colorClasses = (COLOR_CLASSES[color] ?? COLOR_CLASSES.warning)!;

  return (
    <div className={`${colorClasses.bg} ${colorClasses.text} py-2 px-4 border-b ${colorClasses.border} z-50 relative`}>
      <Container>
        <div className="flex items-center justify-center gap-2 text-sm font-medium">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      </Container>
    </div>
  );
}

