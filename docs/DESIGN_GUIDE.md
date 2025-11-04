# Guide Visuel - Phuong Long Vo Dao

## 🎨 Palette de Couleurs Appliquée

### Avant vs Après

#### ❌ AVANT (Corporate/Tech)
```
Primary:   #3B82F6 (Bleu)      - Générique tech
Secondary: #A855F7 (Violet)     - Startup moderne  
Accent:    #EC4899 (Rose)       - Trop féminin
```

#### ✅ APRÈS (Arts Martiaux Vietnamiens)
```
Primary:   #DC2626 (Rouge)      - Force, passion, Vietnam 🇻🇳
Secondary: #F59E0B (Or)         - Excellence, tradition, ceinture 🥋
Accent:    #34D399 (Jade)       - Culture asiatique, harmonie ☯️
Dark:      #1A1A1A (Noir)       - Discipline, puissance 👊
```

---

## 🖼️ Exemples Visuels

### Hero Section

**Gradient** :
```css
background: linear-gradient(135deg, 
  #DC2626 (rouge) → 
  #B91C1C (rouge foncé) → 
  #F59E0B (or)
);
```

**Effet** : Rappelle le drapeau vietnamien (rouge + étoile jaune)

**Pattern** : Motif étoiles asiatiques subtil en blanc 10% opacity

**Stats** :
- 40+ ans d'expérience (crédibilité)
- 5 clubs actifs (proximité)
- 500+ pratiquants (communauté)

---

### Feature Cards

#### 1. Technique & Combat 👊
- **Couleur** : Rouge (primary)
- **Icône** : Poing martial stylisé
- **Message** : Force, self-défense, réflexes

#### 2. Excellence & Tradition 🏆
- **Couleur** : Or (secondary)
- **Icône** : Trophée/médaille
- **Message** : Respect, humilité, persévérance

#### 3. Communauté Dojo 🏠
- **Couleur** : Jade (accent)
- **Icône** : Maison/dojo
- **Message** : Famille, événements, passion

---

## 🎭 Éléments Visuels à Créer

### Priorité 1 - Essentiels

#### Logo Principal
- **Format** : SVG + PNG (transparence)
- **Versions** : Couleur, Blanc, Noir
- **Style** : Calligraphie vietnamienne + moderne
- **Éléments** : 
  - Dragon/Phoenix stylisé
  - Texte "Phuong Long Vo Dao"
  - Peut-être symbole Yin/Yang adapté

#### Icônes Custom (SVG)
- 🥋 Kimono plié
- 👊 Poing fermé position combat
- ⚔️ Armes (bâton, sabre)
- 🎯 Cible (précision)
- 🏆 Trophée avec ruban
- 🧘 Silhouette méditation
- 🔥 Flamme énergie
- ⚡ Éclair vitesse

### Priorité 2 - Visuels Marketing

#### Photos Hero
**Thèmes nécessaires** :
1. **Combat dynamique** : Deux pratiquants en action, fond dojo
2. **Groupe classe** : Pratiquants tous niveaux, ambiance conviviale
3. **Maître enseignant** : Transmission, pédagogie
4. **Enfants pratique** : Kids en kimono, concentration
5. **Compétition** : Athlète médaillé, podium

**Style photos** :
- Contraste élevé
- Saturation légère augmentation
- Vignettage subtil
- Lumière dramatique
- Couleurs chaudes (rouge/or présents)

#### Illustrations
- **Pattern backgrounds** : Motifs géométriques asiatiques
- **Calligraphie** : Caractères vietnamiens traditionnels
- **Dragon/Phoenix** : Symboles stylisés minimalistes

### Priorité 3 - Contenu Clubs

#### Photos Clubs (par club)
- Façade dojo (extérieur)
- Salle entraînement (intérieur)
- Coaches (portraits professionnels)
- Groupe pratiquants
- Équipements

---

## 📐 Spécifications Techniques

### Logo

**Tailles requises** :
```
favicon.ico      : 32x32, 16x16
logo-square.png  : 512x512 (réseaux sociaux)
logo-wide.png    : 1200x630 (Open Graph)
logo-header.svg  : Vectoriel (Header site)
logo-footer.svg  : Vectoriel blanc (Footer)
```

**Format** :
- SVG pour site (scalable)
- PNG avec transparence (réseaux sociaux)
- ICO pour favicon

### Icônes

**Taille** : 24x24px (base)
**Format** : SVG inline
**Couleur** : Mono (colorable via CSS)
**Style** : Outline 2px, coins arrondis

### Photos

**Formats** :
- Original : JPEG haute qualité
- Web : WebP (85% quality)
- Fallback : JPEG optimisé

**Dimensions** :
- Hero : 1920x1080 (16:9)
- Club cover : 1200x675 (16:9)
- Portrait coach : 400x400 (1:1)
- Blog thumbnail : 800x450 (16:9)

---

## 🎨 Applications Couleurs

### Par Section

#### Header
- Background : Blanc
- Logo : Dégradé rouge
- "Vo Dao" : Or
- Links : Gris → Rouge (hover)
- CTA button : Dégradé rouge

#### Hero
- Background : Dégradé rouge → or
- Titre "Phuong Long" : Blanc
- Titre "Vo Dao" : Or (secondary)
- Highlights : Or
- Buttons : Blanc + Or

#### Features Cards
- Card 1 : Accents rouges (combat)
- Card 2 : Accents or (excellence)
- Card 3 : Accents jade (communauté)
- Borders : Hover couleur respective

#### Clubs Section
- Background : Gris clair neutre
- Badges ville : Rouge (primary)
- Cards : Blanc avec hover rouge

#### Events Section
- Background : Blanc
- Badges date : Or (warning)
- Cards : Blanc avec accents

#### CTA Section
- Background : Dégradé rouge → or
- Pattern : Étoiles blanches
- Badge : Or avec glow
- Buttons : Blanc + Or

#### Footer
- Background : Gris clair
- Links : Gris → Rouge (hover)
- Social icons : Gris → Couleurs natives (hover)

---

## 📱 Responsive Behavior

### Mobile (< 768px)
- Titre Hero : 2 lignes ("Phuong Long" + "Vo Dao")
- Stats : Grid 3 colonnes maintenu
- Features : 1 colonne
- Clubs : 1 colonne
- Events : 1 colonne

### Tablet (768px - 1024px)
- Features : 2 colonnes (3ème en dessous)
- Clubs : 2 colonnes
- Events : 2 colonnes

### Desktop (> 1024px)
- Features : 3 colonnes
- Clubs : 3 colonnes
- Events : 3 colonnes

---

## ✨ Animations

### Hero
- Titre : Fade in (500ms)
- Sous-titre : Slide up (600ms)
- Buttons : Hover scale(1.05) + shadow glow

### Cards
- Hover : Border color change
- Icon : Pulse effect (background)
- Transform : Subtle scale(1.02)

### Transitions
- Couleurs : 200ms ease
- Transforms : 250ms ease
- Shadows : 300ms ease

---

## 🔤 Typographie Appliquée

### Headings
**Font** : Poppins (poids 600-800)
- Impactant, moderne
- Bonne lisibilité
- Web-optimized

**Future amélioration** : 
- Considérer `Bebas Neue` (plus martial)
- Ou `Oswald` (condensed, fort)

### Body
**Font** : Inter (poids 400-600)
- Excellente lisibilité
- Optimisée écrans
- Complète (accents français)

---

## 📊 Checklist Design Appliqué

### Couleurs
- [x] Primary : Bleu → Rouge ✅
- [x] Secondary : Violet → Or ✅
- [x] Accent : Rose → Jade ✅
- [x] Cohérence palette Vietnam ✅

### Icônes
- [x] Remplacé éclair générique → Poing martial ✅
- [x] Remplacé coche → Trophée ✅
- [x] Remplacé personnes → Dojo ✅
- [ ] Créer icônes custom SVG (Phase 2)

### Patterns
- [x] Motif asiatique Hero ✅
- [x] Motif étoiles CTA ✅
- [ ] Pattern bambou (Phase 2)
- [ ] Pattern dragon subtil (Phase 2)

### Typography
- [x] Poppins headings (fort, impactant) ✅
- [x] Poids 800 disponible ✅
- [ ] Tester Bebas Neue (option Phase 2)

### Photos/Images
- [ ] Logo réel Phuong Long ⏳
- [ ] Photos Hero arts martiaux ⏳
- [ ] Photos clubs/dojos ⏳
- [ ] Portraits coaches ⏳
- [ ] Photos compétitions ⏳

---

## 🎯 Prochaines Étapes Design

### Court Terme (Phase 2)
1. Créer vrai logo professionnel
2. Photographier les 5 clubs (façade + intérieur)
3. Photos coaches professionnels
4. Créer icônes custom SVG (kimono, armes, etc.)
5. Ajouter images Hero réelles

### Moyen Terme (Phase 3-4)
1. Photos événements (stages, compétitions)
2. Vidéo Hero (loop démonstrations)
3. Illustrations custom (dragon, phoenix)
4. Pattern library complète

### Long Terme (Phase 5+)
1. Design system Figma complet
2. Brand guidelines PDF
3. Templates marketing
4. Assets pour réseaux sociaux

---

**Créé** : 2025-11-04 21:20  
**Maintenu par** : Design Lead  
**Status** : ✅ Design system défini, en cours d'application

