/**
 * Admin Dashboard - Tableau de bord administrateur
 * 
 * Dashboard principal avec analytics et statistiques
 * 
 * @version 1.0
 * @date 2025-11-05 00:50
 */

'use client';

import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/admin/StatsCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common';
import { ClubFormModal } from '@/components/admin/ClubFormModal';
import { EventFormModal } from '@/components/admin/EventFormModal';
import { BlogFormModal } from '@/components/admin/BlogFormModal';
import {
  UsersIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  NewspaperIcon,
} from '@heroicons/react/24/outline';
import { FileText, Check, Calendar } from 'lucide-react';

interface DashboardStats {
  users: {
    total: number;
  };
  clubs: {
    active: number;
  };
  events: {
    upcoming: number;
    ongoing: number;
    past: number;
  };
  blogPosts: {
    published: number;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // États pour les modales
  const [isClubModalOpen, setIsClubModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  
  // États pour le chargement
  const [isSubmittingClub, setIsSubmittingClub] = useState(false);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [isSubmittingBlog, setIsSubmittingBlog] = useState(false);
  
  // Clubs pour EventFormModal
  const [clubs, setClubs] = useState<Array<{ id: string; name: string; city: string }>>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des statistiques');
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchClubs() {
      try {
        const response = await fetch('/api/admin/clubs');
        if (response.ok) {
          const data = await response.json();
          setClubs(data);
        }
      } catch (error) {
        console.error('Error fetching clubs:', error);
      }
    }

    fetchStats();
    fetchClubs();
  }, []);

  const reloadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error reloading stats:', error);
    }
  };

  const handleClubSubmit = async (clubData: Partial<any>) => {
    try {
      setIsSubmittingClub(true);
      const response = await fetch('/api/admin/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clubData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Erreur lors de la création');
      }

      setIsClubModalOpen(false);
      await reloadStats();
    } catch (error) {
      console.error('Error creating club:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      alert(`Erreur : ${errorMessage}`);
      throw error;
    } finally {
      setIsSubmittingClub(false);
    }
  };

  const handleEventSubmit = async (eventData: Partial<any>) => {
    try {
      setIsSubmittingEvent(true);
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Erreur lors de la création');
      }

      setIsEventModalOpen(false);
      await reloadStats();
    } catch (error) {
      console.error('Error creating event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      alert(`Erreur : ${errorMessage}`);
      throw error;
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const handleBlogSubmit = async (postData: Partial<any>) => {
    try {
      setIsSubmittingBlog(true);
      const response = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Erreur lors de la création');
      }

      setIsBlogModalOpen(false);
      await reloadStats();
    } catch (error) {
      console.error('Error creating blog post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      alert(`Erreur : ${errorMessage}`);
      throw error;
    } finally {
      setIsSubmittingBlog(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Tableau de bord
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            Vue d'ensemble de votre plateforme
          </p>
        </div>
      </div>

      {/* Actions Rapides - Mise en avant */}
      <Card variant="bordered" className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-2 border-primary/30 dark:border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-base flex items-center gap-2 text-primary dark:text-primary-light">
            <span className="font-bold">Actions Rapides</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => setIsEventModalOpen(true)}
              className="group p-3 border-2 border-secondary/40 dark:border-secondary/30 rounded-lg hover:border-secondary hover:bg-gradient-to-r hover:from-secondary/10 hover:to-secondary/5 transition-all text-left cursor-pointer bg-white dark:bg-gray-800 shadow-sm hover:shadow-md shadow-secondary/10"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/10 dark:from-secondary/30 dark:to-secondary/20 flex items-center justify-center flex-shrink-0 group-hover:from-secondary/30 group-hover:to-secondary/20 transition-all">
                  <CalendarIcon className="w-4 h-4 text-secondary dark:text-secondary-light" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Nouvel Événement</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Organisez un stage ou une compétition
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setIsBlogModalOpen(true)}
              className="group p-3 border-2 border-accent/40 dark:border-accent/30 rounded-lg hover:border-accent hover:bg-gradient-to-r hover:from-accent/10 hover:to-accent/5 transition-all text-left cursor-pointer bg-white dark:bg-gray-800 shadow-sm hover:shadow-md shadow-accent/10"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 dark:from-accent/30 dark:to-accent/20 flex items-center justify-center flex-shrink-0 group-hover:from-accent/30 group-hover:to-accent/20 transition-all">
                  <NewspaperIcon className="w-4 h-4 text-accent dark:text-accent" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Nouvel Article</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Publiez un nouvel article de blog
                  </div>
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div>
        <h2 className="text-lg font-semibold text-primary dark:text-primary-light mb-3 flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
          Vue d'ensemble
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatsCard
            title="Utilisateurs"
            value={loading ? '...' : stats?.users.total.toString() || '0'}
            description="Inscrits sur la plateforme"
            icon={<UsersIcon className="w-6 h-6" />}
            color="primary"
          />

          <StatsCard
            title="Clubs Actifs"
            value={loading ? '...' : stats?.clubs.active.toString() || '0'}
            description="Clubs opérationnels"
            icon={<BuildingOfficeIcon className="w-6 h-6" />}
            color="secondary"
          />

          <StatsCard
            title="Articles Blog"
            value={loading ? '...' : stats?.blogPosts.published.toString() || '0'}
            description="Publiés au total"
            icon={<NewspaperIcon className="w-6 h-6" />}
            color="success"
          />

          <Card variant="bordered" hoverable className="lg:col-span-1 border-accent/20 dark:border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardDescription className="text-xs mb-0 text-accent dark:text-accent font-medium">Événements</CardDescription>
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent/10 dark:from-accent/30 dark:to-accent/20 text-accent shadow-sm shadow-accent/20">
                  <CalendarIcon className="w-5 h-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {loading ? '...' : stats?.events.upcoming.toString() || '0'}
                  </div>
                  <div className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">À venir</div>
                </div>
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                  <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                    {loading ? '...' : stats?.events.ongoing.toString() || '0'}
                  </div>
                  <div className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-0.5">En cours</div>
                </div>
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <div className="text-xl font-bold text-gray-700 dark:text-gray-300">
                    {loading ? '...' : stats?.events.past.toString() || '0'}
                  </div>
                  <div className="text-xs text-gray-600/70 dark:text-gray-400/70 mt-0.5">Passés</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activité Récente */}
      <div>
        <h2 className="text-lg font-semibold text-secondary dark:text-secondary-light mb-3 flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-to-b from-secondary to-accent rounded-full"></div>
          Activité Récente
        </h2>
        <Card variant="bordered" className="border-secondary/20 dark:border-secondary/30">
          <CardContent className="pt-4 pb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-gradient-to-r from-green-50 to-green-50/50 dark:from-green-950/20 dark:to-green-950/10 border border-green-200 dark:border-green-900/50 hover:from-green-100 hover:to-green-50 dark:hover:from-green-950/30 dark:hover:to-green-950/20 transition-all">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm shadow-green-500/30">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Nouvel utilisateur inscrit
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Il y a 5 minutes</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-950/20 dark:to-blue-950/10 border border-blue-200 dark:border-blue-900/50 hover:from-blue-100 hover:to-blue-50 dark:hover:from-blue-950/30 dark:hover:to-blue-950/20 transition-all">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-500/30">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Article publié</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Il y a 2 heures</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-gradient-to-r from-amber-50 to-amber-50/50 dark:from-amber-950/20 dark:to-amber-950/10 border border-amber-200 dark:border-amber-900/50 hover:from-amber-100 hover:to-amber-50 dark:hover:from-amber-950/30 dark:hover:to-amber-950/20 transition-all">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm shadow-amber-500/30">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Événement créé</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Il y a 5 heures</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modales */}
      <ClubFormModal
        isOpen={isClubModalOpen}
        onClose={() => setIsClubModalOpen(false)}
        onSubmit={handleClubSubmit}
        isLoading={isSubmittingClub}
      />

      <EventFormModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSubmit={handleEventSubmit}
        clubs={clubs}
        isLoading={isSubmittingEvent}
      />

      <BlogFormModal
        isOpen={isBlogModalOpen}
        onClose={() => setIsBlogModalOpen(false)}
        onSubmit={handleBlogSubmit}
        isLoading={isSubmittingBlog}
      />
    </div>
  );
}

