# Code Conventions - Phuong Long Vo Dao

## Principes Généraux

### Code Quality Mantras
1. **Lisibilité > Concision** : Code lu 10x plus que écrit
2. **Explicite > Implicite** : Pas de "magie", comportement clair
3. **Simple > Clever** : Solutions simples et maintenables
4. **DRY** : Don't Repeat Yourself (mais pas avant 3ème occurrence)
5. **YAGNI** : You Aren't Gonna Need It (pas de code spéculatif)
6. **Single Responsibility** : Une fonction/composant = une responsabilité

### Philosophie
- **Tests avant refactoring** : Sécurité filet avant optimisation
- **Petits commits atomiques** : 1 feature/fix = 1 commit
- **Comments expliquent POURQUOI, pas QUOI** : Code auto-documenté
- **Fail fast** : Validation early, errors explicites

---

## TypeScript Standards

### Configuration
```json
// tsconfig.json (strict mode)
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Types & Interfaces

**Règle 1** : Préférer `interface` pour objets, `type` pour unions/intersections/aliases

```typescript
// ✅ GOOD - Interface pour objets
interface User {
  id: string;
  email: string;
  name: string | null;
}

interface UserWithProfile extends User {
  profile: UserProfile;
}

// ✅ GOOD - Type pour unions
type UserRole = 'admin' | 'moderator' | 'coach' | 'user';
type Status = 'pending' | 'active' | 'suspended';

// ✅ GOOD - Type pour intersection
type AuthenticatedUser = User & { token: string };

// ❌ BAD - any interdit
function processData(data: any) { // JAMAIS ça
  return data.value;
}

// ✅ GOOD - unknown si vraiment type inconnu
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value;
  }
  throw new Error('Invalid data structure');
}
```

**Règle 2** : Éviter duplication types (créer types partagés)

```typescript
// ✅ GOOD - Types dans lib/types/
// lib/types/user.ts
export interface User {
  id: string;
  email: string;
  // ...
}

// lib/types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// ❌ BAD - Duplication
// page1.tsx
interface User { id: string; email: string; }
// page2.tsx
interface User { id: string; email: string; } // Duplication!
```

**Règle 3** : Utiliser `as const` pour objets immutables

```typescript
// ✅ GOOD
const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  COACH: 'coach',
  USER: 'user',
} as const;

type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// ❌ BAD
const USER_ROLES = {
  ADMIN: 'admin', // Type: string (trop large)
};
```

### Enums vs Union Types

**Préférer Union Types** (plus léger, meilleur tree-shaking)

```typescript
// ✅ GOOD - Union type
type EventType = 'competition' | 'stage' | 'demonstration' | 'seminar';

// ⚠️ OK mais moins optimal - Enum (uniquement si besoin valeurs numériques)
enum EventType {
  Competition = 'competition',
  Stage = 'stage',
}
```

---

## Naming Conventions

### Variables & Fonctions

```typescript
// camelCase pour variables, fonctions
const userProfile = { ... };
const isAuthenticated = true;
const hasPermission = (user: User, action: string) => { ... };

// PascalCase pour composants React, classes, types, interfaces
function UserProfile() { ... }
class DatabaseService { ... }
interface ApiResponse { ... }

// SCREAMING_SNAKE_CASE pour constantes globales
const MAX_UPLOAD_SIZE = 5_000_000; // 5MB
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// kebab-case pour fichiers (sauf composants React)
// utils/format-date.ts ✅
// components/UserProfile.tsx ✅ (PascalCase pour composants)
```

### Booleans

**Préfixes** : `is`, `has`, `should`, `can`, `will`

```typescript
// ✅ GOOD
const isLoading = true;
const hasAccess = checkAccess();
const shouldRender = isVisible && isReady;
const canEdit = user.role === 'admin';

// ❌ BAD
const loading = true; // Ambigu
const access = checkAccess(); // Pas clair que c'est boolean
```

### Fonctions

**Verbes d'action** : `get`, `set`, `fetch`, `create`, `update`, `delete`, `validate`, `handle`, `toggle`, `calculate`

```typescript
// ✅ GOOD
function getUser(id: string): User { ... }
function fetchClubs(): Promise<Club[]> { ... }
function createBlogPost(data: BlogPostInput): Promise<BlogPost> { ... }
function validateEmail(email: string): boolean { ... }
function handleSubmit(event: FormEvent): void { ... }

// ❌ BAD
function user(id: string) { ... } // Pas de verbe
function clubs() { ... } // Ambigu (getter? liste?)
```

### Événements & Handlers

```typescript
// ✅ GOOD - Handlers préfixés "handle" + Event
function handleClick() { ... }
function handleSubmit(event: FormEvent) { ... }
function handleChange(value: string) { ... }

// Props événements préfixées "on" + Action
interface ButtonProps {
  onClick?: () => void;
  onSubmit?: (data: FormData) => void;
}

// ❌ BAD
function click() { ... } // Pas de contexte
function submitForm() { ... } // OK mais moins cohérent
```

---

## React / Next.js Standards

### Composants

**Structure type** :

```tsx
// components/common/Button.tsx

// 1. Imports (groupés logiquement)
import { ComponentProps, forwardRef } from 'react';
import { cn } from '@/lib/utils';

// 2. Types/Interfaces
interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

// 3. Constantes internes (si besoin)
const variantStyles = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'bg-secondary text-white hover:bg-secondary-dark',
  ghost: 'bg-transparent hover:bg-gray-100',
};

// 4. Composant (export named, pas default)
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ 
    variant = 'primary',
    size = 'md',
    isLoading = false,
    children,
    className,
    ...props 
  }, ref) {
    return (
      <button
        ref={ref}
        className={cn(
          'rounded-lg font-medium transition-colors',
          variantStyles[variant],
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
);

// 5. Export types si réutilisés
export type { ButtonProps };
```

**Règles** :

1. **Export named (pas default)** : `export function Component() { ... }`
   - Meilleur autocomplétion
   - Refactoring plus safe
   - Tree-shaking optimal

2. **Props interface dédiée** : `ComponentNameProps`

3. **Props destructuring** : Avec defaults

4. **Ordre props** :
   - Required props en premier
   - Optional props ensuite
   - `className` et `...rest` à la fin

5. **forwardRef** si composant peut recevoir ref

### Server vs Client Components

```tsx
// ✅ GOOD - Server Component (par défaut, pas de "use client")
// app/(marketing)/clubs/page.tsx
import { supabase } from '@/lib/supabase/server';

export default async function ClubsPage() {
  const { data: clubs } = await supabase.from('clubs').select('*');
  
  return (
    <div>
      {clubs?.map(club => <ClubCard key={club.id} club={club} />)}
    </div>
  );
}

// ✅ GOOD - Client Component (interactivité requise)
// components/common/Button.tsx
'use client';

import { useState } from 'react';

export function LikeButton() {
  const [liked, setLiked] = useState(false);
  
  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? '❤️' : '🤍'}
    </button>
  );
}

// ❌ BAD - "use client" sans raison
'use client'; // Pas besoin si pas de hooks/interactivité!

export function StaticCard({ title }: { title: string }) {
  return <div>{title}</div>; // Aucune interactivité
}
```

**Règle** : Server Component par défaut. `"use client"` UNIQUEMENT si :
- Hooks React (`useState`, `useEffect`, etc.)
- Event handlers (`onClick`, `onChange`, etc.)
- Browser APIs (`window`, `localStorage`, etc.)
- Third-party libraries client-only

### Hooks

**Règles** :

1. **Prefix `use`** obligatoire
2. **Custom hooks dans `hooks/`**
3. **Un hook = une responsabilité**

```typescript
// ✅ GOOD - hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  return { user, isLoading };
}

// ✅ GOOD - Usage
function MyComponent() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <Spinner />;
  if (!user) return <SignInPrompt />;
  
  return <div>Hello {user.email}</div>;
}

// ❌ BAD - Logique auth directement dans composant (duplication)
function MyComponent() {
  const [user, setUser] = useState<User | null>(null);
  // ... duplication de la logique auth dans chaque composant
}
```

### Conditional Rendering

```tsx
// ✅ GOOD - Early returns
function UserProfile({ user }: { user: User | null }) {
  if (!user) return <div>Please sign in</div>;
  if (user.suspended) return <div>Account suspended</div>;
  
  return <div>Welcome {user.name}</div>;
}

// ✅ GOOD - Ternaire simple (max 1 niveau)
{isLoading ? <Spinner /> : <Content />}

// ⚠️ AVOID - Ternaire imbriqué (complexe)
{isLoading ? <Spinner /> : error ? <Error /> : data ? <Content /> : <Empty />}

// ✅ GOOD - Refactorer ternaires complexes
function ContentState() {
  if (isLoading) return <Spinner />;
  if (error) return <Error error={error} />;
  if (!data) return <Empty />;
  return <Content data={data} />;
}

// ✅ GOOD - Short-circuit pour render conditionnel
{isAdmin && <AdminPanel />}
{items.length > 0 && <ItemsList items={items} />}
```

---

## API Routes Standards

### Structure Endpoint

```typescript
// app/api/clubs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/server';

// 1. Schemas Zod validation
const clubUpdateSchema = z.object({
  name: z.string().min(3).max(100),
  city: z.string().min(2),
  description: z.string().optional(),
});

// 2. GET Handler
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: club, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (error || !club) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Club not found' } },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: club });
  } catch (error) {
    console.error('[CLUBS_GET]', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

// 3. PATCH Handler
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    
    // Parse & validate body
    const body = await request.json();
    const validated = clubUpdateSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Invalid input',
            details: validated.error.errors 
          } 
        },
        { status: 400 }
      );
    }
    
    // Update
    const { data: club, error } = await supabase
      .from('clubs')
      .update(validated.data)
      .eq('id', params.id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'UPDATE_FAILED', message: error.message } },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data: club });
  } catch (error) {
    console.error('[CLUBS_PATCH]', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
```

**Règles** :

1. **Validation Zod** : Toujours valider inputs
2. **Error handling** : try/catch + responses standardisées
3. **Auth check** : Dès le début si endpoint protégé
4. **Logging** : `console.error('[CONTEXT]', error)` pour debug
5. **HTTP Status codes** : Respecter conventions (200, 201, 400, 401, 403, 404, 500)

### Response Format Standard

```typescript
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": [ ... ] // Optional (ex: Zod errors)
  }
}
```

---

## Styling Conventions

### Tailwind CSS

**Ordre classes** (recommandé) :

1. Layout (display, position)
2. Box model (padding, margin, width, height)
3. Typography
4. Visual (colors, borders, shadows)
5. Misc (transitions, transforms)

```tsx
// ✅ GOOD - Ordre logique
<div className="flex items-center justify-between p-4 mb-6 text-lg font-semibold bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
  Content
</div>

// ⚠️ OK mais moins lisible - Ordre aléatoire
<div className="shadow-md mb-6 text-lg rounded-lg p-4 flex font-semibold bg-white items-center transition-shadow hover:shadow-lg justify-between">
  Content
</div>
```

**Responsive** : Mobile-first

```tsx
// ✅ GOOD - Mobile first, puis breakpoints
<div className="text-sm md:text-base lg:text-lg">
  Texte responsive
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

**Utiliser `cn()` helper** pour conditions

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
<button 
  className={cn(
    'px-4 py-2 rounded',
    variant === 'primary' && 'bg-blue-500 text-white',
    variant === 'secondary' && 'bg-gray-500 text-white',
    isDisabled && 'opacity-50 cursor-not-allowed'
  )}
/>
```

---

## File Organization

### Structure

```
src/
├── app/                  # Next.js App Router
│   ├── (marketing)/     # Route group
│   ├── api/             # API routes
│   └── ...
├── components/
│   ├── common/          # Réutilisables génériques
│   ├── marketing/       # Spécifiques marketing
│   ├── admin/           # Spécifiques admin
│   └── ...
├── hooks/               # Custom hooks
│   ├── useAuth.ts
│   └── useClubs.ts
├── lib/
│   ├── supabase/        # Supabase clients
│   ├── stripe/          # Stripe config
│   ├── utils/           # Utilities génériques
│   │   ├── cn.ts
│   │   ├── format.ts
│   │   └── validators.ts
│   ├── constants/       # Constantes app
│   │   ├── roles.ts
│   │   └── config.ts
│   └── types/           # Types partagés
│       ├── user.ts
│       ├── club.ts
│       └── api.ts
├── styles/
│   ├── globals.css
│   └── variables.css
└── middleware.ts
```

### Règles Fichiers

1. **Un composant = un fichier** (sauf petits helpers internes)
2. **Colocation** : Fichiers liés proche (ex: `Button.tsx` + `Button.test.tsx`)
3. **Index exports** : Éviter (rend navigation difficile)
4. **Max 400 lignes** : Si plus, refactorer en sous-composants

---

## Comments & Documentation

### Quand Commenter

```typescript
// ✅ GOOD - Expliquer POURQUOI (business logic non évidente)
// Stripe requires amount in cents, not dollars
const amountCents = amountDollars * 100;

// RLS policies don't apply to service role, so we manually check permissions
if (user.role !== 'admin') {
  throw new Error('Unauthorized');
}

// ✅ GOOD - TODO/FIXME avec contexte
// TODO(username): Implement pagination when dataset grows > 1000 items
// FIXME: Race condition possible if user clicks twice rapidly

// ❌ BAD - Commenter le QUOI (code self-explanatory)
// Increment counter
counter++;

// Loop through users
users.forEach(user => { ... });

// ❌ BAD - Code commenté (utiliser git history)
// const oldFunction = () => { ... };
```

### JSDoc (pour utils/helpers)

```typescript
/**
 * Formats a date according to French locale
 * @param date - The date to format
 * @param format - Optional format string (default: 'dd/MM/yyyy')
 * @returns Formatted date string
 * @example
 * formatDate(new Date('2025-11-04')) // '04/11/2025'
 */
export function formatDate(date: Date, format = 'dd/MM/yyyy'): string {
  // ...
}
```

---

## Git Commit Conventions

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: Nouvelle feature
- `fix`: Bug fix
- `docs`: Documentation uniquement
- `style`: Formatting, missing semi colons, etc (pas CSS)
- `refactor`: Refactoring code sans changer comportement
- `perf`: Performance improvement
- `test`: Ajout/modification tests
- `chore`: Maintenance, configs, dependencies

### Exemples

```bash
feat(blog): add comment moderation system

- Admin can approve/reject comments
- Email notification on new comment
- RLS policies for comment visibility

Closes #123

---

fix(auth): prevent race condition on logout

User could trigger multiple logout requests causing
session inconsistency.

---

docs(readme): update setup instructions

---

refactor(components): extract shared Button logic

Moved variant styles to separate config object
for better maintainability.

---

perf(api): add database indexes on frequent queries

Added indexes on:
- blog_posts.author_id
- events.club_id
- orders.user_id

Query time reduced from 800ms to 45ms on /api/blog.
```

### Règles

1. **Subject** : 
   - Imperative mood ("add" not "added")
   - Max 72 caractères
   - Pas de point final
   - Lowercase

2. **Body** : 
   - Expliquer QUOI et POURQUOI (pas COMMENT)
   - Wrap à 72 caractères

3. **Footer** :
   - Issues référencées (Closes #123)
   - Breaking changes (BREAKING CHANGE: ...)

---

## Testing Conventions

### Nommage Tests

```typescript
// ✅ GOOD
describe('Button', () => {
  it('renders children correctly', () => { ... });
  it('calls onClick when clicked', () => { ... });
  it('is disabled when isLoading is true', () => { ... });
  it('throws error when invalid variant provided', () => { ... });
});

// ❌ BAD
describe('Button', () => {
  it('works', () => { ... }); // Trop vague
  it('test 1', () => { ... }); // Pas descriptif
});
```

### Structure Test

```typescript
it('updates user profile successfully', async () => {
  // Arrange (Setup)
  const user = createMockUser();
  const newData = { name: 'John Doe' };
  
  // Act (Execute)
  const result = await updateUserProfile(user.id, newData);
  
  // Assert (Verify)
  expect(result.success).toBe(true);
  expect(result.data.name).toBe('John Doe');
});
```

---

## Performance Checklist

- [ ] Images utilisent `next/image`
- [ ] Fonts chargées via `next/font`
- [ ] Composants lourds lazy-loaded (`dynamic import`)
- [ ] Lists utilisent `key` unique (pas index si ordre change)
- [ ] Expensive computations mémorisées (`useMemo`)
- [ ] Callbacks mémorisés (`useCallback`) si passés en props
- [ ] API responses cachées (React Query `staleTime`)
- [ ] Database queries optimisées (indexes, select specific fields)

---

**Version** : 1.0  
**Dernière mise à jour** : 2025-11-04  
**Appliqué sur** : Tous fichiers projet

