# Configuration Finale des Webhooks Facebook - Guide Complet

## ⚠️ À Faire en UNE SEULE SESSION (Rapide !)

**Durée totale : 10 minutes**  
**Les tokens expirent vite, suivez toutes les étapes sans interruption !**

---

## 🔑 Étape 1 : Générer le Token Permanent (5 min)

### 1.1 : Token Utilisateur Court

1. Allez sur https://developers.facebook.com/tools/explorer/
2. Sélectionnez **"Bot Phuong Long Vo Dao"**
3. Token **Utilisateur** (pas Page)
4. Cliquez **"Generate Access Token"**
5. **COPIEZ IMMÉDIATEMENT** le token

### 1.2 : Échange Token Long Terme

**IMMÉDIATEMENT**, ouvrez dans le navigateur (remplacez TOKEN_COURT) :

```
https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=1549911139234875&client_secret=f1b54de14b1aa7bb6bcfb5d68a9068c6&fb_exchange_token=TOKEN_COURT
```

**Résultat :**
```json
{
  "access_token": "EAA...", ← COPIEZ CE TOKEN (60 jours)
  "expires_in": 5184000
}
```

### 1.3 : Token de Page (Permanent !)

**IMMÉDIATEMENT**, ouvrez (remplacez TOKEN_LONG) :

```
https://graph.facebook.com/v19.0/me/accounts?access_token=TOKEN_LONG
```

**Résultat :**
```json
{
  "data": [{
    "access_token": "EAA...", ← TOKEN PERMANENT DE LA PAGE !
    "name": "Phượng Long Võ Đạo Officiel",
    "id": "103546192397898"
  }]
}
```

**COPIEZ** l'`access_token` de la page !

---

## 🔧 Étape 2 : Configuration (2 min)

### 2.1 : Mettez à Jour Vercel

Dashboard > Settings > Environment Variables :

```env
FACEBOOK_PAGE_ACCESS_TOKEN=TOKEN_PERMANENT_DE_PAGE
```

Redéployez si nécessaire.

### 2.2 : Configurez l'Abonnement

Dans PowerShell (remplacez TOKEN_PERMANENT) :

```bash
curl.exe -X POST "https://graph.facebook.com/v19.0/103546192397898/subscribed_apps?access_token=TOKEN_PERMANENT&subscribed_fields=feed"
```

**Résultat :** `{"success":true}`

---

## ✅ Étape 3 : TEST (3 min)

### Publiez sur Facebook

```
🎉 TEST SYNCHRONISATION [SITE] [STAGE] [TREGUEUX]

[SESSION:2025-12-25|14:00-17:00]
[SESSION:2025-12-26|09:00-12:00]

[TARIF:Adulte|25€]
[TARIF:Enfant|15€]

[LIEU:Dojo Municipal, Trégueux]

[CAPACITE:20]
```

### Vérifiez

1. **Logs Vercel** : POST 200, Événement créé
2. **Supabase** : `SELECT * FROM events WHERE synced_from_facebook = true ORDER BY created_at DESC LIMIT 1;`
3. **Site** : https://www.phuong-long-vo-dao.com/events

---

## 🎯 C'EST FINI !

Les webhooks fonctionnent maintenant **indéfiniment** ! 🎊

**Token de page ne expire jamais** tant que :
- ✅ Admin de la page
- ✅ App publiée
- ✅ Pas de révocation manuelle


