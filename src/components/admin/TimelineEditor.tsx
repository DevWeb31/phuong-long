/**
 * TimelineEditor Component
 * 
 * Éditeur pour gérer les étapes de la timeline (ajout/suppression)
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/common';
import { IconPicker } from '@/components/admin/IconPicker';
import { Plus, Trash2 } from 'lucide-react';

interface TimelineEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

interface TimelineStep {
  id: string;
  year: string;
  title: string;
  description: string;
  icon?: string; // Nom de l'icône Lucide React
}

const MAX_STEPS = 10;

export function TimelineEditor({ value, onChange, label }: TimelineEditorProps) {
  const [steps, setSteps] = useState<TimelineStep[]>([]);

  useEffect(() => {
    try {
      const parsed = value ? JSON.parse(value) : [];
      if (Array.isArray(parsed)) {
        setSteps(parsed);
      } else {
        setSteps([]);
      }
    } catch {
      setSteps([]);
    }
  }, [value]);

  const handleAddStep = () => {
    if (steps.length >= MAX_STEPS) {
      return;
    }
    const newStep: TimelineStep = {
      id: `step-${Date.now()}`,
      year: '',
      title: '',
      description: '',
      icon: 'History', // Icône par défaut
    };
    const newSteps = [...steps, newStep];
    setSteps(newSteps);
    onChange(JSON.stringify(newSteps));
  };

  const handleRemoveStep = (id: string) => {
    const newSteps = steps.filter(step => step.id !== id);
    setSteps(newSteps);
    onChange(JSON.stringify(newSteps));
  };

  const handleStepChange = (id: string, field: keyof TimelineStep, newValue: string) => {
    const newSteps = steps.map(step => {
      if (step.id === id) {
        return { ...step, [field]: newValue };
      }
      return step;
    });
    setSteps(newSteps);
    onChange(JSON.stringify(newSteps));
  };

  return (
    <div className="space-y-4">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddStep}
            disabled={steps.length >= MAX_STEPS}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter une étape
          </Button>
        </div>
      )}

      {steps.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Aucune étape dans la timeline
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddStep}
            className="flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Ajouter la première étape
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50"
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Étape {index + 1}
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveStep(step.id)}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Année
                  </label>
                  <input
                    type="text"
                    value={step.year}
                    onChange={(e) => handleStepChange(step.id, 'year', e.target.value)}
                    placeholder="2020"
                    maxLength={10}
                    className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Icône
                  </label>
                  <IconPicker
                    value={step.icon || 'History'}
                    onChange={(newValue) => handleStepChange(step.id, 'icon', newValue)}
                    label=""
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  value={step.title}
                  onChange={(e) => handleStepChange(step.id, 'title', e.target.value)}
                  placeholder="Titre de l'étape"
                  maxLength={100}
                  className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  value={step.description}
                  onChange={(e) => handleStepChange(step.id, 'description', e.target.value)}
                  placeholder="Description de l'étape"
                  rows={3}
                  className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {steps.length > 0 && steps.length < MAX_STEPS && (
        <div className="pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddStep}
            className="w-full flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter une étape ({steps.length} / {MAX_STEPS})
          </Button>
        </div>
      )}

      {steps.length >= MAX_STEPS && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Limite de {MAX_STEPS} étapes atteinte
        </p>
      )}
    </div>
  );
}

