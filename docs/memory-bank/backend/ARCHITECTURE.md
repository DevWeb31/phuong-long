# Architecture Backend

## Principes Fondamentaux

### Security-First Design
- **Row Level Security (RLS)** : Chaque table publique DOIT avoir des policies RLS
- **JWT Authentication** : Tokens managés par Supabase Auth
- **Service Role Key** : Utilisé UNIQUEMENT pour opérations admin côté serveur
- **Input Validation** : Zod schemas pour toutes les entrées API
- **Rate Limiting** : Middleware sur tous les endpoints publics

### API Design Standards
- **RESTful** : Conventions HTTP standard (GET, POST, PUT, PATCH, DELETE)
- **Versioning** : `/api/v1/...` (anticipation évolutions futures)
- **Consistent Responses** : Format JSON uniforme pour succès/erreurs
- **Pagination** : Limite 50 items par défaut, max 100
- **Filtering & Sorting** : Query params standardisés

### Performance & Scalability
- **Edge Functions** : Pour opérations légères sans état
- **Node Runtime** : Pour webhooks et traitement complexe
- **Caching** : Headers Cache-Control appropriés
- **Database Indexing** : Sur foreign keys + colonnes de recherche
- **Connection Pooling** : Géré par Supabase

## Structure des Endpoints

### Authentication (`/api/auth/*`)

```
POST   /api/auth/signup           Créer compte utilisateur
POST   /api/auth/signin           Connexion (email/password)
POST   /api/auth/signout          Déconnexion
POST   /api/auth/reset-password   Demande reset mot de passe
POST   /api/auth/verify-email     Vérification email
GET    /api/auth/session          Récupérer session courante
```

**Sécurité** :
- Rate limit : 5 tentatives/5min par IP
- Password : Min 8 caractères, validation Zod
- Email verification obligatoire avant accès complet

### Clubs (`/api/clubs/*`)

```
GET    /api/clubs                 Liste tous clubs (public)
GET    /api/clubs/[id]            Détails club (public)
POST   /api/clubs                 Créer club (admin only)
PATCH  /api/clubs/[id]            Modifier club (admin only)
DELETE /api/clubs/[id]            Supprimer club (admin only)
GET    /api/clubs/[id]/events     Événements d'un club
GET    /api/clubs/[id]/coaches    Coaches d'un club
```

**RLS Policies** :
- SELECT : Public (tous)
- INSERT/UPDATE/DELETE : Rôle admin uniquement

### Blog (`/api/blog/*`)

```
GET    /api/blog                  Liste articles (pagination)
GET    /api/blog/[slug]           Article par slug
POST   /api/blog                  Créer article (auth required)
PATCH  /api/blog/[id]             Modifier article (author/admin)
DELETE /api/blog/[id]             Supprimer article (author/admin)
GET    /api/blog/[id]/comments    Commentaires d'un article
POST   /api/blog/[id]/comments    Ajouter commentaire (auth)
DELETE /api/blog/comments/[id]    Supprimer commentaire (author/moderator)
GET    /api/blog/tags             Liste tags populaires
```

**Features** :
- Draft/Published status
- Scheduled publication
- SEO metadata (title, description, OG image)
- Reading time calculation
- View counter

### Events (`/api/events/*`)

```
GET    /api/events                Liste événements (filtres: club, date)
GET    /api/events/[id]           Détails événement
POST   /api/events                Créer événement (coach/admin)
PATCH  /api/events/[id]           Modifier événement (creator/admin)
DELETE /api/events/[id]           Supprimer événement (creator/admin)
POST   /api/events/[id]/register  Inscription événement (auth)
DELETE /api/events/[id]/register  Désinscription (auth)
GET    /api/events/[id]/attendees Liste inscrits (creator/admin)
```

**Business Rules** :
- Capacité max par événement
- Deadline inscription (J-2 par défaut)
- Notification email confirmation
- Reminder 24h avant

### Users (`/api/users/*`)

```
GET    /api/users                 Liste users (admin only)
GET    /api/users/me              Profil utilisateur courant
PATCH  /api/users/me              Modifier son profil
DELETE /api/users/me              Supprimer son compte (RGPD)
GET    /api/users/me/export       Export données RGPD (JSON)
GET    /api/users/[id]            Profil public user
POST   /api/users/[id]/roles      Attribuer rôle (admin)
DELETE /api/users/[id]/roles      Retirer rôle (admin)
GET    /api/users/me/bookmarks    Favoris utilisateur
POST   /api/users/me/bookmarks    Ajouter favori
DELETE /api/users/me/bookmarks/[id] Retirer favori
```

**RGPD Compliance** :
- Export : JSON avec toutes données personnelles
- Delete : Cascade soft-delete (anonymisation)
- Audit : Log toutes modifications

### Products & Orders (`/api/shop/*`)

```
GET    /api/shop/products         Liste produits
GET    /api/shop/products/[id]    Détails produit
POST   /api/shop/products         Créer produit (admin)
PATCH  /api/shop/products/[id]    Modifier produit (admin)
DELETE /api/shop/products/[id]    Supprimer produit (admin)
POST   /api/shop/checkout         Créer session Stripe
GET    /api/shop/orders           Mes commandes (auth)
GET    /api/shop/orders/[id]      Détails commande (owner/admin)
```

**Stripe Integration** :
- Checkout Session pour paiement
- Webhooks pour confirmations async
- Gestion stock (décrémentation post-paiement)

### Stripe Webhooks (`/api/stripe/webhook`)

```
POST   /api/stripe/webhook        Webhooks Stripe (events)
```

**Events gérés** :
- `checkout.session.completed` : Créer commande
- `payment_intent.succeeded` : Confirmer paiement
- `payment_intent.failed` : Logger échec
- `customer.subscription.*` : Si abonnements futurs

**Sécurité** :
- Vérification signature Stripe obligatoire
- Idempotency (events dupliqués)

### Facebook Integration (`/api/facebook/*`)

```
GET    /api/facebook/feed         Agrégation posts 5 clubs
GET    /api/facebook/feed/[clubId] Posts d'un club spécifique
```

**Caching** :
- Cache 1 heure (Header Cache-Control)
- Revalidation ISR Next.js possible
- Fallback si API Facebook indisponible

### Admin Analytics (`/api/admin/analytics/*`)

```
GET    /api/admin/analytics/overview    Métriques globales
GET    /api/admin/analytics/users       Stats utilisateurs
GET    /api/admin/analytics/sales       Stats ventes
GET    /api/admin/analytics/content     Stats contenu (blog, events)
```

**Métriques** :
- Visiteurs uniques (via Vercel Analytics API)
- Conversions (inscriptions, ventes)
- Top contenus (blog posts, produits)
- Funnel analyse

## Modèles de Données

### Core Tables

#### `auth.users` (Supabase native)
- Géré automatiquement par Supabase Auth
- Lien avec `user_profiles` via foreign key

#### `user_profiles`
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  favorite_club_id UUID REFERENCES clubs(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `clubs`
```sql
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  description TEXT,
  cover_image_url TEXT,
  schedule JSONB, -- Horaires JSON
  pricing JSONB, -- Tarifs JSON
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `blog_posts`
```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  author_id UUID REFERENCES auth.users(id),
  club_id UUID REFERENCES clubs(id),
  status TEXT CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  views_count INT DEFAULT 0,
  reading_time_minutes INT,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `blog_comments`
```sql
CREATE TABLE blog_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES blog_comments(id), -- Threading
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `events`
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  event_type TEXT, -- 'competition', 'stage', 'demonstration', 'seminar'
  club_id UUID REFERENCES clubs(id),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  max_attendees INT,
  registration_deadline TIMESTAMPTZ,
  cover_image_url TEXT,
  price_cents INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `event_registrations`
```sql
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);
```

#### `products`
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price_cents INT NOT NULL,
  stock_quantity INT DEFAULT 0,
  images JSONB, -- Array URLs
  category TEXT,
  sizes JSONB, -- Si applicable
  active BOOLEAN DEFAULT TRUE,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `orders`
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  status TEXT CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  total_cents INT NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `order_items`
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INT NOT NULL,
  unit_price_cents INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `user_roles`
```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'moderator', 'coach', 'user')),
  club_id UUID REFERENCES clubs(id), -- NULL si role global
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role, club_id)
);
```

#### `audit_logs`
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', etc.
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes Recommandés

```sql
-- Performances requêtes courantes
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_club ON blog_posts(club_id);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at DESC);

CREATE INDEX idx_events_club ON events(club_id);
CREATE INDEX idx_events_dates ON events(start_date, end_date);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_club ON user_roles(club_id);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
```

## Row Level Security (RLS) Examples

### `blog_posts` RLS Policies

```sql
-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- SELECT: Tous peuvent lire posts published
CREATE POLICY "Public can view published posts"
  ON blog_posts FOR SELECT
  USING (status = 'published');

-- SELECT: Auteur peut voir ses propres drafts
CREATE POLICY "Authors can view own posts"
  ON blog_posts FOR SELECT
  USING (auth.uid() = author_id);

-- INSERT: Utilisateurs authentifiés peuvent créer
CREATE POLICY "Authenticated users can create posts"
  ON blog_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- UPDATE: Auteur ou admin peut modifier
CREATE POLICY "Authors and admins can update posts"
  ON blog_posts FOR UPDATE
  USING (
    auth.uid() = author_id 
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- DELETE: Admins seulement
CREATE POLICY "Admins can delete posts"
  ON blog_posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

## Error Handling Standards

### Response Format

**Success** :
```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "page": 1,
    "limit": 50,
    "total": 123
  }
}
```

**Error** :
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### HTTP Status Codes

- `200 OK` : Succès GET, PATCH
- `201 Created` : Succès POST (création)
- `204 No Content` : Succès DELETE
- `400 Bad Request` : Validation error
- `401 Unauthorized` : Non authentifié
- `403 Forbidden` : Authentifié mais pas autorisé
- `404 Not Found` : Ressource introuvable
- `409 Conflict` : Conflit (ex: email déjà existant)
- `429 Too Many Requests` : Rate limit dépassé
- `500 Internal Server Error` : Erreur serveur

## Testing Strategy

### Unit Tests
- Validation functions (Zod schemas)
- Business logic helpers
- Utilities (formatters, calculators)

### Integration Tests
- API endpoints (avec mock database)
- RLS policies verification
- Webhooks handling

### E2E Tests (Playwright)
- User flows complets (signup → purchase)
- Admin workflows (création contenu)

## Monitoring & Observability

### Logs
- Structured logging (JSON format)
- Levels : ERROR, WARN, INFO, DEBUG
- Context : userId, requestId, timestamp

### Metrics
- API response times (p50, p95, p99)
- Error rates par endpoint
- Database query performance
- Stripe webhook success rate

### Alerts
- Error rate > 5% sur 5min
- API latency > 2s
- Database connections > 80%
- Failed webhook delivery

---

**Version** : 1.0  
**Dernière mise à jour** : 2025-11-04  
**Maintenu par** : Tech Lead Backend

