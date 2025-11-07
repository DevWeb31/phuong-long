/**
 * WeeklySchedule Component
 * 
 * Affichage du calendrier hebdomadaire des cours d'un club
 * 
 * @version 1.0
 * @date 2025-11-06
 */

'use client';

import type { Club } from '@/lib/types';
import { Card } from '@/components/common';
import { Clock } from 'lucide-react';

interface WeeklyScheduleProps {
  club: Club;
}

const DAYS_OF_WEEK = [
  { key: 'lundi', label: 'Lundi', emoji: '📅' },
  { key: 'mardi', label: 'Mardi', emoji: '📅' },
  { key: 'mercredi', label: 'Mercredi', emoji: '📅' },
  { key: 'jeudi', label: 'Jeudi', emoji: '📅' },
  { key: 'vendredi', label: 'Vendredi', emoji: '📅' },
  { key: 'samedi', label: 'Samedi', emoji: '📅' },
  { key: 'dimanche', label: 'Dimanche', emoji: '📅' },
];

export function WeeklySchedule({ club }: WeeklyScheduleProps) {
  const schedule = club.schedule as Record<string, string[]> | null;

  if (!schedule || Object.keys(schedule).length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Horaires non définis
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Les horaires de ce club n'ont pas encore été renseignés.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
          <Clock className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Horaires des cours
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Planning hebdomadaire du club
          </p>
        </div>
      </div>

      {/* Calendrier hebdomadaire - Responsive sans scroll */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {DAYS_OF_WEEK.map((day) => {
          const daySchedule = schedule[day.key] || [];
          const hasSchedule = daySchedule.length > 0;

          return (
            <Card
              key={day.key}
              padding="none"
              className={`transition-all duration-300 ${
                hasSchedule
                  ? 'border-primary/30 hover:shadow-lg hover:shadow-primary/10'
                  : 'opacity-60'
              }`}
            >
              {/* Jour de la semaine */}
              <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                <div className="flex items-center gap-2 justify-center xl:justify-start">
                  <span className="text-lg">{day.emoji}</span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {day.label}
                  </h3>
                </div>
              </div>

              {/* Horaires */}
              <div className="p-2 min-h-[100px]">
                {hasSchedule ? (
                  <div className="space-y-1.5">
                    {daySchedule.map((time, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-2 py-1.5 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20"
                      >
                        <Clock className="w-3 h-3 text-primary flex-shrink-0" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {time}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      Repos
                    </span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

