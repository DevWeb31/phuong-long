# Système d'événements avec interactions sociales

## 🎯 Vue d'ensemble

Système complet d'événements style Facebook avec likes et participations, inspiré du modèle de posts Facebook pour les événements de clubs de Vo Dao.

## ✨ Fonctionnalités

### Page publique `/events/[slug]`
- Design style post Facebook
- Header avec logo/photo du club organisateur
- Image de couverture (affiche de l'événement)
- Informations détaillées (date, heure, lieu, tarif, capacité)
- **Bouton "J'aime ❤️"** avec compteur
- **Bouton "Je serai là ! ✓"** avec compteur
- Section club organisateur avec contact

### Interface admin `/admin/events`
- Création/modification d'événements
- Upload d'affiche (cover_image_url)
- Preview en temps réel
- Tous les champs nécessaires

## 🗄️ Structure de la base de données

### Table `event_likes` (NOUVEAU)
```sql
CREATE TABLE event_likes (
    id UUID PRIMARY KEY,
    event_id UUID REFERENCES events(id),
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ,
    UNIQUE(event_id, user_id)
);
```

### Table `event_registrations` (EXISTANT)
Utilisée pour "Je serai là !"
- `status = 'confirmed'` = Participation confirmée

## 🚀 Activation - IMPORTANT

### 1️⃣ Exécuter la migration SQL

**Via Supabase Dashboard :**
1. Allez sur https://supabase.com/dashboard
2. SQL Editor → New query
3. Copiez le contenu de `supabase/migrations/20250106000001_add_event_likes.sql`
4. Run

**Ou via SQL direct :**
```sql
-- Créer la table
CREATE TABLE IF NOT EXISTS event_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Index
CREATE INDEX idx_event_likes_event_id ON event_likes(event_id);
CREATE INDEX idx_event_likes_user_id ON event_likes(user_id);

-- RLS
ALTER TABLE event_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event likes are viewable by everyone"
ON event_likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like events"
ON event_likes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
ON event_likes FOR DELETE TO authenticated
USING (auth.uid() = user_id);
```

### 2️⃣ Vérifier

```sql
-- Vérifier que la table existe
SELECT * FROM event_likes LIMIT 1;

-- Devrait retourner 0 lignes (table vide)
```

## 📝 Utilisation

### Pour les admins

#### Créer un événement attractif :
1. `/admin/events` → "Nouveau Événement"
2. Remplissez :
   - **Titre** : "Stage de Cublize - Vô Dao"
   - **Type** : Stage
   - **Dates** : Date de début + fin
   - **Lieu** : "Salle des Sports, Cublize"
   - **Description complète** : Programme, activités, instructeurs
   - **Image de couverture** : URL de l'affiche
   - **Prix** : 30€ (ou 0 pour gratuit)
   - **Capacité** : Nombre de places
3. Sauvegardez

#### L'affiche s'affichera comme sur Facebook !

### Pour les utilisateurs

#### Sur la page événement :
1. **Connectez-vous** (requis pour interagir)
2. Cliquez sur **"❤️ J'aime"** → Like l'événement
3. Cliquez sur **"✓ Je serai là !"** → Vous participez

#### Compteurs visibles :
- "X personnes aiment" (avec icône coeur rouge)
- "Y personnes intéressées" (avec icône check bleu)

#### Si non connecté :
- Boutons visibles mais message "Connectez-vous pour interagir"
- Clic redirige vers `/signin`

## 🎨 Design

### Style Facebook
```
┌────────────────────────────────────────┐
│ 🔵 [Logo Club]  Phuong Long Cublize   │ ← Header
│    26 mai • 🥋 Stage                   │
├────────────────────────────────────────┤
│ STAGE DE CUBLIZE                       │ ← Titre
│                                        │
│ Dernier stage de la saison...         │ ← Description
├────────────────────────────────────────┤
│                                        │
│         [Affiche de l'événement]       │ ← Image
│                                        │
├────────────────────────────────────────┤
│ 📅 7-9 Juin 2025  |  🕐 14h00         │ ← Infos
│ 📍 Cublize        |  💰 30€           │
├────────────────────────────────────────┤
│ ❤️ 12 personnes aiment                │ ← Compteurs
│ ✓ 15 personnes intéressées            │
├────────────────────────────────────────┤
│ [  ❤️ J'aime  ] [ ✓ Je serai là ! ]  │ ← Boutons
├────────────────────────────────────────┤
│ 🏢 Club organisateur                  │ ← Contact
│ → Phuong Long Cublize                 │
└────────────────────────────────────────┘
```

## 🔧 API Endpoints

### Likes
- `POST /api/events/[id]/like` - Ajouter un like
- `DELETE /api/events/[id]/like` - Retirer un like

### Participations
- `POST /api/events/[id]/attend` - "Je serai là !"
- `DELETE /api/events/[id]/attend` - Se désinscrire

### Sécurité
- ✅ Authentification requise
- ✅ Vérification user_id
- ✅ RLS policies activées
- ✅ Gestion des doublons (UNIQUE constraint)
- ✅ Vérification événement complet

## 📊 Données requises

### Pour un événement complet (style Facebook) :

```typescript
{
  title: "Stage de Cublize - Week-end de Pentecôte",
  event_type: "stage",
  start_date: "2025-06-07T14:00:00",
  end_date: "2025-06-09T12:00:00",
  location: "Salle des Sports, 1 rue de la Platte, 69550 Cublize",
  description: `Dernier stage officiel de la saison !

Programme :
- Techniques de combat et self-défense
- Travail du bâton long
- Song luyen à deux
- Chaîne à 9 sections
- Couteaux papillons

Encadré par Vo Su David Tintillier (7ème dan FFKDA)

Ouvert à tous niveaux !`,
  club_id: "uuid-du-club-cublize",
  cover_image_url: "https://example.com/affiche-stage.jpg",
  price_cents: 3000, // 30€
  max_attendees: 50,
  registration_deadline: "2025-06-05T23:59:59",
  active: true
}
```

## 🎭 Interactions utilisateur

### États possibles :

| Action | État bouton | Compteur | BDD |
|--------|-------------|----------|-----|
| Like | ❤️ rouge, rempli | +1 like | INSERT event_likes |
| Unlike | ❤️ gris, vide | -1 like | DELETE event_likes |
| Participe | ✓ bleu | +1 intéressé | INSERT event_registrations |
| Se désinscrit | ✓ gris | -1 intéressé | DELETE event_registrations |

### Restrictions :
- 🔒 **Connexion obligatoire** pour toute interaction
- 🚫 **Événement complet** : Impossible de s'inscrire
- ⏰ **Événement passé** : Boutons masqués

## 📱 Responsive

- **Mobile** : Boutons empilés
- **Desktop** : Boutons côte à côte
- Compteurs toujours visibles
- Image adaptative

## 🔍 Analytics disponibles

### Pour les admins :
```sql
-- Événements les plus populaires (likes)
SELECT e.title, COUNT(el.id) as likes_count
FROM events e
LEFT JOIN event_likes el ON e.id = el.event_id
GROUP BY e.id, e.title
ORDER BY likes_count DESC
LIMIT 10;

-- Événements avec le plus de participants
SELECT e.title, COUNT(er.id) as attendees_count
FROM events e
LEFT JOIN event_registrations er ON e.id = er.event_id
WHERE er.status = 'confirmed'
GROUP BY e.id, e.title
ORDER BY attendees_count DESC
LIMIT 10;
```

## ⚠️ Troubleshooting

### Boutons ne fonctionnent pas
1. Vérifier que la migration SQL est exécutée
2. Vérifier l'authentification de l'utilisateur
3. Console du navigateur pour voir les erreurs

### Compteurs à 0
- Normal si personne n'a encore interagi
- Testez en likant/participant

### "Authentification requise"
- Fonctionnement normal si non connecté
- Cliquez pour être redirigé vers `/signin`

## 🚀 Améliorations futures possibles

- [ ] Afficher les photos des participants
- [ ] Commentaires sur les événements
- [ ] Partage sur réseaux sociaux
- [ ] Notifications pour les participants
- [ ] Export iCal pour calendrier
- [ ] Rappels par email

## 📚 Références

- Table `events` : Structure principale
- Table `event_likes` : Likes/J'aime
- Table `event_registrations` : Participations
- Component `EventInteractions` : Boutons interactifs
- Page `/events/[slug]` : Affichage détaillé

