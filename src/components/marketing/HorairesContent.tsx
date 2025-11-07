/**
 * HorairesContent Component
 * 
 * Composant client pour la sélection de clubs et affichage horaires/tarifs
 * 
 * @version 1.0
 * @date 2025-11-06
 */

'use client';

import { useState } from 'react';
import { Container, Badge } from '@/components/common';
import type { Club } from '@/lib/types';
import { WeeklySchedule } from './WeeklySchedule';
import { PricingSection } from './PricingSection';
import { cn } from '@/lib/utils/cn';

interface HorairesContentProps {
  clubs: Club[];
}

export function HorairesContent({ clubs }: HorairesContentProps) {
  const [selectedClubId, setSelectedClubId] = useState<string>(clubs[0]?.id || '');
  
  const selectedClub = clubs.find(club => club.id === selectedClubId);

  if (clubs.length === 0) {
    return (
      <section className="py-20">
        <Container>
          <div className="text-center">
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Aucun club disponible pour le moment.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-12 lg:py-16 bg-white dark:bg-slate-900">
      <Container>
        {/* Sélecteur de clubs - Bandeau horizontal */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Sélectionnez un club
          </h2>
          
          <div className="flex flex-wrap gap-3">
            {clubs.map((club) => (
              <button
                key={club.id}
                onClick={() => setSelectedClubId(club.id)}
                className={cn(
                  'px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200',
                  'border-2 flex items-center gap-2',
                  selectedClubId === club.id
                    ? 'bg-gradient-to-r from-primary to-primary-dark text-white border-primary shadow-lg shadow-primary/30 scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary hover:shadow-md'
                )}
              >
                <span className="text-lg">📍</span>
                <div className="text-left">
                  <div className="font-bold">{club.city}</div>
                  <div className="text-xs opacity-80">{club.name}</div>
                </div>
                {selectedClubId === club.id && (
                  <Badge className="bg-white/20 text-white border-white/30 ml-2">
                    ✓
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Calendrier hebdomadaire */}
        {selectedClub && (
          <div className="space-y-8">
            <WeeklySchedule club={selectedClub} />
            <PricingSection club={selectedClub} />
          </div>
        )}
      </Container>
    </section>
  );
}

