/**
 * ClubFormModal Component
 * 
 * Modal pour créer/éditer un club
 * 
 * @version 1.0
 * @date 2025-11-05
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from '@/components/common';

export interface Club {
  id?: string;
  name: string;
  slug?: string;
  city: string;
  address: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  description?: string;
  active: boolean;
  members_count?: number;
  created_at?: string;
}

interface ClubFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (club: Partial<Club>) => Promise<void>;
  club?: Club | null;
  isLoading?: boolean;
}

export function ClubFormModal({ isOpen, onClose, onSubmit, club, isLoading = false }: ClubFormModalProps) {
  const [formData, setFormData] = useState<Partial<Club>>({
    name: '',
    slug: '',
    city: '',
    address: '',
    postal_code: '',
    phone: '',
    email: '',
    description: '',
    active: true,
  });

  useEffect(() => {
    if (club) {
      setFormData(club);
    } else {
      setFormData({
        name: '',
        slug: '',
        city: '',
        address: '',
        postal_code: '',
        phone: '',
        email: '',
        description: '',
        active: true,
      });
    }
  }, [club, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Auto-générer le slug depuis le nom
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setFormData(prev => ({ ...prev, name, slug }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={club ? 'Modifier le Club' : 'Nouveau Club'}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            {club ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Nom */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Nom du club <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Ex: Marseille Centre"
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-semibold text-gray-700 mb-2">
              Slug (URL) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="marseille-centre"
            />
          </div>

          {/* Ville */}
          <div>
            <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
              Ville <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Marseille"
            />
          </div>

          {/* Code postal */}
          <div>
            <label htmlFor="postal_code" className="block text-sm font-semibold text-gray-700 mb-2">
              Code postal <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="postal_code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="13001"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="06 12 34 56 78"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="club@phuonglong.fr"
            />
          </div>
        </div>

        {/* Adresse */}
        <div>
          <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
            Adresse complète <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="12 Rue de la République"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
            placeholder="Décrivez le club..."
          />
        </div>

        {/* Actif */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="active"
            name="active"
            checked={formData.active}
            onChange={handleChange}
            className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
          />
          <label htmlFor="active" className="text-sm font-semibold text-gray-700">
            Club actif
          </label>
        </div>
      </form>
    </Modal>
  );
}

