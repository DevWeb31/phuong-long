/**
 * ValuesEditor Component
 * 
 * Éditeur pour gérer les valeurs fondamentales (3 valeurs)
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import { useState, useEffect } from 'react';
import { IconPicker } from '@/components/admin/IconPicker';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

interface ValuesEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

interface Value {
  id: string;
  title: string;
  description: string;
  icon: string; // Nom de l'icône Lucide React
}

const MAX_VALUES = 3;

export function ValuesEditor({ value, onChange, label }: ValuesEditorProps) {
  const [values, setValues] = useState<Value[]>([]);

  useEffect(() => {
    try {
      const parsed = value ? JSON.parse(value) : [];
      if (Array.isArray(parsed)) {
        setValues(parsed);
      } else {
        setValues([]);
      }
    } catch {
      setValues([]);
    }
  }, [value]);

  const handleValueChange = (id: string, field: keyof Value, newValue: string) => {
    const newValues = values.map(val => {
      if (val.id === id) {
        return { ...val, [field]: newValue };
      }
      return val;
    });
    setValues(newValues);
    onChange(JSON.stringify(newValues));
  };

  // Initialiser avec 3 valeurs par défaut si vide
  useEffect(() => {
    if (values.length === 0) {
      const defaultValues: Value[] = [
        { id: 'value-1', title: '', description: '', icon: 'Target' },
        { id: 'value-2', title: '', description: '', icon: 'Shield' },
        { id: 'value-3', title: '', description: '', icon: 'Users' },
      ];
      setValues(defaultValues);
      onChange(JSON.stringify(defaultValues));
    }
  }, []);

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: MAX_VALUES }, (_, index) => {
          const value = values[index] || { id: `value-${index + 1}`, title: '', description: '', icon: 'Target' };
          return (
            <div
              key={value.id}
              className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50"
            >
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Valeur {index + 1}
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Icône
                  </label>
                  <IconPicker
                    value={value.icon || 'Target'}
                    onChange={(newValue) => handleValueChange(value.id, 'icon', newValue)}
                    label=""
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={value.title}
                    onChange={(e) => handleValueChange(value.id, 'title', e.target.value)}
                    placeholder="Titre de la valeur"
                    maxLength={50}
                    className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Description
                  </label>
                  <RichTextEditor
                    value={value.description}
                    onChange={(newValue) => handleValueChange(value.id, 'description', newValue)}
                    placeholder="Description de la valeur..."
                    rows={4}
                    showHelpText={false}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

