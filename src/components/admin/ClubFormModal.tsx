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
import { ScheduleEditor } from './ScheduleEditor';
import { PricingEditor } from './PricingEditor';
import { Image as ImageIcon, Map as MapIcon, Calendar as CalendarIcon, Euro, Lightbulb, Facebook, Instagram, Youtube } from 'lucide-react';

export interface CourseSession {
  time: string;
  type?: string;
  level?: string;
  instructor?: string;
  instructors?: string[];
}

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
  cover_image_url?: string;
  latitude?: number | null;
  longitude?: number | null;
  schedule?: Record<string, CourseSession[]> | null;
  pricing?: Record<string, number> | null;
  social_media?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  } | null;
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
    cover_image_url: '',
    latitude: null,
    longitude: null,
    schedule: null,
    pricing: null,
    social_media: {
      facebook: '',
      instagram: '',
      youtube: '',
    },
    active: true,
  });

  useEffect(() => {
    if (club) {
      setFormData({
        ...club,
        social_media: club.social_media || {
          facebook: '',
          instagram: '',
          youtube: '',
        },
      });
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
        cover_image_url: '',
        latitude: null,
        longitude: null,
        schedule: null,
        pricing: null,
        social_media: {
          facebook: '',
          instagram: '',
          youtube: '',
        },
        active: true,
      });
    }
  }, [club, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Nettoyer les données : convertir les chaînes vides en null pour les champs optionnels
    const cleanedSocialMedia = formData.social_media ? {
      facebook: formData.social_media.facebook?.trim() || null,
      instagram: formData.social_media.instagram?.trim() || null,
      youtube: formData.social_media.youtube?.trim() || null,
    } : null;
    
    // Retirer les valeurs null du social_media
    const cleanedSocialMediaFiltered = cleanedSocialMedia ? Object.fromEntries(
      Object.entries(cleanedSocialMedia).filter(([_, v]) => v !== null && v !== '')
    ) : null;
    
    const cleanedData = {
      ...formData,
      cover_image_url: formData.cover_image_url || null,
      description: formData.description || null,
      phone: formData.phone || null,
      email: formData.email || null,
      social_media: cleanedSocialMediaFiltered && Object.keys(cleanedSocialMediaFiltered).length > 0 
        ? cleanedSocialMediaFiltered 
        : null,
    };
    
    await onSubmit(cleanedData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Conversion pour les nombres (latitude/longitude)
    if (name === 'latitude' || name === 'longitude') {
      const numValue = value === '' ? null : parseFloat(value);
      setFormData(prev => ({
        ...prev,
        [name]: numValue,
      }));
      return;
    }
    
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
            <label htmlFor="name" className="block text-sm font-semibold dark:text-gray-300 mb-2">
              Nom du club <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              required
              className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Ex: Marseille Centre"
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-semibold dark:text-gray-300 mb-2">
              Slug (URL) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="marseille-centre"
            />
          </div>

          {/* Ville */}
          <div>
            <label htmlFor="city" className="block text-sm font-semibold dark:text-gray-300 mb-2">
              Ville <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Marseille"
            />
          </div>

          {/* Code postal */}
          <div>
            <label htmlFor="postal_code" className="block text-sm font-semibold dark:text-gray-300 mb-2">
              Code postal <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="postal_code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="13001"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold dark:text-gray-300 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="06 12 34 56 78"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="club@phuonglong.fr"
            />
          </div>

          {/* Image de couverture */}
          <div className="md:col-span-2">
            <label htmlFor="cover_image_url" className="block text-sm font-semibold dark:text-gray-300 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" />
              Image de couverture (URL)
            </label>
            <input
              type="url"
              id="cover_image_url"
              name="cover_image_url"
              value={formData.cover_image_url || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="https://example.com/club-image.jpg"
            />
            <p className="mt-1.5 text-xs dark:text-gray-500 flex items-start gap-1.5">
              <Lightbulb className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <span>Conseil : Utilisez une image 16:9 (ex: 1200x675px) pour un meilleur rendu</span>
            </p>
            
            {/* Preview */}
            {formData.cover_image_url && (
              <div className="mt-4">
                <p className="text-xs font-semibold dark:text-gray-300 mb-2">Aperçu :</p>
                <div className="relative aspect-video w-full max-w-md rounded-xl overflow-hidden border-2 dark:border-gray-800">
                  <img
                    src={formData.cover_image_url}
                    alt="Aperçu"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="sans-serif" font-size="18"%3EImage invalide%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Adresse */}
        <div>
          <label htmlFor="address" className="block text-sm font-semibold dark:text-gray-300 mb-2">
            Adresse complète <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="12 Rue de la République"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
            placeholder="Décrivez le club..."
          />
        </div>

        {/* Coordonnées GPS */}
        <div className="border-t dark:border-gray-700 pt-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-primary" />
            Coordonnées GPS (pour la carte)
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Latitude */}
            <div>
              <label htmlFor="latitude" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                Latitude
              </label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                value={formData.latitude ?? ''}
                onChange={handleChange}
                step="0.000001"
                className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="47.765663"
              />
            </div>

            {/* Longitude */}
            <div>
              <label htmlFor="longitude" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                Longitude
              </label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                value={formData.longitude ?? ''}
                onChange={handleChange}
                step="0.000001"
                className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="-3.358848"
              />
            </div>
          </div>
        </div>

        {/* Horaires (Schedule) - Visual Editor */}
        <div className="border-t dark:border-gray-700 pt-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Horaires des cours
          </h3>
          <ScheduleEditor
            value={formData.schedule as Record<string, CourseSession[]> | null}
            onChange={(schedule) => setFormData(prev => ({ ...prev, schedule: schedule as Record<string, CourseSession[]> }))}
            clubId={formData.id}
          />
        </div>

        {/* Tarifs (Pricing) - Visual Editor */}
        <div className="border-t dark:border-gray-700 pt-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Euro className="w-5 h-5 text-primary" />
            Tarifs annuels
          </h3>
          <PricingEditor
            value={formData.pricing as Record<string, number> | null}
            onChange={(pricing) => setFormData(prev => ({ ...prev, pricing }))}
          />
        </div>

        {/* Réseaux sociaux */}
        <div className="border-t dark:border-gray-700 pt-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Facebook className="w-5 h-5 text-primary" />
            Réseaux sociaux
          </h3>
          
          <div className="space-y-4">
            {/* Facebook */}
            <div>
              <label htmlFor="social_facebook" className="block text-sm font-semibold dark:text-gray-300 mb-2 flex items-center gap-2">
                <Facebook className="w-4 h-4 text-blue-600" />
                Facebook
              </label>
              <input
                type="url"
                id="social_facebook"
                value={formData.social_media?.facebook || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  social_media: {
                    ...prev.social_media,
                    facebook: e.target.value,
                  } as Club['social_media'],
                }))}
                className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="https://www.facebook.com/phuonglongvodao"
              />
            </div>

            {/* Instagram */}
            <div>
              <label htmlFor="social_instagram" className="block text-sm font-semibold dark:text-gray-300 mb-2 flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-600" />
                Instagram
              </label>
              <input
                type="url"
                id="social_instagram"
                value={formData.social_media?.instagram || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  social_media: {
                    ...prev.social_media,
                    instagram: e.target.value,
                  } as Club['social_media'],
                }))}
                className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="https://www.instagram.com/phuonglongvodao"
              />
            </div>

            {/* YouTube */}
            <div>
              <label htmlFor="social_youtube" className="block text-sm font-semibold dark:text-gray-300 mb-2 flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-600" />
                YouTube
              </label>
              <input
                type="url"
                id="social_youtube"
                value={formData.social_media?.youtube || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  social_media: {
                    ...prev.social_media,
                    youtube: e.target.value,
                  } as Club['social_media'],
                }))}
                className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="https://www.youtube.com/@phuonglongvodao"
              />
            </div>
          </div>
        </div>

        {/* Actif */}
        <div className="flex items-center gap-3 border-t dark:border-gray-700 pt-6">
          <input
            type="checkbox"
            id="active"
            name="active"
            checked={formData.active}
            onChange={handleChange}
            className="w-5 h-5 text-primary border-gray-300 dark:border-gray-700 rounded focus:ring-2 focus:ring-primary"
          />
          <label htmlFor="active" className="text-sm font-semibold dark:text-gray-300">
            Club actif
          </label>
        </div>
      </form>
    </Modal>
  );
}

