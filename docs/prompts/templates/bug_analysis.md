# TEMPLATE: Bug Analysis

## Usage
Utiliser ce template pour analyser et résoudre un bug de manière méthodique.

---

# ANALYZE - [BUG_TITLE]

## SYMPTÔME OBSERVÉ

**Description utilisateur**:
[Ce que l'utilisateur voit/expérimente]

Exemple:
- "Le bouton de soumission ne répond pas après clic"
- "Page blanche au chargement du dashboard"
- "Données utilisateur pas sauvegardées"

**Fréquence**:
- [ ] Systématique (100% du temps)
- [ ] Intermittent (parfois)
- [ ] Rare (< 10% du temps)

**Sévérité**:
- [ ] Critical (app crash, perte données)
- [ ] Major (feature cassée, bloque user)
- [ ] Minor (inconvénient, workaround exists)
- [ ] Cosmetic (UI glitch, pas d'impact fonctionnel)

## CONTEXTE

### Environnement
- **Environnement**: [ ] Production | [ ] Staging | [ ] Development | [ ] Local
- **Browser**: [Chrome 120, Safari 17, etc.]
- **OS**: [Windows 11, macOS 14, iOS 17, etc.]
- **Device**: [ ] Desktop | [ ] Tablet | [ ] Mobile
- **Version app**: [v1.2.3]

### User Context
- **User role**: [admin, user, guest, etc.]
- **Authentication**: [ ] Logged in | [ ] Logged out
- **Data state**: [nouveau compte, compte avec données, etc.]

## ÉTAPES DE REPRODUCTION

### Prerequisites
[État initial nécessaire]

Exemple:
- Compte utilisateur créé
- Au moins 1 article blog publié
- Panier contient 2 items

### Steps
1. [Action 1]
2. [Action 2]
3. [Action 3]
4. **Résultat observé**: [Bug se manifeste]

**Résultat attendu**: [Ce qui devrait se passer]

### Taux de reproduction
- [ ] 100% (toujours)
- [ ] ~75% (souvent)
- [ ] ~50% (parfois)
- [ ] ~25% (rare)
- [ ] Conditions spécifiques nécessaires: [...]

## LOGS & ERREURS

### Browser Console
```javascript
// Coller erreurs console ici
Error: Cannot read property 'id' of undefined
  at UserProfile.tsx:42
  at ...
```

### Network Errors (si applicable)
```
POST /api/users/me
Status: 500 Internal Server Error
Response: {
  "error": "Database connection failed"
}
```

### Server Logs (si applicable)
```
[ERROR] 2025-11-04T10:30:45Z - Unhandled exception in /api/users/me
  Error: Connection timeout
  at Database.query (database.ts:123)
```

## FICHIERS PROBABLEMENT AFFECTÉS

- [ ] `src/components/...`
- [ ] `src/app/api/...`
- [ ] `src/lib/...`
- [ ] `src/hooks/...`

Exemple:
- `src/components/auth/SignInForm.tsx` (ligne 42)
- `src/app/api/auth/signin/route.ts`
- `src/lib/supabase/client.ts`

## INVESTIGATION (à itérer)

### Étape 1: Lecture Code
- [ ] Lire fichiers affectés
- [ ] Comprendre flux logique
- [ ] Identifier points de failure possibles

**Observations**:
[Notes pendant lecture code]

### Étape 2: Vérifier Logs/Errors
- [ ] Console browser (erreurs JS)
- [ ] Network tab (requêtes API échouées)
- [ ] Server logs (erreurs backend)
- [ ] Database logs (queries problématiques)

**Erreurs identifiées**:
[Lister erreurs trouvées]

### Étape 3: Isoler Root Cause
- [ ] Reproduire bug localement
- [ ] Tester avec debugger/breakpoints
- [ ] Vérifier assumptions (data format, types, etc.)
- [ ] Éliminer causes possibles une par une

**Hypothèses testées**:
1. ❌ Hypothèse 1: [Description] - Infirmée car [raison]
2. ❌ Hypothèse 2: [Description] - Infirmée car [raison]
3. ✅ Hypothèse 3: [Description] - **CONFIRMÉE**

## ROOT CAUSE IDENTIFIÉE

**Cause principale**:
[Description précise du problème]

Exemple:
```typescript
// Problème: user peut être null mais pas checké
function UserProfile({ user }: { user: User }) {
  return <div>{user.name}</div>; // ❌ Crash si user null
}
```

**Pourquoi ça s'est produit**:
[Explication contexte/erreur humaine/edge case oublié]

## SOLUTION PROPOSÉE

### Approche
[Description de la solution]

### Code Fix

**Fichier**: `[path/to/file.ts]`

**Avant** (buggy):
```typescript
// Code avec bug
```

**Après** (fixed):
```typescript
// Code corrigé avec explication
// Fix: Check if user exists before accessing properties
function UserProfile({ user }: { user: User | null }) {
  if (!user) {
    return <div>Loading...</div>;
  }
  return <div>{user.name}</div>;
}
```

### Tests Ajoutés

```typescript
// test: UserProfile.test.tsx
describe('UserProfile', () => {
  it('handles null user gracefully', () => {
    render(<UserProfile user={null} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
  
  it('displays user name when user exists', () => {
    const user = { name: 'John Doe' };
    render(<UserProfile user={user} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

## PRÉVENTION FUTURE

### Pourquoi ce bug a passé?
- [ ] Manque de validation input
- [ ] Edge case pas testé
- [ ] Type safety insuffisante
- [ ] Error handling absent
- [ ] Assumption incorrecte sur données
- [ ] Autre: [...]

### Mesures préventives
1. **Ajout validation**: [Description]
2. **Amélioration tests**: [Tests edge cases manquants]
3. **Type safety**: [Utiliser types plus stricts]
4. **Documentation**: [Clarifier assumptions]

Exemple:
- Ajouter tests pour cas `user = null`
- Utiliser `User | null` au lieu de `User` si nullable
- Ajouter error boundary React au niveau supérieur

## IMPACT & RÉGRESSION

### Scope du fix
- **Fichiers modifiés**: [liste]
- **Tests ajoutés/modifiés**: [liste]
- **Breaking changes**: [ ] Oui | [x] Non

### Régression possible?
- [ ] Aucune (fix isolé)
- [ ] Faible (tester feature X)
- [ ] Moyenne (tester flow Y complet)
- [ ] Élevée (tests E2E complets nécessaires)

### Tests de régression effectués
- [ ] Tests unitaires passent
- [ ] Tests E2E critical paths passent
- [ ] Test manuel sur staging
- [ ] Vérification autres users flows similaires

## TESTING PLAN

### Tests Unitaires
- [ ] Test cas nominal
- [ ] Test edge case 1: [Description]
- [ ] Test edge case 2: [Description]
- [ ] Test error handling

### Tests Manuels
1. [Reproduire bug original] → ✅ Bug résolu
2. [Tester cas similaires] → ✅ Pas de régression
3. [Tester sur différents browsers] → ✅ Cross-browser OK

### Tests E2E (si applicable)
- [ ] User flow complet testé
- [ ] Pas de régression sur flows adjacents

## DELIVERABLES

### Code
- [ ] Fix implémenté
- [ ] Tests ajoutés
- [ ] Code reviewé

### Documentation
- [ ] Comment expliquant fix (dans code)
- [ ] Update DECISIONS.md si pattern à suivre
- [ ] Issue tracker mis à jour

### Git
```bash
git commit -m "fix(component): handle null user in UserProfile

- Add null check before accessing user properties
- Display loading state when user is null
- Add tests for null user scenario

Fixes #ISSUE_NUMBER"
```

## VERIFICATION

### Checklist finale
- [ ] Bug reproduit puis résolu (confirmé)
- [ ] Tests passent (unit + E2E si applicable)
- [ ] Pas de régression introduite
- [ ] Code review OK
- [ ] Testé sur staging
- [ ] Ready for production

### Sign-off
- **Developer**: [Nom]
- **Reviewer**: [Nom]
- **QA**: [Nom]
- **Date**: [Date]

---

**Template Version**: 1.0  
**Dernière mise à jour**: 2025-11-04

