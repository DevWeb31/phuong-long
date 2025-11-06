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
import Link from 'next/link';
import { Button } from '@/components/common';

// Fix pour les icônes Leaflet avec Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icône personnalisée pour les clubs
const clubIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#2563eb" stroke="white" stroke-width="3"/>
      <text x="16" y="22" text-anchor="middle" fill="white" font-size="16" font-weight="bold">🥋</text>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
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
      <div className="mb-16 p-10 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-6 shadow-xl shadow-primary/20">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">Carte Interactive des Clubs</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-4 font-medium">Aucun club avec coordonnées disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-16">
      <div className="text-center mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          🗺️ Nos Clubs en France
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Trouvez le club le plus proche de chez vous
        </p>
      </div>
      
      <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-200 dark:border-slate-700 h-[500px] md:h-[600px]">
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
                  <p className="text-sm text-slate-700 mb-1">
                    📍 {club.city}
                  </p>
                  {club.address && (
                    <p className="text-xs text-slate-600 mb-2">
                      {club.address}, {club.postal_code}
                    </p>
                  )}
                  {club.phone && (
                    <p className="text-xs text-slate-600 mb-2">
                      📞 {club.phone}
                    </p>
                  )}
                  {club.email && (
                    <p className="text-xs text-slate-600 mb-3">
                      ✉️ {club.email}
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
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-2">
            <span className="text-lg">🥋</span>
            <span>Cliquez sur un marqueur pour voir les détails du club</span>
          </span>
        </p>
      </div>
    </div>
  );
}

