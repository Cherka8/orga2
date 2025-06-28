# Migration des Couleurs - Guide d'Utilisation

## Contexte

Ce guide explique comment migrer le système de couleurs de l'application d'un stockage basé sur des codes hexadécimaux vers un stockage basé sur des noms de couleurs français.

## Problème Résolu

**Avant :** Les couleurs étaient stockées en base de données sous forme de codes hexadécimaux (ex: `#f59e0b`)
**Après :** Les couleurs sont stockées sous forme de noms français (ex: `Ambre`)

## Avantages

1. **Lisibilité** : Plus facile de comprendre les couleurs en base de données
2. **Maintenance** : Plus simple de gérer les couleurs par nom
3. **Internationalisation** : Possibilité de traduire les noms de couleurs
4. **Cohérence** : Uniformisation avec l'interface utilisateur

## Étapes de Migration

### 1. Migration de la Base de Données

```bash
# Dans le dossier organaizer-backend
cd organaizer-backend

# Exécuter la migration de structure (optionnel si déjà fait)
npm run typeorm:migration:run

# Exécuter la migration des données
npm run migrate:colors
```

### 2. Vérification

Après la migration, vérifiez que :
- Les événements avec des couleurs hexadécimales ont été convertis en noms
- Les nouveaux événements utilisent des noms de couleurs
- L'interface utilisateur affiche correctement les couleurs

## Palette de Couleurs Disponibles

| Nom Français | Code Hexadécimal | Utilisation |
|--------------|------------------|-------------|
| Indigo | #4f46e5 | Couleur principale |
| Rouge | #ef4444 | Urgence, important |
| Orange | #f97316 | Attention |
| Ambre | #f59e0b | Avertissement |
| Émeraude | #10b981 | Succès, validation |
| Cyan | #06b6d4 | Information |
| Bleu | #3b82f6 | Neutre |
| Violet | #8b5cf6 | Créativité |
| Rose | #ec4899 | Personnel |
| Indigo Clair | #6366f1 | Variante |
| Turquoise | #14b8a6 | Calme |
| Citron Vert | #84cc16 | Énergie |
| Pourpre | #a855f7 | Luxe |
| Noir | #000000 | Formel |
| Gris Ardoise | #64748b | Neutre sombre |

## API Endpoints

### Récupérer la Palette Complète
```
GET /api/colors/palette
```

### Récupérer les Noms de Couleurs
```
GET /api/colors/names
```

### Récupérer les Codes Hexadécimaux
```
GET /api/colors/hex-codes
```

## Utilisation dans le Code

### Frontend

```javascript
import { getColorNameFromHex, getHexFromColorName } from '../utils/colorUtils';

// Convertir un code hex en nom
const colorName = getColorNameFromHex('#f59e0b'); // "Ambre"

// Convertir un nom en code hex
const hexCode = getHexFromColorName('Ambre'); // "#f59e0b"
```

### Backend

```typescript
import { getColorNameFromHex, getHexFromColorName } from '../utils/color.utils';

// Convertir un code hex en nom
const colorName = getColorNameFromHex('#f59e0b'); // "Ambre"

// Convertir un nom en code hex
const hexCode = getHexFromColorName('Ambre'); // "#f59e0b"
```

## Compatibilité

Le système est rétrocompatible :
- Les anciens codes hexadécimaux sont automatiquement convertis
- Les nouveaux événements utilisent des noms de couleurs
- L'interface utilisateur gère les deux formats

## Dépannage

### Problème : Les couleurs ne s'affichent pas correctement
**Solution :** Vérifiez que la migration a été exécutée et que les utilitaires de couleur sont correctement importés.

### Problème : Erreur lors de la migration
**Solution :** Vérifiez la connexion à la base de données et les permissions.

### Problème : Couleurs manquantes dans l'interface
**Solution :** Vérifiez que le ViewsPanel utilise les nouvelles fonctions de couleur.

## Support

Pour toute question ou problème, consultez :
1. Les logs de migration
2. Les utilitaires de couleur (`colorUtils.js` et `color.utils.ts`)
3. Le ViewsPanel pour l'affichage des couleurs
