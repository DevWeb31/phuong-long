# Changelog - Phuong Long Vo Dao

Tous les changements notables du projet sont documentés dans ce fichier.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

---

## [1.1.0] - 2025-11-05

### 🎨 Design Moderne & UX

#### Ajouté
- Système d'animations avancé (float, shimmer, pulse-glow, gradient-shift)
- Composants modernisés (Button, Card, Header, Footer) avec glassmorphism
- Effet parallax léger sur toutes les pages principales (6 pages)
- Heroes uniformisés avec structure identique
- Motifs de fond cohérents (croix 60x60)
- Typography moderne (jusqu'à text-9xl)
- Glow effects et deep shadows partout

#### Modifié
- Heroes réduits de `min-h-screen` à `py-20 lg:py-24` pour cohérence
- Vitesses parallax réduites de 50% pour effet plus subtil
- Homepage, Clubs, Events avec contenu engageant
- Badges dynamiques avec compteurs (posts, produits, événements)

### 🛡️ Back Office & Administration

#### Ajouté
- **CRUD complet pour 4 entités** : Clubs, Events, Blog, Products
- Composants Modal et ConfirmModal avec glassmorphism
- 4 FormModals spécialisés avec auto-génération de slugs
- 16 API routes sécurisées avec vérification admin
- Hook `useIsAdmin` pour vérification rôle client-side
- Lien "Panel Administrateur" dans menu utilisateur (conditionnel admin)
- Page redirect `/admin/dashboard` → `/admin`

#### Sécurité
- Vérification authentification sur toutes les API routes
- Vérification rôle admin via `checkAdminRole(userId)`
- Error handling robuste
- Loading states et confirmations avant suppressions

### 🖼️ Images de Clubs (05/11/2025)

#### Ajouté
- Champ `cover_image_url` intégré dans ClubFormModal
- Affichage images dans page `/clubs` (vignettes avec hover zoom)
- Colonne image dans DataTable admin (miniatures 64x64px)
- Preview en temps réel dans formulaire admin
- Fallback élégant si pas d'image (emoji 🥋 + nom club)
- Guide complet des images (`docs/IMAGES_GUIDE.md`)
- Migration documentaire (`004_add_club_images.sql`)
- Documentation backend mise à jour

#### Spécifications
- Format recommandé : 16:9 (1200x675px)
- Poids max : 500KB
- Formats : JPG, WebP, PNG
- Badges en overlay (ville + statut actif)

---

## [1.0.0] - 2025-11-04

### Initial Release

#### Ajouté
- Projet Next.js 15 avec App Router
- Intégration Supabase (Auth + Database)
- 6 pages principales (Accueil, Clubs, Events, Blog, Shop, Contact)
- Système d'authentification complet
- Dashboard utilisateur
- Panel admin de base
- E-commerce avec panier et checkout
- Optimisation logo (WebP + favicons)
- 26 routes + 2 API routes initiales

---

**Total commits** : 41+  
**Routes** : 32  
**API Routes** : 16  
**Production Ready** : ✅

