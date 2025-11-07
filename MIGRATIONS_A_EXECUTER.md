# ⚠️ Migrations SQL à exécuter IMMÉDIATEMENT

## 🎯 Actions requises avant d'utiliser le site

Vous devez exécuter ces 3 migrations SQL dans Supabase Dashboard :

---

## 1️⃣ Coordonnées GPS des clubs

**Fichier :** `supabase/migrations/20250106000000_add_club_coordinates.sql`

```sql
-- Marseille Centre
UPDATE clubs SET latitude = 43.296482, longitude = 5.369780
WHERE city = 'Marseille' AND latitude IS NULL;

-- Paris Bastille
UPDATE clubs SET latitude = 48.853291, longitude = 2.369254
WHERE city = 'Paris' AND latitude IS NULL;

-- Nice Promenade
UPDATE clubs SET latitude = 43.696950, longitude = 7.265000
WHERE city = 'Nice' AND latitude IS NULL;

-- Créteil Université
UPDATE clubs SET latitude = 48.790370, longitude = 2.445520
WHERE city = 'Créteil' AND latitude IS NULL;

-- Strasbourg Centre
UPDATE clubs SET latitude = 48.573405, longitude = 7.752111
WHERE city = 'Strasbourg' AND latitude IS NULL;
```

**Résultat :** Les clubs s'afficheront sur la carte interactive

---

## 2️⃣ Système de likes pour événements

**Fichier :** `supabase/migrations/20250106000001_add_event_likes.sql`

```sql
-- Créer la table event_likes
CREATE TABLE IF NOT EXISTS event_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_event_likes_event_id ON event_likes(event_id);
CREATE INDEX IF NOT EXISTS idx_event_likes_user_id ON event_likes(user_id);

-- RLS (Row Level Security)
ALTER TABLE event_likes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Event likes are viewable by everyone"
ON event_likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like events"
ON event_likes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
ON event_likes FOR DELETE TO authenticated
USING (auth.uid() = user_id);
```

**Résultat :** Les boutons "J'aime ❤️" fonctionneront

---

## 3️⃣ Image de couverture pour événements

**Fichier :** `supabase/migrations/20250106000002_add_cover_image_to_events.sql`

```sql
-- Ajouter la colonne cover_image_url
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
```

**Résultat :** Vous pourrez ajouter des affiches aux événements

---

## 4️⃣ Mettre les événements dans le futur

**Pour que vos 5 événements s'affichent :**

```sql
-- Déplacer tous les événements de 3 mois dans le futur
UPDATE events
SET 
  start_date = start_date + INTERVAL '90 days',
  end_date = CASE 
    WHEN end_date IS NOT NULL THEN end_date + INTERVAL '90 days'
    ELSE NULL
  END
WHERE active = true;
```

**Résultat :** Les événements s'afficheront sur `/events`

---

## 📝 Comment exécuter ces migrations

### Via Supabase Dashboard :

1. **Allez sur** https://supabase.com/dashboard
2. **Sélectionnez votre projet** Phuong Long Vo Dao
3. **Cliquez sur "SQL Editor"** dans le menu de gauche
4. **Cliquez sur "New query"**
5. **Copiez-collez** TOUTES les requêtes ci-dessus (une après l'autre ou toutes ensemble)
6. **Cliquez sur "Run"** (ou Ctrl+Enter)
7. ✅ Vous devriez voir "Success"

---

## ✅ Vérification

Après avoir exécuté les migrations :

### Vérifier que tout est OK :
```sql
-- Vérifier les clubs avec GPS
SELECT name, city, latitude, longitude FROM clubs WHERE active = true;

-- Vérifier la table event_likes
SELECT COUNT(*) FROM event_likes;

-- Vérifier les événements
SELECT title, start_date, cover_image_url FROM events WHERE active = true ORDER BY start_date;
```

### Tester sur le site :
1. **Carte interactive** : `/clubs` → Carte devrait afficher les clubs
2. **Événements** : `/events` → Devrait afficher les 5 événements
3. **Détail événement** : Cliquez sur un événement → Boutons ❤️ et ✓ visibles

---

## 🆘 En cas de problème

Si une migration échoue :
- Vérifiez le message d'erreur
- La colonne/table existe peut-être déjà (c'est OK)
- `IF NOT EXISTS` empêche les doublons

---

## 🚀 Une fois fait

Tous ces systèmes seront opérationnels :
- ✅ Carte interactive des clubs
- ✅ Likes sur événements
- ✅ Participations "Je serai là !"
- ✅ Affiches d'événements
- ✅ Événements affichés

**Exécutez ces migrations maintenant et votre site sera 100% fonctionnel !** 🎉

