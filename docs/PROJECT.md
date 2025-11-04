# Project Documentation - Phuong Long Vo Dao

## Vue d'Ensemble

Ce document sert de point d'entrée pour toute la documentation du projet.

## 📁 Structure Documentation

### Memory Bank (`docs/memory-bank/`)

Documentation technique détaillée de l'architecture et des patterns.

#### Project
- **`PROJECT_BRIEF.md`**: Vision, objectifs, features, tech stack, phases développement
- **`DATABASE.mmd`**: Schema database complet (format Mermaid)
- **`RGPD_COMPLIANCE.md`**: Conformité RGPD, consentements, data retention
- **`FEATURES_ROADMAP.md`**: Roadmap features par sprint (à créer)
- **`DECISIONS.md`**: Architectural Decision Records (à créer)
- **`DESIGN.md`**: Design system, couleurs, typography (à créer)

#### Frontend
- **`ARCHITECTURE.md`**: Architecture Next.js/React, patterns composants, routing
- **`COMPONENTS_REGISTRY.md`**: Registry composants réutilisables (à créer)
- **`CODING_ASSERTIONS.md`**: Best practices frontend (à créer)
- **`TESTING.md`**: Stratégie tests frontend (à créer)
- **`BACKEND_COMMUNICATION.md`**: Patterns communication avec API (à créer)

#### Backend
- **`ARCHITECTURE.md`**: API design, endpoints, RLS policies, database
- **`API_DOCS.md`**: Documentation complète API endpoints (à générer)
- **`CODING_ASSERTIONS.md`**: Best practices backend (à créer)
- **`DATABASE.md`**: Schema détaillé, migrations (à créer)
- **`TESTING.md`**: Stratégie tests backend/API (à créer)

#### Shared
- **`DESIGN_SYSTEM.md`**: Tokens design, composants (à créer)
- **`TYPES_INTERFACES.md`**: Types TypeScript partagés (à créer)
- **`UTILITIES.md`**: Fonctions utilitaires communes (à créer)

### Rules (`docs/rules/`)

Standards de code et conventions strictes à respecter.

- **`CODE_CONVENTIONS.md`**: Conventions générales (TypeScript, React, naming, git)
- **`API_STANDARDS.md`**: Standards API REST (requests, responses, errors, validation)
- **`NAMING_PATTERNS.md`**: Conventions de nommage complètes (variables, fichiers, DB)

### Prompts (`docs/prompts/`)

Templates et agents pour développement assisté par IA (Cursor).

#### Templates (`docs/prompts/templates/`)
- **`implement.md`**: Template implémentation feature
- **`code_review.md`**: Template review code
- **`bug_analysis.md`**: Template analyse bug
- **`architecture_proposal.md`**: Template proposition architecture (à créer)
- **`optimization.md`**: Template optimisation (à créer)
- **`feature_briefing.md`**: Template briefing feature (à créer)
- **`deployment.md`**: Template déploiement (à créer)

#### Sub-Agents (`docs/prompts/sub-agents/`)
Experts IA spécialisés à invoquer via `@agent-name`:

- **`dev-frontend.md`**: Expert Next.js/React/TypeScript/UX
- **`dev-backend.md`**: Expert API/Supabase/PostgreSQL/Security
- **`seo-optimizer.md`**: Expert SEO technique & performance
- **`security-auditor.md`**: Expert sécurité OWASP & RGPD
- **`lead-architecture.md`**: Expert architecture logicielle (à créer)
- **`tester-e2e.md`**: Expert tests E2E Playwright (à créer)
- **`frontend-ui.md`**: Expert UI/UX design (à créer)
- **`memory-manager.md`**: Gestionnaire documentation (à créer)
- **`asserter.md`**: Validateur conformité standards (à créer)

#### IDE Prompts (`docs/prompts/ide/`)
Prompts organisés par phase de développement:

- **`01_onboard/`**: Onboarding nouveau développeur
- **`02_context/`**: Comprendre contexte projet
- **`03_plan/`**: Planification architecture
- **`04_code/`**: Implémentation code
- **`05_review/`**: Code review
- **`06_tests/`**: Écriture tests
- **`07_documentation/`**: Documentation
- **`08_deploy/`**: Déploiement
- **`09_refactor/`**: Refactoring
- **`10_maintenance/`**: Maintenance

## 🚀 Quick Start Documentation

### Pour Développeur Frontend
1. Lire `docs/memory-bank/frontend/ARCHITECTURE.md`
2. Consulter `docs/rules/CODE_CONVENTIONS.md`
3. Utiliser templates `docs/prompts/templates/implement.md`
4. Invoquer `@dev-frontend` dans Cursor pour assistance

### Pour Développeur Backend
1. Lire `docs/memory-bank/backend/ARCHITECTURE.md`
2. Consulter `docs/rules/API_STANDARDS.md`
3. Vérifier schema `docs/memory-bank/project/DATABASE.mmd`
4. Invoquer `@dev-backend` pour assistance

### Pour Nouveau Développeur
1. Lire `docs/memory-bank/project/PROJECT_BRIEF.md`
2. Setup local selon `README.md`
3. Parcourir `docs/rules/CODE_CONVENTIONS.md`
4. Explore codebase avec assistance Cursor AI

### Pour Audit/Review
1. Security: `@security-auditor` + `docs/memory-bank/project/RGPD_COMPLIANCE.md`
2. SEO: `@seo-optimizer`
3. Code: `docs/prompts/templates/code_review.md`

## 📋 Maintenance Documentation

### Quand Mettre à Jour

#### Toujours
- **DECISIONS.md**: Choix architectural majeur
- **API_DOCS.md**: Nouveau endpoint ou modification
- **COMPONENTS_REGISTRY.md**: Nouveau composant réutilisable

#### Souvent
- **FEATURES_ROADMAP.md**: Feature complétée ou ajoutée
- **ARCHITECTURE.md**: Pattern nouveau ou changement structure
- **TESTING.md**: Nouvelle stratégie ou outil test

#### Parfois
- **CODE_CONVENTIONS.md**: Nouvelle convention adoptée
- **DESIGN_SYSTEM.md**: Token design ajouté/modifié

#### Rarement
- **PROJECT_BRIEF.md**: Vision ou objectifs changent
- **DATABASE.mmd**: Schema modifié (générer depuis DB)

### Comment Mettre à Jour

```bash
# 1. Éditer fichier concerné
vim docs/memory-bank/backend/ARCHITECTURE.md

# 2. Commit avec message clair
git add docs/memory-bank/backend/ARCHITECTURE.md
git commit -m "docs(backend): add webhook error handling pattern"

# 3. Si changement majeur, updater PROJECT.md (ce fichier)
```

### Principes Documentation

1. **Single Source of Truth**: Pas de duplication info
2. **Living Documentation**: Mise à jour continue, pas ponctuelle
3. **Contextual**: Lien vers autres docs pertinentes
4. **Examples-First**: Code examples > théorie abstraite
5. **Searchable**: Mots-clés clairs, structure logique

## 🎯 Utilisation avec Cursor AI

### Configuration Cursor

Les règles Cursor sont dans `.cursor/rules/`:
- **`project-overview.mdc`**: Résumé projet + tech stack
- **`coding-standards.mdc`**: Standards code (quick ref)
- **`architecture.mdc`**: Patterns architecture (quick ref)

Cursor charge automatiquement ces règles au démarrage.

### Invoquer Sub-Agents

Dans le chat Cursor:

```
@dev-frontend Créer composant Card pour afficher club
@dev-backend Implémenter endpoint POST /api/blog
@seo-optimizer Audit SEO page /clubs/[slug]
@security-auditor Review RLS policies table blog_posts
```

### Utiliser Templates

Copier template dans chat Cursor et adapter:

```bash
# Copier template
cat docs/prompts/templates/implement.md

# Adapter sections
# - FEATURE_NAME
# - EXIGENCES
# - FICHIERS AFFECTÉS

# Coller dans Cursor chat
```

## 📊 Metrics & KPIs Documentation

### Coverage Documentation
- [ ] Backend API: 100% endpoints documentés
- [ ] Frontend Components: 80% composants réutilisables documentés
- [ ] Database: Schema à jour (sync avec DB)
- [ ] Decisions: ADR pour choix majeurs

### Quality Metrics
- Documentation synchro avec code: < 1 semaine de décalage
- Nouveaux développeurs autonomes: < 3 jours avec docs
- Questions récurrentes: Documentées dans FAQ (à créer)

## 🔄 Documentation Workflow

### Lors d'une Feature
1. **Planning**: Consulter roadmap + architecture
2. **Development**: Suivre conventions + patterns
3. **Review**: Utiliser templates review
4. **Completion**: Updater docs si nécessaire

### Lors d'un Bug
1. **Analysis**: Template bug_analysis.md
2. **Fix**: Respecter standards
3. **Post-Mortem**: Ajouter pattern éviter récurrence

### Lors d'un Refactor
1. **Proposal**: Documenter raison + approach
2. **Implementation**: Updater architecture docs
3. **DECISIONS.md**: Enregistrer choix

## 📞 Questions Fréquentes

### "Quelle doc lire en premier?"
→ `PROJECT_BRIEF.md` pour vision globale, puis `ARCHITECTURE.md` (frontend ou backend selon rôle)

### "Comment proposer changement architecture?"
→ Créer ADR dans `DECISIONS.md`, discuter avec équipe, implémenter si validé

### "Où documenter nouveau pattern?"
→ `ARCHITECTURE.md` (frontend ou backend) + example dans code + comment dans composant/fonction

### "Comment invoquer sub-agent Cursor?"
→ `@agent-name` dans chat Cursor (ex: `@dev-frontend`)

### "Documentation outdated, que faire?"
→ Créer issue GitHub "docs: Update [FILE] with [CHANGES]" ou fix directement + PR

## 🛠️ Outils Documentation

### Génération Automatique
- **API Docs**: Générer depuis Zod schemas (futur)
- **Database Schema**: Exporter depuis Supabase → Mermaid
- **Components Registry**: Script parsing composants (futur)

### Validation
- **Links checker**: Vérifier liens docs internes
- **Markdown linter**: Cohérence format
- **Sync checker**: Alerte si doc pas mise à jour > 2 semaines feature

## 📅 Roadmap Documentation

### Court Terme (Sprint 1-2)
- [x] Structure documentation complète
- [x] Memory Bank core (PROJECT_BRIEF, ARCHITECTURE)
- [x] Rules (CODE_CONVENTIONS, API_STANDARDS)
- [ ] DECISIONS.md initié
- [ ] FEATURES_ROADMAP.md détaillé

### Moyen Terme (Sprint 3-5)
- [ ] API_DOCS.md généré
- [ ] COMPONENTS_REGISTRY.md complet
- [ ] TESTING.md (stratégie complète)
- [ ] DESIGN_SYSTEM.md
- [ ] Sub-agents additionnels (lead-architecture, tester-e2e)

### Long Terme (Sprint 6+)
- [ ] Documentation auto-générée (API, components)
- [ ] Interactive documentation (Storybook composants)
- [ ] Video tutorials onboarding
- [ ] Documentation versionnée (par release)

---

**Maintenu par**: Tech Lead  
**Dernière mise à jour**: 2025-11-04  
**Version**: 1.0  
**Next Review**: Chaque fin de sprint

