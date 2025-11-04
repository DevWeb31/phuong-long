# Naming Patterns - Phuong Long Vo Dao

## Vue d'Ensemble

Ce document définit les conventions de nommage strictes à respecter dans tout le projet pour assurer cohérence et maintenabilité.

---

## Fichiers & Dossiers

### Composants React

**Format** : `PascalCase.tsx`

```
✅ GOOD
components/
├── Button.tsx
├── UserProfile.tsx
├── BlogPostCard.tsx
└── EventCalendarView.tsx

❌ BAD
components/
├── button.tsx          # Pas lowercase
├── user-profile.tsx    # Pas kebab-case
├── BUTTON.tsx          # Pas UPPERCASE
└── blogPostCard.tsx    # Commence par minuscule
```

### Utilities & Helpers

**Format** : `kebab-case.ts`

```
✅ GOOD
lib/utils/
├── format-date.ts
├── cn.ts
├── api-client.ts
└── validate-email.ts

❌ BAD
lib/utils/
├── formatDate.ts       # Pas camelCase
├── ApiClient.ts        # Pas PascalCase (réservé composants)
└── validate_email.ts   # Pas snake_case
```

### Hooks

**Format** : `use-hook-name.ts` (kebab-case avec préfixe `use-`)

```
✅ GOOD
hooks/
├── use-auth.ts
├── use-clubs.ts
├── use-media-query.ts
└── use-local-storage.ts

❌ BAD
hooks/
├── useAuth.ts          # Pas camelCase pour fichier
├── auth-hook.ts        # Pas de préfixe "use"
└── UseAuth.ts          # Pas PascalCase pour fichier
```

### Types & Interfaces

**Format** : `kebab-case.ts` (fichiers), mais `PascalCase` (noms types)

```
✅ GOOD
lib/types/
├── user.ts             # Fichier kebab-case
│   export interface User { ... }
│   export type UserRole = ...
├── api.ts
│   export interface ApiResponse<T> { ... }
└── database.ts
    export type DbTable = ...

❌ BAD
lib/types/
├── User.ts             # Pas PascalCase pour fichier
├── api_types.ts        # Pas snake_case
└── databaseTypes.ts    # Pas camelCase
```

### API Routes

**Format** : `kebab-case/route.ts`

```
✅ GOOD
app/api/
├── clubs/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
├── blog-posts/
│   └── [slug]/
│       └── route.ts
└── user-roles/
    └── route.ts

❌ BAD
app/api/
├── Clubs/              # Pas PascalCase
├── blog_posts/         # Pas snake_case
└── userRoles/          # Pas camelCase
```

### Pages (App Router)

**Format** : `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`

```
✅ GOOD
app/
├── (marketing)/
│   ├── page.tsx
│   ├── layout.tsx
│   └── clubs/
│       ├── page.tsx
│       └── [slug]/
│           └── page.tsx

❌ BAD
app/
├── (marketing)/
│   ├── index.tsx       # Utiliser "page.tsx"
│   ├── Layout.tsx      # Pas PascalCase pour fichier Next.js
│   └── clubs.tsx       # Pas de fichier direct (utiliser dossier/page.tsx)
```

### Dossiers Route Groups

**Format** : `(group-name)` (parenthèses + kebab-case)

```
✅ GOOD
app/
├── (marketing)/
├── (auth)/
├── (dashboard)/
└── (admin)/

❌ BAD
app/
├── marketing/          # Manque parenthèses (sera dans URL)
├── (Auth)/             # Pas PascalCase
└── (user_dashboard)/   # Pas snake_case
```

---

## Variables

### Variables Standard

**Format** : `camelCase`

```typescript
// ✅ GOOD
const userName = 'John Doe';
const isAuthenticated = true;
const maxUploadSize = 5_000_000;
const userProfileData = fetchUserProfile();

// ❌ BAD
const UserName = 'John'; // Pas PascalCase (réservé types/composants)
const is_authenticated = true; // Pas snake_case
const MAX_UPLOAD_SIZE = 5000; // Pas SCREAMING_SNAKE_CASE (réservé constantes globales)
```

### Constantes Globales

**Format** : `SCREAMING_SNAKE_CASE`

```typescript
// ✅ GOOD - lib/constants/config.ts
export const API_BASE_URL = 'https://api.example.com';
export const MAX_FILE_SIZE_MB = 10;
export const DEFAULT_PAGE_SIZE = 50;
export const CACHE_TTL_SECONDS = 3600;

// ❌ BAD
export const apiBaseUrl = '...'; // Pas camelCase pour constante globale
export const maxFileSizeMb = 10; // Pas camelCase
```

### Constantes Enum-like

**Format** : `camelCase` object + `as const` + `SCREAMING_SNAKE_CASE` keys

```typescript
// ✅ GOOD
export const userRoles = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  COACH: 'coach',
  USER: 'user',
} as const;

export const eventTypes = {
  COMPETITION: 'competition',
  STAGE: 'stage',
  DEMONSTRATION: 'demonstration',
} as const;

// ❌ BAD
export const UserRoles = { ... }; // Objet pas PascalCase
export const user_roles = { ... }; // Objet pas snake_case
export const userRoles = {
  admin: 'admin',         // Keys pas SCREAMING_SNAKE_CASE
  moderator: 'moderator',
};
```

### Booleans

**Format** : `camelCase` avec préfixes `is`, `has`, `should`, `can`, `will`, `did`

```typescript
// ✅ GOOD
const isLoading = true;
const hasPermission = checkPermission(user);
const shouldRender = isVisible && isReady;
const canEdit = user.role === 'admin';
const willExpire = expiryDate < now;
const didComplete = status === 'completed';

// ❌ BAD
const loading = true;           // Ambigu (string? boolean?)
const permission = checkPerm(); // Pas clair type
const visible = true;           // Manque préfixe "is"
```

### Private Variables (Class)

**Format** : `_camelCase` (underscore prefix) ou `#camelCase` (private fields)

```typescript
// ✅ GOOD - TypeScript private
class UserService {
  private _apiClient: ApiClient;
  private _cache: Map<string, User>;
  
  // Ou avec private fields
  #apiClient: ApiClient;
  #cache: Map<string, User>;
}

// ❌ BAD
class UserService {
  private apiClient: ApiClient;  // OK mais moins visible
  private ApiClient: ApiClient;  // Pas PascalCase pour variable
}
```

---

## Fonctions

### Fonctions Standard

**Format** : `camelCase` avec verbe d'action

**Verbes courants** : `get`, `set`, `fetch`, `create`, `update`, `delete`, `validate`, `calculate`, `format`, `parse`, `handle`, `toggle`, `check`, `is`, `has`

```typescript
// ✅ GOOD
function getUser(id: string): User { ... }
function fetchClubs(): Promise<Club[]> { ... }
function createBlogPost(data: BlogPostInput): Promise<BlogPost> { ... }
function updateUserProfile(id: string, data: Partial<User>): Promise<void> { ... }
function deleteComment(id: string): Promise<void> { ... }
function validateEmail(email: string): boolean { ... }
function formatDate(date: Date): string { ... }
function parseQueryParams(url: string): Record<string, string> { ... }
function handleSubmit(event: FormEvent): void { ... }
function toggleSidebar(): void { ... }
function checkPermission(user: User, action: string): boolean { ... }

// ❌ BAD
function user(id: string) { ... }        // Pas de verbe
function clubs() { ... }                 // Ambigu (getter? constante?)
function submit(e: FormEvent) { ... }    // Pas de contexte (handle? on?)
function email(val: string): boolean { ... } // Pas de verbe (validate?)
```

### Event Handlers

**Format** : `handle` + `EventName` (camelCase)

```typescript
// ✅ GOOD
function handleClick() { ... }
function handleSubmit(event: FormEvent) { ... }
function handleChange(value: string) { ... }
function handleKeyDown(event: KeyboardEvent) { ... }
function handleMouseEnter() { ... }
function handleFocus() { ... }

// ❌ BAD
function onClick() { ... }       // Utiliser "handle" (cohérence)
function click() { ... }         // Manque "handle"
function submitForm() { ... }    // OK mais moins cohérent avec handlers
```

### Async Functions

**Format** : Même convention, type de retour `Promise<T>`

```typescript
// ✅ GOOD
async function fetchUser(id: string): Promise<User> { ... }
async function createPost(data: PostInput): Promise<Post> { ... }

// ⚠️ AVOID préfixes "async" dans nom (redondant avec mot-clé)
async function asyncFetchUser(id: string): Promise<User> { ... }

// ❌ BAD
async function getUser(id: string): User { ... } // Type retour incorrect (manque Promise)
```

### Pure Functions / Utilities

**Format** : `camelCase` verbe descriptif

```typescript
// ✅ GOOD - lib/utils/format.ts
export function formatCurrency(amountCents: number): string { ... }
export function formatPhoneNumber(phone: string): string { ... }
export function slugify(text: string): string { ... }
export function truncate(text: string, maxLength: number): string { ... }

// ❌ BAD
export function currency(amount: number) { ... }  // Pas de verbe
export function phone(p: string) { ... }          // Nom trop vague
```

---

## Types & Interfaces

### Interfaces

**Format** : `PascalCase` (pas de préfixe `I`)

```typescript
// ✅ GOOD
interface User {
  id: string;
  email: string;
  name: string;
}

interface BlogPost {
  title: string;
  content: string;
  author: User;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// ❌ BAD
interface IUser { ... }          // Pas de préfixe "I" (convention C#, pas TS)
interface user { ... }           // Pas lowercase
interface blog_post { ... }      // Pas snake_case
interface IBlogPostInterface { ... } // Trop verbeux + préfixe
```

### Types

**Format** : `PascalCase`

```typescript
// ✅ GOOD
type UserRole = 'admin' | 'moderator' | 'coach' | 'user';
type Status = 'pending' | 'active' | 'suspended';
type Nullable<T> = T | null;
type ApiError = {
  code: string;
  message: string;
};

// ❌ BAD
type userRole = ...;             // Pas camelCase
type USER_ROLE = ...;            // Pas SCREAMING_SNAKE_CASE
type TUserRole = ...;            // Pas de préfixe "T"
```

### Props Interfaces

**Format** : `ComponentName` + `Props`

```typescript
// ✅ GOOD
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

interface UserProfileProps {
  user: User;
  onEdit?: () => void;
}

// ❌ BAD
interface IButtonProps { ... }       // Pas de préfixe "I"
interface ButtonProperties { ... }   // Utiliser "Props"
interface Props { ... }              // Trop générique
```

### Generics

**Format** : Single uppercase letter ou `PascalCase` descriptif

```typescript
// ✅ GOOD - Single letter
function identity<T>(value: T): T { ... }
function mapArray<T, U>(arr: T[], fn: (item: T) => U): U[] { ... }

// ✅ GOOD - Descriptif si complexe
interface Repository<TEntity, TId> {
  findById(id: TId): Promise<TEntity | null>;
}

// ✅ GOOD - Conventions
T      // Type générique principal
U, V   // Types additionnels
K      // Key type (objets)
P      // Props type (React)
R      // Return type

// ❌ BAD
function identity<type>(value: type): type { ... } // Pas lowercase
function map<t, u>(arr: t[], fn: (item: t) => u): u[] { ... } // Pas lowercase
```

---

## Classes

### Nommage Classes

**Format** : `PascalCase` (nom)

```typescript
// ✅ GOOD
class UserService {
  async getUser(id: string): Promise<User> { ... }
}

class ApiClient {
  private baseUrl: string;
  async request(endpoint: string): Promise<Response> { ... }
}

class EventEmitter {
  on(event: string, handler: Function): void { ... }
}

// ❌ BAD
class userService { ... }        // Pas camelCase
class User_Service { ... }       // Pas snake_case
class api_client { ... }         // Pas snake_case
```

### Méthodes

**Format** : `camelCase` (mêmes conventions que fonctions)

```typescript
// ✅ GOOD
class BlogService {
  async createPost(data: PostInput): Promise<Post> { ... }
  async updatePost(id: string, data: Partial<Post>): Promise<Post> { ... }
  async deletePost(id: string): Promise<void> { ... }
  
  private validatePostData(data: unknown): PostInput { ... }
}

// ❌ BAD
class BlogService {
  async CreatePost(...) { ... }      // Pas PascalCase pour méthode
  async post_create(...) { ... }     // Pas snake_case
  async Post(...) { ... }            // Pas de verbe
}
```

---

## React Specifics

### Composants

**Format** : `PascalCase`

```tsx
// ✅ GOOD
export function Button({ children }: ButtonProps) { ... }
export function UserProfile({ user }: UserProfileProps) { ... }
export const BlogPostCard = ({ post }: BlogPostCardProps) => { ... };

// ❌ BAD
export function button(...) { ... }          // Pas lowercase
export function user_profile(...) { ... }    // Pas snake_case
export function BUTTON(...) { ... }          // Pas SCREAMING
export default function Component(...) { ... } // Éviter default exports
```

### Hooks

**Format** : `use` + `PascalCaseName` (camelCase résultant : `useName`)

```typescript
// ✅ GOOD
export function useAuth() { ... }
export function useClubs() { ... }
export function useMediaQuery(query: string) { ... }
export function useLocalStorage<T>(key: string, initialValue: T) { ... }

// ❌ BAD
export function getAuth() { ... }         // Manque préfixe "use"
export function UseAuth() { ... }         // Pas PascalCase (fonction doit être camelCase)
export function use_auth() { ... }        // Pas snake_case
export function authHook() { ... }        // Manque préfixe "use"
```

### Props

**Format** : `camelCase` (sauf event handlers `on` + `EventName`)

```tsx
// ✅ GOOD
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  onSubmit?: (data: FormData) => void;
  className?: string;
  children?: ReactNode;
}

// ❌ BAD
interface ButtonProps {
  Variant?: string;            // Pas PascalCase
  is_loading?: boolean;        // Pas snake_case
  click?: () => void;          // Manque préfixe "on"
  OnClick?: () => void;        // Pas PascalCase (doit être camelCase)
}
```

### Context

**Format** : `PascalCase` + `Context`

```typescript
// ✅ GOOD
export const AuthContext = createContext<AuthContextType | null>(null);
export const ThemeContext = createContext<ThemeContextType>({ ... });

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={...}>{children}</AuthContext.Provider>;
}

// Hook
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
}

// ❌ BAD
export const Auth = createContext(...);        // Manque suffixe "Context"
export const authContext = createContext(...); // Pas camelCase
```

---

## Database

### Tables

**Format** : `snake_case` (pluriel pour collections)

```sql
-- ✅ GOOD
CREATE TABLE users (...);
CREATE TABLE blog_posts (...);
CREATE TABLE event_registrations (...);
CREATE TABLE user_roles (...);

-- ❌ BAD
CREATE TABLE Users (...);           -- Pas PascalCase
CREATE TABLE blogPosts (...);       -- Pas camelCase
CREATE TABLE user (...);            -- Singulier (sauf tables pivot)
```

### Colonnes

**Format** : `snake_case`

```sql
-- ✅ GOOD
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ❌ BAD
CREATE TABLE users (
  Id UUID,                 -- Pas PascalCase
  Email TEXT,              -- Pas PascalCase
  fullName TEXT,           -- Pas camelCase
  CreatedAt TIMESTAMPTZ    -- Pas PascalCase
);
```

### Indexes

**Format** : `idx_` + `table` + `_` + `column(s)`

```sql
-- ✅ GOOD
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX idx_events_club_id_start_date ON events(club_id, start_date);

-- ❌ BAD
CREATE INDEX users_email_index ON users(email);    -- Pas de convention
CREATE INDEX BlogPostsAuthor ON blog_posts(...);   -- PascalCase
```

### Foreign Keys

**Format** : `fk_` + `table` + `_` + `ref_table`

```sql
-- ✅ GOOD
ALTER TABLE blog_posts
  ADD CONSTRAINT fk_blog_posts_users
  FOREIGN KEY (author_id) REFERENCES users(id);

-- ❌ BAD
ALTER TABLE blog_posts
  ADD CONSTRAINT author_fk ...;  -- Pas de convention claire
```

---

## URLs & Endpoints

### API Endpoints

**Format** : `kebab-case`, pluriel pour collections

```
✅ GOOD
GET    /api/clubs
GET    /api/clubs/:id
POST   /api/blog-posts
GET    /api/blog-posts/:slug
PATCH  /api/user-roles/:id
DELETE /api/event-registrations/:id

❌ BAD
GET    /api/Clubs              # Pas PascalCase
GET    /api/club               # Singulier (pour liste)
POST   /api/blog_posts         # Pas snake_case
GET    /api/blogPosts          # Pas camelCase
```

### Slugs (URLs publiques)

**Format** : `kebab-case`, lowercase

```
✅ GOOD
/clubs/marseille-centre
/blog/introduction-phuong-long-vo-dao
/events/competition-nationale-2025

❌ BAD
/clubs/Marseille_Centre        # Pas snake_case + PascalCase
/blog/Introduction-Phuong-Long # Pas PascalCase
/events/competitionNationale   # Pas camelCase
```

---

## Environment Variables

**Format** : `SCREAMING_SNAKE_CASE`

```bash
# ✅ GOOD - .env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENDGRID_API_KEY=SG.xxx

# ❌ BAD
databaseUrl=...                # Pas camelCase
next-public-api-url=...        # Pas kebab-case
stripeSecretKey=...            # Pas camelCase
```

**Préfixes Next.js** :
- `NEXT_PUBLIC_` : Variables exposées au client (browser)
- Sans préfixe : Secrets côté serveur UNIQUEMENT

---

## CSS Classes (Tailwind)

**Format** : `kebab-case` (Tailwind) ou `camelCase` (CSS Modules)

```tsx
// ✅ GOOD - Tailwind
<div className="flex items-center justify-between px-4 py-2">

// ✅ GOOD - CSS Modules
import styles from './Button.module.css';
<button className={styles.primaryButton}>

// ❌ BAD
<div className="Flex Items-Center">  # Pas PascalCase
<button className={styles.primary_button}> # snake_case dans CSS Modules (préférer camelCase)
```

---

## Tests

### Fichiers Test

**Format** : `ComponentName.test.tsx` ou `function-name.test.ts`

```
✅ GOOD
components/
├── Button.tsx
└── Button.test.tsx

lib/utils/
├── format-date.ts
└── format-date.test.ts

❌ BAD
components/
└── button.spec.tsx      # Utiliser ".test" (Jest/Vitest convention)
└── ButtonTest.tsx       # Pas de suffixe "Test"
```

### Test Cases

**Format** : Phrases descriptives (commence par verb + complément)

```typescript
// ✅ GOOD
describe('Button', () => {
  it('renders children correctly', () => { ... });
  it('calls onClick when clicked', () => { ... });
  it('is disabled when isLoading is true', () => { ... });
  it('throws error when invalid variant is provided', () => { ... });
});

// ❌ BAD
describe('Button', () => {
  it('works', () => { ... });                    // Trop vague
  it('test 1', () => { ... });                   // Pas descriptif
  it('should render correctly', () => { ... });  // "should" redondant avec "it"
});
```

---

## Résumé Rapide

| Contexte | Convention | Exemple |
|---|---|---|
| **Composant React** | PascalCase | `UserProfile.tsx` |
| **Fonction/Variable** | camelCase | `getUserData()`, `isLoading` |
| **Constante globale** | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE` |
| **Type/Interface** | PascalCase | `interface User`, `type UserRole` |
| **Hook** | use + camelCase | `useAuth()` |
| **Fichier util** | kebab-case | `format-date.ts` |
| **API endpoint** | kebab-case | `/api/blog-posts` |
| **Table DB** | snake_case | `blog_posts` |
| **Colonne DB** | snake_case | `created_at` |
| **Env variable** | SCREAMING_SNAKE_CASE | `DATABASE_URL` |
| **CSS class (Tailwind)** | kebab-case | `flex-col` |
| **Test file** | *.test.* | `Button.test.tsx` |

---

**Version** : 1.0  
**Dernière mise à jour** : 2025-11-04  
**Strictement appliqué** : Tout le projet

