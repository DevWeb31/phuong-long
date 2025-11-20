/**
 * PricingEditor Component
 * 
 * Éditeur visuel pour les tarifs
 * 
 * @version 1.0
 * @date 2025-11-06
 */

'use client';

import { Button } from '@/components/common';
import { Plus, Trash2, Euro, Lightbulb } from 'lucide-react';

interface PricingEditorProps {
  value: Record<string, number> | null;
  onChange: (pricing: Record<string, number>) => void;
}

const COMMON_CATEGORIES = [
  'adultes',
  'enfants',
  'famille',
  'etudiant',
  'senior',
];

export function PricingEditor({ value, onChange }: PricingEditorProps) {
  const pricing = value || {};
  const entries = Object.entries(pricing);

  const addCategory = () => {
    const newPricing = { ...pricing };
    // Trouver une catégorie pas encore utilisée
    const unusedCategory = COMMON_CATEGORIES.find(cat => !newPricing[cat]) || 'nouvelle_categorie';
    newPricing[unusedCategory] = 0;
    onChange(newPricing);
  };

  const removeCategory = (category: string) => {
    const newPricing = { ...pricing };
    delete newPricing[category];
    onChange(newPricing);
  };

  const updateCategory = (oldCategory: string, newCategory: string, price: number) => {
    const newPricing = { ...pricing };
    delete newPricing[oldCategory];
    newPricing[newCategory] = price;
    onChange(newPricing);
  };

  const updatePrice = (category: string, price: number) => {
    const newPricing = { ...pricing };
    newPricing[category] = price;
    onChange(newPricing);
  };

  return (
    <div className="space-y-4">
      {/* Tarifs existants */}
      {entries.map(([category, price]) => (
        <div
          key={category}
          className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3"
        >
          <div className="grid md:grid-cols-2 gap-3">
            {/* Catégorie */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => updateCategory(category, e.target.value.slice(0, 60), price)}
                placeholder="adultes, enfants, famille..."
                maxLength={60}
                className="w-full px-3 py-2 text-sm border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {category.length}/60 caractères
              </p>
            </div>

            {/* Prix */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Prix annuel (€) <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => updatePrice(category, parseFloat(e.target.value) || 0)}
                    min="0"
                    step="10"
                    placeholder="250"
                    className="w-full px-3 py-2 text-sm border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                  <Euro className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeCategory(category)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Bouton ajouter */}
      <Button
        type="button"
        variant="ghost"
        onClick={addCategory}
        className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary text-gray-900 dark:text-gray-100"
      >
        <Plus className="w-4 h-4 mr-2" />
        Ajouter une catégorie de tarif
      </Button>

      {/* Suggestions */}
      {entries.length === 0 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-900 dark:text-blue-100 font-semibold mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3 h-3" />
            <span>Catégories courantes :</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {COMMON_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  const newPricing = { ...pricing, [cat]: 0 };
                  onChange(newPricing);
                }}
                className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                + {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

