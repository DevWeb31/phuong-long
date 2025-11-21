/**
 * AddressEditor Component
 * 
 * Éditeur d'adresse avec champs séparés
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import { useState, useEffect } from 'react';

interface AddressEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

interface AddressData {
  street?: string;
  postal_code?: string;
  city?: string;
  country?: string;
}

export function AddressEditor({ value, onChange, label }: AddressEditorProps) {
  const [address, setAddress] = useState<AddressData>({});

  useEffect(() => {
    try {
      const parsed = value ? JSON.parse(value) : {};
      setAddress(parsed);
    } catch {
      // Si ce n'est pas du JSON, essayer de parser l'ancien format texte
      const lines = value.split('\n');
      const newAddress: AddressData = {
        street: lines[0] || '',
        postal_code: lines[1]?.match(/\d{5}/)?.[0] || '',
        city: lines[1]?.replace(/\d{5}\s*/, '') || lines[2] || '',
        country: lines[2] || lines[3] || 'France',
      };
      setAddress(newAddress);
    }
  }, [value]);

  const handleFieldChange = (field: keyof AddressData, fieldValue: string) => {
    const newAddress = { ...address, [field]: fieldValue };
    setAddress(newAddress);
    onChange(JSON.stringify(newAddress));
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Adresse
          </label>
          <input
            type="text"
            value={address.street || ''}
            onChange={(e) => handleFieldChange('street', e.target.value.slice(0, 150))}
            placeholder="123 Rue Example"
            maxLength={150}
            className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
            {(address.street || '').length} / 150 caractères
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Code postal
            </label>
            <input
              type="text"
              value={address.postal_code || ''}
              onChange={(e) => handleFieldChange('postal_code', e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="31000"
              maxLength={5}
              pattern="[0-9]{5}"
              className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Ville
            </label>
            <input
              type="text"
              value={address.city || ''}
              onChange={(e) => handleFieldChange('city', e.target.value.slice(0, 100))}
              placeholder="Paris"
              maxLength={100}
              className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
              {(address.city || '').length} / 100 caractères
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Pays
          </label>
          <input
            type="text"
            value={address.country || 'France'}
            readOnly
            disabled
            placeholder="France"
            className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-sm cursor-not-allowed opacity-60"
          />
        </div>
      </div>
    </div>
  );
}

