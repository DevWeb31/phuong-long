# Components Registry - Frontend

Registry de tous les composants réutilisables du projet.

**Version**: 1.0  
**Dernière mise à jour**: 2025-11-04 21:05  

---

## 📦 Composants Communs

### Button

**Fichier**: `src/components/common/Button.tsx`  
**Créé**: 2025-11-04 20:40

**Description**: Bouton réutilisable avec variants, tailles et état loading.

**Props**:
```typescript
interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}
```

**Exemples**:
```tsx
// Primary button
<Button variant="primary" size="md">
  Cliquer ici
</Button>

// Loading state
<Button isLoading>
  Envoi en cours...
</Button>

// Full width
<Button fullWidth variant="secondary">
  S'inscrire
</Button>
```

**Utilisé dans**:
- Landing page (CTA buttons)
- Page clubs (voir club buttons)
- Header (essai gratuit)

---

### Card

**Fichier**: `src/components/common/Card.tsx`  
**Créé**: 2025-11-04 20:40

**Description**: Carte avec sous-composants pour structurer le contenu.

**Composants**:
- `Card` : Conteneur principal
- `CardHeader` : En-tête
- `CardTitle` : Titre
- `CardDescription` : Description
- `CardContent` : Contenu
- `CardFooter` : Pied de page

**Props Card**:
```typescript
interface CardProps extends ComponentProps<'div'> {
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}
```

**Exemples**:
```tsx
<Card variant="bordered" hoverable>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
    <CardDescription>Description courte</CardDescription>
  </CardHeader>
  <CardContent>
    Contenu principal
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Utilisé dans**:
- Landing page (features, clubs, events)
- Page clubs (club cards)

---

### Container

**Fichier**: `src/components/common/Container.tsx`  
**Créé**: 2025-11-04 20:40

**Description**: Conteneur responsive pour centrer le contenu avec max-width.

**Props**:
```typescript
interface ContainerProps extends ComponentProps<'div'> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
}
```

**Tailles**:
- `sm`: max-w-3xl (768px)
- `md`: max-w-5xl (1024px)
- `lg`: max-w-7xl (1280px) **[DEFAULT]**
- `xl`: max-w-[1400px]
- `full`: max-w-full

**Exemples**:
```tsx
<Container>
  Contenu centré avec padding
</Container>

<Container size="sm" padding={false}>
  Conteneur étroit sans padding
</Container>
```

**Utilisé dans**:
- Toutes les pages (wrapper principal)
- Header, Footer

---

### Badge

**Fichier**: `src/components/common/Badge.tsx`  
**Créé**: 2025-11-04 20:40

**Description**: Badge pour afficher statuts, tags ou labels.

**Props**:
```typescript
interface BadgeProps extends ComponentProps<'span'> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
}
```

**Exemples**:
```tsx
<Badge variant="success">Actif</Badge>
<Badge variant="warning" size="sm">En attente</Badge>
<Badge variant="primary">Marseille</Badge>
```

**Utilisé dans**:
- Page clubs (ville, statut)
- Page événements (date, type)
- Landing page (5 clubs en France)

---

## 🎨 Layout Components

### Header

**Fichier**: `src/components/layout/Header.tsx`  
**Créé**: 2025-11-04 20:45

**Description**: Header sticky avec navigation desktop/mobile et menu hamburger.

**Features**:
- Navigation desktop (liens horizontaux)
- Menu mobile hamburger
- Active link highlighting
- Logo Phuong Long
- CTA buttons (Connexion, Essai Gratuit)

**Navigation**:
```typescript
const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'Clubs', href: '/clubs' },
  { name: 'Événements', href: '/events' },
  { name: 'Blog', href: '/blog' },
  { name: 'Boutique', href: '/shop' },
  { name: 'Contact', href: '/contact' },
];
```

**Utilisé dans**:
- Layout marketing (toutes pages publiques)

---

### Footer

**Fichier**: `src/components/layout/Footer.tsx`  
**Créé**: 2025-11-04 20:45

**Description**: Footer complet avec liens, newsletter et réseaux sociaux.

**Sections**:
1. **Nos Clubs** : Liens vers 5 clubs
2. **Ressources** : Blog, Événements, FAQ, Contact
3. **Boutique** : Catégories produits
4. **Légal** : Mentions, CGU, Privacy, Cookies
5. **Newsletter** : Formulaire inscription
6. **Social** : Facebook, Instagram, YouTube
7. **Copyright** : Année dynamique

**Utilisé dans**:
- Layout marketing (toutes pages publiques)

---

## 📊 Statistiques

**Total composants** : 6  
**Composants communs** : 4 (Button, Card, Container, Badge)  
**Composants layout** : 2 (Header, Footer)  
**Lignes de code** : ~800  

---

## 🔄 Prochains Composants (Planifiés)

### Phase 2
- [ ] `Input` : Champ formulaire
- [ ] `Textarea` : Zone de texte
- [ ] `Select` : Liste déroulante
- [ ] `Checkbox` : Case à cocher
- [ ] `Radio` : Bouton radio
- [ ] `Modal` : Fenêtre modale
- [ ] `Toast` : Notification toast
- [ ] `Spinner` : Indicateur chargement
- [ ] `Tabs` : Navigation onglets
- [ ] `Dropdown` : Menu déroulant

### Phase 3
- [ ] `Table` : Tableau données
- [ ] `Pagination` : Pagination
- [ ] `Breadcrumb` : Fil d'Ariane
- [ ] `Avatar` : Photo profil
- [ ] `Calendar` : Calendrier
- [ ] `DatePicker` : Sélecteur date

---

## 📝 Guidelines d'Utilisation

### Bonnes Pratiques

1. **Import centralisé** :
```tsx
import { Button, Card, Container } from '@/components/common';
```

2. **Props typing** :
```tsx
import type { ButtonProps } from '@/components/common';
```

3. **Composition** :
```tsx
// ✅ GOOD - Composable
<Card variant="bordered">
  <CardHeader>
    <CardTitle>Titre</CardTitle>
  </CardHeader>
  <CardContent>Contenu</CardContent>
</Card>

// ❌ BAD - Monolithique
<BigCard title="Titre" content="Contenu" />
```

4. **Variants cohérents** :
```tsx
// Utiliser variants existants
<Button variant="primary" />
<Badge variant="primary" />

// Pas de styles inline custom
<Button style={{ background: 'red' }} /> // ❌
```

### Standards

- **Export named** : Toujours `export function Component`
- **ForwardRef** : Si composant peut recevoir ref
- **Props destructuring** : Avec defaults
- **className merge** : Utiliser `cn()` utility
- **TypeScript strict** : Pas de `any`

---

**Maintenu par** : Tech Lead Frontend  
**Review requise** : Avant ajout nouveau composant

