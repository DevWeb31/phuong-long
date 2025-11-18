/**
 * LocationMapPicker Component
 * 
 * Carte interactive pour sélectionner les coordonnées GPS en cliquant sur la carte
 * 
 * @version 1.0
 * @date 2025-11-06
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Fix pour les icônes Leaflet avec Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icône personnalisée pour le marqueur de sélection
const selectionIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="markerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3B82F6"/>
          <stop offset="100%" style="stop-color:#2563EB"/>
        </linearGradient>
        <filter id="markerShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4"/>
        </filter>
      </defs>
      <!-- Cercle de fond avec dégradé -->
      <circle cx="16" cy="16" r="14" fill="url(#markerGrad)" stroke="#FFFFFF" stroke-width="2" filter="url(#markerShadow)"/>
      <!-- Pin point -->
      <circle cx="16" cy="12" r="5" fill="#FFFFFF"/>
      <!-- Point central -->
      <circle cx="16" cy="12" r="2.5" fill="#3B82F6"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface LocationMapPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}

// Composant pour écouter les clics sur la carte
function MapClickHandler({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationChange(lat, lng);
    },
  });
  return null;
}

// Composant pour mettre à jour la position de la carte quand les coordonnées changent
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 0.5 });
  }, [map, center, zoom]);
  
  return null;
}

export function LocationMapPicker({ latitude, longitude, onLocationChange }: LocationMapPickerProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  // Centre de la carte (France par défaut, ou coordonnées existantes)
  const center = useMemo<[number, number]>(() => {
    if (latitude !== null && longitude !== null) {
      return [latitude, longitude];
    }
    return [46.603354, 1.888334]; // Centre de la France
  }, [latitude, longitude]);

  // Zoom initial selon si on a déjà des coordonnées
  const zoom = useMemo(() => {
    return latitude !== null && longitude !== null ? 13 : 6;
  }, [latitude, longitude]);

  // S'assurer que le composant est monté côté client (pour éviter les erreurs SSR)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLocationChange = (lat: number, lng: number) => {
    onLocationChange(lat, lng);
  };

  // Ne pas rendre la carte côté serveur
  if (!isMounted) {
    return (
      <div className="rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg h-[400px] sm:h-[500px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Cliquez sur la carte pour définir l'emplacement du club. Un marqueur apparaîtra à l'endroit sélectionné.</span>
        </p>
      </div>

      <div className="rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg h-[400px] sm:h-[500px] bg-white map-light-theme">
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={true}
          className="h-full w-full z-0"
          style={{ zIndex: 0 }}
        >
          {/* Tuile de carte - OpenStreetMap */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
          />
          
          {/* Mettre à jour la position de la carte quand les coordonnées changent */}
          <MapUpdater center={center} zoom={zoom} />
          
          {/* Écouter les clics sur la carte */}
          <MapClickHandler onLocationChange={handleLocationChange} />
          
          {/* Marqueur si des coordonnées existent */}
          {latitude !== null && longitude !== null && (
            <Marker
              key={`${latitude}-${longitude}`}
              position={[latitude, longitude]}
              icon={selectionIcon}
            />
          )}
        </MapContainer>
      </div>

      {/* Coordonnées actuelles */}
      {latitude !== null && longitude !== null && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <p className="text-xs sm:text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>
              Coordonnées sélectionnées : <strong>{latitude.toFixed(6)}, {longitude.toFixed(6)}</strong>
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

