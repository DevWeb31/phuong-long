-- ============================================
-- UPDATE HERO SLIDES MEDIA CONSTRAINT
-- ============================================
-- Version: 1.0
-- Date: 2025-11-06
-- Description: Autorise les slides sans vidéo YouTube
--              lorsqu'une image est fournie et impose
--              qu'un seul média soit défini à la fois.
-- ============================================

ALTER TABLE hero_slides
  ALTER COLUMN youtube_video_id DROP NOT NULL;

ALTER TABLE hero_slides
  DROP CONSTRAINT IF EXISTS hero_slides_media_check;

ALTER TABLE hero_slides
  ADD CONSTRAINT hero_slides_media_check CHECK (
    (youtube_video_id IS NOT NULL AND image_url IS NULL)
    OR (youtube_video_id IS NULL AND image_url IS NOT NULL)
  );

