/**
 * WeeklySchedule Component
 * 
 * Affichage du calendrier hebdomadaire des cours d'un club
 * 
 * @version 2.0
 * @date 2025-11-06
 */

'use client';

import type { Club } from '@/lib/types';
import { Card, Badge } from '@/components/common';
import { Clock, Users, GraduationCap, User } from 'lucide-react';

interface CourseSession {
  time: string;
  type?: string;         // Ex: "Adultes", "Enfants", "Tous niveaux"
  level?: string;        // Ex: "Débutant", "Intermédiaire", "Avancé"
  instructor?: string;   // Legacy: single instructor
  instructors?: string[]; // New: multiple instructors
}

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
  const schedule = club.schedule as Record<string, (string | CourseSession)[]> | null;

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

  // Normaliser les données (support format simple string ou objet)
  const normalizeSession = (session: string | CourseSession): CourseSession => {
    if (typeof session === 'string') {
      return { time: session };
    }
    return session;
  };

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
              <div className="p-2 min-h-[140px]">
                {hasSchedule ? (
                  <div className="space-y-2">
                    {daySchedule.map((session, index) => {
                      const normalizedSession = normalizeSession(session);
                      
                      return (
                        <div
                          key={index}
                          className="px-2 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20 hover:border-primary/40 hover:shadow-md transition-all"
                        >
                          {/* Horaire */}
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                              {normalizedSession.time}
                            </span>
                          </div>
                          
                          {/* Type de cours */}
                          {normalizedSession.type && (
                            <div className="flex items-center gap-1.5 mb-1">
                              <Users className="w-3 h-3 text-accent flex-shrink-0" />
                              <span className="text-xs text-slate-700 dark:text-slate-300">
                                {normalizedSession.type}
                              </span>
                            </div>
                          )}
                          
                          {/* Niveau */}
                          {normalizedSession.level && (
                            <div className="mb-1">
                              <Badge className="text-[10px] py-0 px-1.5 bg-secondary/20 text-secondary-dark border-secondary/30">
                                {normalizedSession.level}
                              </Badge>
                            </div>
                          )}
                          
                          {/* Instructeur(s) */}
                          {(() => {
                            // Support legacy (string) et nouveau format (array)
                            const instructorsList = normalizedSession.instructors || 
                              (normalizedSession.instructor ? [normalizedSession.instructor] : []);
                            
                            return instructorsList.length > 0 && (
                              <div className="flex items-start gap-1.5">
                                <User className="w-3 h-3 text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5" />
                                <div className="flex flex-wrap gap-1">
                                  {instructorsList.map((instructor, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs text-slate-600 dark:text-slate-400"
                                    >
                                      {instructor}
                                      {idx < instructorsList.length - 1 && <span className="text-slate-400 mx-0.5">•</span>}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
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

