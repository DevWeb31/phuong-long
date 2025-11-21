/**
 * IconPicker Component
 * 
 * Sélecteur d'icônes SVG (Lucide) pour les cartes de valeurs
 * 
 * @version 2.0
 * @date 2025-01-XX
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/common';
import { FEATURE_ICONS } from '@/lib/icons/feature-icons';
import type { LucideIcon } from 'lucide-react';

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

// Labels pour les icônes
const ICON_LABELS: Record<string, string> = {
  'Bolt': 'Éclair',
  'Trophy': 'Trophée',
  'Users': 'Utilisateurs',
  'Shield': 'Bouclier',
  'Target': 'Cible',
  'Zap': 'Énergie',
  'Flame': 'Flamme',
  'Star': 'Étoile',
  'Award': 'Récompense',
  'Medal': 'Médaille',
  'Crown': 'Couronne',
  'Gem': 'Gemme',
  'Sword': 'Épée',
  'ShieldCheck': 'Bouclier vérifié',
  'Crosshair': 'Viseur',
  'Heart': 'Cœur',
  'Sparkles': 'Étincelles',
  'Activity': 'Activité',
  'TrendingUp': 'Croissance',
  'Brain': 'Cerveau',
  'Dumbbell': 'Haltère',
  'BookOpen': 'Livre',
  'GraduationCap': 'Diplôme',
  'UserCheck': 'Utilisateur vérifié',
  'Handshake': 'Poignée de main',
  'ThumbsUp': 'Pouce levé',
};

// Liste des options d'icônes pour l'affichage
const ICON_OPTIONS = Object.keys(FEATURE_ICONS).map(name => ({
  name,
  icon: FEATURE_ICONS[name]!,
  label: ICON_LABELS[name] || name,
}));

// Fonction pour obtenir l'icône par son nom (pour compatibilité)
export function getIconByName(name: string): LucideIcon | null {
  return FEATURE_ICONS[name] || null;
}

export function IconPicker({ value, onChange, label }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedIcon = ICON_OPTIONS.find(opt => opt.name === value);
  const defaultIcon = FEATURE_ICONS['Bolt'];
  const SelectedIconComponent: LucideIcon = selectedIcon?.icon ?? defaultIcon!;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-start gap-2 hover:scale-100"
        >
          <SelectedIconComponent className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {selectedIcon?.label || 'Sélectionner une icône'}
          </span>
        </Button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-20 mt-2 w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg p-4 max-h-80 overflow-y-auto">
              <div className="grid grid-cols-6 gap-3">
                {ICON_OPTIONS.map((option) => {
                  const IconComponent: LucideIcon = option.icon;
                  const isSelected = value === option.name;
                  return (
                    <button
                      key={option.name}
                      type="button"
                      onClick={() => {
                        onChange(option.name);
                        setIsOpen(false);
                      }}
                      className={`
                        w-12 h-12 flex flex-col items-center justify-center gap-1 rounded-lg
                        transition-all duration-200
                        hover:bg-gray-100 dark:hover:bg-gray-700
                        ${isSelected ? 'bg-primary/10 dark:bg-primary/20 ring-2 ring-primary' : ''}
                      `}
                      title={option.label}
                    >
                      <IconComponent className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`} />
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate w-full text-center">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
