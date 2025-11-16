'use client';

import Link from 'next/link';
import { useState } from 'react';

interface FooterShopSectionProps {
  navigation: Array<{ name: string; href: string }>;
  isShopHidden: boolean;
  isDeveloper: boolean;
}

export function FooterShopSection({ navigation, isShopHidden, isDeveloper }: FooterShopSectionProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Si développeur et boutique masquée, afficher en rouge avec tooltip
  const isShopHiddenForDev = isShopHidden && isDeveloper;

  return (
    <div className="relative group">
      <div>
        <h3 
          className={`text-sm font-semibold uppercase tracking-wider ${
            isShopHiddenForDev 
              ? 'text-red-600 dark:text-red-400' 
              : 'dark:text-gray-100'
          }`}
          onMouseEnter={() => isShopHiddenForDev && setShowTooltip(true)}
          onMouseLeave={() => isShopHiddenForDev && setShowTooltip(false)}
        >
          Boutique
        </h3>
        <ul className="mt-4 space-y-3">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`text-base transition-colors ${
                  isShopHiddenForDev
                    ? 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300'
                    : 'dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Tooltip personnalisé pour développeur si boutique masquée */}
      {isShopHiddenForDev && showTooltip && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
          ⚠️ La boutique est masquée pour les autres utilisateurs
          <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
}

