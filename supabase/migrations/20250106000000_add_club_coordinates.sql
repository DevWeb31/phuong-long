/**
 * Add GPS Coordinates to Clubs
 * 
 * Ajout des coordonnées GPS pour les clubs existants
 * Les coordonnées sont approximatives (centre-ville de chaque ville)
 * 
 * @version 1.0
 * @date 2025-11-06
 */

-- Marseille Centre
UPDATE clubs
SET 
  latitude = 43.296482,
  longitude = 5.369780
WHERE city = 'Marseille' AND latitude IS NULL;

-- Paris Bastille
UPDATE clubs
SET 
  latitude = 48.853291,
  longitude = 2.369254
WHERE city = 'Paris' AND latitude IS NULL;

-- Nice Promenade
UPDATE clubs
SET 
  latitude = 43.696950,
  longitude = 7.265000
WHERE city = 'Nice' AND latitude IS NULL;

-- Créteil Université
UPDATE clubs
SET 
  latitude = 48.790370,
  longitude = 2.445520
WHERE city = 'Créteil' AND latitude IS NULL;

-- Strasbourg Centre
UPDATE clubs
SET 
  latitude = 48.573405,
  longitude = 7.752111
WHERE city = 'Strasbourg' AND latitude IS NULL;

-- Note: Ces coordonnées sont approximatives
-- Pour une précision exacte, utilisez l'API de géocodage avec les adresses complètes
-- ou mettez à jour manuellement via l'interface d'administration

