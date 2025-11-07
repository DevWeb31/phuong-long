/**
 * Add cover_image_url to events table
 * 
 * Ajout du champ cover_image_url pour les affiches d'événements
 * 
 * @version 1.0
 * @date 2025-11-06
 */

-- Ajouter la colonne cover_image_url si elle n'existe pas déjà
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Commentaire pour la documentation
COMMENT ON COLUMN events.cover_image_url IS 'URL de l''image de couverture/affiche de l''événement';

