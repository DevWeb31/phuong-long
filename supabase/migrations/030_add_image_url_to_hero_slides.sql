-- ============================================
-- ADD IMAGE URL TO HERO SLIDES
-- ============================================
-- Version: 1.0
-- Date: 2025-11-06
-- Description: Ajoute une colonne optionnelle pour stocker l'image associée à un slide
-- ============================================

ALTER TABLE hero_slides
    ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN hero_slides.image_url IS 'URL de l''image utilisée comme fond statique pour le slide';

