# Plan d'Implémentation de la Gestion des Acteurs

## Analyse de la Structure Actuelle du Frontend

La structure actuelle du frontend suit ces modèles :

- **Composant App Principal** : Contient la logique du calendrier et la mise en page principale
- **Organisation des Composants** : 
  - `/components/common` : Composants UI partagés (Sidebar)
  - `/components/calendar` : Composants spécifiques au calendrier (CalendarToolbar)
  - `/components/actors` : Dossier vide prêt pour les composants d'acteurs
- **Pas d'Implémentation Redux** : Utilise actuellement l'état React dans App.js
- **Pas de Structure de Pages** : Toute l'UI est rendue dans App.js
- **Style** : Utilisation de Tailwind CSS pour les composants et CSS personnalisé pour FullCalendar

## Plan d'Implémentation

### Phase 1 : Configuration Redux et Modèles de Données 

1. **Installation des Dépendances**
   ```bash
   npm install @reduxjs/toolkit react-redux redux-persist
   ```

2. **Création de la Structure du Store Redux**
   - Créer `/src/redux/store.js`
   - Créer `/src/redux/slices/actorsSlice.js`
   - Créer `/src/redux/slices/groupsSlice.js`
   - Configurer redux-persist pour le stockage local

3. **Définition des Modèles de Données**
   - Modèle de base d'acteur avec propriétés partagées
   - Modèles Humain, Lieu et Objet étendant le modèle de base
   - Modèle de groupe avec gestion des membres

4. **Création du Service API Simulé**
   - Créer `/src/services/actorsService.js`
   - Créer `/src/services/groupsService.js`
   - Implémenter les opérations CRUD qui utilisent Redux

### Phase 2 : Interface de Liste et de Création d'Acteurs 

1. **Création des Composants de Base**
   - `/components/actors/ActorsPage.js` : Conteneur principal avec onglets
   - `/components/actors/ActorsList.js` : Liste filtrable et recherchable
   - `/components/actors/ActorCard.js` : Affichage individuel d'acteur
   - `/components/actors/ActorForm.js` : Formulaire de création/modification

2. **Implémentation des Opérations CRUD d'Acteur**
   - Créer un modal pour ajouter de nouveaux acteurs
   - Implémenter des formulaires spécifiques par type (Humain, Lieu, Objet)
   - Ajouter les fonctionnalités de modification et de suppression
   - Implémenter le filtrage par type d'acteur

3. **Mise à Jour de la Navigation dans la Sidebar**
   - Ajouter le routage vers la page Acteurs
   - Assurer une navigation correcte entre Calendrier et Acteurs

### Phase 3 : Interface de Gestion des Groupes 

1. **Création des Composants de Groupe**
   - `/components/actors/groups/GroupsList.js` : Liste des groupes
   - `/components/actors/groups/GroupForm.js` : Formulaire de création/modification
   - `/components/actors/groups/GroupMembers.js` : Gestion des membres

2. **Implémentation de l'Interface Drag and Drop**
   - Créer `/components/actors/groups/DragDropInterface.js`
   - Implémenter le glisser-déposer pour ajouter/retirer des acteurs des groupes
   - Ajouter des options de filtrage pour les acteurs disponibles

3. **Connecter les Groupes avec les Acteurs**
   - Mettre à jour Redux pour gérer l'appartenance aux groupes
   - Assurer des relations de données appropriées

### Phase 4 : Intégration et Peaufinage 

1. **Connexion avec le Calendrier**
   - Mettre à jour la création d'événement pour inclure la sélection d'acteurs
   - Afficher les acteurs associés dans les détails de l'événement

2. **Ajouter la Fonctionnalité de Téléchargement d'Images**
   - Implémenter le téléchargement de fichiers pour les photos d'acteurs
   - Ajouter la prévisualisation et le recadrage d'image

3. **Implémenter la Recherche et le Filtrage Avancé**
   - Ajouter une fonctionnalité de recherche globale
   - Implémenter des filtres combinés (type + autres attributs)

4. **Polissage de l'UI et Responsive**
   - Assurer un style cohérent avec Tailwind
   - Tester et optimiser pour différentes tailles d'écran

## Structure des Composants

```
/src
  /components
    /actors
      ActorsPage.js           # Conteneur principal avec onglets
      /list
        ActorsList.js         # Liste filtrable d'acteurs
        ActorCard.js          # Affichage individuel d'acteur
        ActorDetails.js       # Vue étendue des détails d'acteur
      /forms
        ActorForm.js          # Formulaire de base pour tous les types d'acteurs
        HumanForm.js          # Champs spécifiques aux humains
        LocationForm.js       # Champs spécifiques aux lieux
        ObjectForm.js         # Champs spécifiques aux objets
      /groups
        GroupsList.js         # Liste des groupes
        GroupForm.js          # Formulaire de création/modification de groupe
        GroupMembers.js       # Gestion des membres du groupe
        DragDropInterface.js  # Interface de glisser-déposer
  /redux
    store.js
    /slices
      actorsSlice.js
      groupsSlice.js
  /services
    actorsService.js
    groupsService.js
    uploadService.js          # Pour les téléchargements d'images
```

## Structure Redux

### actorsSlice.js

```javascript
// Structure exemple
{
  actors: {
    byId: {
      'actor1': {
        id: 'actor1',
        name: 'John Doe',
        type: 'human',
        photo: 'url/to/photo.jpg',
        firstName: 'John',
        lastName: 'Doe',
        role: 'Developer',
        email: 'john@example.com',
        phone: '123-456-7890'
      },
      'actor2': {
        id: 'actor2',
        name: 'Conference Room A',
        type: 'location',
        photo: 'url/to/room.jpg',
        address: '123 Main St, Floor 2'
      }
      // Plus d'acteurs...
    },
    allIds: ['actor1', 'actor2', ...],
    loading: false,
    error: null
  }
}
```

### groupsSlice.js

```javascript
// Structure exemple
{
  groups: {
    byId: {
      'group1': {
        id: 'group1',
        name: 'Development Team',
        description: 'All developers',
        members: ['actor1', 'actor3']
      }
      // Plus de groupes...
    },
    allIds: ['group1', ...],
    loading: false,
    error: null
  }
}
```

## Préparation pour l'Intégration Backend

La couche de services sera conçue pour faciliter la transition des données simulées vers de véritables appels API :

```javascript
// Structure exemple de actorsService.js
export const actorsService = {
  getActors: async () => {
    // Actuellement retourne depuis Redux
    // Sera remplacé par fetch('/api/actors')
    return store.getState().actors.allIds.map(id => store.getState().actors.byId[id]);
  },
  
  createActor: async (actor) => {
    // Actuellement dispatche vers Redux
    // Sera remplacé par fetch POST vers '/api/actors'
    store.dispatch(addActor(actor));
    return actor;
  }
  
  // Autres méthodes...
}
```

Cette approche permettra une transition en douceur vers le backend FastAPI lorsqu'il sera prêt, avec des changements minimaux dans le code des composants.
