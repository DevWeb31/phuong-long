/**
 * EventFormModal Component
 * 
 * Modal pour créer/éditer un événement
 * 
 * @version 1.0
 * @date 2025-11-05
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from '@/components/common';

export interface Event {
  id?: string;
  title: string;
  slug?: string;
  event_type: string;
  start_date: string;
  end_date?: string;
  location?: string;
  description?: string;
  club_id?: string;
  max_attendees?: number;
  registration_deadline?: string;
  price_cents: number;
  active: boolean;
  created_at?: string;
}

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: Partial<Event>) => Promise<void>;
  event?: Event | null;
  clubs?: Array<{ id: string; name: string; city: string }>;
  isLoading?: boolean;
}

export function EventFormModal({ isOpen, onClose, onSubmit, event, clubs = [], isLoading = false }: EventFormModalProps) {
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    slug: '',
    event_type: 'stage',
    start_date: '',
    end_date: '',
    location: '',
    description: '',
    club_id: '',
    max_attendees: undefined,
    registration_deadline: '',
    price_cents: 0,
    active: true,
  });

  useEffect(() => {
    if (event) {
      setFormData(event);
    } else {
      setFormData({
        title: '',
        slug: '',
        event_type: 'stage',
        start_date: '',
        end_date: '',
        location: '',
        description: '',
        club_id: '',
        max_attendees: undefined,
        registration_deadline: '',
        price_cents: 0,
        active: true,
      });
    }
  }, [event, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setFormData(prev => ({ ...prev, title, slug }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={event ? 'Modifier l\'Événement' : 'Nouvel Événement'}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            {event ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleTitleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="event_type" className="block text-sm font-semibold text-gray-700 mb-2">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              id="event_type"
              name="event_type"
              value={formData.event_type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="stage">Stage</option>
              <option value="competition">Compétition</option>
              <option value="demonstration">Démonstration</option>
              <option value="seminar">Séminaire</option>
            </select>
          </div>

          <div>
            <label htmlFor="club_id" className="block text-sm font-semibold text-gray-700 mb-2">
              Club
            </label>
            <select
              id="club_id"
              name="club_id"
              value={formData.club_id || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="">Tous les clubs</option>
              {clubs.map(club => (
                <option key={club.id} value={club.id}>{club.name} - {club.city}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="start_date" className="block text-sm font-semibold text-gray-700 mb-2">
              Date de début <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="start_date"
              name="start_date"
              value={formData.start_date?.slice(0, 16) || ''}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-semibold text-gray-700 mb-2">
              Date de fin
            </label>
            <input
              type="datetime-local"
              id="end_date"
              name="end_date"
              value={formData.end_date?.slice(0, 16) || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
              Lieu
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="max_attendees" className="block text-sm font-semibold text-gray-700 mb-2">
              Places max
            </label>
            <input
              type="number"
              id="max_attendees"
              name="max_attendees"
              value={formData.max_attendees || ''}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="price_cents" className="block text-sm font-semibold text-gray-700 mb-2">
              Prix (€) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="price_cents"
              name="price_cents"
              value={formData.price_cents ? formData.price_cents / 100 : 0}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, price_cents: parseInt(e.target.value) * 100 }));
              }}
              min="0"
              step="1"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="registration_deadline" className="block text-sm font-semibold text-gray-700 mb-2">
              Inscription jusqu'au
            </label>
            <input
              type="datetime-local"
              id="registration_deadline"
              name="registration_deadline"
              value={formData.registration_deadline?.slice(0, 16) || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

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
          />
        </div>

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
            Événement actif
          </label>
        </div>
      </form>
    </Modal>
  );
}

