# Supabase Database Setup

## 📋 Vue d'Ensemble

Ce dossier contient tous les scripts SQL pour initialiser votre base de données Supabase.

## 🗂️ Fichiers

1. **`001_initial_schema.sql`** - Schema complet (tables, indexes, triggers)
2. **`002_rls_policies.sql`** - Row Level Security policies
3. **`003_seed_data.sql`** - Données de test (clubs, events, products)

## 🚀 Installation

### Méthode 1 : Via Supabase Dashboard (Recommandé)

1. Aller sur [app.supabase.com](https://app.supabase.com)
2. Sélectionner votre projet
3. Menu **SQL Editor** (icône `<>` dans la sidebar)
4. Créer une **New query**

#### Étape 1 : Schema
```sql
-- Copier tout le contenu de migrations/001_initial_schema.sql
-- Coller dans SQL Editor
-- Cliquer sur "Run" (ou Ctrl+Enter)
```

#### Étape 2 : RLS Policies
```sql
-- Copier tout le contenu de migrations/002_rls_policies.sql
-- Coller dans SQL Editor
-- Cliquer sur "Run"
```

#### Étape 3 : Seed Data
```sql
-- Copier tout le contenu de migrations/003_seed_data.sql
-- Coller dans SQL Editor
-- Cliquer sur "Run"
```

### Méthode 2 : Via Supabase CLI

```bash
# 1. Installer Supabase CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Linker votre projet
supabase link --project-ref your-project-ref

# 4. Appliquer migrations
supabase db push

# Note: Cette méthode nécessite configuration locale
# Voir docs Supabase CLI: https://supabase.com/docs/guides/cli
```

## ✅ Vérification

Après exécution, vérifier dans **Table Editor** :

### Tables Créées (19 tables)
- [x] `user_profiles`
- [x] `clubs` (5 clubs insérés)
- [x] `coaches` (6 coaches insérés)
- [x] `blog_posts`
- [x] `blog_comments`
- [x] `tags` (12 tags insérés)
- [x] `blog_tags`
- [x] `events` (5 events insérés)
- [x] `event_registrations`
- [x] `products` (8 produits insérés)
- [x] `orders`
- [x] `order_items`
- [x] `roles` (4 rôles insérés)
- [x] `permissions` (15 permissions insérées)
- [x] `user_roles`
- [x] `role_permissions`
- [x] `user_bookmarks`
- [x] `audit_logs`
- [x] `facebook_cache`

### RLS Activé
Dans **Authentication** → **Policies**, vérifier que toutes les tables ont des policies.

### Données de Test
```sql
-- Vérifier dans SQL Editor:
SELECT COUNT(*) FROM clubs; -- Devrait retourner 5
SELECT COUNT(*) FROM coaches; -- Devrait retourner 6
SELECT COUNT(*) FROM events; -- Devrait retourner 5
SELECT COUNT(*) FROM products; -- Devrait retourner 8
SELECT COUNT(*) FROM roles; -- Devrait retourner 4
SELECT COUNT(*) FROM tags; -- Devrait retourner 12
```

## 🔐 Créer Premier Utilisateur Admin

### Via Supabase Dashboard

1. **Authentication** → **Users** → **Add user**
2. Email : `admin@phuong-long-vo-dao.fr`
3. Password : `Admin123!` (à changer après première connexion)
4. **Auto Confirm User** : ✅ Coché

### Attribuer Rôle Admin via SQL

```sql
-- 1. Récupérer l'ID de l'utilisateur créé
SELECT id, email FROM auth.users WHERE email = 'admin@phuong-long-vo-dao.fr';

-- 2. Créer profil
INSERT INTO user_profiles (id, username, full_name)
VALUES (
    'USER_ID_FROM_STEP_1',
    'admin',
    'Administrateur Principal'
);

-- 3. Attribuer rôle admin
INSERT INTO user_roles (user_id, role_id, granted_by)
VALUES (
    'USER_ID_FROM_STEP_1',
    (SELECT id FROM roles WHERE name = 'admin'),
    'USER_ID_FROM_STEP_1'
);
```

### Script Complet (remplacer YOUR_USER_ID)

```sql
-- Script à exécuter après création user dans Supabase Auth
DO $$
DECLARE
    v_user_id UUID := 'YOUR_USER_ID'; -- Remplacer par l'ID réel
BEGIN
    -- Créer profil
    INSERT INTO user_profiles (id, username, full_name)
    VALUES (v_user_id, 'admin', 'Administrateur Principal')
    ON CONFLICT (id) DO NOTHING;
    
    -- Attribuer rôle admin
    INSERT INTO user_roles (user_id, role_id, granted_by)
    SELECT v_user_id, id, v_user_id
    FROM roles WHERE name = 'admin'
    ON CONFLICT (user_id, role_id, club_id) DO NOTHING;
    
    RAISE NOTICE 'Admin user created successfully!';
END $$;
```

## 🧪 Créer Utilisateurs de Test

```sql
-- Après avoir créé les users via Supabase Auth Dashboard:

-- User 1: Moderator
INSERT INTO user_profiles (id, username, full_name)
VALUES ('MODERATOR_USER_ID', 'moderator', 'Modérateur Test');

INSERT INTO user_roles (user_id, role_id, granted_by)
SELECT 'MODERATOR_USER_ID', id, 'ADMIN_USER_ID'
FROM roles WHERE name = 'moderator';

-- User 2: Coach Marseille
INSERT INTO user_profiles (id, username, full_name)
VALUES ('COACH_USER_ID', 'coach_marseille', 'Coach Marseille');

INSERT INTO user_roles (user_id, role_id, club_id, granted_by)
SELECT 
    'COACH_USER_ID',
    (SELECT id FROM roles WHERE name = 'coach'),
    '650e8400-e29b-41d4-a716-446655440001', -- Club Marseille
    'ADMIN_USER_ID';

-- User 3: Membre standard
INSERT INTO user_profiles (id, username, full_name)
VALUES ('USER_USER_ID', 'membre', 'Membre Standard');

INSERT INTO user_roles (user_id, role_id, granted_by)
SELECT 'USER_USER_ID', id, 'ADMIN_USER_ID'
FROM roles WHERE name = 'user';
```

## 📊 Données Insérées (Seed)

### 5 Clubs
- **Marseille** (Principal) - 12 Avenue des Arts Martiaux
- **Paris** (Bastille) - 45 Boulevard de la Bastille
- **Nice** (Promenade) - 78 Promenade des Anglais
- **Créteil** (Université) - 15 Avenue de l'Université
- **Strasbourg** (Centre) - 8 Rue du Combat

### 6 Coaches
- Maître Nguyen Van Long (Marseille) - 40 ans d'expérience
- Sophie Martin (Marseille) - Self-defense
- Jean Dubois (Paris) - Combat
- Marie Lefebvre (Nice) - Quyền
- Thomas Petit (Créteil) - Pédagogie
- Émilie Schmitt (Strasbourg) - Enfants

### 5 Événements
- Stage Technique Nationale 2025 (Marseille)
- Championnat Régional PACA (Nice)
- Démonstration Fête de la Ville (Paris)
- Séminaire Self-Defense Féminine (Marseille)
- Stage Armes Traditionnelles (Strasbourg)

### 8 Produits Boutique
- Kimono Vo Dao Blanc - 45€
- Kimono Vo Dao Noir - 55€
- Ceinture Coton - 8€
- Protège-tibias et Pieds - 28€
- Gants Combat - 18€
- Protège-dents - 6€
- Sac de Sport - 32€
- T-Shirt Technique - 18€

### 4 Rôles + 15 Permissions
- Admin (toutes permissions)
- Moderator (contenu)
- Coach (événements)
- User (standard)

## 🔧 Maintenance

### Reset Database (⚠️ DANGER - Supprime tout)

```sql
-- À utiliser UNIQUEMENT en développement
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Puis ré-exécuter les 3 migrations
```

### Backup Data

```bash
# Via Supabase Dashboard
# Settings → Database → Backup
# Ou via pg_dump si accès direct
```

## 🐛 Troubleshooting

### Erreur "permission denied"
```sql
-- Vérifier rôles PostgreSQL
SELECT current_user, current_database();

-- Donner permissions si nécessaire (admin Supabase)
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
```

### Erreur "function auth.uid() does not exist"
```sql
-- Vérifier que vous êtes connecté avec un user authentifié
-- Les RLS policies utilisent auth.uid() qui nécessite JWT valide
```

### Tables vides après seed
```sql
-- Vérifier contraintes foreign key
-- Peut-être besoin de créer users auth d'abord
SELECT * FROM auth.users;
```

## 📚 Documentation Complète

Voir `docs/memory-bank/backend/ARCHITECTURE.md` pour:
- Détail de chaque table
- Explication RLS policies
- Patterns API avec Supabase
- Best practices sécurité

## ✅ Checklist Setup Complet

- [ ] Projet Supabase créé
- [ ] Script 001 exécuté (tables)
- [ ] Script 002 exécuté (RLS)
- [ ] Script 003 exécuté (seed data)
- [ ] Vérification tables (19 tables)
- [ ] Vérification données (5 clubs, 8 produits, etc.)
- [ ] User admin créé
- [ ] Rôle admin attribué
- [ ] Test connexion depuis Next.js (npm run dev)
- [ ] Variables `.env.local` configurées

---

**Prêt à développer !** 🚀

La base de données est maintenant configurée avec :
- ✅ Schema complet
- ✅ Sécurité RLS
- ✅ Données de test réalistes
- ✅ Système de permissions RBAC

Next step : Tester connexion Next.js → Supabase

