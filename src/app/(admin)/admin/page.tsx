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
import { FileText, Check, Calendar, UserPlus } from 'lucide-react';
import { ClubMembershipRequestsModal } from '@/components/admin/ClubMembershipRequestsModal';

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

interface ClubMembershipRequest {
  clubId: string;
  clubName: string;
  clubCity: string;
  clubSlug: string;
  count: number;
}

interface MembershipRequestsStats {
  totalPending: number;
  byClub: ClubMembershipRequest[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [membershipRequests, setMembershipRequests] = useState<MembershipRequestsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMembershipRequests, setLoadingMembershipRequests] = useState(true);
  const [selectedClubForRequests, setSelectedClubForRequests] = useState<{ id: string; name: string } | null>(null);
  const [isMembershipRequestsModalOpen, setIsMembershipRequestsModalOpen] = useState(false);
  
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
  
  // États pour détecter si l'utilisateur est coach
  const [isCoach, setIsCoach] = useState(false);
  const [coachClubId, setCoachClubId] = useState<string | null>(null);
  
  // État pour la limite de blogs
  const [blogCount, setBlogCount] = useState<number | null>(null);
  const BLOG_LIMIT = 50;

  const fetchMembershipRequests = async (userIsCoach: boolean, userCoachClubId: string | null) => {
    try {
      setLoadingMembershipRequests(true);
      
      // Si l'utilisateur est coach, utiliser l'endpoint spécifique avec son club_id
      const url = userIsCoach && userCoachClubId
        ? `/api/admin/clubs/${userCoachClubId}/membership-requests`
        : '/api/admin/clubs/membership-requests';
      
      console.log('[Dashboard] Fetching membership requests:', { userIsCoach, userCoachClubId, url });
      
      const response = await fetch(url);
      const responseData = await response.json();
      
      console.log('[Dashboard] Membership requests response:', { 
        ok: response.ok, 
        success: responseData.success, 
        dataLength: responseData.data?.length 
      });
      
      if (response.ok) {
        if (responseData.success) {
          // Si coach, transformer les données pour correspondre au format attendu
          if (userIsCoach && userCoachClubId) {
            // Les données viennent directement comme un tableau de demandes
            const requests = responseData.data || [];
            console.log('[Dashboard] Coach requests:', requests.length);
            
            // Récupérer les infos du club
            const clubResponse = await fetch(`/api/admin/clubs/${userCoachClubId}`);
            if (clubResponse.ok) {
              const clubData = await clubResponse.json();
              console.log('[Dashboard] Club data:', clubData);
              
              setMembershipRequests({
                totalPending: requests.length,
                byClub: requests.length > 0 ? [{
                  clubId: userCoachClubId,
                  clubName: clubData.name || 'Club',
                  clubCity: clubData.city || '',
                  clubSlug: clubData.slug || '',
                  count: requests.length,
                }] : [],
              });
            } else {
              console.error('[Dashboard] Failed to fetch club data');
              setMembershipRequests({
                totalPending: requests.length,
                byClub: [],
              });
            }
          } else {
            setMembershipRequests(responseData.data);
          }
        } else {
          console.error('[Dashboard] API returned success: false', responseData);
          setMembershipRequests({
            totalPending: 0,
            byClub: [],
          });
        }
      } else {
        console.error('[Dashboard] API request failed:', response.status, responseData);
        setMembershipRequests({
          totalPending: 0,
          byClub: [],
        });
      }
    } catch (error) {
      console.error('[Dashboard] Error fetching membership requests:', error);
      setMembershipRequests({
        totalPending: 0,
        byClub: [],
      });
    } finally {
      setLoadingMembershipRequests(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      // D'abord vérifier le rôle de l'utilisateur
      let userIsCoach = false;
      let userCoachClubId: string | null = null;
      
      try {
        const roleResponse = await fetch('/api/admin/user-role');
        if (roleResponse.ok) {
          const roleData = await roleResponse.json();
          console.log('[Dashboard] User role data:', roleData);
          userIsCoach = roleData.isCoach || false;
          userCoachClubId = roleData.coachClubId || null;
          setIsCoach(userIsCoach);
          setCoachClubId(userCoachClubId);
          
          if (userIsCoach && !userCoachClubId) {
            console.warn('[Dashboard] User is coach but has no club_id');
          }
        } else {
          console.error('[Dashboard] Failed to fetch user role:', roleResponse.status);
        }
      } catch (error) {
        console.error('[Dashboard] Error checking user role:', error);
      }

      // Charger les stats seulement si l'utilisateur n'est pas coach
      if (!userIsCoach) {
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
      } else {
        setLoading(false);
      }

      // Charger le nombre de blogs pour vérifier la limite
      try {
        const blogResponse = await fetch('/api/admin/blog');
        if (blogResponse.ok) {
          const blogData = await blogResponse.json();
          setBlogCount(Array.isArray(blogData) ? blogData.length : 0);
        }
      } catch (error) {
        console.error('Error fetching blog count:', error);
      }

      // Charger les clubs seulement si l'utilisateur n'est pas coach
      if (!userIsCoach) {
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

      // Charger les demandes d'adhésion
      await fetchMembershipRequests(userIsCoach, userCoachClubId);
    }

    loadData();
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
            {isCoach ? 'Tableau de bord Coach' : 'Tableau de bord'}
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            {isCoach ? 'Gestion des demandes d\'adhésion de votre club' : 'Vue d\'ensemble de votre plateforme'}
          </p>
        </div>
      </div>

      {/* Actions Rapides - Masqué pour les coaches */}
      {!isCoach && (
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
                disabled={blogCount !== null && blogCount >= BLOG_LIMIT}
                className={`group p-3 border-2 rounded-lg transition-all text-left ${
                  blogCount !== null && blogCount >= BLOG_LIMIT
                    ? 'border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 cursor-not-allowed opacity-60'
                    : 'border-accent/40 dark:border-accent/30 hover:border-accent hover:bg-gradient-to-r hover:from-accent/10 hover:to-accent/5 cursor-pointer bg-white dark:bg-gray-800 shadow-sm hover:shadow-md shadow-accent/10'
                }`}
                title={blogCount !== null && blogCount >= BLOG_LIMIT ? `Limite de ${BLOG_LIMIT} articles atteinte` : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                    blogCount !== null && blogCount >= BLOG_LIMIT
                      ? 'bg-gray-200 dark:bg-gray-700'
                      : 'bg-gradient-to-br from-accent/20 to-accent/10 dark:from-accent/30 dark:to-accent/20 group-hover:from-accent/30 group-hover:to-accent/20'
                  }`}>
                    <NewspaperIcon className={`w-4 h-4 ${
                      blogCount !== null && blogCount >= BLOG_LIMIT
                        ? 'text-gray-400 dark:text-gray-500'
                        : 'text-accent dark:text-accent'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-semibold ${
                      blogCount !== null && blogCount >= BLOG_LIMIT
                        ? 'text-gray-500 dark:text-gray-400'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      Nouvel Article
                    </div>
                    <div className={`text-xs mt-0.5 ${
                      blogCount !== null && blogCount >= BLOG_LIMIT
                        ? 'text-gray-400 dark:text-gray-500'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {blogCount !== null && blogCount >= BLOG_LIMIT
                        ? `Limite de ${BLOG_LIMIT} articles atteinte`
                        : 'Publiez un nouvel article de blog'}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques - Masqué pour les coaches */}
      {!isCoach && (
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
      )}

      {/* Demandes d'adhésion en attente */}
      <div>
        <h2 className="text-lg font-semibold text-secondary dark:text-secondary-light mb-3 flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-to-b from-secondary to-accent rounded-full"></div>
          Demandes d'adhésion en attente
        </h2>
        <Card variant="bordered" className="border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-950/20 dark:to-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <UserPlus className="w-5 h-5" />
                  <span className="font-semibold">
                    {loadingMembershipRequests 
                      ? 'Chargement...' 
                      : membershipRequests 
                        ? `${membershipRequests.totalPending} demande${membershipRequests.totalPending > 1 ? 's' : ''} en attente`
                        : '0 demande en attente'}
                  </span>
                </CardTitle>
                <CardDescription className="text-xs mt-1 text-orange-600/70 dark:text-orange-400/70">
                  {isCoach ? 'Demandes pour votre club' : 'Répartition par club'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {loadingMembershipRequests ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  Chargement...
                </div>
              ) : !membershipRequests ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  Erreur lors du chargement des données
                </div>
              ) : isCoach && !coachClubId ? (
                <div className="text-center py-4 text-orange-600 dark:text-orange-400">
                  <p className="font-medium">Aucun club associé</p>
                  <p className="text-sm mt-1">Veuillez contacter un administrateur pour associer un club à votre compte.</p>
                </div>
              ) : membershipRequests.byClub.length === 0 ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  Aucune demande en attente
                </div>
                ) : (
                  membershipRequests.byClub.map((club) => (
                    <div
                      key={club.clubId}
                      onClick={() => {
                        setSelectedClubForRequests({ id: club.clubId, name: club.clubName });
                        setIsMembershipRequestsModalOpen(true);
                      }}
                      className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800/50 border border-orange-200 dark:border-orange-800/50 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {club.clubName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          {club.clubCity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 text-sm font-semibold">
                          {club.count}
                        </span>
                      </div>
                    </div>
                  ))
                )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activité Récente - Masqué pour les coaches */}
      {!isCoach && (
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
      )}

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

      <ClubMembershipRequestsModal
        isOpen={isMembershipRequestsModalOpen}
        onClose={() => {
          setIsMembershipRequestsModalOpen(false);
          setSelectedClubForRequests(null);
        }}
        clubId={selectedClubForRequests?.id || null}
        clubName={selectedClubForRequests?.name || null}
        onRequestUpdated={() => {
          // Rafraîchir les statistiques après une mise à jour
          fetchMembershipRequests(isCoach, coachClubId);
        }}
      />
    </div>
  );
}

