# Conformité RGPD - Phuong Long Vo Dao

## Vue d'Ensemble

Ce document détaille les mesures de conformité RGPD (Règlement Général sur la Protection des Données) implémentées dans la plateforme Phuong Long Vo Dao.

**Date d'application** : 25 mai 2018  
**Juridiction** : Union Européenne (applicable en France)  
**Responsable de traitement** : Phuong Long Vo Dao  
**DPO (Data Protection Officer)** : [À désigner si > 250 employés ou traitement sensible]

## Consentements Requis

### 1. Cookie Banner (Obligatoire dès l'arrivée)

**Cookies Essentiels** (pas de consentement requis) :
- Session authentication (Supabase JWT)
- Préférences langue/accessibilité
- Panier e-commerce (session)

**Cookies Analytics** (consentement requis) :
- Vercel Analytics
- Google Analytics (si ajouté)
- Heatmaps (Hotjar, etc.)

**Cookies Marketing** (consentement requis) :
- Facebook Pixel (tracking conversions)
- Publicités ciblées
- Remarketing

**Implémentation** :
```tsx
// components/common/CookieConsent.tsx
- Affichage au premier chargement
- Choix granulaire (accepter tout / personnaliser / refuser non-essentiels)
- Révocable à tout moment (lien footer "Gérer cookies")
- Stockage consentement : localStorage + database (traçabilité)
```

### 2. Consentement Inscription (Création Compte)

**Données collectées** :
- Email (obligatoire)
- Mot de passe (hashé, obligatoire)
- Nom complet (optionnel)
- Téléphone (optionnel)
- Photo profil (optionnel)

**Consentements à cocher** :
- [ ] **Obligatoire** : J'accepte les [Conditions Générales d'Utilisation](#)
- [ ] **Obligatoire** : J'ai lu la [Politique de Confidentialité](#)
- [ ] **Optionnel** : J'accepte de recevoir la newsletter (emails marketing)
- [ ] **Optionnel** : J'accepte le traitement de mes données à des fins de personnalisation

**Stockage** : Table `user_consents` avec timestamps et versions des CGU/Privacy Policy.

### 3. Consentement Paiement (Stripe)

**Données transmises à Stripe** :
- Email
- Nom + Prénom
- Adresse facturation
- Adresse livraison
- Informations bancaires (traitées par Stripe, PCI-DSS compliant)

**Information utilisateur** :
- Pop-up avant redirection Stripe Checkout
- "En procédant au paiement, vous acceptez que vos données soient transmises à notre processeur de paiement sécurisé Stripe. [En savoir plus](#)"

### 4. Consentement Facebook Feed

**Si intégration Facebook Graph API** :
- Mention dans Privacy Policy : "Nous affichons publiquement des posts de nos pages Facebook officielles"
- Aucun tracking utilisateur via Facebook Pixel sans consentement explicite

## Base Légale des Traitements

| Traitement | Base Légale | Durée Conservation |
|---|---|---|
| Création compte | Exécution contrat | Tant que compte actif + 6 mois |
| Newsletter | Consentement | Jusqu'à désabonnement |
| Analytics | Intérêt légitime | 12 mois (anonymisation après) |
| Commandes e-commerce | Exécution contrat + obligations légales | 10 ans (comptabilité FR) |
| Logs sécurité | Obligation légale | 6 mois |
| Commentaires blog | Consentement | Tant que post existe ou demande suppression |

## Droits des Utilisateurs (Articles RGPD)

### Droit d'Accès (Art. 15)

**Description** : L'utilisateur peut demander quelles données personnelles sont détenues.

**Implémentation** :
- Endpoint : `GET /api/users/me/export`
- Format : JSON structuré avec toutes données
- Délai réponse : 1 mois max
- Interface : Page "Mes données" dans Dashboard

**Données incluses** :
```json
{
  "user_profile": { ... },
  "blog_posts": [ ... ],
  "comments": [ ... ],
  "orders": [ ... ],
  "event_registrations": [ ... ],
  "bookmarks": [ ... ],
  "audit_logs": [ ... ],
  "consents": [ ... ]
}
```

### Droit de Rectification (Art. 16)

**Description** : Corriger données inexactes.

**Implémentation** :
- Page "Mon profil" avec formulaire d'édition
- Endpoint : `PATCH /api/users/me`
- Validation données côté serveur (Zod)
- Audit log de la modification

### Droit à l'Oubli / Suppression (Art. 17)

**Description** : Demander suppression complète des données.

**Implémentation** :
- Bouton "Supprimer mon compte" (confirmation double)
- Endpoint : `DELETE /api/users/me`
- Process :
  1. Soft delete compte (flag `deleted_at`)
  2. Anonymisation données (remplacer email/nom par hash)
  3. Conservation 6 mois (délai légal réclamation)
  4. Hard delete après 6 mois (CRON job)
  5. **Exception** : Commandes conservées 10 ans (légal)

**Cascade** :
- Commentaires : Anonymisés (auteur devient "Utilisateur supprimé")
- Blog posts authored : Anonymisés ou réattribués (si co-auteur)
- Orders : Anonymisation données perso, conservation montants (compta)
- Event registrations : Supprimés

### Droit à la Portabilité (Art. 20)

**Description** : Recevoir données dans format structuré machine-readable.

**Implémentation** :
- Identique export RGPD (JSON)
- Possibilité future : Export CSV si demandé

### Droit d'Opposition (Art. 21)

**Description** : S'opposer au traitement (ex : marketing).

**Implémentation** :
- Unsubscribe newsletter : Lien dans chaque email + toggle Dashboard
- Opposition analytics : Respect DNT header + opt-out cookie settings
- Opposition profilage : Option "Désactiver personnalisation" dans settings

### Droit de Limitation du Traitement (Art. 18)

**Description** : Geler traitement pendant vérification données.

**Implémentation** :
- Flag `processing_limited` sur user account
- Pas de nouveaux traitements marketing/analytics
- Conservation données minimale

## Data Retention Policies

### Utilisateurs
- **Compte actif** : Données maintenues indéfiniment
- **Compte inactif** : Email rappel après 2 ans d'inactivité → Suppression après 3 ans si pas de réponse
- **Compte supprimé** : Soft delete 6 mois → Hard delete automatique

### Contenu Utilisateur
- **Blog comments** : Supprimés avec article OU sur demande DSAR
- **Event registrations** : Supprimés 1 an après date événement
- **Bookmarks** : Supprimés avec compte

### Commandes E-commerce
- **Données commandes** : **10 ans** (obligation légale comptabilité France)
- **Données personnelles** : Anonymisées après 3 ans (sauf montants/dates)
- **Données bancaires** : JAMAIS stockées (gérées par Stripe)

### Logs & Analytics
- **Logs applicatifs** : 6 mois (audit trail)
- **Logs sécurité** : 6 mois (CNIL)
- **Analytics** : 12 mois puis anonymisation (IP masquées, user IDs retirés)
- **Audit logs RGPD** : 3 ans (preuve conformité)

### Cookies
- **Session** : Expiration à la fermeture navigateur
- **Remember me** : 30 jours
- **Consent cookie** : 13 mois (durée légale max)
- **Analytics cookies** : 13 mois (avec consentement)

## Mesures de Sécurité Techniques

### Encryption
- [x] **TLS/HTTPS** : Forcé sur tous endpoints (HSTS headers)
- [x] **Passwords** : Hashed avec bcrypt (Supabase Auth)
- [x] **Tokens JWT** : Signed avec secret fort (rotation annuelle)
- [x] **Database** : Encryption at rest (Supabase)

### Access Control
- [x] **Row Level Security (RLS)** : Policies PostgreSQL sur toutes tables
- [x] **Least Privilege** : Rôles DB séparés (anon, authenticated, service_role)
- [x] **API Rate Limiting** : 100 req/min par IP (public) / 500 (authenticated)
- [x] **2FA** : Disponible pour admins (Supabase Auth)

### Monitoring & Auditing
- [x] **Audit Logs** : Traçabilité actions sensibles (CRUD users, orders, consents)
- [x] **Security Alerts** : Notifications échecs auth répétés, accès admin suspects
- [x] **Database Backups** : Quotidiens, rétention 30 jours
- [x] **Incident Response Plan** : Procédure breach < 72h notification CNIL

### Input Validation
- [x] **Frontend** : React Hook Form + Zod validation
- [x] **Backend** : Validation Zod sur tous endpoints API
- [x] **SQL Injection** : Supabase Client parameterized queries
- [x] **XSS Protection** : CSP headers + sanitization inputs
- [x] **CSRF** : SameSite cookies + CSRF tokens si nécessaire

## Processeurs de Données Tiers (DPA)

### Data Processing Agreements (Sous-traitants)

| Service | Données Traitées | Localisation | DPA Signé | Conformité RGPD |
|---|---|---|---|---|
| **Supabase** | Toutes données utilisateurs, contenus | USA (AWS) | ✅ | ✅ Privacy Shield successor |
| **Vercel** | Logs, analytics | USA (AWS) | ✅ | ✅ Standard Contractual Clauses |
| **Stripe** | Données paiement, commandes | USA/EU | ✅ | ✅ PCI-DSS + RGPD |
| **SendGrid** | Emails, adresses destinataires | USA | ✅ | ✅ Standard Contractual Clauses |
| **Cloudinary** | Images uploadées (avatars, covers) | EU (data residency option) | ✅ | ✅ |
| **Sentry** | Error logs (peut contenir user IDs) | USA | ✅ | ✅ Data scrubbing activé |

**Action requise** : Signer DPA avec chaque service AVANT mise en production.

## Politique de Confidentialité (Privacy Policy)

### Contenu Requis

**À inclure dans `/legal/privacy-policy`** :

1. **Identité responsable traitement**
   - Nom organisation : Phuong Long Vo Dao
   - Adresse siège social
   - Email contact : privacy@phuong-long-vo-dao.fr
   - DPO si applicable

2. **Données collectées**
   - Identité (nom, email, etc.)
   - Données connexion (IP, logs)
   - Données bancaires (via Stripe)
   - Cookies et trackers

3. **Finalités traitement**
   - Fourniture service
   - Gestion commandes
   - Communication marketing (consentement)
   - Amélioration service (analytics)
   - Obligations légales

4. **Base légale**
   - Exécution contrat
   - Consentement
   - Intérêt légitime
   - Obligation légale

5. **Destinataires données**
   - Personnel autorisé
   - Sous-traitants (listés)
   - Autorités (si requis)

6. **Transferts hors UE**
   - Pays : USA
   - Garanties : Standard Contractual Clauses

7. **Durée conservation**
   - Par catégorie (voir section Retention)

8. **Droits utilisateurs**
   - Accès, rectification, suppression, portabilité, opposition
   - Procédure exercice : Email privacy@ ou interface Dashboard

9. **Droit réclamation**
   - Autorité : CNIL (France)
   - Lien : https://www.cnil.fr/

10. **Modifications politique**
    - Notification utilisateurs si changements majeurs
    - Version + date

### Mise à Jour
- Révision annuelle obligatoire
- Versionning : v1.0, v1.1, etc.
- Historique accessible

## Conditions Générales d'Utilisation (CGU)

**À inclure dans `/legal/terms-of-service`** :

1. Acceptation conditions
2. Description services
3. Création compte (obligations utilisateur)
4. Propriété intellectuelle
5. Utilisation acceptable (interdictions)
6. Responsabilités et limitations
7. Résiliation compte
8. Loi applicable (droit français)
9. Règlement litiges

## Mentions Légales

**À inclure dans `/legal/mentions-legales`** :

1. Éditeur site
2. Directeur publication
3. Hébergeur (Vercel)
4. Contact
5. Propriété intellectuelle

## Checklist Mise en Conformité

### Phase 1 : Légal
- [ ] Rédiger Privacy Policy (FR + EN si bilingue)
- [ ] Rédiger CGU
- [ ] Rédiger Mentions Légales
- [ ] Signer DPA avec tous sous-traitants
- [ ] Nommer DPO si requis
- [ ] Créer adresse email dédiée : privacy@...

### Phase 2 : Technique
- [ ] Implémenter cookie consent banner
- [ ] Implémenter opt-in newsletter (double opt-in)
- [ ] Créer page "Mes données" (export RGPD)
- [ ] Créer endpoint export données (JSON)
- [ ] Créer endpoint suppression compte
- [ ] Implémenter anonymisation cascade
- [ ] Audit logs pour actions sensibles
- [ ] Masquer IP dans analytics
- [ ] Implémenter data retention policies (CRON jobs)

### Phase 3 : UX
- [ ] Liens footer : Privacy, CGU, Mentions, Cookies
- [ ] Checkboxes consentement signup
- [ ] Interface gestion consentements Dashboard
- [ ] Confirmation double suppression compte
- [ ] Emails transactionnels RGPD-compliant

### Phase 4 : Documentation
- [ ] Former équipe sur RGPD
- [ ] Procédure réponse demandes DSAR (30 jours)
- [ ] Procédure notification breach (72h)
- [ ] Registre traitements (si > 250 employés)

### Phase 5 : Validation
- [ ] Audit RGPD externe (recommandé)
- [ ] Test procédures (export, suppression)
- [ ] Review par juriste spécialisé

## Contact RGPD

**Email dédié** : privacy@phuong-long-vo-dao.fr  
**Délai réponse** : 1 mois (max légal)  
**Extensions possibles** : +2 mois si complexité (notification obligatoire)

## Ressources Utiles

- **CNIL** : https://www.cnil.fr/
- **Texte RGPD** : https://eur-lex.europa.eu/eli/reg/2016/679/oj
- **RGPD Pratique** : https://www.cnil.fr/fr/rgpd-passer-a-laction
- **Modèles documents** : https://www.cnil.fr/fr/modeles

---

**Version** : 1.0  
**Dernière mise à jour** : 2025-11-04  
**Prochain audit** : 2026-11-04

