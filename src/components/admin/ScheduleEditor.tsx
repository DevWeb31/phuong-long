/**
 * ScheduleEditor Component
 * 
 * Éditeur visuel pour les horaires hebdomadaires
 * 
 * @version 1.0
 * @date 2025-11-06
 */

'use client';

import { useState } from 'react';
import { Button, Badge } from '@/components/common';
import { Plus, Trash2, Clock } from 'lucide-react';

interface CourseSession {
  time: string;
  type?: string;
  level?: string;
  instructor?: string;
}

interface ScheduleEditorProps {
  value: Record<string, CourseSession[]> | null;
  onChange: (schedule: Record<string, CourseSession[]>) => void;
}

const DAYS = [
  { key: 'lundi', label: 'Lundi' },
  { key: 'mardi', label: 'Mardi' },
  { key: 'mercredi', label: 'Mercredi' },
  { key: 'jeudi', label: 'Jeudi' },
  { key: 'vendredi', label: 'Vendredi' },
  { key: 'samedi', label: 'Samedi' },
  { key: 'dimanche', label: 'Dimanche' },
];

export function ScheduleEditor({ value, onChange }: ScheduleEditorProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  
  const schedule = value || {};

  const addSession = (day: string) => {
    const newSchedule = { ...schedule };
    if (!newSchedule[day]) {
      newSchedule[day] = [];
    }
    newSchedule[day].push({
      time: '',
      type: '',
      level: '',
      instructor: '',
    });
    onChange(newSchedule);
    setExpandedDay(day);
  };

  const removeSession = (day: string, index: number) => {
    const newSchedule = { ...schedule };
    newSchedule[day].splice(index, 1);
    if (newSchedule[day].length === 0) {
      delete newSchedule[day];
    }
    onChange(newSchedule);
  };

  const updateSession = (day: string, index: number, field: keyof CourseSession, value: string) => {
    const newSchedule = { ...schedule };
    newSchedule[day][index] = {
      ...newSchedule[day][index],
      [field]: value || undefined,
    };
    onChange(newSchedule);
  };

  return (
    <div className="space-y-4">
      {DAYS.map((day) => {
        const daySessions = schedule[day.key] || [];
        const hasSession = daySessions.length > 0;
        const isExpanded = expandedDay === day.key;

        return (
          <div
            key={day.key}
            className={`border-2 rounded-xl transition-all ${
              hasSession
                ? 'border-primary/30 bg-primary/5'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            {/* Header du jour */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">📅</span>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">
                  {day.label}
                </h4>
                {hasSession && (
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    {daySessions.length} cours
                  </Badge>
                )}
              </div>
              
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => addSession(day.key)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter un cours
              </Button>
            </div>

            {/* Sessions du jour */}
            {hasSession && (
              <div className="px-4 pb-4 space-y-3">
                {daySessions.map((session, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Cours #{index + 1}
                        </span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeSession(day.key, index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      {/* Horaire */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Horaire <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={session.time}
                          onChange={(e) => updateSession(day.key, index, 'time', e.target.value)}
                          placeholder="18:00-19:00"
                          className="w-full px-3 py-2 text-sm border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      {/* Type */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Type de cours
                        </label>
                        <input
                          type="text"
                          value={session.type || ''}
                          onChange={(e) => updateSession(day.key, index, 'type', e.target.value)}
                          placeholder="Adultes, Enfants 8-12 ans..."
                          className="w-full px-3 py-2 text-sm border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      {/* Niveau */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Niveau
                        </label>
                        <select
                          value={session.level || ''}
                          onChange={(e) => updateSession(day.key, index, 'level', e.target.value)}
                          className="w-full px-3 py-2 text-sm border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">-- Sélectionner --</option>
                          <option value="Débutant">Débutant</option>
                          <option value="Intermédiaire">Intermédiaire</option>
                          <option value="Avancé">Avancé</option>
                          <option value="Tous niveaux">Tous niveaux</option>
                        </select>
                      </div>

                      {/* Instructeur */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Instructeur
                        </label>
                        <input
                          type="text"
                          value={session.instructor || ''}
                          onChange={(e) => updateSession(day.key, index, 'instructor', e.target.value)}
                          placeholder="Nom du professeur"
                          className="w-full px-3 py-2 text-sm border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

