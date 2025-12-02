/**
 * SessionsEditor Component
 * 
 * Gestionnaire de sessions multiples (dates/horaires) pour les événements
 * 
 * @version 1.0
 * @date 2025-11-08
 */

'use client';

import { useState } from 'react';
import { Calendar, Clock, Trash2, Users, Plus, FileText } from 'lucide-react';
import { Button } from '@/components/common';
import type { EventSession } from '@/lib/types';

interface SessionsEditorProps {
  eventId?: string;
  sessions: Partial<EventSession>[];
  onChange: (sessions: Partial<EventSession>[]) => void;
  disabled?: boolean;
}

export function SessionsEditor({ sessions, onChange, disabled = false }: SessionsEditorProps) {
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [newSession, setNewSession] = useState<Partial<EventSession>>({
    session_date: '',
    start_time: '',
    end_time: '',
    max_attendees: null,
    notes: '',
    status: 'scheduled',
  });

  const addSession = () => {
    if (!newSession.session_date || !newSession.start_time) {
      alert('La date et l\'heure de début sont obligatoires');
      return;
    }

    onChange([...sessions, { ...newSession }]);
    
    // Reset
    setNewSession({
      session_date: '',
      start_time: '',
      end_time: '',
      max_attendees: null,
      notes: '',
      status: 'scheduled',
    });
    setIsAddingSession(false);
  };

  const removeSession = (index: number) => {
    onChange(sessions.filter((_, i) => i !== index));
  };

  const updateSession = (index: number, field: keyof EventSession, value: any) => {
    const updatedSessions = [...sessions];
    updatedSessions[index] = {
      ...updatedSessions[index],
      [field]: value,
    };
    onChange(updatedSessions);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold dark:text-gray-300 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Sessions / Dates ({sessions.length})
        </label>
        {!isAddingSession && (
          <Button
            type="button"
            size="sm"
            onClick={() => setIsAddingSession(true)}
            disabled={disabled}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter une session
          </Button>
        )}
      </div>

      {/* Liste des sessions */}
      {sessions.length > 0 && (
        <div className="space-y-3">
          {sessions.map((session, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-primary" />
                    {session.session_date ? formatDate(session.session_date) : 'Date non définie'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    {session.start_time || '--:--'} 
                    {session.end_time && ` - ${session.end_time}`}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeSession(index)}
                  disabled={disabled}
                  className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                {/* Date */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={session.session_date || ''}
                    onChange={(e) => updateSession(index, 'session_date', e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 text-sm border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Heure début */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Heure début
                  </label>
                  <input
                    type="time"
                    value={session.start_time || ''}
                    onChange={(e) => updateSession(index, 'start_time', e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 text-sm border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Heure fin */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Heure fin (optionnelle)
                  </label>
                  <input
                    type="time"
                    value={session.end_time || ''}
                    onChange={(e) => updateSession(index, 'end_time', e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 text-sm border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Capacité */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Places max (opt.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={session.max_attendees || ''}
                    onChange={(e) => updateSession(index, 'max_attendees', e.target.value ? parseInt(e.target.value) : null)}
                    disabled={disabled}
                    placeholder="Illimité"
                    className="w-full px-3 py-2 text-sm border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Notes (optionnelles)
                </label>
                <textarea
                  value={session.notes || ''}
                  onChange={(e) => updateSession(index, 'notes', e.target.value)}
                  disabled={disabled}
                  rows={2}
                  placeholder="Ex: Catégorie enfants, Niveau avancé..."
                  className="w-full px-3 py-2 text-sm border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout */}
      {isAddingSession && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            Nouvelle session
          </h4>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={newSession.session_date || ''}
                onChange={(e) => setNewSession(prev => ({ ...prev, session_date: e.target.value }))}
                className="w-full px-3 py-2 text-sm border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heure début *
              </label>
              <input
                type="time"
                value={newSession.start_time || ''}
                onChange={(e) => setNewSession(prev => ({ ...prev, start_time: e.target.value }))}
                className="w-full px-3 py-2 text-sm border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heure fin
              </label>
              <input
                type="time"
                value={newSession.end_time || ''}
                onChange={(e) => setNewSession(prev => ({ ...prev, end_time: e.target.value }))}
                className="w-full px-3 py-2 text-sm border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Places max
              </label>
              <input
                type="number"
                min="0"
                value={newSession.max_attendees || ''}
                onChange={(e) => setNewSession(prev => ({ ...prev, max_attendees: e.target.value ? parseInt(e.target.value) : null }))}
                placeholder="Illimité"
                className="w-full px-3 py-2 text-sm border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={newSession.notes || ''}
              onChange={(e) => setNewSession(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              placeholder="Ex: Catégorie enfants, Niveau avancé..."
              className="w-full px-3 py-2 text-sm border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingSession(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={addSession}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter la session
            </Button>
          </div>
        </div>
      )}

      {/* Info */}
      {sessions.length === 0 && !isAddingSession && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Ajoutez plusieurs sessions si l'événement se déroule sur plusieurs dates ou avec des horaires différents.
          Exemple : Stage sur 3 jours, Compétition avec plusieurs catégories, etc.
        </p>
      )}
    </div>
  );
}

