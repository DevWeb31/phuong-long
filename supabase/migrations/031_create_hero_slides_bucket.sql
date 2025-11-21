-- ============================================
-- CREATE STORAGE BUCKET FOR HERO SLIDES
-- ============================================
-- Version: 1.0
-- Date: 2025-11-06
-- Description: Crée un bucket public pour stocker les images du carousel hero
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hero-slides',
  'hero-slides',
  true,
  5242880, -- 5 MB
  ARRAY['image/webp', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Lecture publique
DROP POLICY IF EXISTS "Public Access Hero Slides" ON storage.objects;
CREATE POLICY "Public Access Hero Slides"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero-slides');

-- Upload réservé aux admins
DROP POLICY IF EXISTS "Admin Upload Hero Slides" ON storage.objects;
CREATE POLICY "Admin Upload Hero Slides"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hero-slides' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  )
);

-- Mise à jour réservée aux admins
DROP POLICY IF EXISTS "Admin Update Hero Slides" ON storage.objects;
CREATE POLICY "Admin Update Hero Slides"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'hero-slides' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  )
);

-- Suppression réservée aux admins
DROP POLICY IF EXISTS "Admin Delete Hero Slides" ON storage.objects;
CREATE POLICY "Admin Delete Hero Slides"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'hero-slides' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  )
);

