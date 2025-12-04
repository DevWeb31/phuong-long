/**
 * Event Carousel Card Component
 * 
 * Carte d'événement pour le carrousel
 * - Mobile: 1 carte (100% - padding)
 * - Tablette: 2 cartes (50% - gap)
 * - Desktop: 3 cartes (33.333% - gap)
 * 
 * @version 1.0
 * @date 2025-11-11
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, Badge } from '@/components/common';
import { CalendarIcon, MapPinIcon, UsersIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { Zap } from 'lucide-react';
import type { Event } from '@/lib/types';

interface Club {
  id: string;
  name: string;
  city: string;
  slug: string;
}

interface EventWithClub extends Event {
  club: Club | null;
  prices?: Array<{
    id: string;
    label: string;
    price_cents: number;
    display_order: number;
  }>;
}

interface EventCarouselCardProps {
  event: EventWithClub;
  timeStatus: 'past' | 'current' | 'upcoming';
}

export function EventCarouselCard({ event, timeStatus }: EventCarouselCardProps) {
  const isPast = timeStatus === 'past';
  const isCurrent = timeStatus === 'current';

  // Calculer le prix à afficher
  const getPriceDisplay = () => {
    const prices = event.prices || [];
    
    if (prices.length === 0) {
      // Fallback sur l'ancien champ
      if (event.price_cents === 0) return { text: 'Gratuit', variant: 'success' as const };
      return { text: `${(event.price_cents / 100).toFixed(0)}€`, variant: 'primary' as const };
    }
    
    const minPrice = Math.min(...prices.map(p => p.price_cents));
    
    if (minPrice === 0) return { text: 'Gratuit', variant: 'success' as const };
    
    if (prices.length === 1) {
      return { text: `${(minPrice / 100).toFixed(0)}€`, variant: 'primary' as const };
    }
    
    // Plusieurs tarifs
    return { text: `À partir de ${(minPrice / 100).toFixed(0)}€`, variant: 'primary' as const };
  };

  const priceDisplay = getPriceDisplay();

  return (
    <div
      data-event-card
      className="flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
      style={{ scrollSnapAlign: 'start' }}
    >
      <Link href={`/events/${event.slug}`} className="group block h-full">
        <Card
          hoverable
          className={`h-full flex flex-col border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-xl overflow-hidden transition-all duration-300 hover:border-primary ${
            isPast ? 'opacity-75' : ''
          }`}
        >
          {/* Image */}
          {event.cover_image_url ? (
            <div className="relative w-full h-44 bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <Image
                src={event.cover_image_url}
                alt={event.title}
                fill
                className={`object-cover group-hover:scale-105 transition-transform duration-500 ${
                  isPast ? 'grayscale' : ''
                }`}
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

              {/* Badges sur l'image */}
              <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <Badge
                    variant="warning"
                    size="sm"
                    className="backdrop-blur-md bg-white/95 dark:bg-gray-900/95 text-xs font-semibold shadow-sm"
                  >
                    {new Date(event.start_date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Badge>
                  {isCurrent && (
                    <Badge
                      size="sm"
                      className="backdrop-blur-md bg-green-500 text-white text-xs font-semibold shadow-sm animate-pulse flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3 fill-current" />
                      En cours
                    </Badge>
                  )}
                  {isPast && (
                    <Badge
                      size="sm"
                      className="backdrop-blur-md bg-gray-500 text-white text-xs font-semibold shadow-sm"
                    >
                      Terminé
                    </Badge>
                  )}
                </div>
                <Badge
                  variant={priceDisplay.variant}
                  size="sm"
                  className="backdrop-blur-md bg-white/95 dark:bg-gray-900/95 text-xs font-semibold shadow-sm"
                >
                  {priceDisplay.text}
                </Badge>
              </div>
            </div>
          ) : (
            <div
              className={`relative w-full h-44 bg-gradient-to-br from-primary via-primary-dark to-[#B91C1C] flex items-center justify-center ${
                isPast ? 'grayscale' : ''
              }`}
            >
              <CalendarIcon className="w-12 h-12 text-white/20" />
              <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <Badge
                    variant="warning"
                    size="sm"
                    className="backdrop-blur-md bg-white/95 dark:bg-gray-900/95 text-xs font-semibold shadow-sm"
                  >
                    {new Date(event.start_date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Badge>
                  {isCurrent && (
                    <Badge
                      size="sm"
                      className="backdrop-blur-md bg-green-500 text-white text-xs font-semibold shadow-sm animate-pulse flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3 fill-current" />
                      En cours
                    </Badge>
                  )}
                  {isPast && (
                    <Badge
                      size="sm"
                      className="backdrop-blur-md bg-gray-500 text-white text-xs font-semibold shadow-sm"
                    >
                      Terminé
                    </Badge>
                  )}
                </div>
                <Badge
                  variant={priceDisplay.variant}
                  size="sm"
                  className="backdrop-blur-md bg-white/95 dark:bg-gray-900/95 text-xs font-semibold shadow-sm"
                >
                  {priceDisplay.text}
                </Badge>
              </div>
            </div>
          )}

          {/* Contenu */}
          <CardHeader className="flex-1 p-4">
            <CardTitle className="line-clamp-2 mb-3 text-base font-bold group-hover:text-primary transition-colors leading-tight">
              {event.title}
            </CardTitle>

            <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
              {/* Club */}
              {event.club && (
                <div className="flex items-center gap-1.5">
                  <BuildingOfficeIcon className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
                  <span className="truncate font-medium">{event.club.name}</span>
                </div>
              )}

              {/* Lieu */}
              {event.location && (
                <div className="flex items-start gap-1.5">
                  <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>
              )}

              {/* Capacité */}
              {event.max_attendees && (
                <div className="flex items-center gap-1.5">
                  <UsersIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{event.max_attendees} places max</span>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>
      </Link>
    </div>
  );
}

