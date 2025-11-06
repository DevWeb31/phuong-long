# Carte Interactive des Clubs

## 📍 Vue d'ensemble

La carte interactive affiche tous les clubs Phuong Long Vo Dao actifs sur une carte de France, permettant aux utilisateurs de visualiser rapidement leur emplacement géographique.

## 🛠️ Technologies utilisées

- **Leaflet** : Bibliothèque JavaScript open-source pour cartes interactives
- **React-Leaflet** : Intégration React pour Leaflet
- **OpenStreetMap** : Fournisseur de tuiles de carte gratuit

## ✨ Fonctionnalités

### Affichage de la carte
- Carte centrée automatiquement sur les clubs
- Zoom et navigation fluides
- Support du thème clair et sombre
- Responsive (mobile, tablette, desktop)

### Markers personnalisés
- Icône 🥋 pour chaque club
- Effet hover au survol
- Animation au clic

### Popups interactives
Chaque marker affiche :
- Nom du club
- Ville
- Adresse complète
- Téléphone
- Email
- Bouton "Voir le club"

## 📊 Données requises

Pour qu'un club apparaisse sur la carte, il doit avoir :
- `latitude` (nombre décimal)
- `longitude` (nombre décimal)
- `active = true`

## 🗺️ Ajouter/Modifier les coordonnées GPS

### Méthode 1 : Via SQL

```sql
UPDATE clubs
SET 
  latitude = 48.8566,
  longitude = 2.3522
WHERE slug = 'paris-bastille';
```

### Méthode 2 : Via l'interface Admin

1. Aller dans `/admin/clubs`
2. Cliquer sur "Modifier" pour un club
3. Remplir les champs `Latitude` et `Longitude`
4. Sauvegarder

### Méthode 3 : Géocodage automatique

Si vous avez l'adresse complète, vous pouvez utiliser l'API de géocodage :

```bash
# Exemple avec l'API Nominatim (OpenStreetMap)
curl "https://nominatim.openstreetmap.org/search?q=123+Rue+Example+Paris&format=json&limit=1"
```

## 🎨 Personnalisation

### Modifier l'icône des markers

Dans `src/components/marketing/ClubsMap.tsx` :

```typescript
const clubIcon = new L.Icon({
  iconUrl: 'chemin/vers/votre/icone.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});
```

### Modifier la tuile de carte

Dans `ClubsMap.tsx`, remplacer l'URL de la tuile :

```typescript
<TileLayer
  url="https://YOUR_TILE_PROVIDER/{z}/{x}/{y}.png"
  attribution="..."
/>
```

**Autres fournisseurs populaires :**
- Carto : `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`
- Thunderforest : `https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey={YOUR_KEY}`
- Mapbox : `https://api.mapbox.com/...` (nécessite une clé API)

### Modifier le style en mode sombre

Dans `src/styles/leaflet-custom.css` :

```css
html.dark .leaflet-tile {
  filter: brightness(0.7) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
}
```

## 🔧 Dépannage

### La carte ne s'affiche pas

**Problème** : Erreur "Container is already initialized"
**Solution** : S'assurer que le composant est bien marqué `'use client'`

**Problème** : Icônes manquantes
**Solution** : Vérifier que Leaflet CSS est bien importé

```typescript
import 'leaflet/dist/leaflet.css';
```

### Les markers ne s'affichent pas

1. Vérifier que les clubs ont des coordonnées valides :
```sql
SELECT name, latitude, longitude FROM clubs WHERE active = true;
```

2. Vérifier dans la console du navigateur s'il y a des erreurs

### La carte est trop lente

1. Réduire le nombre de markers affichés
2. Utiliser un clustering de markers (react-leaflet-markercluster)
3. Optimiser les images/icônes

## 📱 Responsive

La carte s'adapte automatiquement :
- **Mobile** : Hauteur 500px
- **Desktop** : Hauteur 600px

Pour modifier :

```typescript
<div className="h-[500px] md:h-[600px]">
  <MapContainer>...</MapContainer>
</div>
```

## 🌍 Coordonnées GPS des villes principales

| Ville | Latitude | Longitude |
|-------|----------|-----------|
| Marseille | 43.296482 | 5.369780 |
| Paris | 48.853291 | 2.369254 |
| Nice | 43.696950 | 7.265000 |
| Créteil | 48.790370 | 2.445520 |
| Strasbourg | 48.573405 | 7.752111 |

## 🚀 Améliorations futures possibles

- [ ] Clustering de markers pour mieux visualiser les clubs proches
- [ ] Filtrage par type de cours (enfants, adultes, compétition)
- [ ] Calcul d'itinéraire depuis la position de l'utilisateur
- [ ] Affichage d'un rayon de recherche
- [ ] Vue Street View des clubs
- [ ] Export de la carte en PDF/Image

## 📚 Ressources

- [Documentation Leaflet](https://leafletjs.com/)
- [Documentation React-Leaflet](https://react-leaflet.js.org/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Nominatim (Géocodage gratuit)](https://nominatim.openstreetmap.org/)

## ⚠️ Limitations

- **Rate limiting** : OpenStreetMap limite le nombre de requêtes
- **Précision** : Les coordonnées doivent être vérifiées manuellement pour une précision optimale
- **Offline** : La carte nécessite une connexion internet

## 🆘 Support

En cas de problème avec la carte :
1. Vérifier la console du navigateur
2. Vérifier les coordonnées GPS dans la base de données
3. Consulter les issues GitHub de react-leaflet
4. Contacter l'équipe de développement

