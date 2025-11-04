# Design System - Phuong Long Vo Dao

## 🎨 Identité Visuelle

### Inspiration
Le design s'inspire de :
- **Culture vietnamienne** : Rouge et or du drapeau
- **Arts martiaux** : Force, discipline, élégance
- **Tradition** : Motifs asiatiques, calligraphie
- **Modernité** : Interface clean et épurée

---

## 🎨 Palette de Couleurs

### Couleurs Principales

#### Rouge Principal (Force & Passion)
```css
--color-primary: 0 84% 48%        /* Rouge vif martial #DC2626 */
--color-primary-dark: 0 84% 38%   /* Rouge profond #B91C1C */
--color-primary-light: 0 84% 58%  /* Rouge clair #EF4444 */
```
**Utilisation** :
- CTA buttons principaux
- Hero sections
- Accents importants
- Hover states

#### Or/Doré (Excellence & Tradition)
```css
--color-gold: 43 96% 56%          /* Or vif #F59E0B */
--color-gold-dark: 43 96% 46%     /* Or profond #D97706 */
--color-gold-light: 43 96% 66%    /* Or clair #FBBF24 */
```
**Utilisation** :
- Badges premium
- Highlights
- Bordures spéciales
- Icons importantes

#### Noir (Discipline & Puissance)
```css
--color-dark: 0 0% 10%            /* Noir doux #1A1A1A */
--color-dark-muted: 0 0% 20%      /* Gris très foncé #333333 */
```
**Utilisation** :
- Textes principaux
- Backgrounds Hero
- Contrastes forts

### Couleurs Secondaires

#### Jade/Émeraude (Culture Asiatique)
```css
--color-jade: 158 64% 52%         /* Vert jade #34D399 */
--color-jade-dark: 158 64% 42%    /* Jade profond #10B981 */
```
**Utilisation** :
- Success states
- Nature/harmonie sections
- Accents subtils

#### Indigo (Spiritualité)
```css
--color-indigo: 231 48% 48%       /* Indigo #4F46E5 */
--color-indigo-dark: 231 48% 38%  /* Indigo profond #4338CA */
```
**Utilisation** :
- Information states
- Méditation/philosophie sections
- Liens secondaires

### Couleurs Fonctionnelles

#### Success
```css
--color-success: 142 71% 45%      /* Vert #22C55E */
```

#### Warning
```css
--color-warning: 38 92% 50%       /* Orange #FB923C */
```

#### Danger
```css
--color-danger: 0 84% 60%         /* Rouge clair #F87171 */
```

#### Info
```css
--color-info: 199 89% 48%         /* Bleu cyan #0EA5E9 */
```

### Couleurs Neutres

```css
--color-gray-50: 0 0% 98%         /* #FAFAFA */
--color-gray-100: 0 0% 96%        /* #F5F5F5 */
--color-gray-200: 0 0% 90%        /* #E5E5E5 */
--color-gray-300: 0 0% 83%        /* #D4D4D4 */
--color-gray-400: 0 0% 64%        /* #A3A3A3 */
--color-gray-500: 0 0% 45%        /* #737373 */
--color-gray-600: 0 0% 32%        /* #525252 */
--color-gray-700: 0 0% 25%        /* #404040 */
--color-gray-800: 0 0% 15%        /* #262626 */
--color-gray-900: 0 0% 9%         /* #171717 */
```

---

## 🔤 Typographie

### Fonts

#### Headings (Titres)
**Font** : `Bebas Neue` (Google Fonts)
- Style : Condensed, fort, impactant
- Poids : 400 (Regular), 700 (Bold)
- Évoque : Force, impact martial

**Alternative** : `Oswald` ou `Anton`

#### Body (Corps de texte)
**Font** : `Inter` (Google Fonts)
- Style : Moderne, lisible, web-optimized
- Poids : 400, 500, 600, 700

#### Accent (Citations, highlights)
**Font** : `Playfair Display` (optionnel)
- Style : Élégant, traditionnel
- Utilisation : Citations maîtres, philosophie

### Tailles

```css
/* Headings */
--text-h1: 3.5rem (56px)          /* Hero titles */
--text-h2: 2.5rem (40px)          /* Section titles */
--text-h3: 2rem (32px)            /* Subsection titles */
--text-h4: 1.5rem (24px)          /* Card titles */

/* Body */
--text-lg: 1.125rem (18px)        /* Lead paragraphs */
--text-base: 1rem (16px)          /* Standard */
--text-sm: 0.875rem (14px)        /* Secondary */
--text-xs: 0.75rem (12px)         /* Captions */
```

---

## 🖼️ Motifs & Patterns

### Pattern Dragon (Background Hero)
Motif subtil de dragon/phoenix stylisé en filigrane.

### Pattern Bambou
Lignes verticales évoquant le bambou pour sections calmes.

### Pattern Vagues
Vagues asiatiques pour transitions de sections.

### Pattern Étoiles Asiatiques
Motif géométrique inspiré des fenêtres traditionnelles.

---

## 🎭 Iconographie

### Style Icônes
- **Outline** : Traits fins pour élégance
- **Couleur** : Rouge/Or/Noir selon contexte
- **Thème** : Évoquant arts martiaux quand possible

### Icônes Personnalisées à Créer
- 🥋 Kimono
- 🥊 Poing fermé
- ⚔️ Armes traditionnelles (bâton, sabre)
- 🏆 Trophée/médaille
- 🎯 Cible (précision)
- 🔥 Flamme (énergie)
- ⚡ Éclair (vitesse)
- 🧘 Position méditation
- 👊 Techniques de frappe

---

## 📐 Spacing & Layout

### Grid System
- **Mobile** : 1 colonne (< 768px)
- **Tablet** : 2 colonnes (768px - 1024px)
- **Desktop** : 3 colonnes (> 1024px)
- **Large** : 4 colonnes (> 1440px)

### Spacing Scale
```css
--space-xs: 0.25rem (4px)
--space-sm: 0.5rem (8px)
--space-md: 1rem (16px)
--space-lg: 1.5rem (24px)
--space-xl: 2rem (32px)
--space-2xl: 3rem (48px)
--space-3xl: 4rem (64px)
--space-4xl: 6rem (96px)
```

### Container Sizes
- **sm** : 768px (articles, forms)
- **md** : 1024px (contenu standard)
- **lg** : 1280px (défaut pages) **[DEFAULT]**
- **xl** : 1400px (grilles larges)
- **full** : 100% (Hero sections)

---

## 🌊 Animations & Transitions

### Principes
- **Subtiles** : Pas trop flashy
- **Fluides** : Courbes ease naturelles
- **Rapides** : < 300ms pour interactivité
- **Significatives** : Guidant l'attention

### Animations Signature

#### Fade In (Apparition)
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```
Durée : 500ms

#### Slide Up (Scroll reveal)
```css
@keyframes slideUp {
  from { 
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```
Durée : 600ms

#### Scale Pulse (Hover buttons)
```css
@keyframes scalePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```
Durée : 300ms

---

## 🖼️ Images & Media

### Formats
- **Hero images** : 1920x1080 (16:9)
- **Club covers** : 1200x675 (16:9)
- **Blog thumbnails** : 800x450 (16:9)
- **Portraits coaches** : 400x400 (1:1)
- **Product images** : 800x800 (1:1)

### Optimisation
- Format : WebP (fallback JPEG)
- Quality : 85%
- Lazy loading : Oui (sauf above fold)
- Responsive sizes : Multiples

### Style Photos
- **Ambiance** : Dynamique, énergétique
- **Lighting** : Contrasté, dramatique
- **Post-processing** : Léger vignettage, saturation +10%

---

## 🎯 Composants UI

### Buttons

**Hiérarchie** :
1. **Primary** (Rouge) : Actions principales
2. **Secondary** (Or) : Actions secondaires importantes
3. **Ghost** (Transparent) : Actions tertiaires
4. **Danger** (Rouge foncé) : Actions destructives

**États** :
- Default
- Hover : Brightness +10%, transform scale(1.02)
- Active : Brightness -10%
- Disabled : Opacity 50%, cursor not-allowed
- Loading : Spinner + texte

### Cards

**Variants** :
- **Default** : Fond blanc
- **Bordered** : Bordure grise
- **Elevated** : Shadow + hover effect
- **Premium** : Bordure or, shadow colorée

### Badges

**Couleurs sémantiques** :
- Rouge : Prioritaire, urgent
- Or : Premium, VIP
- Vert : Success, actif
- Bleu : Info
- Gris : Neutral

---

## 📱 Responsive Design

### Breakpoints
```css
sm: 640px    /* Phones landscape */
md: 768px    /* Tablets */
lg: 1024px   /* Desktop */
xl: 1280px   /* Large desktop */
2xl: 1536px  /* Extra large */
```

### Stratégie
- **Mobile-first** : Design pour 375px minimum
- **Progressive enhancement** : Ajouter features desktop
- **Touch-friendly** : Tap targets min 44x44px
- **Readable** : Font size min 16px (pas de zoom)

---

## ♿ Accessibilité

### Contrast Ratios
- **Texte normal** : 4.5:1 minimum
- **Texte large** : 3:1 minimum
- **UI components** : 3:1 minimum

### Focus States
- Ring primary (2px)
- Ring offset (2px)
- Visible sur tous éléments interactifs

### ARIA
- Labels sur icônes
- Live regions pour notifications
- Roles appropriés

---

## 📐 Shadows & Depth

### Levels
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
--shadow-md: 0 4px 6px rgba(0,0,0,0.1)
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1)
--shadow-xl: 0 20px 25px rgba(0,0,0,0.1)
--shadow-2xl: 0 25px 50px rgba(0,0,0,0.15)
```

### Colored Shadows (Spécial)
```css
--shadow-red: 0 10px 30px rgba(220, 38, 38, 0.3)    /* Hover buttons */
--shadow-gold: 0 10px 30px rgba(245, 158, 11, 0.3)  /* Premium cards */
```

---

## 🎨 Gradients

### Gradient Hero
```css
background: linear-gradient(135deg, 
  hsl(0, 84%, 48%) 0%,      /* Rouge */
  hsl(0, 84%, 38%) 50%,     /* Rouge foncé */
  hsl(20, 90%, 50%) 100%    /* Orange chaud */
);
```

### Gradient Gold
```css
background: linear-gradient(135deg,
  hsl(43, 96%, 56%) 0%,     /* Or */
  hsl(38, 92%, 50%) 100%    /* Or chaud */
);
```

### Gradient Overlay (Images)
```css
background: linear-gradient(
  to bottom,
  rgba(0, 0, 0, 0) 0%,
  rgba(0, 0, 0, 0.7) 100%
);
```

---

## ✨ Effets Spéciaux

### Parallax
Effet de profondeur sur Hero avec multiple layers.

### Particle Effect
Particules dorées flottantes sur hover boutons premium.

### Hover Glow
Lueur dorée/rouge sur hover éléments importants.

---

## 📋 Checklist Design

Chaque page doit :
- [ ] Utiliser palette cohérente (rouge/or/noir)
- [ ] Inclure au moins 1 motif asiatique subtil
- [ ] Avoir une hiérarchie claire (headings)
- [ ] Être responsive (mobile → desktop)
- [ ] Contraste WCAG AA minimum
- [ ] Animations subtiles et fluides

---

**Version** : 1.0  
**Créé** : 2025-11-04 21:10  
**Dernière mise à jour** : 2025-11-04 21:10  
**Maintenu par** : Design Lead

## 🔄 Changelog Design

### 2025-11-04 21:10 - Création
- Définition palette arts martiaux (rouge/or/noir)
- Remplacement couleurs corporate (bleu/violet)
- Ajout inspirations culture vietnamienne

