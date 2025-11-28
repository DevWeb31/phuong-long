/**
 * Admin FAQ Page - Gestion des Questions Fréquentes
 * 
 * Page de gestion des FAQ avec onglets : Général + un onglet par club
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Club } from '@/lib/types';
import { cn } from '@/lib/utils/cn';
import { FAQFormModal, type FAQItem } from '@/components/admin/FAQFormModal';
import { ConfirmModal } from '@/components/admin/Modal';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function AdminFAQPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoadingClubs, setIsLoadingClubs] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('general');
  const [faqItems, setFaqItems] = useState<Record<string, FAQItem[]>>({});
  const [isLoadingFAQ, setIsLoadingFAQ] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FAQItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userClubId, setUserClubId] = useState<string | null>(null);
  const [isCoach, setIsCoach] = useState(false);

  // Charger les clubs et vérifier le rôle de l'utilisateur
  useEffect(() => {
    async function loadClubs() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoadingClubs(false);
          return;
        }

        // Vérifier si l'utilisateur est un coach
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role_id, club_id, roles!inner(name)')
          .eq('user_id', user.id);

        const roles = (userRoles as any[])?.map(ur => ur.roles?.name) || [];
        const coachRole = roles.includes('coach');
        setIsCoach(coachRole);

        // Si coach, récupérer uniquement son club
        if (coachRole && userRoles && userRoles.length > 0) {
          const clubId = (userRoles[0] as any).club_id;
          setUserClubId(clubId);
          
          if (clubId) {
            const { data: clubData, error: clubError } = await supabase
              .from('clubs')
              .select('id, name, slug, city')
              .eq('id', clubId)
              .eq('active', true)
              .single();

            if (!clubError && clubData) {
              setClubs([clubData] as unknown as Club[]);
            }
          }
        } else {
          // Sinon, charger tous les clubs actifs
          const { data, error } = await supabase
            .from('clubs')
            .select('id, name, slug, city')
            .eq('active', true)
            .order('city');

          if (error) {
            console.error('Error loading clubs:', error);
          } else {
            setClubs((data || []) as unknown as Club[]);
          }
        }
      } catch (error) {
        console.error('Unexpected error loading clubs:', error);
      } finally {
        setIsLoadingClubs(false);
      }
    }

    loadClubs();
  }, []);

  // Charger les FAQ depuis l'API
  useEffect(() => {
    async function loadFAQ() {
      if (isLoadingClubs || clubs.length === 0) return;

      try {
        const initialFAQ: Record<string, FAQItem[]> = {};

        // Si coach, ne charger que les FAQ de son club
        if (isCoach && userClubId) {
          const clubResponse = await fetch(`/api/admin/faq?club_id=${userClubId}`);
          if (clubResponse.ok) {
            const clubData = await clubResponse.json();
            initialFAQ[userClubId] = clubData || [];
          } else {
            initialFAQ[userClubId] = [];
          }
        } else {
          // Sinon, charger les FAQ générales et de tous les clubs
          initialFAQ.general = [];

          // Charger les FAQ générales
          const generalResponse = await fetch('/api/admin/faq?club_id=general');
          if (generalResponse.ok) {
            const generalData = await generalResponse.json();
            initialFAQ.general = generalData || [];
          }

          // Charger les FAQ de chaque club
          for (const club of clubs) {
            const clubResponse = await fetch(`/api/admin/faq?club_id=${club.id}`);
            if (clubResponse.ok) {
              const clubData = await clubResponse.json();
              initialFAQ[club.id] = clubData || [];
            } else {
              initialFAQ[club.id] = [];
            }
          }
        }

        setFaqItems(initialFAQ);
        
        // Si coach, définir l'onglet actif sur son club
        if (isCoach && userClubId) {
          setActiveTab(userClubId);
        }
      } catch (error) {
        console.error('Error loading FAQ:', error);
      } finally {
        setIsLoadingFAQ(false);
      }
    }

    if (!isLoadingClubs && clubs.length > 0) {
      loadFAQ();
    }
  }, [clubs, isLoadingClubs, isCoach, userClubId]);

  const handleAdd = () => {
    // Vérifier la limite de 10 FAQ par onglet
    if (currentFAQItems.length >= 10) {
      alert('La limite de 10 FAQ par onglet est atteinte. Veuillez supprimer une FAQ existante avant d\'en ajouter une nouvelle.');
      return;
    }
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: FAQItem) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (item: FAQItem) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (item: FAQItem) => {
    setIsSubmitting(true);
    try {
      const url = item.id ? `/api/admin/faq/${item.id}` : '/api/admin/faq';
      const method = item.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: item.question,
          answer: item.answer,
          display_order: item.display_order,
          club_id: activeTab === 'general' ? null : activeTab,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
      }

      const savedItem = await response.json();

      // Mettre à jour l'état local
      const currentItems = faqItems[activeTab] || [];
      if (item.id) {
        // Modification
        const updatedItems = currentItems.map((i) =>
          i.id === item.id ? savedItem : i
        );
        setFaqItems({ ...faqItems, [activeTab]: updatedItems });
      } else {
        // Ajout
        setFaqItems({
          ...faqItems,
          [activeTab]: [...currentItems, savedItem],
        });
      }

      setIsFormOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error submitting FAQ:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem || !selectedItem.id) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/faq/${selectedItem.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      // Mettre à jour l'état local
      const currentItems = faqItems[activeTab] || [];
      const updatedItems = currentItems.filter((i) => i.id !== selectedItem.id);
      setFaqItems({ ...faqItems, [activeTab]: updatedItems });

      setIsDeleteOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la suppression');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentFAQItems = faqItems[activeTab] || [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Gestion des FAQ
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Gérez les questions fréquentes par catégorie (Général et par club)
        </p>
      </div>

      {/* Tabs - Masquer pour les coaches (ils n'ont qu'un seul club) */}
      {!isCoach && (
        <div className="mb-4 sm:mb-6 border-b border-gray-200 dark:border-gray-800 -mx-4 sm:mx-0 px-4 sm:px-0">
          <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('general')}
              className={cn(
                'whitespace-nowrap py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 sm:gap-2 flex-shrink-0',
                activeTab === 'general'
                  ? 'border-primary text-primary dark:text-primary-light'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              )}
            >
              Général
              <span className={cn(
                'px-1.5 py-0.5 text-xs rounded-full',
                activeTab === 'general'
                  ? 'bg-primary/20 text-primary dark:bg-primary/30'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              )}>
                {(faqItems.general || []).length}/10
              </span>
            </button>
            {isLoadingClubs ? (
              <div className="py-3 sm:py-4 px-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                Chargement...
              </div>
            ) : (
              clubs.map((club) => (
                <button
                  key={club.id}
                  onClick={() => setActiveTab(club.id)}
                  className={cn(
                    'whitespace-nowrap py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 sm:gap-2 flex-shrink-0',
                    activeTab === club.id
                      ? 'border-primary text-primary dark:text-primary-light'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  )}
                >
                  <span className="hidden sm:inline">{club.city}</span>
                  <span className="sm:hidden">{club.city.length > 10 ? `${club.city.substring(0, 10)}...` : club.city}</span>
                  <span className={cn(
                    'px-1.5 py-0.5 text-xs rounded-full',
                    activeTab === club.id
                      ? 'bg-primary/20 text-primary dark:bg-primary/30'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  )}>
                    {(faqItems[club.id] || []).length}/10
                  </span>
                </button>
              ))
            )}
          </nav>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingFAQ ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500 dark:text-gray-400">Chargement...</div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {activeTab === 'general'
                    ? 'Questions Générales'
                    : `Questions - ${clubs.find((c) => c.id === activeTab)?.city || ''}`}
                </h2>
                <span className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap',
                  currentFAQItems.length >= 10
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                )}>
                  {currentFAQItems.length}/10 FAQ
                </span>
              </div>
              <button
                onClick={handleAdd}
                disabled={currentFAQItems.length >= 10}
                className={cn(
                  'px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium whitespace-nowrap w-full sm:w-auto',
                  currentFAQItems.length >= 10
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                    : 'bg-primary text-white hover:bg-primary-dark'
                )}
              >
                + Ajouter une question
              </button>
            </div>

            {currentFAQItems.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4">
                  Aucune question pour le moment.
                </p>
                <button
                  onClick={handleAdd}
                  disabled={currentFAQItems.length >= 10}
                  className={cn(
                    'px-4 py-2 rounded-lg transition-colors text-sm font-medium w-full sm:w-auto',
                    currentFAQItems.length >= 10
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                      : 'bg-primary text-white hover:bg-primary-dark'
                  )}
                >
                  Ajouter la première question
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {currentFAQItems
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 dark:border-gray-800 rounded-lg p-3 sm:p-4 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 break-words">
                            {item.question}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">
                            {item.answer.length > 150 
                              ? `${item.answer.substring(0, 150)}...` 
                              : item.answer}
                          </p>
                        </div>
                        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 sm:p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Éditer"
                            aria-label="Éditer cette question"
                          >
                            <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Supprimer"
                            aria-label="Supprimer cette question"
                          >
                            <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <FAQFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={handleSubmit}
        item={selectedItem}
        isLoading={isSubmitting}
        clubId={activeTab === 'general' ? null : activeTab}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer la question"
        message={`Êtes-vous sûr de vouloir supprimer la question "${selectedItem?.question}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}

