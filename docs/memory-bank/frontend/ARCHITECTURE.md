# Architecture Frontend

## Principes Fondamentaux

### App Router First
- **Next.js 15 App Router** : Convention basée sur le système de fichiers
- **Server Components par défaut** : Optimisation performances et SEO
- **Client Components** : Uniquement quand interactivité nécessaire ("use client")
- **Layouts Imbriqués** : Réutilisation code et state persistence
- **Loading & Error States** : Fichiers `loading.tsx` et `error.tsx`

### TypeScript Strict
- **Mode strict activé** : `"strict": true` dans tsconfig.json
- **JAMAIS `any`** : Utiliser `unknown` si type vraiment inconnu
- **Interfaces > Types** : Pour objets et composants props
- **Zod pour runtime** : Validation données externes (API, forms)

### Performance First
- **Core Web Vitals** : Objectif Lighthouse > 90
- **Code Splitting** : Dynamic imports pour composants lourds
- **Image Optimization** : `next/image` obligatoire
- **Font Optimization** : `next/font` avec preload
- **Bundle Analysis** : Monitorer taille bundles

### Accessibilité (A11y)
- **WCAG 2.1 AA minimum**
- **Semantic HTML** : Utiliser balises appropriées
- **ARIA Labels** : Quand sémantique insuffisante
- **Keyboard Navigation** : Tous éléments interactifs accessibles
- **Contrast Ratios** : 4.5:1 pour texte normal, 3:1 pour large

## Structure App Router

### Layouts Hiérarchiques

```
src/app/
├── layout.tsx                    # Root layout (global)
├── page.tsx                      # Homepage
├── globals.css                   # Styles globaux
│
├── (marketing)/                  # Route group (SEO pages)
│   ├── layout.tsx               # Layout marketing (Header/Footer)
│   ├── page.tsx                 # Redirect vers /
│   ├── clubs/
│   │   ├── page.tsx             # Liste clubs
│   │   └── [slug]/
│   │       └── page.tsx         # Détail club (SSR)
│   ├── blog/
│   │   ├── page.tsx             # Liste articles (pagination)
│   │   ├── [slug]/
│   │   │   └── page.tsx         # Article détail (SSG/ISR)
│   │   └── tags/
│   │       └── [tag]/
│   │           └── page.tsx     # Articles par tag
│   ├── events/
│   │   ├── page.tsx             # Calendrier événements
│   │   └── [id]/
│   │       └── page.tsx         # Détail événement
│   ├── faq/
│   │   └── page.tsx
│   └── contact/
│       └── page.tsx
│
├── (auth)/                       # Route group (Auth pages)
│   ├── layout.tsx               # Layout minimal (centré)
│   ├── signin/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   └── forgot-password/
│       └── page.tsx
│
├── (dashboard)/                  # Route group (User espace)
│   ├── layout.tsx               # Layout avec sidebar user
│   ├── page.tsx                 # Dashboard user
│   ├── profile/
│   │   └── page.tsx
│   ├── account/
│   │   └── page.tsx
│   └── bookmarks/
│       └── page.tsx
│
├── (admin)/                      # Route group (Admin panel)
│   ├── layout.tsx               # Layout admin (sidebar avancé)
│   ├── dashboard/
│   │   └── page.tsx             # Analytics overview
│   ├── clubs/
│   │   ├── page.tsx             # CRUD liste clubs
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       ├── page.tsx         # Edit club
│   │       └── delete/
│   │           └── page.tsx
│   ├── blog/
│   │   ├── page.tsx             # Gestion articles
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx
│   ├── events/
│   │   ├── page.tsx
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx
│   ├── users/
│   │   ├── page.tsx             # Gestion utilisateurs
│   │   └── [id]/
│   │       └── page.tsx         # Détail user + roles
│   ├── roles/
│   │   └── page.tsx             # Gestion permissions
│   ├── shop/
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   └── orders/
│   │       ├── page.tsx
│   │       └── [id]/
│   │           └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   └── analytics/
│       └── page.tsx
│
└── api/                          # API Routes
    ├── auth/
    ├── clubs/
    ├── blog/
    ├── events/
    ├── users/
    ├── shop/
    ├── facebook/
    └── stripe/
```

## Composants Architecture

### Structure Composants

```
src/components/
├── layout/                       # Composants layout globaux
│   ├── Header.tsx               # Navigation principale
│   ├── Footer.tsx               # Footer avec liens
│   ├── Sidebar.tsx              # Sidebar admin/dashboard
│   └── Navigation.tsx           # Mobile nav
│
├── marketing/                    # Composants pages publiques
│   ├── Hero.tsx                 # Hero section homepage
│   ├── HeroParallax.tsx         # Hero avec effet parallaxe
│   ├── ClubCard.tsx             # Card affichage club
│   ├── EventCard.tsx            # Card événement
│   ├── BlogCard.tsx             # Card article blog
│   ├── Testimonials.tsx         # Section témoignages
│   ├── FeaturesGrid.tsx         # Grille features
│   ├── CTASection.tsx           # Call-to-action
│   └── Newsletter.tsx           # Formulaire newsletter
│
├── common/                       # Composants réutilisables
│   ├── Button.tsx               # Bouton avec variants
│   ├── Card.tsx                 # Card générique
│   ├── Modal.tsx                # Modal accessible
│   ├── Toast.tsx                # Notifications toast
│   ├── Spinner.tsx              # Loading spinner
│   ├── Badge.tsx                # Badge statut/tag
│   ├── Avatar.tsx               # Avatar utilisateur
│   ├── Tooltip.tsx              # Tooltip
│   ├── Dropdown.tsx             # Menu dropdown
│   ├── Tabs.tsx                 # Tabs navigation
│   └── form/
│       ├── Input.tsx            # Input texte
│       ├── Textarea.tsx
│       ├── Select.tsx
│       ├── Checkbox.tsx
│       ├── Radio.tsx
│       ├── FileUpload.tsx
│       ├── DatePicker.tsx
│       └── FormField.tsx        # Wrapper avec label + error
│
├── blog/                         # Composants spécifiques blog
│   ├── BlogGrid.tsx             # Grille articles
│   ├── BlogHeader.tsx           # Header article (cover, title)
│   ├── BlogContent.tsx          # Contenu riche (MDX)
│   ├── BlogSidebar.tsx          # Sidebar (tags, populaires)
│   ├── CommentSection.tsx       # Section commentaires
│   ├── CommentForm.tsx          # Form ajouter commentaire
│   ├── CommentItem.tsx          # Affichage commentaire
│   └── ShareButtons.tsx         # Boutons partage social
│
├── admin/                        # Composants admin panel
│   ├── DataTable.tsx            # Table avec tri/filtre/pagination
│   ├── StatsCard.tsx            # Card statistique
│   ├── Chart.tsx                # Graphiques (recharts)
│   ├── RichTextEditor.tsx       # Éditeur WYSIWYG (Tiptap)
│   ├── MediaUploader.tsx        # Upload images
│   ├── UserRoleSelector.tsx     # Sélection rôles
│   └── AuditLogViewer.tsx       # Visualisation logs
│
└── animations/                   # Composants avec animations
    ├── FadeIn.tsx               # Fade in on scroll
    ├── SlideIn.tsx              # Slide in on scroll
    ├── ParallaxImage.tsx        # Image parallaxe
    ├── CountUp.tsx              # Compteur animé
    └── ScrollProgress.tsx       # Barre progression lecture
```

### Conventions Composants

#### Nommage
- **PascalCase** : Tous composants React
- **Suffixe descriptif** : `Button`, `Card`, `Modal` (pas `Btn`, `Crd`)
- **Préfixe contexte** : `BlogCard`, `EventCard` (si spécifique)

#### Structure Fichier
```tsx
// Imports
import { ComponentProps } from 'react';

// Types/Interfaces
interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

// Composant
export function Button({ 
  variant = 'primary', 
  size = 'md',
  isLoading = false,
  children,
  className,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        isLoading && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <Spinner size="sm" /> : children}
    </button>
  );
}

// Exports nommés additionnels si nécessaire
export type { ButtonProps };
```

## État & Gestion Données

### Server State (React Query)

```tsx
// hooks/useClubs.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export function useClubs() {
  return useQuery({
    queryKey: ['clubs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('active', true)
        .order('city');
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Usage dans composant
function ClubsList() {
  const { data: clubs, isLoading, error } = useClubs();
  
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clubs?.map(club => (
        <ClubCard key={club.id} club={club} />
      ))}
    </div>
  );
}
```

### Global State (Zustand - minimal)

```tsx
// stores/authStore.ts
import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),
  signOut: async () => {
    // Logic signout
    set({ user: null });
  },
}));
```

**Principe** : Zustand pour état vraiment global et fréquemment accédé (user, theme). Sinon préférer React Query ou props.

## Styling Strategy

### Tailwind CSS
- **Utility-first** : Composition classes Tailwind
- **Responsive** : Mobile-first (`md:`, `lg:`, `xl:`)
- **Dark mode** : `dark:` variant si implémenté
- **Custom utilities** : Définir dans `tailwind.config.ts` si réutilisé > 3 fois

### CSS Modules (pour animations complexes)
```tsx
// components/animations/parallax.module.css
.parallaxContainer {
  position: relative;
  overflow: hidden;
}

.parallaxLayer {
  position: absolute;
  will-change: transform;
}

// Usage
import styles from './parallax.module.css';

export function ParallaxSection() {
  return (
    <div className={styles.parallaxContainer}>
      <div className={styles.parallaxLayer}>...</div>
    </div>
  );
}
```

### CSS Variables
```css
/* src/styles/variables.css */
:root {
  /* Colors */
  --color-primary: 220 90% 56%;
  --color-secondary: 280 70% 60%;
  --color-accent: 340 82% 52%;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-heading: 'Poppins', sans-serif;
  
  /* Animations */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 350ms ease;
}
```

## Routing & Navigation

### Navigation Programmatique
```tsx
'use client';

import { useRouter } from 'next/navigation';

export function MyComponent() {
  const router = useRouter();
  
  const handleSubmit = async () => {
    // ... logic
    router.push('/dashboard');
    router.refresh(); // Si besoin revalidate
  };
}
```

### Link Component
```tsx
import Link from 'next/link';

export function Navigation() {
  return (
    <nav>
      <Link 
        href="/clubs" 
        className="hover:text-primary transition-colors"
        prefetch={true} // Prefetch au hover
      >
        Clubs
      </Link>
    </nav>
  );
}
```

### Middleware (Auth protection)
```tsx
// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Protéger routes admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/signin', req.url));
    }
    
    // Vérifier rôle admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .single();
    
    if (!roles) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }
  
  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
```

## SEO Optimization

### Metadata API
```tsx
// app/(marketing)/blog/[slug]/page.tsx
import { Metadata } from 'next';
import { supabase } from '@/lib/supabase/server';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .single();
  
  if (!post) return {};
  
  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.cover_image_url],
      type: 'article',
      publishedTime: post.published_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.cover_image_url],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  // ... page content
}
```

### JSON-LD Structured Data
```tsx
// components/marketing/ClubSchema.tsx
import { Club } from '@/lib/types';

export function ClubSchema({ club }: { club: Club }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    name: club.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: club.address,
      addressLocality: club.city,
      postalCode: club.postal_code,
      addressCountry: 'FR',
    },
    telephone: club.phone,
    email: club.email,
    url: `https://phuong-long-vo-dao.fr/clubs/${club.slug}`,
    image: club.cover_image_url,
    description: club.description,
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

## Performance Optimization

### Image Optimization
```tsx
import Image from 'next/image';

export function OptimizedImage() {
  return (
    <Image
      src="/hero-martial-arts.jpg"
      alt="Phuong Long Vo Dao"
      width={1200}
      height={600}
      priority // Pour LCP si above fold
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}
```

### Dynamic Imports
```tsx
import dynamic from 'next/dynamic';

// Heavy component (ex: editor)
const RichTextEditor = dynamic(
  () => import('@/components/admin/RichTextEditor'),
  { 
    loading: () => <Spinner />,
    ssr: false, // Si nécessite window/document
  }
);
```

### React.memo
```tsx
import { memo } from 'react';

export const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  // Render expensive
  return <div>...</div>;
});
```

## Testing Strategy

### Unit Tests (Vitest)
```tsx
// components/common/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('is disabled when isLoading', () => {
    render(<Button isLoading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### E2E Tests (Playwright)
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can sign up', async ({ page }) => {
  await page.goto('/signup');
  
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'SecurePass123!');
  await page.fill('input[name="confirmPassword"]', 'SecurePass123!');
  
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('text=Bienvenue')).toBeVisible();
});
```

## Error Handling

### Error Boundary
```tsx
// app/error.tsx (global)
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">
          Une erreur est survenue
        </h2>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
```

### Toast Notifications
```tsx
// hooks/useToast.ts
import { toast } from 'sonner'; // ou react-hot-toast

export function useToast() {
  return {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    info: (message: string) => toast.info(message),
  };
}

// Usage
function MyComponent() {
  const { success, error } = useToast();
  
  const handleSubmit = async () => {
    try {
      await api.submit();
      success('Sauvegardé avec succès !');
    } catch (err) {
      error('Une erreur est survenue');
    }
  };
}
```

---

**Version** : 1.0  
**Dernière mise à jour** : 2025-11-04  
**Maintenu par** : Tech Lead Frontend

