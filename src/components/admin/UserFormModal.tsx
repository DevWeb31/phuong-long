/**
 * UserFormModal Component
 * 
 * Modal pour modifier un utilisateur (rôles, club, profil)
 * Note: Ne permet PAS de modifier nom, email ou mot de passe
 * 
 * @version 1.0
 * @date 2025-11-05
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from '@/components/common';

interface User {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  club: string | null;
  user_roles?: Array<{
    role_id: string;
    role_name: string;
    club_id: string | null;
    club_name: string | null;
  }>;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  level: number;
}

interface Club {
  id: string;
  name: string;
  city: string;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: {
    role_id: string | null;
    club_id: string | null;
    username?: string;
    bio?: string;
    avatar_url?: string;
  }) => Promise<void>;
  user: User | null;
  clubs?: Club[];
  isLoading?: boolean;
}

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  clubs = [],
  isLoading = false,
}: UserFormModalProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState<{
    role_id: string;
    club_id: string;
    username: string;
    bio: string;
    avatar_url: string;
  }>({
    role_id: '',
    club_id: '',
    username: '',
    bio: '',
    avatar_url: '',
  });
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRoles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (user) {
      const primaryRole = user.user_roles?.[0];
      setFormData({
        role_id: primaryRole?.role_id || '',
        club_id: primaryRole?.club_id || '',
        username: '', // Ne pas afficher le username dans le formulaire
        bio: '', // Ne pas afficher la bio dans le formulaire
        avatar_url: '', // Ne pas afficher l'avatar dans le formulaire
      });
    } else {
      setFormData({
        role_id: '',
        club_id: '',
        username: '',
        bio: '',
        avatar_url: '',
      });
    }
  }, [user, isOpen]);

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);
      const response = await fetch('/api/admin/roles');
      if (response.ok) {
        const data = await response.json();
        // Exclure le rôle "developer"
        const filteredRoles = data.filter((r: Role) => r.name !== 'developer');
        setRoles(filteredRoles);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await onSubmit({
      role_id: formData.role_id || null,
      club_id: formData.club_id || null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? `Modifier l'utilisateur` : 'Nouvel utilisateur'}
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            Enregistrer
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations non modifiables */}
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom complet
            </label>
            <input
              type="text"
              value={user?.full_name || 'N/A'}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Non modifiable
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Non modifiable
            </p>
          </div>
        </div>

        {/* Champs modifiables */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rôle <span className="text-red-500">*</span>
            </label>
            {loadingRoles ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">Chargement...</div>
            ) : (
              <select
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Sélectionner un rôle</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} {role.description && `- ${role.description}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Club
            </label>
            <select
              value={formData.club_id}
              onChange={(e) => setFormData({ ...formData, club_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Aucun club</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name} - {club.city}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Optionnel. Laissez vide si le rôle n'est pas lié à un club spécifique.
            </p>
          </div>
        </div>
      </form>
    </Modal>
  );
}

