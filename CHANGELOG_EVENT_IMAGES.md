# Changelog - Galerie d'images pour événements

## Version 1.0 - 2025-11-08

### 🎉 Fonctionnalités ajoutées

#### Backend
- ✅ **Table `event_images`** - Galerie d'images multiples par événement
- ✅ **API Routes** - CRUD complet pour gérer les images
  - `GET /api/events/:id/images` - Lister les images
  - `POST /api/events/:id/images` - Ajouter une image
  - `PATCH /api/events/images/:imageId` - Modifier une image
  - `DELETE /api/events/images/:imageId` - Supprimer une image
- ✅ **RLS Policies** - Sécurité configurée
- ✅ **Auto-réorganisation** - Les display_order se réorganisent automatiquement après suppression

#### Backoffice (Admin)
- ✅ **ImagesEditor Component** - Gestionnaire visuel d'images
  - Ajout d'images via URL
  - Réorganisation avec boutons haut/bas
  - Définir l'image de couverture (étoile)
  - Aperçu de chaque image
  - Légendes et textes alternatifs
  - Suppression d'images
- ✅ **Intégration EventFormModal** - Galerie directement dans le formulaire
- ✅ **Sauvegarde automatique** - Les images sont sauvegardées lors de la création/modification

#### Frontend Public
- ✅ **ImageCarousel Component** - Carousel moderne et responsive
  - Navigation avec flèches (← →)
  - Thumbnails cliquables
  - Indicateur de position (1/5)
  - Affichage des légendes
  - Support mobile/tablette/desktop
  - Transitions fluides
- ✅ **Rétrocompatibilité** - Fallback sur `cover_image_url` si pas d'images
- ✅ **Integration** - Automatique sur page détail événement

### 📁 Fichiers créés

```
supabase/migrations/
├── 005_event_sessions_clean.sql       # Migration sessions multiples
├── 006_event_images.sql               # Migration images (v1)
└── 006_event_images_clean.sql         # Migration images (v2 - nettoyage)

src/app/api/
├── events/[id]/images/route.ts        # API liste + ajout images
└── events/images/[imageId]/route.ts   # API modifier + supprimer image

src/components/
├── admin/ImagesEditor.tsx             # Gestionnaire admin
└── common/ImageCarousel.tsx           # Carousel public

docs/features/
├── EVENT_SESSIONS.md                  # Doc sessions
└── EVENT_IMAGES.md                    # Doc images

CHANGELOG_EVENT_IMAGES.md              # Ce fichier
```

### 📝 Fichiers modifiés

```
src/lib/types/database.ts              # +EventSession, +EventImage
src/lib/types/index.ts                 # Exports mis à jour
src/components/common/index.ts         # +ImageCarousel export
src/components/admin/EventFormModal.tsx # +ImagesEditor intégré
src/app/(admin)/admin/events/page.tsx  # +Sauvegarde images
src/app/(marketing)/events/[slug]/page.tsx # +Carousel display
```

### 🔧 Caractéristiques techniques

#### Table `event_images`
```sql
- id: UUID (PK)
- event_id: UUID (FK → events)
- image_url: TEXT
- display_order: INTEGER (0, 1, 2...)
- caption: TEXT (nullable)
- alt_text: TEXT (nullable)
- is_cover: BOOLEAN
```

#### Workflow admin
1. Admin ouvre formulaire événement
2. Section "Galerie d'images" avec ImagesEditor
3. Ajoute URL d'images
4. Réorganise avec ↑↓
5. Définit image de couverture avec ⭐
6. Sauvegarde → Images créées en BDD

#### Workflow public
1. Page événement charge images depuis `event_images`
2. Si images présentes → Carousel
3. Si pas d'images → Fallback sur `cover_image_url`
4. Navigation fluide entre images
5. Thumbnails pour accès rapide

### ✨ Améliorations futures possibles

- [ ] Upload direct d'images (Supabase Storage)
- [ ] Drag & drop pour réorganiser
- [ ] Zoom sur les images
- [ ] Lightbox en plein écran
- [ ] Support vidéos dans le carousel
- [ ] Compression automatique des images
- [ ] CDN pour optimisation
- [ ] Lazy loading des thumbnails

### 🐛 Bugs connus

- Aucun pour le moment

### 📚 Documentation

Voir `docs/features/EVENT_IMAGES.md` pour guide complet d'utilisation.

---

**Version** : 1.0  
**Date** : 2025-11-08  
**Auteur** : Assistant AI  
**Status** : ✅ Production Ready

