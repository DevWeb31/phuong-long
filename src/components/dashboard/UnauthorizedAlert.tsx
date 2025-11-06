/**
 * Unauthorized Alert Component
 * 
 * Affiche une alerte si l'utilisateur n'a pas les permissions admin
 * 
 * @version 1.0
 * @date 2025-11-05 01:45
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export function UnauthorizedAlert() {
  const searchParams = useSearchParams();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (searchParams.get('error') === 'unauthorized') {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    }
  }, [searchParams]);

  if (!showAlert) return null;

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
      <span className="text-red-600 dark:text-red-400">🚫</span>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
          Accès non autorisé
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300">
          Vous n'avez pas les permissions nécessaires pour accéder au panel d'administration. 
          Si vous pensez qu'il s'agit d'une erreur, contactez un administrateur.
        </p>
      </div>
      <button
        onClick={() => setShowAlert(false)}
        className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
      >
        ✕
      </button>
    </div>
  );
}

