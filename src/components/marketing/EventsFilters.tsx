/**
 * Events Filters Component
 * 
 * Composant de filtrage compact pour la page événements
 * Design minimaliste avec selects au lieu de boutons
 * 
 * @version 2.0
 * @date 2025-11-08
 */

'use client';

import { BuildingOffice2Icon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { GraduationCap, Trophy, Theater, BookOpen, Calendar } from 'lucide-react';
import { ScrollReveal } from '@/components/common';

interface Club {
  id: string;
  name: string;
  city: string;
}

interface EventsFiltersProps {
  clubs: Club[];
  selectedClub: string | null;
  selectedType: string | null;
  onClubChange: (clubId: string | null) => void;
  onTypeChange: (type: string | null) => void;
  eventCounts: {
    total: number;
    byType: Record<string, number>;
    byClub: Record<string, number>;
  };
}

const EVENT_TYPES = [
  { value: 'stage', label: 'Stages', IconComponent: GraduationCap },
  { value: 'competition', label: 'Compétitions', IconComponent: Trophy },
  { value: 'demonstration', label: 'Démonstrations', IconComponent: Theater },
  { value: 'seminar', label: 'Séminaires', IconComponent: BookOpen },
  { value: 'other', label: 'Autres', IconComponent: Calendar },
];

export function EventsFilters({
  clubs,
  selectedClub,
  selectedType,
  onClubChange,
  onTypeChange,
  eventCounts,
}: EventsFiltersProps) {
  const hasActiveFilters = selectedClub !== null || selectedType !== null;

  const clearAllFilters = () => {
    onClubChange(null);
    onTypeChange(null);
  };

  const selectedClubData = clubs.find(c => c.id === selectedClub);
  const selectedTypeData = EVENT_TYPES.find(t => t.value === selectedType);

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ScrollReveal direction="down" delay={0}>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Filtres compacts */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
            {/* Icône Filtres */}
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <FunnelIcon className="w-5 h-5" />
              <span className="font-semibold text-sm">Filtrer :</span>
            </div>

            {/* Select Club */}
            <div className="relative flex-1 sm:flex-initial sm:min-w-[200px]">
              <select
                value={selectedClub || ''}
                onChange={(e) => onClubChange(e.target.value || null)}
                className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer hover:border-primary"
              >
                <option value="">Tous les clubs ({eventCounts.total})</option>
                {clubs.map((club) => {
                  const count = eventCounts.byClub[club.id] || 0;
                  return (
                    <option key={club.id} value={club.id} disabled={count === 0}>
                      {club.name} - {club.city} ({count})
                    </option>
                  );
                })}
              </select>
              <BuildingOffice2Icon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Select Type */}
            <div className="relative flex-1 sm:flex-initial sm:min-w-[180px]">
              <select
                value={selectedType || ''}
                onChange={(e) => onTypeChange(e.target.value || null)}
                className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer hover:border-primary"
              >
                <option value="">Tous les types</option>
                {EVENT_TYPES.map((type) => {
                  const count = eventCounts.byType[type.value] || 0;
                  return (
                    <option key={type.value} value={type.value} disabled={count === 0}>
                      {type.label} ({count})
                    </option>
                  );
                })}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Bouton Reset (si filtres actifs) */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800"
              >
                <XMarkIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Réinitialiser</span>
              </button>
            )}
          </div>

            {/* Compteur de résultats */}
            <ScrollReveal direction="left" delay={100}>
              <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                <span className="font-semibold text-primary text-lg">{eventCounts.total}</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {eventCounts.total > 1 ? 'événements' : 'événement'}
                </span>
              </div>
            </ScrollReveal>
          </div>
        </ScrollReveal>

        {/* Badges des filtres actifs (en dessous) */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            {selectedClubData && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light rounded-full text-sm font-medium">
                <BuildingOffice2Icon className="w-3.5 h-3.5" />
                {selectedClubData.name}
                <button
                  onClick={() => onClubChange(null)}
                  className="hover:bg-primary/20 dark:hover:bg-primary/30 rounded-full p-0.5 transition-colors"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {selectedTypeData && selectedTypeData.IconComponent && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/10 text-secondary-dark dark:bg-secondary/20 dark:text-secondary-light rounded-full text-sm font-medium">
                <selectedTypeData.IconComponent className="w-3.5 h-3.5" />
                {selectedTypeData.label}
                <button
                  onClick={() => onTypeChange(null)}
                  className="hover:bg-secondary/20 dark:hover:bg-secondary/30 rounded-full p-0.5 transition-colors"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

