/**
 * FAQFormModal Component
 * 
 * Modal pour créer/éditer une question FAQ
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from '@/components/common';

export interface FAQItem {
  id?: string;
  question: string;
  answer: string;
  display_order: number;
  club_id?: string | null;
}

interface FAQFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: FAQItem) => Promise<void>;
  item?: FAQItem | null;
  isLoading?: boolean;
  clubId?: string | null;
}

export function FAQFormModal({
  isOpen,
  onClose,
  onSubmit,
  item,
  isLoading = false,
  clubId = null,
}: FAQFormModalProps) {
  const [formData, setFormData] = useState<FAQItem>({
    question: '',
    answer: '',
    display_order: 0,
    club_id: clubId,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id,
        question: item.question || '',
        answer: item.answer || '',
        display_order: item.display_order || 0,
        club_id: item.club_id || clubId,
      });
    } else {
      setFormData({
        question: '',
        answer: '',
        display_order: 0,
        club_id: clubId,
      });
    }
    setErrors({});
  }, [item, clubId, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.question.trim()) {
      newErrors.question = 'La question est requise';
    } else if (formData.question.length > 150) {
      newErrors.question = 'La question ne peut pas dépasser 150 caractères';
    }

    if (!formData.answer.trim()) {
      newErrors.answer = 'La réponse est requise';
    } else if (formData.answer.length > 500) {
      newErrors.answer = 'La réponse ne peut pas dépasser 500 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting FAQ:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Modifier la question' : 'Ajouter une question'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question */}
        <div>
          <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
            <label
              htmlFor="question"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Question <span className="text-red-500">*</span>
            </label>
            <span className={`text-xs whitespace-nowrap ${
              formData.question.length > 150 
                ? 'text-red-600 dark:text-red-400' 
                : formData.question.length > 130
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {formData.question.length}/150
            </span>
          </div>
          <input
            type="text"
            id="question"
            value={formData.question}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 150) {
                setFormData({ ...formData, question: value });
              }
            }}
            maxLength={150}
            className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 ${
              errors.question ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Quelle est la différence entre le Vo Dao et d'autres arts martiaux ?"
          />
          {errors.question && (
            <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">
              {errors.question}
            </p>
          )}
        </div>

        {/* Réponse */}
        <div>
          <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
            <label
              htmlFor="answer"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Réponse <span className="text-red-500">*</span>
            </label>
            <span className={`text-xs whitespace-nowrap ${
              formData.answer.length > 500 
                ? 'text-red-600 dark:text-red-400' 
                : formData.answer.length > 450
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {formData.answer.length}/500
            </span>
          </div>
          <textarea
            id="answer"
            value={formData.answer}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 500) {
                setFormData({ ...formData, answer: value });
              }
            }}
            maxLength={500}
            rows={6}
            className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 resize-y ${
              errors.answer ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Le Vo Dao vietnamien se distingue par sa fluidité, l'utilisation de techniques circulaires..."
          />
          {errors.answer && (
            <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">
              {errors.answer}
            </p>
          )}
        </div>

        {/* Ordre d'affichage */}
        <div>
          <label
            htmlFor="display_order"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Ordre d'affichage
          </label>
          <input
            type="number"
            id="display_order"
            value={formData.display_order}
            onChange={(e) =>
              setFormData({
                ...formData,
                display_order: parseInt(e.target.value) || 0,
              })
            }
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            placeholder="0"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Les questions avec un ordre plus petit apparaîtront en premier
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            isLoading={isLoading}
            className="w-full sm:w-auto"
          >
            {item ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

