/**
 * CoachFormModal Component
 * 
 * Modal pour créer/éditer un coach/instructeur
 * 
 * @version 1.0
 * @date 2025-11-06
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button, Badge } from '@/components/common';
import { Plus, X } from 'lucide-react';

export interface Coach {
  id?: string;
  name: string;
  bio?: string;
  photo_url?: string;
  specialties?: string[];
  years_experience: number;
  active: boolean;
  display_order: number;
  club_id?: string | null;
}

interface Club {
  id: string;
  name: string;
  city: string;
}

interface CoachFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (coach: Partial<Coach>) => Promise<void>;
  coach?: Coach | null;
  isLoading?: boolean;
}

export function CoachFormModal({ isOpen, onClose, onSubmit, coach, isLoading = false }: CoachFormModalProps) {
  const [formData, setFormData] = useState<Partial<Coach>>({
    name: '',
    bio: '',
    photo_url: '',
    specialties: [],
    years_experience: 0,
    active: true,
    display_order: 0,
    club_id: null,
  });
  
  const [clubs, setClubs] = useState<Club[]>([]);
  const [newSpecialty, setNewSpecialty] = useState('');

  // Charger les clubs
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch('/api/clubs');
        if (response.ok) {
          const data = await response.json();
          setClubs(data);
        }
      } catch (error) {
        console.error('Failed to fetch clubs:', error);
      }
    };
    
    fetchClubs();
  }, []);

  useEffect(() => {
    if (coach) {
      setFormData(coach);
    } else {
      setFormData({
        name: '',
        bio: '',
        photo_url: '',
        specialties: [],
        years_experience: 0,
        active: true,
        display_order: 0,
        club_id: null,
      });
    }
  }, [coach, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'years_experience' || name === 'display_order') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value, 10) || 0,
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const addSpecialty = () => {
    if (newSpecialty.trim()) {
      setFormData(prev => ({
        ...prev,
        specialties: [...(prev.specialties || []), newSpecialty.trim()],
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialties: (prev.specialties || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={coach ? 'Modifier le Coach' : 'Nouveau Coach'}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            {coach ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Nom */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Nom complet <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Maître Nguyen Van"
            />
          </div>

          {/* Club */}
          <div>
            <label htmlFor="club_id" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Club
            </label>
            <select
              id="club_id"
              name="club_id"
              value={formData.club_id || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="">-- Tous les clubs --</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name} ({club.city})
                </option>
              ))}
            </select>
          </div>

          {/* Années d'expérience */}
          <div>
            <label htmlFor="years_experience" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Années d'expérience <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="years_experience"
              name="years_experience"
              value={formData.years_experience}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-4 py-2.5 border dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="15"
            />
          </div>

          {/* Ordre d'affichage */}
          <div>
            <label htmlFor="display_order" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Ordre d'affichage
            </label>
            <input
              type="number"
              id="display_order"
              name="display_order"
              value={formData.display_order}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2.5 border dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="1"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Plus petit = affiché en premier
            </p>
          </div>

          {/* Photo URL */}
          <div className="md:col-span-2">
            <label htmlFor="photo_url" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Photo (URL) 📷
            </label>
            <input
              type="url"
              id="photo_url"
              name="photo_url"
              value={formData.photo_url || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="https://example.com/photo-coach.jpg"
            />
            
            {/* Preview */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Aperçu :</p>
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-700 mx-auto">
                <img
                  src={formData.photo_url || 'https://us.123rf.com/450wm/glebstock/glebstock1405/glebstock140500249/29946904-noir-et-blanc-silhouette-portrait-de-l-homme-inconnu.jpg?ver=6'}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://us.123rf.com/450wm/glebstock/glebstock1405/glebstock140500249/29946904-noir-et-blanc-silhouette-portrait-de-l-homme-inconnu.jpg?ver=6';
                  }}
                />
              </div>
              {!formData.photo_url && (
                <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
                  Image par défaut (silhouette)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Biographie
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio || ''}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2.5 border dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
            placeholder="Parcours, expérience, philosophie..."
          />
        </div>

        {/* Spécialités */}
        <div className="border-t dark:border-slate-700 pt-6">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Spécialités
          </label>
          
          {/* Spécialités existantes */}
          {(formData.specialties || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              {(formData.specialties || []).map((specialty, index) => (
                <Badge
                  key={index}
                  className="bg-secondary/20 text-secondary-dark border-secondary/30 flex items-center gap-1.5"
                >
                  <span>{specialty}</span>
                  <button
                    type="button"
                    onClick={() => removeSpecialty(index)}
                    className="hover:scale-125 transition-transform"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          
          {/* Ajouter une spécialité */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSpecialty();
                }
              }}
              placeholder="Ex: Combat, Armes, Kata..."
              className="flex-1 px-4 py-2.5 border dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <Button
              type="button"
              variant="ghost"
              onClick={addSpecialty}
              disabled={!newSpecialty.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Appuyez sur Entrée ou cliquez sur + pour ajouter
          </p>
        </div>

        {/* Actif */}
        <div className="flex items-center gap-3 border-t dark:border-slate-700 pt-6">
          <input
            type="checkbox"
            id="active"
            name="active"
            checked={formData.active}
            onChange={handleChange}
            className="w-5 h-5 text-primary border-slate-300 dark:border-slate-700 rounded focus:ring-2 focus:ring-primary"
          />
          <label htmlFor="active" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Coach actif (visible sur le site)
          </label>
        </div>
      </form>
    </Modal>
  );
}

