/**
 * PricingSection Component
 * 
 * Affichage des tarifs d'un club
 * 
 * @version 1.0
 * @date 2025-11-06
 */

'use client';

import type { Club } from '@/lib/types';
import { Card } from '@/components/common';
import { Euro, Users, GraduationCap, Heart } from 'lucide-react';

interface PricingSectionProps {
  club: Club;
}

const PRICING_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  adultes: Users,
  enfants: GraduationCap,
  famille: Heart,
  etudiant: GraduationCap,
  senior: Users,
};

const PRICING_LABELS: Record<string, string> = {
  adultes: 'Adultes',
  enfants: 'Enfants',
  famille: 'Famille',
  etudiant: 'Étudiant',
  senior: 'Senior',
};

export function PricingSection({ club }: PricingSectionProps) {
  const pricing = club.pricing as Record<string, number> | null;

  if (!pricing || Object.keys(pricing).length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <Euro className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Tarifs non définis
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Les tarifs de ce club n'ont pas encore été renseignés.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl">
          <Euro className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Tarifs annuels
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Tarification du club {club.name}
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(pricing).map(([key, value]) => {
          const Icon = PRICING_ICONS[key] || Euro;
          const label = PRICING_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);

          return (
            <Card
              key={key}
              hoverable
              className="relative overflow-hidden group border-2 border-transparent hover:border-accent/30"
            >
              {/* Accent gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative p-6 text-center">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8 text-accent" />
                </div>

                {/* Category */}
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {label}
                </h3>

                {/* Price */}
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold bg-gradient-to-r from-accent via-amber-500 to-accent bg-clip-text text-transparent">
                    {value}
                  </span>
                  <span className="text-2xl font-semibold text-accent">€</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  par an
                </p>

                {/* Hover indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-amber-500 to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Info complémentaire */}
      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <span className="text-2xl">ℹ️</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Informations importantes
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li>Les tarifs incluent la licence fédérale</li>
              <li>Cours d'essai gratuit disponible</li>
              <li>Possibilité de paiement échelonné (3 ou 4 fois)</li>
              <li>Réductions possibles pour les familles</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

