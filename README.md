# Phuong Long Vo Dao - Plateforme Web

Plateforme web vitrine + back-office pour 5 clubs de Phuong Long Vo Dao avec e-commerce intégré.

**Développé par** : [DevWeb31](https://github.com/DevWeb31)  
**Développeur** : [@Damiodev](https://github.com/Damiodev)  
**Licence** : Propriétaire - Tous droits réservés

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes + Supabase
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth (JWT + Row Level Security)
- **Payment**: Stripe
- **Hosting**: Vercel
- **Analytics**: Vercel Analytics

## ✨ Features

### Front-Office (Public)
- 🏯 Site vitrine premium avec animations martial arts
- 📝 Blog multi-auteurs avec système de tags et recherche
- 📅 Calendrier événements (compétitions, stages, démonstrations)
- 📱 Fil d'actualité Facebook intégré (5 clubs)
- 🛒 Boutique e-commerce (équipements, kimonos, accessoires)
- 📧 Formulaire de contact multi-clubs
- 📱 Design responsive (mobile-first)

### Back-Office (Admin)
- 📊 Dashboard analytics (visites, conversions, ventes)
- ⚙️ CRUD complet clubs, blog, événements
- 👥 Gestion utilisateurs et rôles
- 💬 Modération commentaires
- 📦 Gestion boutique (produits, stock, commandes)
- 🔒 Conformité RGPD (export données, suppression compte)
- 📋 Logs d'audit

### Authentification & Rôles
- **Admin**: Accès total système
- **Moderator**: Gestion blog + événements + modération
- **Coach**: Gestion événements de son club
- **User**: Compte membre (favoris, commentaires, commandes)

## 📋 Prerequisites

- Node.js 20+ LTS
- npm 10+ ou pnpm
- Compte Supabase (database + auth)
- Compte Stripe (paiements)
- Compte Vercel (hosting)

## 🛠️ Installation

### 1. Clone Repository
```bash
git clone https://github.com/votre-org/phuong-long-vo-dao.git
cd phuong-long-vo-dao
```

### 2. Install Dependencies
```bash
npm install
# ou
pnpm install
```

### 3. Environment Variables

Copier `env.example` vers `.env.local` et remplir les variables:

```bash
cp env.example .env.local
```

**Variables requises**:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup (Supabase)

Exécuter les migrations dans Supabase SQL Editor:

```sql
-- Voir docs/memory-bank/backend/ARCHITECTURE.md pour le schema complet
-- Créer tables: users, clubs, blog_posts, events, products, orders, etc.
-- Configurer RLS policies
```

### 5. Run Development Server

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

```bash
npm run dev          # Development server (port 3000)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run type-check   # TypeScript check sans emit
npm run test         # Unit tests (Vitest)
npm run test:watch   # Tests en mode watch
npm run test:coverage # Coverage report
npm run test:e2e     # E2E tests (Playwright)
```

## 🏗️ Project Structure

```
phuong-long-vo-dao/
├── .cursor/                   # Cursor AI configuration
│   └── rules/                 # Project rules for AI
├── docs/                      # Documentation complète
│   ├── memory-bank/           # Architecture & patterns
│   │   ├── backend/
│   │   ├── frontend/
│   │   ├── shared/
│   │   └── project/
│   ├── rules/                 # Code standards
│   └── prompts/               # AI prompt templates
│       ├── templates/
│       └── sub-agents/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (marketing)/       # Pages publiques SEO
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # User dashboard
│   │   ├── (admin)/           # Admin panel
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── layout/
│   │   ├── marketing/
│   │   ├── common/
│   │   ├── blog/
│   │   └── admin/
│   ├── hooks/                 # Custom React hooks
│   ├── lib/
│   │   ├── supabase/          # Supabase clients
│   │   ├── stripe/            # Stripe config
│   │   ├── utils/             # Utilities
│   │   ├── constants/         # Constants
│   │   └── types/             # TypeScript types
│   └── styles/                # Global styles
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/                    # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

## 📚 Documentation

Documentation disponible dans le repository privé (non versionné pour raisons commerciales).

## 🔐 Security

- **RLS (Row Level Security)**: Sécurité au niveau PostgreSQL
- **Input Validation**: Zod schemas sur tous les endpoints
- **JWT Authentication**: Tokens Supabase avec refresh automatique
- **Rate Limiting**: Protection contre abus API
- **HTTPS Only**: Force HTTPS avec HSTS headers
- **Security Headers**: CSP, X-Frame-Options, etc.
- **RGPD Compliant**: Export données, suppression compte, audit logs

## 🚀 Deployment

### Vercel (Recommended)

1. Push vers GitHub
2. Importer projet dans Vercel
3. Configurer environment variables
4. Deploy automatique sur chaque push

```bash
# Ou via CLI
npm install -g vercel
vercel
```

### Environment Variables Production

Configurer dans Vercel Dashboard:
- Toutes les variables de `env.example`
- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_URL=https://phuong-long-vo-dao.fr`

## 🧪 Testing

### Unit Tests (Vitest)
```bash
npm run test
npm run test:coverage
```

### E2E Tests (Playwright)
```bash
npm run test:e2e
npm run test:e2e:ui
```

### Coverage Target
- Unit tests: > 80%
- E2E tests: Critical user flows

## 📊 Performance Targets

- **Lighthouse Score**: > 90 (mobile)
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

## 🤝 Contributing

### Workflow
1. Créer branche: `feat/feature-name` ou `fix/bug-name`
2. Développer en suivant conventions (`docs/rules/`)
3. Tester (unit + E2E si applicable)
4. Commit avec format conventionnel:
   ```bash
   feat(scope): description
   fix(scope): description
   ```
5. Push et créer Pull Request
6. Code review
7. Merge vers `main` → Deploy automatique

### Code Standards
- TypeScript strict mode (pas de `any`)
- ESLint + Prettier configurés
- Tests requis pour nouvelles features
- Documentation à jour

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache
rm -rf .next
npm run build
```

### Database Issues
- Vérifier RLS policies dans Supabase
- Check logs dans Supabase Dashboard

### Type Errors
```bash
npm run type-check
```

## 📞 Support

- **Issues**: GitHub Issues
- **Email**: contact@devweb31.fr
- **Website**: [DevWeb31](https://devweb31.fr)

## 📄 License

**Propriétaire - Tous droits réservés**

© 2025 DevWeb31 - Phuong Long Vo Dao  
Ce code est la propriété de DevWeb31. Toute utilisation, reproduction ou distribution non autorisée est strictement interdite.

---

**Développé par** [DevWeb31](https://github.com/DevWeb31) - [@Damiodev](https://github.com/Damiodev)  
**Powered by** : Next.js 15, React 19, Supabase, Stripe

