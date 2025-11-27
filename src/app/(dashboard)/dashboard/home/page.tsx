/**
 * Dashboard Home Page - Tableau de bord
 * 
 * Page principale du dashboard avec sélection de club si nécessaire
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/common';
import { Loader2, CheckCircle2, MapPin, Phone, Mail, Calendar, MapPin as MapPinIcon, ExternalLink, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';

interface Club {
  id: string;
  name: string;
  slug: string;
  city: string;
  postal_code: string | null;
}

interface MembershipStatus {
  hasClub: boolean;
  favoriteClubId: string | null;
  pendingRequests: Array<{
    id: string;
    club_id: string;
    status: string;
    requested_at: string;
    clubs: {
      name: string;
      slug: string;
    };
  }>;
  approvedRequests: Array<{
    id: string;
    club_id: string;
    status: string;
    requested_at: string;
    clubs: {
      name: string;
      slug: string;
    };
  }>;
}

interface ClubInfo {
  id: string;
  name: string;
  slug: string;
  city: string;
  address: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  cover_image_url: string | null;
  social_media: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    discord?: string;
  } | null;
}

interface UpcomingEvent {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  event_type: string;
  start_date: string;
  end_date: string | null;
  location: string | null;
  cover_image_url: string | null;
}

export default function DashboardHomePage() {
  const { user, loading: authLoading } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedClubName, setSelectedClubName] = useState<string>('');
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus | null>(null);
  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [discordLink, setDiscordLink] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingClubInfo, setIsLoadingClubInfo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger les informations du club
  const loadClubInfo = async () => {
    try {
      setIsLoadingClubInfo(true);
      const [clubResponse, discordResponse] = await Promise.all([
        fetch('/api/clubs/my-club'),
        fetch('/api/settings/discord'),
      ]);

      if (clubResponse.ok) {
        const data = await clubResponse.json();
        if (data.success && data.data) {
          setClubInfo(data.data.club);
          setUpcomingEvents(data.data.upcomingEvents || []);
        }
      }

      if (discordResponse.ok) {
        const discordData = await discordResponse.json();
        if (discordData.success) {
          setDiscordLink(discordData.data.discordLink);
        }
      }
    } catch (err) {
      console.error('Error loading club info:', err);
    } finally {
      setIsLoadingClubInfo(false);
    }
  };

  // Charger les clubs et le statut d'adhésion
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);

        // Charger les clubs
        const clubsResponse = await fetch('/api/clubs');
        if (clubsResponse.ok) {
          const clubsData = await clubsResponse.json();
          setClubs(clubsData);
        }

        // Charger le statut d'adhésion
        const statusResponse = await fetch('/api/clubs/membership-status');
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          if (statusData.success) {
            setMembershipStatus(statusData.data);
            
            // Si l'utilisateur a un club (via favorite_club_id ou demande approuvée), charger les informations
            if (statusData.data.hasClub || 
                statusData.data.favoriteClubId || 
                (statusData.data.approvedRequests && statusData.data.approvedRequests.length > 0)) {
              await loadClubInfo();
            }
          }
        }
      } catch (err) {
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleClubSelect = (clubId: string) => {
    const club = clubs.find(c => c.id === clubId);
    if (club) {
      setSelectedClubId(clubId);
      setSelectedClubName(club.name);
      setShowConfirmDialog(true);
    }
  };

  const handleConfirm = async () => {
    if (!selectedClubId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/clubs/request-membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clubId: selectedClubId }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de la soumission de la demande');
      }

      // Mettre à jour le statut
      const statusResponse = await fetch('/api/clubs/membership-status');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        if (statusData.success) {
          setMembershipStatus(statusData.data);
        }
      }

      setShowConfirmDialog(false);
      setSelectedClubId('');
      setSelectedClubName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 dark:text-gray-500">Vous devez être connecté pour accéder à cette page.</p>
      </div>
    );
  }

  // Si l'utilisateur a un club ou une demande en attente
  const hasPendingRequest = membershipStatus?.pendingRequests && membershipStatus.pendingRequests.length > 0;
  const hasApprovedClub = membershipStatus?.hasClub || (membershipStatus?.approvedRequests && membershipStatus.approvedRequests.length > 0);
  
  // Vérifier aussi si on a déjà chargé les infos du club (même si hasApprovedClub est false)
  const shouldShowClubCards = hasApprovedClub || clubInfo !== null;

  if (hasApprovedClub || hasPendingRequest) {
    const pendingRequest = membershipStatus?.pendingRequests?.[0];
    
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold dark:text-gray-100 mb-2">
            Bienvenue, {user.user_metadata?.full_name || user.email?.split('@')[0]} ! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-500">
            Gérez votre compte, vos inscriptions et votre progression.
          </p>
        </div>

        {hasPendingRequest && (
          <Card variant="bordered" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Demande d'adhésion en cours de validation
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300">
                    Votre demande d'adhésion au club <strong>{pendingRequest?.clubs.name}</strong> est en cours de validation par l'équipe.
                    Vous recevrez une notification une fois votre demande traitée.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {shouldShowClubCards && !hasPendingRequest && (
          <>
            {isLoadingClubInfo ? (
              <Card variant="bordered">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                </CardContent>
              </Card>
            ) : clubInfo ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Card Informations du club */}
                <Card variant="bordered" className="lg:col-span-2">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary dark:text-primary-light" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{clubInfo.name}</CardTitle>
                        <CardDescription className="text-sm">{clubInfo.city}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {clubInfo.address && (
                          <div className="flex items-start gap-2.5">
                            <MapPinIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Adresse</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {clubInfo.address}
                                {clubInfo.postal_code && `, ${clubInfo.postal_code}`}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {clubInfo.phone && (
                          <div className="flex items-start gap-2.5">
                            <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Téléphone</p>
                              <a 
                                href={`tel:${clubInfo.phone}`}
                                className="text-xs text-primary hover:underline"
                              >
                                {clubInfo.phone}
                              </a>
                            </div>
                          </div>
                        )}
                        
                        {clubInfo.email && (
                          <div className="flex items-start gap-2.5">
                            <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Email</p>
                              <a 
                                href={`mailto:${clubInfo.email}`}
                                className="text-xs text-primary hover:underline break-all"
                              >
                                {clubInfo.email}
                              </a>
                            </div>
                          </div>
                        )}
                        
                        {clubInfo.social_media && (clubInfo.social_media.facebook || clubInfo.social_media.instagram || clubInfo.social_media.youtube) && (
                          <div className="flex items-start gap-2.5">
                            <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Réseaux sociaux</p>
                              <div className="flex flex-wrap gap-2">
                                {clubInfo.social_media.facebook && (
                                  <a
                                    href={clubInfo.social_media.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline"
                                  >
                                    Facebook
                                  </a>
                                )}
                                {clubInfo.social_media.instagram && (
                                  <a
                                    href={clubInfo.social_media.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline"
                                  >
                                    Instagram
                                  </a>
                                )}
                                {clubInfo.social_media.youtube && (
                                  <a
                                    href={clubInfo.social_media.youtube}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline"
                                  >
                                    YouTube
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                  </CardContent>
                </Card>

                {/* Card Événements à venir */}
                <Card variant="bordered">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-accent/10 dark:bg-accent/20 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Événements à venir</CardTitle>
                        <CardDescription>
                          {upcomingEvents.length > 0 
                            ? `${upcomingEvents.length} événement${upcomingEvents.length > 1 ? 's' : ''}`
                            : 'Aucun événement prévu'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {upcomingEvents.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                        Aucun événement à venir pour le moment
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {upcomingEvents.map((event) => {
                          const eventDate = new Date(event.start_date);
                          const formattedDate = eventDate.toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          });
                          
                          return (
                            <Link
                              key={event.id}
                              href={`/events/${event.slug}`}
                              className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
                                {event.title}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                {formattedDate}
                              </p>
                              {event.location && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                                  <MapPinIcon className="w-3 h-3" />
                                  {event.location}
                                </p>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Card Discord */}
                {discordLink && (
                  <Card variant="bordered">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center">
                          <MessageCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Rejoignez notre Discord</CardTitle>
                          <CardDescription>
                            Communauté et échanges en temps réel
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <a
                        href={discordLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full"
                      >
                        <Button
                          variant="primary"
                          fullWidth
                          className="flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-5 h-5" />
                          Rejoindre le serveur Discord
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card variant="bordered">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                    <div>
                      <h3 className="text-lg font-semibold dark:text-gray-100 mb-1">
                        Club associé
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Vous êtes membre d'un club.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    );
  }

  // Si l'utilisateur n'a pas de club, afficher le sélecteur
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-2xl">
        <Card variant="bordered" className="text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl mb-2">
              Sélectionnez votre club
            </CardTitle>
            <CardDescription>
              Choisissez le club Phuong Long Vo Dao auquel vous souhaitez vous associer.
              Votre demande sera soumise pour validation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <div className="space-y-3 mb-6">
              <label htmlFor="club-select" className="block text-sm font-medium dark:text-gray-300 text-left mb-2">
                Club
              </label>
              <select
                id="club-select"
                value={selectedClubId}
                onChange={(e) => handleClubSelect(e.target.value)}
                className={cn(
                  'w-full px-4 py-3 rounded-xl border',
                  'bg-white dark:bg-gray-800',
                  'border-gray-300 dark:border-gray-700',
                  'text-gray-900 dark:text-gray-100',
                  'focus:ring-2 focus:ring-primary focus:border-transparent',
                  'transition-all duration-200'
                )}
              >
                <option value="">Sélectionnez un club...</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name} - {club.city} {club.postal_code ? `(${club.postal_code})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Boîte de dialogue de confirmation */}
        {showConfirmDialog && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowConfirmDialog(false)}
            />

            {/* Dialog */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <Card variant="bordered" className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="text-xl">Confirmer votre choix</CardTitle>
                  <CardDescription>
                    Vous êtes sur le point de demander l'adhésion au club suivant :
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-lg font-semibold dark:text-gray-100">
                      {selectedClubName}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowConfirmDialog(false);
                        setSelectedClubId('');
                        setSelectedClubName('');
                      }}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleConfirm}
                      isLoading={isSubmitting}
                      className="flex-1"
                    >
                      Confirmer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
