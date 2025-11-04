# API Standards - Phuong Long Vo Dao

## Principes REST

### Resource-Oriented URLs
- **Collections** : `/api/clubs`, `/api/events`
- **Singular resource** : `/api/clubs/[id]`, `/api/users/me`
- **Sub-resources** : `/api/clubs/[id]/events`, `/api/blog/[id]/comments`
- **Actions non-CRUD** : `/api/users/[id]/roles` (POST/DELETE)

### HTTP Methods

| Method | Usage | Idempotent | Body |
|---|---|---|---|
| GET | Lecture ressource(s) | ✅ | ❌ |
| POST | Création ressource | ❌ | ✅ |
| PUT | Remplacement complet | ✅ | ✅ |
| PATCH | Modification partielle | ❌ | ✅ |
| DELETE | Suppression ressource | ✅ | ❌ |

### Status Codes Standards

**Success (2xx)**
- `200 OK` : GET, PATCH réussi
- `201 Created` : POST création réussie (+ header Location)
- `204 No Content` : DELETE réussi, PUT sans retour

**Client Errors (4xx)**
- `400 Bad Request` : Validation error, malformed JSON
- `401 Unauthorized` : Non authentifié (pas de token/session)
- `403 Forbidden` : Authentifié mais pas autorisé (permissions)
- `404 Not Found` : Ressource inexistante
- `409 Conflict` : Conflit (ex: email déjà utilisé)
- `422 Unprocessable Entity` : Validation métier (ex: stock insuffisant)
- `429 Too Many Requests` : Rate limit dépassé

**Server Errors (5xx)**
- `500 Internal Server Error` : Erreur serveur non gérée
- `502 Bad Gateway` : Service tiers indisponible (Stripe, Facebook API)
- `503 Service Unavailable` : Maintenance, surcharge

---

## Request Format

### Headers

**Required** :
```http
Content-Type: application/json
Accept: application/json
```

**Authentication** :
```http
Authorization: Bearer <jwt_token>
```

**Optional** :
```http
X-Request-ID: <uuid>          # Traçabilité
Accept-Language: fr-FR        # Internationalisation
```

### Query Parameters

**Pagination** :
```
GET /api/blog?page=1&limit=20
```
- `page` : Numéro page (default: 1)
- `limit` : Items par page (default: 50, max: 100)

**Filtering** :
```
GET /api/clubs?city=Marseille&active=true
GET /api/events?club_id=abc123&date_from=2025-01-01&date_to=2025-12-31
```

**Sorting** :
```
GET /api/blog?sort=published_at:desc
GET /api/users?sort=created_at:asc,name:asc
```
Format : `field:order` (order = `asc` | `desc`)

**Search** :
```
GET /api/blog?q=martial+arts
GET /api/products?search=kimono
```

**Fields Selection** (sparse fieldsets) :
```
GET /api/clubs?fields=id,name,city
```

### Body (POST/PATCH)

**JSON obligatoire** :
```json
{
  "title": "Article title",
  "content": "Article content...",
  "status": "published",
  "tags": ["martial-arts", "competition"]
}
```

**Validation** : Zod schemas

---

## Response Format

### Success Response

**Single Resource** :
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "name": "Club Marseille",
    "city": "Marseille",
    "created_at": "2025-01-01T10:00:00Z",
    "updated_at": "2025-01-15T14:30:00Z"
  }
}
```

**Collection** :
```json
{
  "success": true,
  "data": [
    { "id": "abc123", "name": "Club 1" },
    { "id": "def456", "name": "Club 2" }
  ],
  "metadata": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

**Creation (201)** :
```json
{
  "success": true,
  "data": {
    "id": "xyz789",
    ...
  }
}
```
+ Header : `Location: /api/clubs/xyz789`

### Error Response

**Format Standard** :
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [] // Optional (validation errors, etc.)
  }
}
```

**Validation Error (400)** :
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format",
        "received": "invalid-email"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters",
        "received": "short"
      }
    ]
  }
}
```

**Authentication Error (401)** :
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required. Please sign in."
  }
}
```

**Authorization Error (403)** :
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to perform this action.",
    "required_role": "admin"
  }
}
```

**Not Found (404)** :
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Club not found",
    "resource": "club",
    "id": "abc123"
  }
}
```

**Rate Limit (429)** :
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 60
  }
}
```
+ Header : `Retry-After: 60`

**Server Error (500)** :
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Please try again later.",
    "request_id": "req_abc123xyz"
  }
}
```

### Error Codes Registry

| Code | Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `MALFORMED_JSON` | 400 | Invalid JSON body |
| `UNAUTHORIZED` | 401 | No authentication provided |
| `INVALID_TOKEN` | 401 | JWT token invalid/expired |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `CONFLICT` | 409 | Resource already exists |
| `UNPROCESSABLE` | 422 | Business rule violation |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | Temporary unavailability |

---

## Authentication

### JWT Token (Supabase)

**Obtention** : Via `/api/auth/signin`

```json
POST /api/auth/signin
{
  "email": "user@example.com",
  "password": "password123"
}

Response 200:
{
  "success": true,
  "data": {
    "user": { ... },
    "session": {
      "access_token": "eyJhbGc...",
      "refresh_token": "...",
      "expires_at": 1735994400
    }
  }
}
```

**Utilisation** :
```http
GET /api/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Refresh** : Géré automatiquement par Supabase Client

**Validation côté serveur** :
```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }
  
  // Proceed with authenticated request
  const user = session.user;
  // ...
}
```

---

## Authorization (Permissions)

### Role-Based Access Control (RBAC)

**Roles hiérarchiques** :
1. `admin` : Accès total
2. `moderator` : Gestion contenu (blog, events)
3. `coach` : Gestion événements de son club
4. `user` : Lecture + actions personnelles (commentaires, commandes)

**Check permissions** :
```typescript
async function checkPermission(userId: string, requiredRole: string): Promise<boolean> {
  const { data: roles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);
  
  if (!roles || roles.length === 0) return false;
  
  // Admin a tous les droits
  if (roles.some(r => r.role === 'admin')) return true;
  
  // Check role spécifique
  return roles.some(r => r.role === requiredRole);
}

// Usage dans API route
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  
  const hasPermission = await checkPermission(session.user.id, 'admin');
  if (!hasPermission) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Admin role required' } },
      { status: 403 }
    );
  }
  
  // Proceed with deletion
}
```

### Row-Level Security (RLS)

**Prefer RLS over API-level checks** (defense in depth) :

```sql
-- Example: User can only edit own blog posts
CREATE POLICY "Users can update own posts"
  ON blog_posts FOR UPDATE
  USING (auth.uid() = author_id);

-- Example: Admins can delete any post
CREATE POLICY "Admins can delete any post"
  ON blog_posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

**Benefits** :
- Sécurité native database (même si API compromise)
- Performance (filtres côté DB)
- Consistency (pas de duplication logique auth)

---

## Validation

### Input Validation (Zod)

**Define schemas** :
```typescript
// lib/validators/club.ts
import { z } from 'zod';

export const clubCreateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  city: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Invalid French phone number'),
  description: z.string().max(5000).optional(),
  schedule: z.record(z.string(), z.array(z.string())).optional(),
  pricing: z.record(z.string(), z.number().positive()).optional(),
});

export const clubUpdateSchema = clubCreateSchema.partial();

export type ClubCreate = z.infer<typeof clubCreateSchema>;
export type ClubUpdate = z.infer<typeof clubUpdateSchema>;
```

**Validate in API route** :
```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = clubCreateSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: validated.error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              received: err.input,
            })),
          },
        },
        { status: 400 }
      );
    }
    
    const data = validated.data;
    // Proceed with creation
    
  } catch (error) {
    // Handle errors
  }
}
```

---

## Pagination

### Offset-Based (Standard)

**Request** :
```
GET /api/blog?page=2&limit=20
```

**Implementation** :
```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100); // Max 100
  const offset = (page - 1) * limit;
  
  const { data, error, count } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('published_at', { ascending: false });
  
  if (error) {
    return NextResponse.json({ success: false, error: { ... } }, { status: 500 });
  }
  
  return NextResponse.json({
    success: true,
    data,
    metadata: {
      page,
      limit,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / limit),
    },
  });
}
```

**Response** :
```json
{
  "success": true,
  "data": [ ... ],
  "metadata": {
    "page": 2,
    "limit": 20,
    "total": 87,
    "total_pages": 5
  }
}
```

### Cursor-Based (Optionnel, pour infinite scroll)

**Request** :
```
GET /api/events?cursor=2025-03-15T10:30:00Z&limit=20
```

**Response** :
```json
{
  "success": true,
  "data": [ ... ],
  "metadata": {
    "next_cursor": "2025-02-28T14:00:00Z",
    "has_more": true
  }
}
```

---

## Rate Limiting

### Limits par Type

| Endpoint Type | Authenticated | Anonymous |
|---|---|---|
| Public GET (clubs, blog) | 500/min | 100/min |
| Auth (signin, signup) | - | 5/5min |
| User actions (comments) | 30/min | - |
| Admin actions | 200/min | - |

### Implementation (Middleware)

```typescript
// middleware.ts
import { ratelimit } from '@/lib/redis'; // Upstash Redis

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  
  const { success, remaining } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests',
          retry_after: 60,
        },
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'Retry-After': '60',
        },
      }
    );
  }
  
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  return response;
}
```

### Headers Réponse

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 73
X-RateLimit-Reset: 1735994400
Retry-After: 60 (si 429)
```

---

## Caching

### Client-Side (Cache-Control Headers)

**Static content (images, assets)** :
```typescript
export async function GET() {
  return new NextResponse(content, {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
```

**Semi-static (clubs list)** :
```typescript
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=60', // 5min
  },
});
```

**Dynamic (user data)** :
```typescript
return NextResponse.json(userData, {
  headers: {
    'Cache-Control': 'private, no-cache',
  },
});
```

**Never cache** :
```typescript
return NextResponse.json(sensitiveData, {
  headers: {
    'Cache-Control': 'no-store',
  },
});
```

### Server-Side (Redis/In-Memory)

**Facebook feed cache** (1h) :
```typescript
import { redis } from '@/lib/redis';

export async function GET() {
  const cacheKey = 'facebook:feed';
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return NextResponse.json(JSON.parse(cached));
  }
  
  const data = await fetchFacebookFeed();
  await redis.set(cacheKey, JSON.stringify(data), { ex: 3600 }); // 1h
  
  return NextResponse.json(data);
}
```

---

## Versioning

### URL Versioning (Préféré)

```
/api/v1/clubs
/api/v2/clubs (future breaking changes)
```

**Implementation** :
```
src/app/api/v1/clubs/route.ts
src/app/api/v2/clubs/route.ts
```

**Deprecation** :
- Annoncer 6 mois avant
- Header `Deprecation: true` + `Sunset: <date>`
- Documentation migration guide

---

## Security Headers

**Toujours inclure** :
```typescript
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'",
      'Permissions-Policy': 'geolocation=(), microphone=()',
    },
  });
}
```

**CORS** (si API publique) :
```typescript
export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowedOrigins = ['https://phuong-long-vo-dao.fr', 'https://admin.phuong-long.fr'];
  
  if (!origin || !allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: 'CORS not allowed' }, { status: 403 });
  }
  
  return NextResponse.json(data, {
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

---

## Testing API Endpoints

### Integration Tests

```typescript
// tests/api/clubs.test.ts
import { describe, it, expect } from 'vitest';

describe('GET /api/clubs', () => {
  it('returns list of clubs', async () => {
    const response = await fetch('http://localhost:3000/api/clubs');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
  
  it('returns 401 for protected endpoint without auth', async () => {
    const response = await fetch('http://localhost:3000/api/clubs', {
      method: 'POST',
      body: JSON.stringify({ name: 'New Club' }),
    });
    
    expect(response.status).toBe(401);
  });
});
```

---

**Version** : 1.0  
**Dernière mise à jour** : 2025-11-04  
**Appliqué sur** : Tous endpoints API

