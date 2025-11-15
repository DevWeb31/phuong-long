/**
 * ScheduleEditor Component
 * 
 * Éditeur visuel pour les horaires hebdomadaires
 * 
 * @version 2.0
 * @date 2025-11-06
 */

'use client';

import { useState, useEffect } from 'react';
import { Button, Badge } from '@/components/common';
import { Plus, Trash2, Clock, Calendar, Check, AlertTriangle } from 'lucide-react';

interface CourseSession {
  time: string;
  type?: string;
  level?: string;
  instructor?: string;  // Legacy: single instructor (string)
  instructors?: string[]; // New: multiple instructors (array)
}

interface Coach {
  id: string;
  name: string;
  club_id: string | null;
  active: boolean;
}

interface ScheduleEditorProps {
  value: Record<string, CourseSession[]> | null;
  onChange: (schedule: Record<string, CourseSession[]>) => void;
  clubId?: string;
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

export function ScheduleEditor({ value, onChange, clubId: _clubId }: ScheduleEditorProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  
  const schedule = value || {};

  // Charger les coaches depuis l'API
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const response = await fetch('/api/coaches');
        if (response.ok) {
          const data = await response.json();
          setCoaches(data);
        }
      } catch (error) {
        console.error('Failed to fetch coaches:', error);
      }
    };
    
    fetchCoaches();
  }, []);

  const addSession = (day: string) => {
    const newSchedule = { ...schedule };
    if (!newSchedule[day]) {
      newSchedule[day] = [];
    }
    newSchedule[day].push({
      time: '',
      type: '',
      level: '',
      instructors: [],
    });
    onChange(newSchedule);
    setExpandedDay(day);
  };

  const removeSession = (day: string, index: number) => {
    const newSchedule = { ...schedule };
    if (newSchedule[day]) {
      newSchedule[day].splice(index, 1);
      if (newSchedule[day].length === 0) {
        delete newSchedule[day];
      }
    }
    onChange(newSchedule);
  };

  const updateSession = (day: string, index: number, field: keyof CourseSession, value: string) => {
    const newSchedule = { ...schedule };
    if (newSchedule[day] && newSchedule[day][index]) {
      newSchedule[day][index] = {
        ...newSchedule[day][index],
        [field]: value || undefined,
      };
      onChange(newSchedule);
    }
  };

  const toggleInstructor = (day: string, index: number, instructorName: string) => {
    const newSchedule = { ...schedule };
    if (!newSchedule[day] || !newSchedule[day][index]) {
      return;
    }
    
    const session = newSchedule[day][index];
    
    // Migrer de l'ancien format (string) vers le nouveau (array) si nécessaire
    if (!session.instructors) {
      session.instructors = session.instructor ? [session.instructor] : [];
      delete session.instructor;
    }
    
    const currentInstructors = session.instructors || [];
    const instructorIndex = currentInstructors.indexOf(instructorName);
    
    if (instructorIndex > -1) {
      // Retirer l'instructeur
      session.instructors = currentInstructors.filter(name => name !== instructorName);
    } else {
      // Ajouter l'instructeur
      session.instructors = [...currentInstructors, instructorName];
    }
    
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
                <Calendar className="w-5 h-5 text-primary" />
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

                      {/* Instructeurs (multi-sélection) */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Instructeur(s)
                        </label>
                        
                        {coaches.length > 0 ? (
                          <>
                            {/* Badges des instructeurs sélectionnés */}
                            {(() => {
                              // Gérer legacy format (string) et nouveau format (array)
                              const selectedInstructors = session.instructors || (session.instructor ? [session.instructor] : []);
                              
                              return selectedInstructors.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                  {selectedInstructors.map((instructor) => (
                                    <button
                                      key={instructor}
                                      type="button"
                                      onClick={() => toggleInstructor(day.key, index, instructor)}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary text-white rounded-full text-xs font-semibold hover:bg-primary-dark transition-colors"
                                    >
                                      <span>{instructor}</span>
                                      <span className="hover:scale-125 transition-transform">✕</span>
                                    </button>
                                  ))}
                                </div>
                              );
                            })()}
                            
                            {/* Liste des instructeurs disponibles */}
                            <div className="flex flex-wrap gap-2">
                              {coaches.map((coach) => {
                                const selectedInstructors = session.instructors || (session.instructor ? [session.instructor] : []);
                                const isSelected = selectedInstructors.includes(coach.name);
                                
                                return (
                                  <button
                                    key={coach.id}
                                    type="button"
                                    onClick={() => toggleInstructor(day.key, index, coach.name)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border-2 transition-all ${
                                      isSelected
                                        ? 'bg-primary/10 border-primary text-primary'
                                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                                  >
                                    {isSelected && <Check className="w-3 h-3 mr-1" />}
                                    {coach.name}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        ) : (
                          <p className="text-xs text-amber-600 dark:text-amber-400 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>Aucun coach disponible. Ajoutez-en dans la section Coaches de l'admin.</span>
                          </p>
                        )}
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

