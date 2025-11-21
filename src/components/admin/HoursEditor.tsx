/**
 * HoursEditor Component
 * 
 * Éditeur d'horaires avec sélection des jours de la semaine
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import { useState, useEffect } from 'react';

interface HoursEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
];

interface HoursData {
  [key: string]: string;
}

export function HoursEditor({ value, onChange, label }: HoursEditorProps) {
  const [hours, setHours] = useState<HoursData>({});

  useEffect(() => {
    try {
      const parsed = value ? JSON.parse(value) : {};
      setHours(parsed);
    } catch {
      // Si ce n'est pas du JSON, essayer de parser l'ancien format texte
      const lines = value.split('\n');
      const newHours: HoursData = {};
      DAYS_OF_WEEK.forEach((day, index) => {
        if (lines[index]) {
          newHours[day.key] = lines[index].replace(/^[^:]+:\s*/, '');
        }
      });
      setHours(newHours);
    }
  }, [value]);

  const handleDayChange = (dayKey: string, hoursValue: string) => {
    const newHours = { ...hours, [dayKey]: hoursValue };
    setHours(newHours);
    onChange(JSON.stringify(newHours));
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="space-y-3">
        {DAYS_OF_WEEK.map((day) => {
          const currentValue = hours[day.key] || '';
          const charCount = currentValue.length;
          return (
            <div key={day.key} className="space-y-1">
              <div className="flex items-center gap-3">
                <label className="w-24 text-sm text-gray-700 dark:text-gray-300 flex-shrink-0">
                  {day.label}
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    value={currentValue}
                    onChange={(e) => handleDayChange(day.key, e.target.value.slice(0, 30))}
                    placeholder="9h - 18h ou Fermé"
                    maxLength={30}
                    className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                    {charCount} / 30 caractères
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

