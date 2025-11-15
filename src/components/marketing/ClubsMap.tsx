/**
 * ClubsMap Component
 * 
 * Carte interactive affichant tous les clubs avec Leaflet
 * 
 * @version 1.0
 * @date 2025-11-06
 */

'use client';

import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Club } from '@/lib/types';
import { Map, MapPin, Phone, Mail, Shield } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/common';

// Fix pour les icônes Leaflet avec Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icône personnalisée pour les clubs - Étoile martiale stylisée
const clubIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3B82F6"/>
          <stop offset="100%" style="stop-color:#2563EB"/>
        </linearGradient>
        <filter id="markerGlow">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-opacity="0.3"/>
        </filter>
      </defs>
      <!-- Cercle de fond avec dégradé bleu -->
      <circle cx="20" cy="20" r="18" fill="url(#starGrad)" stroke="#F59E0B" stroke-width="2.5" filter="url(#markerGlow)"/>
      <!-- Étoile martiale stylisée -->
      <g transform="translate(20, 20)">
        <!-- Étoile à 5 branches -->
        <path d="M 0 -10 L 2.5 -3 L 9.5 -3 L 3.5 1 L 5.5 8 L 0 4 L -5.5 8 L -3.5 1 L -9.5 -3 L -2.5 -3 Z" 
              fill="#FFFFFF" 
              opacity="0.98"
              stroke="#2563EB" 
              stroke-width="1"/>
        <!-- Cercle central -->
        <circle cx="0" cy="0" r="3" fill="#3B82F6" opacity="0.9"/>
        <!-- Lignes de force -->
        <line x1="0" y1="-8" x2="0" y2="-5" stroke="#2563EB" stroke-width="1.2" opacity="0.7"/>
        <line x1="0" y1="5" x2="0" y2="8" stroke="#2563EB" stroke-width="1.2" opacity="0.7"/>
        <line x1="-7" y1="0" x2="-5" y2="0" stroke="#2563EB" stroke-width="1.2" opacity="0.7"/>
        <line x1="5" y1="0" x2="7" y2="0" stroke="#2563EB" stroke-width="1.2" opacity="0.7"/>
      </g>
      <!-- Bordure dorée décorative -->
      <circle cx="20" cy="20" r="16" fill="none" stroke="#F59E0B" stroke-width="1" opacity="0.6"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

interface ClubsMapProps {
  clubs: Club[];
}

export function ClubsMap({ clubs }: ClubsMapProps) {
  // Filtrer les clubs qui ont des coordonnées
  const clubsWithCoordinates = useMemo(
    () => clubs.filter(club => club.latitude && club.longitude && club.active),
    [clubs]
  );

  // Calculer le centre de la carte (centre de la France)
  const center = useMemo<[number, number]>(() => {
    if (clubsWithCoordinates.length === 0) {
      return [46.603354, 1.888334]; // Centre de la France
    }
    
    // Calculer le centre moyen de tous les clubs
    const avgLat = clubsWithCoordinates.reduce((sum, club) => sum + (club.latitude || 0), 0) / clubsWithCoordinates.length;
    const avgLng = clubsWithCoordinates.reduce((sum, club) => sum + (club.longitude || 0), 0) / clubsWithCoordinates.length;
    
    return [avgLat, avgLng];
  }, [clubsWithCoordinates]);

  if (clubsWithCoordinates.length === 0) {
    return (
      <div className="mb-16 p-10 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-50 dark:to-slate-100 rounded-3xl border border-slate-200 dark:border-slate-200 shadow-xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-6 shadow-xl shadow-primary/20">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-900 mb-3">Carte Interactive des Clubs</h2>
          <p className="text-lg text-slate-600 dark:text-slate-600 mb-4 font-medium">Aucun club avec coordonnées disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-16">
      <div className="text-center mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center justify-center gap-2">
          <Map className="w-6 h-6 md:w-7 md:h-7 text-primary" />
          Nos Clubs en France
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Trouvez le club le plus proche de chez vous
        </p>
      </div>
      
      <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-200 dark:border-slate-200 h-[500px] md:h-[600px] bg-white clubs-map-light">
        <MapContainer
          center={center}
          zoom={6}
          scrollWheelZoom={true}
          className="h-full w-full"
          style={{ zIndex: 0 }}
        >
          {/* Tuile de carte - OpenStreetMap */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
          />
          
          {/* Markers pour chaque club */}
          {clubsWithCoordinates.map((club) => (
            <Marker
              key={club.id}
              position={[club.latitude!, club.longitude!]}
              icon={clubIcon}
            >
              <Popup maxWidth={300} className="custom-popup">
                <div className="p-2">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {club.name}
                  </h3>
                  <p className="text-sm text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {club.city}
                  </p>
                  {club.address && (
                    <p className="text-xs text-slate-600 mb-2">
                      {club.address}, {club.postal_code}
                    </p>
                  )}
                  {club.phone && (
                    <p className="text-xs text-slate-600 mb-2 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {club.phone}
                    </p>
                  )}
                  {club.email && (
                    <p className="text-xs text-slate-600 mb-3 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {club.email}
                    </p>
                  )}
                  <Link href={`/clubs/${club.slug}`} className="block">
                    <Button size="sm" variant="primary" className="w-full text-xs">
                      Voir le club →
                    </Button>
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      {/* Légende */}
      <div className="mt-4 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-600">
          <span className="inline-flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span>Cliquez sur un marqueur pour voir les détails du club</span>
          </span>
        </p>
      </div>
    </div>
  );
}

