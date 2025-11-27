/**
 * Emails Settings Section
 * 
 * Section pour gérer les emails des clubs et l'email du site principal
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/common';
import { Mail, Phone, X } from 'lucide-react';

interface Club {
  id: string;
  name: string;
  city: string;
  email: string | null;
  phone: string | null;
}

interface SiteEmail {
  key: string;
  value: string;
}

export function EmailsSettingsSection() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [siteEmail, setSiteEmail] = useState<string>('');
  const [pendingEmails, setPendingEmails] = useState<Record<string, string>>({});
  const [pendingPhones, setPendingPhones] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingClubId, setSavingClubId] = useState<string | null>(null);
  const [savingSiteEmail, setSavingSiteEmail] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!snackbar) return;
    const timer = setTimeout(() => setSnackbar(null), 4000);
    return () => clearTimeout(timer);
  }, [snackbar]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Charger les clubs
      const clubsResponse = await fetch('/api/admin/clubs');
      if (clubsResponse.ok) {
        const clubsData: Club[] = await clubsResponse.json();
        setClubs(clubsData);
        // Initialiser les valeurs en attente avec les emails et téléphones actuels
        const initialPendingEmails: Record<string, string> = {};
        const initialPendingPhones: Record<string, string> = {};
        clubsData.forEach((club) => {
          initialPendingEmails[club.id] = club.email || '';
          // S'assurer que le téléphone est bien récupéré (peut être null ou undefined)
          initialPendingPhones[club.id] = (club.phone ?? '') || '';
        });
        setPendingEmails(initialPendingEmails);
        setPendingPhones(initialPendingPhones);
      }

      // Charger l'email du site principal
      const settingsResponse = await fetch('/api/admin/site-settings');
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        const siteEmailSetting = settingsData.find((s: SiteEmail) => s.key === 'site.main_email');
        if (siteEmailSetting) {
          setSiteEmail(siteEmailSetting.value || '');
        }
      }
    } catch (error) {
      console.error('Error loading emails data:', error);
      setSnackbar({ message: 'Erreur lors du chargement des données', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClubEmailChange = (clubId: string, newEmail: string) => {
    setPendingEmails((prev) => ({
      ...prev,
      [clubId]: newEmail,
    }));
  };

  const handleClubPhoneChange = (clubId: string, newPhone: string) => {
    setPendingPhones((prev) => ({
      ...prev,
      [clubId]: newPhone,
    }));
  };

  const handleSaveClubEmail = async (clubId: string) => {
    const newEmail = pendingEmails[clubId]?.trim() || null;
    const club = clubs.find((c) => c.id === clubId);
    const currentEmail = club?.email || null;

    // Vérifier si l'email a changé
    if (newEmail === currentEmail) {
      return;
    }

    // Validation email si non vide
    if (newEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setSnackbar({ message: 'Format d\'email invalide', type: 'error' });
      return;
    }

    try {
      setSavingClubId(clubId);
      const response = await fetch(`/api/admin/clubs/${clubId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Erreur lors de la sauvegarde');
      }

      const updatedClub = await response.json();

      // Mettre à jour l'état local
      setClubs((prev) =>
        prev.map((club) => (club.id === clubId ? { ...club, email: updatedClub.email } : club))
      );

      // Réinitialiser la valeur en attente
      setPendingEmails((prev) => ({
        ...prev,
        [clubId]: updatedClub.email || '',
      }));

      setSnackbar({ message: 'Email du club enregistré avec succès', type: 'success' });
    } catch (error) {
      console.error('Error saving club email:', error);
      setSnackbar({
        message: 'Erreur lors de la sauvegarde de l\'email du club',
        type: 'error',
      });
    } finally {
      setSavingClubId(null);
    }
  };

  const handleSaveClubPhone = async (clubId: string) => {
    const newPhone = pendingPhones[clubId]?.trim() || null;
    const club = clubs.find((c) => c.id === clubId);
    const currentPhone = club?.phone || null;

    // Vérifier si le téléphone a changé
    if (newPhone === currentPhone) {
      return;
    }

    try {
      setSavingClubId(clubId);
      const response = await fetch(`/api/admin/clubs/${clubId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: newPhone }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Erreur lors de la sauvegarde');
      }

      const updatedClub = await response.json();

      // Mettre à jour l'état local
      setClubs((prev) =>
        prev.map((club) => (club.id === clubId ? { ...club, phone: updatedClub.phone } : club))
      );

      // Réinitialiser la valeur en attente
      setPendingPhones((prev) => ({
        ...prev,
        [clubId]: updatedClub.phone || '',
      }));

      setSnackbar({ message: 'Téléphone du club enregistré avec succès', type: 'success' });
    } catch (error) {
      console.error('Error saving club email:', error);
      setSnackbar({
        message: 'Erreur lors de la sauvegarde de l\'email du club',
        type: 'error',
      });
    } finally {
      setSavingClubId(null);
    }
  };

  const handleSiteEmailChange = (newEmail: string) => {
    setSiteEmail(newEmail);
  };

  const handleSaveSiteEmail = async () => {
    // Validation email si non vide
    if (siteEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(siteEmail.trim())) {
      setSnackbar({ message: 'Format d\'email invalide', type: 'error' });
      return;
    }

    try {
      setSavingSiteEmail(true);
      const response = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'site.main_email',
          value: siteEmail.trim() || null,
          label: 'Email principal du site',
          description: 'Adresse email principale utilisée pour les communications du site',
          category: 'emails',
          type: 'string',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Erreur lors de la sauvegarde');
      }

      setSnackbar({ message: 'Email du site enregistré avec succès', type: 'success' });
    } catch (error) {
      console.error('Error saving site email:', error);
      setSnackbar({
        message: 'Erreur lors de la sauvegarde de l\'email du site',
        type: 'error',
      });
    } finally {
      setSavingSiteEmail(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 dark:border-gray-800"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email du site principal */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <CardTitle>Email du site principal</CardTitle>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Adresse email principale utilisée pour les communications du site
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <input
                type="email"
                value={siteEmail}
                onChange={(e) => handleSiteEmailChange(e.target.value)}
                disabled={savingSiteEmail}
                placeholder="contact@phuong-long-vo-dao.com"
                className="w-full px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              disabled={savingSiteEmail}
              onClick={handleSaveSiteEmail}
            >
              {savingSiteEmail ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cards des clubs en grille horizontale sur desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emails des clubs */}
        <Card variant="bordered" className="h-full flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              <CardTitle>Emails des clubs</CardTitle>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Gérez les adresses email de chaque club
            </p>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {clubs.length === 0 ? (
              <p className="text-center py-8 text-gray-600 dark:text-gray-400">
                Aucun club disponible
              </p>
            ) : (
            clubs.map((club, index) => {
              // Utiliser la valeur en attente si disponible, sinon la valeur du club
              const currentEmail = pendingEmails[club.id] !== undefined 
                ? pendingEmails[club.id] 
                : (club.email || '');
              const isSaving = savingClubId === club.id;
              const originalEmail = club.email || '';
              const hasEmailChanges = currentEmail !== originalEmail;

              return (
                <div key={club.id}>
                  <div className="flex flex-col gap-3 py-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {club.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{club.city}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="email"
                        value={currentEmail}
                        onChange={(e) => handleClubEmailChange(club.id, e.target.value)}
                        disabled={isSaving}
                        placeholder="club@phuong-long-vo-dao.com"
                        className="flex-1 px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      />
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={!hasEmailChanges || isSaving}
                          onClick={() => handleSaveClubEmail(club.id)}
                          className="whitespace-nowrap"
                        >
                          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                      </div>
                    </div>
                    {index !== clubs.length - 1 && (
                      <div className="border-t dark:border-gray-800" />
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Téléphones des clubs */}
        <Card variant="bordered" className="h-full flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              <CardTitle>Téléphones des clubs</CardTitle>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Gérez les numéros de téléphone de chaque club
            </p>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {clubs.length === 0 ? (
              <p className="text-center py-8 text-gray-600 dark:text-gray-400">
                Aucun club disponible
              </p>
            ) : (
            clubs.map((club, index) => {
              // Utiliser la valeur en attente si disponible, sinon la valeur du club
              const currentPhone = pendingPhones[club.id] !== undefined 
                ? pendingPhones[club.id] 
                : (club.phone || '');
              const isSaving = savingClubId === club.id;
              const originalPhone = club.phone || '';
              const hasPhoneChanges = currentPhone !== originalPhone;

              return (
                <div key={club.id}>
                  <div className="flex flex-col gap-3 py-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {club.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{club.city}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="tel"
                        value={currentPhone}
                        onChange={(e) => handleClubPhoneChange(club.id, e.target.value)}
                        disabled={isSaving}
                        placeholder="06 12 34 56 78"
                        className="flex-1 px-3 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      />
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={!hasPhoneChanges || isSaving}
                          onClick={() => handleSaveClubPhone(club.id)}
                          className="whitespace-nowrap"
                        >
                          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                      </div>
                    </div>
                    {index !== clubs.length - 1 && (
                      <div className="border-t dark:border-gray-800" />
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Snackbar */}
      {snackbar && (
        <div
          className={`
            fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl shadow-lg border
            flex items-center gap-3 text-sm font-medium z-50
            ${snackbar.type === 'success'
              ? 'bg-green-500 text-white border-green-600'
              : 'bg-red-500 text-white border-red-600'}
          `}
        >
          <span>{snackbar.message}</span>
          <button
            type="button"
            onClick={() => setSnackbar(null)}
            className="p-1 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

