# TEMPLATE: Feature Implementation

## Usage
Copier ce template et adapter pour implémenter une nouvelle feature.

---

# IMPLEMENT - [FEATURE_NAME]

## OBJECTIF
Implémenter [description courte de la feature] suivant le plan d'architecture validé.

## CONTEXTE PROJET
@docs/memory-bank/project/PROJECT_BRIEF.md
@docs/memory-bank/frontend/ARCHITECTURE.md (si frontend)
@docs/memory-bank/backend/ARCHITECTURE.md (si backend)

## PLAN ARCHITECTURE
[Coller ici le plan validé depuis phase 03_plan, ou décrire brièvement]

Exemple:
- Composants: `Button`, `Modal`, `Form`
- API endpoints: `POST /api/resource`, `GET /api/resource`
- Database: Table `resources` avec colonnes X, Y, Z
- RLS policies: Users can read own resources

## FICHIERS AFFECTÉS
- [ ] `src/components/...`
- [ ] `src/app/api/...`
- [ ] `src/lib/...`
- [ ] `tests/...`

## EXIGENCES FONCTIONNELLES

### FR1: [Requirement Title]
**Description**: ...  
**Acceptance**: ...

### FR2: [Requirement Title]
**Description**: ...  
**Acceptance**: ...

### FR3: [Requirement Title]
**Description**: ...  
**Acceptance**: ...

## EXIGENCES NON-FONCTIONNELLES

### Performance
- **NFR1**: Page load time < 2s
- **NFR2**: API response time < 500ms (p95)
- **NFR3**: Lighthouse score > 90

### Accessibilité
- **NFR4**: WCAG 2.1 niveau AA
- **NFR5**: Keyboard navigation complète
- **NFR6**: Screen reader friendly

### Sécurité
- **NFR7**: Input validation (Zod)
- **NFR8**: RLS policies PostgreSQL
- **NFR9**: Rate limiting si endpoint public

### UX
- **NFR10**: Mobile responsive (375px+)
- **NFR11**: Loading states pour actions async
- **NFR12**: Error messages explicites

## RÈGLES IMPÉRATIVES À SUIVRE

Consulter et respecter:
- [ ] @docs/rules/CODE_CONVENTIONS.md
- [ ] @docs/rules/API_STANDARDS.md (si API)
- [ ] @docs/rules/NAMING_PATTERNS.md

**Règles critiques**:
- [ ] TypeScript strict mode - JAMAIS `any`
- [ ] Composants max 400 lignes (refactor si plus)
- [ ] Tests unitaires avec min 80% coverage
- [ ] Pas de secrets hardcodés - utiliser `.env`
- [ ] Comments expliquent POURQUOI, pas QUOI
- [ ] Validation Zod sur tous inputs API
- [ ] Props destructuring avec defaults
- [ ] Export named (pas default)

## ÉTAPES IMPLÉMENTATION (à itérer jusqu'à complétion)

### 1. ANALYSE
- [ ] Comprendre contexte existant
- [ ] Vérifier dépendances déjà installées
- [ ] Identifier composants/utils réutilisables
- [ ] Lire code related files (si modification existant)

### 2. DESIGN
- [ ] Proposer structure fichiers/dossiers
- [ ] Définir interfaces TypeScript
- [ ] Sketch architecture composants (si complexe)
- [ ] Valider approche vs contraintes projet

### 3. CODE
- [ ] Implémenter en small, reviewable chunks
- [ ] Commencer par types/interfaces
- [ ] Puis composants/fonctions core
- [ ] Tester manuellement au fur et à mesure
- [ ] Commit atomiques avec messages descriptifs

### 4. TEST
- [ ] Écrire tests unitaires (Vitest)
- [ ] Tester edge cases
- [ ] Vérifier coverage > 80%
- [ ] Tests E2E si user flow critique (Playwright)

### 5. REVIEW
- [ ] Auto-review vs CODE_CONVENTIONS.md
- [ ] Vérifier accessibilité (si UI)
- [ ] Vérifier performance (si impact attendu)
- [ ] Pas de console.log/debug code
- [ ] Pas de duplication code (DRY)

### 6. DOCUMENTATION
- [ ] Updater memory-bank si changement architectural
- [ ] JSDoc pour utils/helpers publics
- [ ] README si nouvelle dépendance
- [ ] DECISIONS.md si choix technique important

## ACCEPTANCE CRITERIA

**Fonctionnel**:
- [ ] Toutes exigences FR1-FRX satisfaites
- [ ] Tests passent (unit + integration)
- [ ] Testé manuellement sur desktop + mobile
- [ ] Pas de régression sur features existantes

**Qualité**:
- [ ] Aucune erreur linter
- [ ] Aucun warning TypeScript
- [ ] Code coverage > 80%
- [ ] Lighthouse score maintenu/amélioré

**Documentation**:
- [ ] Code auto-documenté (noms explicites)
- [ ] Comments POURQUOI (si logique complexe)
- [ ] Memory-bank à jour si nécessaire

**Git**:
- [ ] Commits atomiques (1 feature = 1-3 commits)
- [ ] Messages commit conventionnels (feat/fix/refactor/...)
- [ ] Branch nommée `feat/feature-name` ou `fix/bug-name`

## DELIVERABLES

**Fichiers attendus**:
- [ ] Code source fonctionnel
- [ ] Tests (unit + E2E si applicable)
- [ ] Documentation à jour
- [ ] Migration DB (si applicable)

**Commit final**:
```bash
git add .
git commit -m "feat(scope): implement feature-name

- Feature 1 description
- Feature 2 description
- Tests with 85% coverage

Closes #ISSUE_NUMBER"
```

## NEXT STEPS (Après cette feature)
- [ ] Code review par pair (si équipe)
- [ ] Merge vers develop
- [ ] Deploy staging + test
- [ ] User acceptance testing
- [ ] Deploy production

---

**Template Version**: 1.0  
**Dernière mise à jour**: 2025-11-04

