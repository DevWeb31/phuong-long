# Brief Projet Phuong Long Vo Dao

## Vision

Créer une plateforme digitale professionnelle pour 5 clubs Phuong Long Vo Dao.
Objectif: Attirer nouveaux élèves, fidéliser les existants, générer revenu via boutique.

## Clubs

1. **Club Principal** (Marseille) - Club historique et siège
2. **Club Expansion** (Paris) - Développement métropolitain
3. **Club Côte d'Azur** (Nice) - Région Sud-Est
4. **Club Île-de-France** (Créteil) - Extension parisienne
5. **Club Alsace** (Strasbourg) - Région Est

## Fonctionnalités Clés

### Front-Office (Public)
- Site vitrine premium avec animations martial arts
- Pages clubs individuelles avec horaires, tarifs, instructeurs
- Blog multi-auteurs avec système de tags et recherche
- Calendrier événements (compétitions, stages, démonstrations)
- Fil d'actualité Facebook intégré (5 groupes/pages)
- Boutique e-commerce (équipements, kimonos, accessoires)
- Système d'inscription/essai gratuit
- FAQ dynamique
- Formulaire de contact multi-clubs
- Responsive design (mobile-first)

### Back-Office (Admin)
- Dashboard analytics (visites, conversions, ventes)
- CRUD complet clubs (infos, horaires, tarifs, photos)
- Blog management (création, édition, modération)
- Événements management (création, inscriptions, rappels)
- Users management (liste, rôles, suspensions)
- Roles & Permissions granulaires
- Modération commentaires
- Gestion boutique (produits, stock, commandes)
- Export données (RGPD compliance)
- Logs d'audit

### Authentification & Rôles
- **Admin** : Accès total système
- **Moderator** : Gestion blog + événements + modération
- **Coach** : Gestion événements de son club uniquement
- **User** : Compte membre (favoris, commentaires, commandes)

## Tech Stack Validée

### Frontend
- **Framework** : Next.js 15+ (App Router)
- **UI Library** : React 19
- **Language** : TypeScript (strict mode)
- **Styling** : Tailwind CSS + CSS Modules pour animations
- **Animations** : Framer Motion (optionnel) + CSS custom
- **Forms** : React Hook Form + Zod validation
- **State** : React Query (server state) + Zustand (global state minimal)

### Backend
- **Runtime** : Next.js API Routes (Edge + Node)
- **Database** : PostgreSQL via Supabase
- **ORM/Query** : Supabase Client + SQL direct
- **Auth** : Supabase Auth (JWT + RLS)
- **File Storage** : Supabase Storage ou Cloudinary
- **Email** : SendGrid ou Resend

### Paiements & Intégrations
- **Paiement** : Stripe (Checkout + Webhooks)
- **Social** : Facebook Graph API (feed aggregation)
- **Analytics** : Vercel Analytics + Supabase monitoring
- **SEO** : next-sitemap + structured data

### DevOps & Deployment
- **Hosting** : Vercel (production + preview)
- **CI/CD** : GitHub Actions (tests + linting)
- **Monitoring** : Vercel Insights + Sentry (errors)
- **Testing** : Vitest (unit) + Playwright (E2E)

## Contraintes & Exigences

### Performance
- Lighthouse Score > 90 (mobile)
- Core Web Vitals : LCP < 2.5s, FID < 100ms, CLS < 0.1
- Images optimisées (WebP, lazy loading)
- Code splitting agressif

### SEO
- Server-side rendering pour pages marketing
- Metadata dynamique par page
- JSON-LD structured data (Organization, Event, Article)
- Sitemap XML auto-généré
- robots.txt configuré

### Accessibilité
- WCAG 2.1 niveau AA minimum
- Navigation clavier complète
- ARIA labels appropriés
- Contrast ratios validés
- Screen reader friendly

### Sécurité
- HTTPS uniquement (force)
- Content Security Policy headers
- CORS restrictif
- Rate limiting API
- RLS (Row Level Security) PostgreSQL
- Input validation (backend + frontend)
- XSS/CSRF protection

### RGPD
- Cookie consent banner
- Privacy policy + Terms of service
- Data export user (JSON)
- Account deletion + cascade
- Audit logging
- Data retention policies
- DPA avec processeurs tiers

## Phases de Développement

### Phase 1 - Foundation (Sprint 1-2)
- [ ] Setup projet + architecture
- [ ] Design system + composants de base
- [ ] Landing page + navigation
- [ ] Auth system (signup/signin)
- [ ] Database schema initial

### Phase 2 - Core Features (Sprint 3-5)
- [ ] Pages clubs individuelles
- [ ] Blog (CRUD + affichage)
- [ ] Événements (calendrier + inscriptions)
- [ ] Admin dashboard skeleton
- [ ] User profiles

### Phase 3 - E-commerce (Sprint 6-7)
- [ ] Boutique (catalogue produits)
- [ ] Panier + checkout Stripe
- [ ] Webhooks paiement
- [ ] Gestion commandes (admin)

### Phase 4 - Social & Advanced (Sprint 8-9)
- [ ] Facebook feed integration
- [ ] Système commentaires
- [ ] Notifications (email)
- [ ] Search (blog + produits)
- [ ] Favoris/bookmarks

### Phase 5 - Polish & Launch (Sprint 10-11)
- [ ] SEO optimization complète
- [ ] Performance tuning
- [ ] E2E testing coverage
- [ ] RGPD compliance finale
- [ ] Documentation utilisateur
- [ ] Deployment production

## KPIs & Success Metrics

### Business
- +50% inscriptions essais vs site actuel
- Taux conversion boutique > 2%
- Temps moyen session > 3 minutes
- Taux rebond < 50%

### Technique
- Uptime > 99.9%
- TTFB < 600ms
- Build time < 3 minutes
- Zero security vulnerabilities (high/critical)

### SEO
- Top 3 Google pour "vo dao [ville]"
- +100% trafic organique en 6 mois
- Featured snippets pour FAQ

## Budget & Timeline

- **Budget estimé** : À définir (développement + services cloud)
- **Timeline** : 22 semaines (11 sprints de 2 semaines)
- **Équipe** : 1 développeur full-stack + 1 designer (partiel)
- **Maintenance** : ~8h/mois post-launch

## Contact & Stakeholders

- **Product Owner** : [À définir]
- **Technical Lead** : [À définir]
- **Clubs Coordinators** : 1 par club (validation contenu)

---

**Version** : 1.0  
**Dernière mise à jour** : 2025-11-04  
**Statut** : Ready for development

