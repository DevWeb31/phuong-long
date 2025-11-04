# TEMPLATE: Code Review

## Usage
Utiliser ce template pour reviewer du code (par AI ou humain).

---

# REVIEW - [FILE/FEATURE NAME]

## CONTEXTE
@docs/rules/CODE_CONVENTIONS.md
@docs/rules/API_STANDARDS.md (si API)
@docs/rules/NAMING_PATTERNS.md
@docs/memory-bank/[backend|frontend]/CODING_ASSERTIONS.md (si existe)

## OBJECTIF REVIEW
[Pourquoi ce review? Nouveau code? Refactor? Debug?]

Exemple:
- Review nouvelle feature authentication
- Audit sécurité endpoint paiement
- Performance check composant lourd
- Accessibility compliance page

## ASPECTS À REVIEWER

### 1. Conventions & Standards
- [ ] Respect conventions nommage (variables, fonctions, fichiers)
- [ ] Format code cohérent (indentation, spacing)
- [ ] Structure fichier logique (imports, types, code)
- [ ] Exports nommés (pas default)
- [ ] Pas de code commenté (utiliser git history)

### 2. TypeScript & Type Safety
- [ ] Pas de `any` (utiliser `unknown` si vraiment inconnu)
- [ ] Interfaces/types appropriés
- [ ] Props components typées
- [ ] Return types functions explicites
- [ ] Pas de `@ts-ignore` (ou justifié avec comment)
- [ ] Zod validation pour inputs externes

### 3. React / Next.js (si applicable)
- [ ] Server Components par défaut (pas "use client" sans raison)
- [ ] Props destructuring avec defaults
- [ ] Conditional rendering propre (early returns > ternaires imbriqués)
- [ ] Keys uniques sur lists (pas index si ordre change)
- [ ] useEffect avec dependencies correctes
- [ ] Hooks rules respectées (pas dans conditions/loops)
- [ ] Memoization appropriée (useMemo/useCallback si pertinent)

### 4. API / Backend (si applicable)
- [ ] Validation inputs (Zod schemas)
- [ ] Error handling robuste (try/catch)
- [ ] HTTP status codes appropriés
- [ ] Response format standard (success/error)
- [ ] Authentication check si endpoint protégé
- [ ] RLS policies si données sensibles
- [ ] Rate limiting considéré
- [ ] Logging errors pour debug

### 5. Performance
- [ ] Pas de computations lourdes sans memoization
- [ ] Images utilisent `next/image`
- [ ] Fonts via `next/font`
- [ ] Lazy loading composants lourds (dynamic import)
- [ ] Pas de re-renders inutiles
- [ ] Database queries optimisées (indexes, select fields needed)
- [ ] API responses cachées si approprié
- [ ] Pas de N+1 queries

### 6. Accessibilité (si UI)
- [ ] Semantic HTML (header, nav, main, section, etc.)
- [ ] ARIA labels si nécessaire
- [ ] Keyboard navigation (focus visible, tab order)
- [ ] Color contrast suffisant
- [ ] Alt text sur images
- [ ] Form labels associés
- [ ] Error messages accessibles (aria-live)

### 7. Sécurité
- [ ] Aucun secret hardcodé (API keys, passwords)
- [ ] Input sanitization (XSS prevention)
- [ ] SQL injection impossible (parameterized queries)
- [ ] CSRF protection si nécessaire
- [ ] Permissions checked (authorization)
- [ ] Sensitive data pas logged
- [ ] Rate limiting si endpoint public

### 8. Testing
- [ ] Tests unitaires présents
- [ ] Tests couvrent happy path + edge cases
- [ ] Tests E2E pour user flows critiques
- [ ] Mocks appropriés (pas de calls API réels)
- [ ] Test names descriptifs

### 9. Error Handling
- [ ] Try/catch sur async operations
- [ ] Error boundaries (React)
- [ ] User-friendly error messages
- [ ] Loading states affichés
- [ ] Fallbacks si data manquante
- [ ] Logs errors pour monitoring

### 10. Code Quality Générale
- [ ] Pas de duplication (DRY)
- [ ] Single Responsibility Principle
- [ ] Functions < 50 lignes (idéalement < 30)
- [ ] Components < 400 lignes
- [ ] Naming explicite (pas de `temp`, `data`, `x`)
- [ ] Comments expliquent POURQUOI (pas QUOI)
- [ ] Pas de "magic numbers" (utiliser constantes nommées)
- [ ] Consistent style (pas mix patterns)

## CODE À REVIEWER

[Coller code ici ou référencer fichiers]

Exemple:
```typescript
// File: src/components/common/Button.tsx
[CODE ICI]
```

Ou:
```
Fichiers à reviewer:
- src/components/auth/SignInForm.tsx
- src/app/api/auth/signin/route.ts
- tests/auth/signin.test.ts
```

## ISSUES TROUVÉS

### Critical (à fix immédiatement)
1. **[Issue Title]**
   - **Problème**: Description du problème
   - **Impact**: Pourquoi c'est critique (sécurité, crash, data loss)
   - **Fix suggéré**: 
   ```typescript
   // Code corrigé
   ```

### Major (à fix avant merge)
1. **[Issue Title]**
   - **Problème**: ...
   - **Fix suggéré**: ...

### Minor (nice to have)
1. **[Issue Title]**
   - **Problème**: ...
   - **Suggestion**: ...

## SUGGESTIONS D'AMÉLIORATION

### Performance
- [ ] Suggestion 1
- [ ] Suggestion 2

### Code Quality
- [ ] Refactor X pour meilleure lisibilité
- [ ] Extraire fonction helper pour réutilisation

### Tests
- [ ] Ajouter tests pour edge case X
- [ ] Améliorer coverage sur fichier Y

## EXEMPLES CODE (Avant/Après)

### Exemple 1: [Description]

**Avant** (problématique):
```typescript
// Code existant avec problème
```

**Après** (recommandé):
```typescript
// Code amélioré
```

**Pourquoi**: Explication du bénéfice

### Exemple 2: [Description]
[...]

## VERDICT

**Status**: [ ] ✅ Approved | [ ] ⚠️ Approved with comments | [ ] ❌ Changes required

**Résumé**:
- Critical issues: X
- Major issues: Y
- Minor issues: Z
- Suggestions: W

**Action requise**:
- [ ] Fix critical issues
- [ ] Address major issues
- [ ] Consider suggestions
- [ ] Update tests
- [ ] Re-review après fixes

## CHECKLIST FINALE

Avant d'approuver:
- [ ] Aucun critical issue restant
- [ ] Major issues adressés ou plan mitigation
- [ ] Tests passent
- [ ] Pas de régression introduite
- [ ] Documentation à jour si nécessaire
- [ ] Code suit standards projet

---

**Reviewer**: [Nom]  
**Date**: [Date]  
**Template Version**: 1.0

