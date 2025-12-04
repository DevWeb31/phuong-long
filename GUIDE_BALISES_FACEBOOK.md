# 📖 Guide des Balises Facebook - Phuong Long Vo Dao

## 🎯 Comment Ça Marche ?

Quand vous publiez un événement sur la **page Facebook** "Phượng Long Võ Đạo Officiel", utilisez des **balises spéciales** dans votre publication pour que l'événement apparaisse **automatiquement** sur le site web !

---

## ⭐ BALISE OBLIGATOIRE

### `[SITE]` - Publier sur le Site

**OBLIGATOIRE** pour que l'événement soit synchronisé !

```
Votre titre d'événement [SITE]
```

**✅ Sans cette balise, l'événement n'apparaîtra PAS sur le site.**

---

## 📌 BALISES DE BASE

### Titre et Description (Recommandées !)

Contrôlez exactement ce qui s'affiche sur le site :

| Balise | Description | Exemple |
|--------|-------------|---------|
| `[TITRE:...]` | Titre exact de l'événement | `[TITRE:Stage d'été 2025]` |
| `[DESCRIPTION:...]` | Description courte | `[DESCRIPTION:Stage intensif pour tous niveaux]` |

**💡 Pourquoi les utiliser ?**
- ✅ Contrôle total sur l'affichage
- ✅ Pas de balises parasites dans le titre
- ✅ Description claire et précise

**Exemple :**
```
[SITE] [STAGE] [TREGUEUX]
[TITRE:Stage de Perfectionnement Technique]
[DESCRIPTION:Venez perfectionner vos techniques lors de ce stage intensif animé par nos meilleurs instructeurs.]

[SESSION:15-06-2025|14:00-17:00]
[PRIX:30€]
[LIEU:Dojo de Trégueux]
```

### Type d'Événement

Indiquez de quel type d'événement il s'agit :

| Balise | Type d'Événement | Exemple |
|--------|------------------|---------|
| `[STAGE]` | Stage / Formation | `Stage d'été [SITE] [STAGE]` |
| `[COMPETITION]` | Compétition | `Championnat régional [SITE] [COMPETITION]` |
| `[DEMONSTRATION]` ou `[DEMO]` | Démonstration publique | `Démo place publique [SITE] [DEMO]` |
| `[SEMINAIRE]` ou `[SEMINAR]` | Séminaire / Conférence | `Séminaire technique [SITE] [SEMINAIRE]` |

### Clubs Concernés

Indiquez quel(s) club(s) sont concernés :

| Balise | Club | Exemple |
|--------|------|---------|
| `[TOUS]` ou `[ALL]` | Tous les clubs | `Stage national [TOUS]` |
| `[CUBLIZE]` | Club de Cublize | `Stage local [CUBLIZE]` |
| `[LANESTER]` | Club de Lanester | `Compétition [LANESTER]` |
| `[MONTAIGUT]` | Club de Montaigut Sur Save | `Stage [MONTAIGUT]` |
| `[TREGUEUX]` ou `[TRÉGUEUX]` | Club de Trégueux | `Demo [TREGUEUX]` |
| `[WIMILLE]` | Club de Wimille | `Stage [WIMILLE]` |

**💡 Vous pouvez mettre plusieurs clubs :**
```
Stage inter-clubs [SITE] [STAGE] [TREGUEUX] [LANESTER]
```

---

## 📅 BALISES DATES ET HORAIRES

### Dates

| Format | Exemple | Utilisation |
|--------|---------|-------------|
| `[DATE:JJ-MM-AAAA]` | `[DATE:25-12-2025]` | Format recommandé ⭐ |
| `[DATE:JJ/MM/AAAA]` | `[DATE:25/12/2025]` | Avec slashes |
| `[DATE:AAAA-MM-JJ]` | `[DATE:12-25]` | Format international |

### Horaires

| Format | Exemple | Utilisation |
|--------|---------|-------------|
| `[HORAIRE:HH:MM-HH:MM]` | `[HORAIRE:14:00-17:00]` | Heure début et fin |
| `[HORAIRE:HHhMM-HHhMM]` | `[HORAIRE:14h00-17h00]` | Avec 'h' |
| `[HORAIRE:HH:MM]` | `[HORAIRE:14:00]` | Heure de début seule |

### Sessions Complètes (Recommandé !)

Pour combiner date + horaires en une seule balise :

| Format | Exemple | Utilisation |
|--------|---------|-------------|
| `[SESSION:DATE\|HORAIRES]` | `[SESSION:25-12-2025\|14:00-17:00]` | Date + horaires |

**💡 Plusieurs sessions pour un stage multi-jours :**
```
[SESSION:15-12-2025|09:00-12:00]
[SESSION:15-12-2025|14:00-17:00]
[SESSION:16-12-2025|09:00-12:00]
```

---

## 💰 BALISES PRIX

### Événement Gratuit

| Balise | Exemple |
|--------|---------|
| `[GRATUIT]` | `Démonstration publique [GRATUIT]` |
| `[FREE]` | `Demo [FREE]` |

### Prix Unique

| Balise | Exemple |
|--------|---------|
| `[PRIX:XX€]` | `[PRIX:25€]` |
| `[PRIX:XX]` | `[PRIX:25]` |

### Tarifs Multiples (Recommandé !)

| Format | Exemple | Utilisation |
|--------|---------|-------------|
| `[TARIF:Label\|Prix€]` | `[TARIF:Adulte\|25€]` | Tarif avec description |
| | `[TARIF:Enfant\|15€]` | |
| | `[TARIF:Adhérent PLVD\|20€]` | |

**💡 Exemple complet :**
```
[TARIF:Adulte|30€]
[TARIF:Enfant (-16 ans)|20€]
[TARIF:Adhérent PLVD|25€]
```

---

## 📍 BALISES LIEUX

| Format | Exemple | Utilisation |
|--------|---------|-------------|
| `[LIEU:Nom, Adresse, Ville]` | `[LIEU:Dojo Municipal, 10 Rue du Sport, Trégueux]` | Lieu complet |
| `[ADRESSE:...]` | `[ADRESSE:Gymnase, Rue X, Ville]` | Alias de LIEU |

**💡 Plusieurs lieux :**
```
[LIEU:Gymnase Principal, 123 Avenue, Lyon]
[LIEU:Dojo de Secours, 456 Rue, Lyon]
```

---

## 👥 BALISES CAPACITÉ

| Balise | Exemple | Utilisation |
|--------|---------|-------------|
| `[CAPACITE:XX]` | `[CAPACITE:30]` | Nombre de places max |
| `[CAPACITÉ:XX]` | `[CAPACITÉ:30]` | Avec accent |
| `[PLACES:XX]` | `[PLACES:50]` | Alias |
| `[ILLIMITE]` | `[ILLIMITE]` | Capacité illimitée |
| `[ILLIMITÉ]` | `[ILLIMITÉ]` | Avec accent |
| `[UNLIMITED]` | `[UNLIMITED]` | En anglais |

**💡 Par défaut (sans balise) = Illimité**

---

## 📝 EXEMPLES COMPLETS

### Exemple 1 : Stage Simple (1 Jour)

```
Stage de Perfectionnement [SITE] [STAGE] [TREGUEUX]

Venez perfectionner vos techniques lors de ce stage intensif !

[DATE:15-06-2025]
[HORAIRE:14:00-17:00]
[PRIX:25€]
[LIEU:Dojo de Trégueux, 10 Rue du Sport, Trégueux]
[CAPACITE:20]
```

**Résultat :**
- ✅ 1 événement type "Stage"
- ✅ 1 session (15 juin, 14h-17h)
- ✅ 1 tarif (25€)
- ✅ 1 lieu (Dojo de Trégueux)
- ✅ 20 places maximum

---

### Exemple 2 : Stage National Multi-Jours

```
🥋 STAGE NATIONAL D'ÉTÉ 2025 [SITE] [STAGE] [TOUS]

Le stage incontournable de l'année ! 3 jours de pratique intensive.

📆 Programme:

Samedi 15 juin:
[SESSION:15-06-2025|09:00-12:00]
Matin - Techniques fondamentales

[SESSION:15-06-2025|14:00-17:00]
Après-midi - Combat souple

Dimanche 16 juin:
[SESSION:16-06-2025|09:00-12:00]
Matin - Armes traditionnelles

[SESSION:16-06-2025|14:00-17:00]
Après-midi - Formes (Quyen)

Lundi 17 juin:
[SESSION:17-06-2025|09:00-12:00]
Matin - Révisions et grades

💶 Tarifs:
[TARIF:Adhérent PLVD|40€]
[TARIF:Non-adhérent|50€]
[TARIF:Moins de 16 ans|30€]

📍 Lieu:
[LIEU:Gymnase Municipal, 123 Avenue du Sport, 69000 Lyon]

👥 Capacité:
[CAPACITE:50]

ℹ️ Inscription avant le 10 juin obligatoire.
Repas du midi sur place (5€ supplémentaires)

#PLVD #VoDaoVietnam #StageNational
```

**Résultat :**
- ✅ 1 événement pour tous les clubs
- ✅ 5 sessions sur 3 jours
- ✅ 3 tarifs différents
- ✅ 1 lieu
- ✅ 50 places max

---

### Exemple 3 : Compétition Gratuite

```
🏆 CHAMPIONNAT RÉGIONAL [SITE] [COMPETITION] [GRATUIT]
[CUBLIZE] [LANESTER] [TREGUEUX]

Grande compétition ouverte à tous !

Catégories: Poussins, Benjamins, Minimes, Cadets, Juniors, Seniors

[DATE:20-03-2025]
[HORAIRE:09:00-18:00]

[LIEU:Salle des Sports, Place de la République, Feurs]
[LIEU:Gymnase Central, Avenue des Écoles, Lanester]

[ILLIMITE]

Inscriptions sur place de 8h à 8h45

#Competition #VoDaoFrance
```

**Résultat :**
- ✅ Événement gratuit
- ✅ 3 clubs concernés
- ✅ 1 session (toute la journée)
- ✅ 2 lieux différents
- ✅ Capacité illimitée

---

### Exemple 4 : Démonstration Publique

```
🎭 DÉMONSTRATION PUBLIQUE [SITE] [DEMO] [TOUS] [GRATUIT]

Venez découvrir le Phuong Long Vo Dao !

[DATE:05-01]
[HORAIRE:15:00-16:30]

[LIEU:Place du Marché, Centre-ville, Marseille]

#VoDao #DemoGratuite #ArtsMartiauxVietnamiens
```

**Résultat :**
- ✅ Démo gratuite
- ✅ Tous les clubs
- ✅ 1 session
- ✅ 1 lieu
- ✅ Illimité (pas de balise capacité)

---

## 📋 RÉCAPITULATIF DES BALISES

### Obligatoires

- ✅ `[SITE]` - Toujours obligatoire !

### Recommandées

- ⭐ Type : `[STAGE]`, `[COMPETITION]`, `[DEMO]`, `[SEMINAIRE]`
- ⭐ Club(s) : `[TOUS]`, `[CUBLIZE]`, `[LANESTER]`, etc.

### Dates et Horaires

- 📅 `[SESSION:YYYY-MM-DD|HH:MM-HH:MM]` (format complet recommandé)
- 📅 `[DATE:YYYY-MM-DD]` (date seule)
- 🕒 `[HORAIRE:HH:MM-HH:MM]` (horaires seuls)

### Prix

- 💰 `[GRATUIT]` (événement gratuit)
- 💰 `[PRIX:XX€]` (prix unique)
- 💰 `[TARIF:Label|XX€]` (tarifs multiples)

### Lieux

- 📍 `[LIEU:Nom, Adresse, Ville]`

### Capacité

- 👥 `[CAPACITE:XX]` (nombre de places)
- 👥 `[ILLIMITE]` (pas de limite)

---

## ✅ CONSEILS D'UTILISATION

### ✔️ À FAIRE

- ✅ Toujours mettre `[SITE]` en évidence
- ✅ Utiliser `[SESSION:DATE|HORAIRE]` pour les événements multi-jours
- ✅ Utiliser `[TARIF:Label|Prix]` pour plusieurs tarifs
- ✅ Ajouter une description lisible pour le public Facebook
- ✅ Utiliser des emojis pour rendre la publication attractive

### ❌ À ÉVITER

- ❌ Oublier la balise `[SITE]`
- ❌ Mettre toutes les balises dans le titre (illisible)
- ❌ Utiliser des formats de date incorrects
- ❌ Faire des fautes dans les noms de clubs

---

## 🎨 TEMPLATE RAPIDE COPIER-COLLER

### Template Standard

```
[TITRE DE L'ÉVÉNEMENT] [SITE] [TYPE] [CLUB(S)]

[Description de votre événement pour Facebook]

📅 Date:
[SESSION:YYYY-MM-DD|HH:MM-HH:MM]

💶 Tarifs:
[TARIF:Adulte|XX€]
[TARIF:Enfant|XX€]

📍 Lieu:
[LIEU:Nom du lieu, Adresse, Ville]

👥 Capacité:
[CAPACITE:XX]

ℹ️ [Informations complémentaires]

#VosHashtags
```

### Template Minimal (Événement Simple)

```
[TITRE] [SITE] [STAGE] [CLUB]

[Description]

[DATE:YYYY-MM-DD]
[HORAIRE:HH:MM-HH:MM]
[PRIX:XX€]
[LIEU:Nom, Ville]
```

---

## 🔤 FORMATS ACCEPTÉS

### Dates

✅ `2025-12-25` (YYYY-MM-DD)  
✅ `25/12/2025` (DD/MM/YYYY)  
✅ `25-12-2025` (DD-MM-YYYY)  

❌ `25 décembre 2025` (texte)  
❌ `12/25/2025` (format américain)  

### Horaires

✅ `14:00` (HH:MM)  
✅ `14h00` (avec 'h')  
✅ `14:00-17:00` (plage horaire)  

❌ `14h` (incomplet)  
❌ `2:00 PM` (format 12h)  

### Prix

✅ `25€` ou `25`  
✅ `25.50€` (avec centimes)  

❌ `25 euros` (en lettres)  
❌ `€25` (symbole avant)  

---

## 🎯 CAS PARTICULIERS

### Événement sur Plusieurs Lieux

```
Compétition régionale [SITE] [COMPETITION] [TOUS]

[DATE:03-15]
[HORAIRE:09:00-18:00]
[GRATUIT]

[LIEU:Salle A, Adresse A, Ville A]
[LIEU:Salle B, Adresse B, Ville B]
[LIEU:Salle C, Adresse C, Ville C]
```

### Événement Gratuit Multi-Sessions

```
Week-end portes ouvertes [SITE] [DEMO] [TOUS] [GRATUIT]

[SESSION:04-12|10:00-12:00]
[SESSION:04-12|14:00-17:00]
[SESSION:04-13|10:00-12:00]

[LIEU:Dojo, Adresse, Ville]
[ILLIMITE]
```

### Événement avec Capacité Limitée

```
Stage intensif petit groupe [SITE] [STAGE] [WIMILLE]

Groupes limités pour un apprentissage optimal

[SESSION:05-20|14:00-17:00]
[PRIX:35€]
[LIEU:Dojo de Wimille]
[CAPACITE:12]

⚠️ Places limitées !
```

---

## 📱 VISUALISATION

Voici comment votre publication Facebook sera transformée :

**Publication Facebook :**
```
Stage d'été [SITE] [STAGE] [TREGUEUX]
[SESSION:07-10|14:00-17:00]
[PRIX:20€]
[LIEU:Dojo Municipal, Trégueux]
[CAPACITE:25]

Stage intensif pour tous niveaux !
```

**↓ Synchronisation Automatique ↓**

**Sur le Site Web :**
```
┌─────────────────────────────────────┐
│ Stage d'été                         │
│ 🏷️ Stage | 🏛️ Trégueux            │
│                                     │
│ 📅 Mercredi 10 juillet 2025        │
│ 🕒 14:00 - 17:00                   │
│                                     │
│ 📍 Dojo Municipal, Trégueux        │
│ 💰 20,00 €                         │
│ 👥 25 places maximum               │
│                                     │
│ Stage intensif pour tous niveaux ! │
│                                     │
│ [S'inscrire]                        │
└─────────────────────────────────────┘
```

---

## ❓ QUESTIONS FRÉQUENTES

### Que se passe-t-il si j'oublie `[SITE]` ?

➡️ L'événement reste sur Facebook mais **n'apparaît PAS** sur le site.

### Puis-je modifier un événement après publication ?

➡️ Oui ! Modifiez votre publication Facebook, l'événement sera **automatiquement mis à jour** sur le site.

### Que se passe-t-il si je supprime la publication Facebook ?

➡️ L'événement reste sur le site. Supprimez-le manuellement si nécessaire.

### Combien de temps prend la synchronisation ?

➡️ **Instantané** ! L'événement apparaît sur le site **dans les 30 secondes** après publication.

### Puis-je mettre plusieurs dates ?

➡️ **OUI !** Utilisez plusieurs balises `[SESSION:...]`

### Les balises sont-elles visibles sur Facebook ?

➡️ Oui, mais elles sont **supprimées** de l'affichage sur le site web.

---

## 📞 AIDE

En cas de problème :
1. **Vérifiez** que la balise `[SITE]` est présente
2. **Vérifiez** les formats de dates/horaires
3. **Attendez** 1-2 minutes pour la synchronisation
4. **Contactez** le développeur si l'événement n'apparaît toujours pas

---

## ✨ ASTUCES PRO

### Rendez votre Publication Attractive

```
🥋 GRAND STAGE D'ÉTÉ 2025 [SITE] [STAGE] [TOUS]

✨ 3 jours de pratique intensive
🎯 Pour tous niveaux
👨‍🏫 Encadré par nos meilleurs instructeurs

📆 Du 15 au 17 juillet
[SESSION:07-15|09:00-12:00]
[SESSION:07-15|14:00-17:00]
[SESSION:07-16|09:00-12:00]
[SESSION:07-16|14:00-17:00]
[SESSION:07-17|09:00-12:00]

💶 Tarifs préférentiels:
[TARIF:Adhérent PLVD|40€]
[TARIF:Non-adhérent|55€]
[TARIF:Moins de 16 ans|35€]

📍 Gymnase Municipal
[LIEU:Gymnase Municipal, 123 Avenue du Sport, Lyon]

👥 Places limitées!
[CAPACITE:40]

🎁 Repas inclus le samedi midi
📸 Remise de certificat

Inscription: www.phuong-long-vo-dao.com

#PLVD #VoDaoVietnam #StageEte #ArtsMartiauxVietnamiens
```

---

**Version**: 1.0  
**Date**: 2025-12-02  
**Pour**: Administrateurs de la page Facebook Phuong Long Vo Dao


