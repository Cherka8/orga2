# Vue des Événements d'un Acteur

## 1. Introduction

La fonctionnalité "Vue des Événements d'un Acteur" permet aux utilisateurs de sélectionner un acteur spécifique (de type humain) et de visualiser tous les événements auxquels cet acteur est associé, que ce soit directement ou via son appartenance à un groupe participant.

Cette vue est principalement orchestrée par le composant `ActorEventsView.js`, qui utilise deux sous-composants principaux :
*   `SelectableActorList.js` : Pour afficher une liste filtrable d'acteurs et gérer la sélection.
*   `ActorEventList.js` : Pour afficher la liste des événements de l'acteur sélectionné.

## 2. Analyse des Composants Frontend

### 2.1. `SelectableActorList.js`

*   **Fichier :** `frontend/src/components/actors/SelectableActorList.js`
*   **Rôle :** Ce composant est responsable de l'affichage d'une liste interactive d'acteurs. Il permet à l'utilisateur de rechercher et de sélectionner un acteur dans cette liste.

*   **Props du Composant :**
    *   `actors (Array<Object>)` : Tableau des objets acteurs (généralement des acteurs humains pré-filtrés) à afficher.
    *   `selectedActorId (String | null)` : L'ID de l'acteur actuellement sélectionné, utilisé pour la mise en évidence visuelle.
    *   `onSelectActor (Function)` : Fonction de rappel invoquée avec l'ID de l'acteur lorsqu'un acteur est cliqué.
    *   `searchTerm (String)` : La chaîne de caractères actuelle du champ de recherche.
    *   `onSearchChange (Function)` : Fonction de rappel invoquée lorsque la valeur du champ de recherche est modifiée par l'utilisateur.

*   **État Interne :** Ce composant est principalement contrôlé et ne gère pas d'état interne complexe lié à la logique métier.

*   **Fonctionnalités Clés :**
    *   Affichage de chaque acteur avec sa photo (ou ses initiales), son nom complet et son rôle.
    *   Barre de recherche pour filtrer la liste (la logique de filtrage est gérée par le composant parent).
    *   Mise en surbrillance visuelle de l'acteur sélectionné.
    *   Gestion de l'affichage pour les cas où aucun acteur n'est disponible ou si la recherche ne retourne aucun résultat.
    *   Utilisation de `react-i18next` pour l'internationalisation des textes.

*   **Interaction :**
    *   Reçoit la liste des acteurs (`actors`) et l'ID de l'acteur sélectionné (`selectedActorId`) de son parent (`ActorEventsView`).
    *   Informe le composant parent des actions de l'utilisateur via les callbacks `onSelectActor` et `onSearchChange`.

### 2.2. `ActorEventList.js`

*   **Fichier :** `frontend/src/components/actors/ActorEventList.js`
*   **Rôle :** Ce composant est dédié à l'affichage d'une liste d'événements. Il prend un tableau d'événements en entrée et les présente de manière lisible.

*   **Props du Composant :**
    *   `events (Array<Object>)` : Tableau des objets événements à afficher. Par défaut à `[]`.

*   **État Interne :** Aucun état interne significatif.

*   **Fonctionnalités Clés :**
    *   Tri des événements par date de début (`event.start`) dans l'ordre décroissant (les plus récents en premier).
    *   Affichage des détails de chaque événement :
        *   Titre (`event.title`).
        *   Heures de début et de fin (formatées via `formatTime` de `timeUtils.js`).
        *   Date (formatée via `formatDate` de `timeUtils.js`).
        *   Lieu (`event.extendedProps.location.name`), si disponible.
        *   Description (`event.extendedProps.description`), si disponible.
    *   Utilisation de couleurs distinctes pour chaque carte d'événement (soit à partir de `event.backgroundColor`, soit d'une palette prédéfinie).
    *   Affiche un message informatif si la liste `events` est vide.
    *   Utilisation de `date-fns` pour l'analyse des dates et `react-i18next` pour l'internationalisation et la gestion de la locale pour le formatage des dates/heures.

*   **Interaction :**
    *   Purement présentationnel. Reçoit la liste des événements à afficher de son parent (`ActorEventsView`).

### 2.3. `ActorEventsView.js`

*   **Fichier :** `frontend/src/components/actors/ActorEventsView.js`
*   **Rôle :** Composant principal qui orchestre la vue des événements d'un acteur. Il gère la sélection de l'acteur, récupère les données nécessaires depuis Redux, filtre les événements pertinents et les transmet aux composants d'affichage.

*   **Props du Composant :** Aucune (conçu comme une vue de page).

*   **État Interne :**
    *   `selectedActorId (String | null)` : Stocke l'ID de l'acteur actuellement sélectionné par l'utilisateur.
    *   `searchTerm (String)` : Stocke le terme de recherche saisi par l'utilisateur pour filtrer la liste des acteurs.

*   **Sources de Données (Redux via `useSelector`) :**
    *   `selectAllActors` : Pour obtenir la liste de tous les acteurs.
    *   `selectEvents` : Pour obtenir la liste de tous les événements.
    *   `selectGroupsByIdMap` : Pour obtenir une map des groupes par leur ID, utilisée pour vérifier l'appartenance d'un acteur à un groupe.

*   **Logique Dérivée (Calculs mémoïsés avec `useMemo`) :**
    *   `humanActors`: Filtre `allActors` pour ne conserver que les acteurs de type `ACTOR_TYPES.HUMAN`.
    *   `filteredActors`: Filtre `humanActors` en fonction du `searchTerm` (recherche sur prénom, nom, et rôle).
    *   `selectedActor`: Récupère l'objet acteur complet correspondant au `selectedActorId`.
    *   `actorEvents`: C'est la logique centrale de cette vue. Elle filtre `allEvents` pour ne retourner que les événements auxquels l'acteur sélectionné participe. Un acteur est considéré comme participant si :
        1.  Il est listé directement dans `event.extendedProps.participants` avec `type === ACTOR_TYPES.HUMAN`.
        2.  OU, il est membre d'un groupe qui est listé dans `event.extendedProps.participants` avec `type === ACTOR_TYPES.GROUP`. La fonction `isActorInGroup` (définie avec `useCallback`) est utilisée ici.

*   **Fonctionnalités Clés :**
    *   Structure l'interface en deux colonnes : `SelectableActorList` à droite et la liste des événements (`ActorEventList`) avec un en-tête pour l'acteur sélectionné à gauche.
    *   Gère la logique de recherche et de sélection d'acteur.
    *   Sélectionne automatiquement le premier acteur de la liste `filteredActors` si aucun `selectedActorId` n'est défini ou si l'acteur précédemment sélectionné n'est plus dans la liste filtrée.
    *   Affiche les informations de l'acteur sélectionné (photo/initiales, nom, rôle) dans un en-tête au-dessus de la liste des événements.

*   **Interaction :**
    *   Transmet `filteredActors`, `selectedActorId`, `searchTerm` et les fonctions de rappel `handleSelectActor`, `handleSearchChange` à `SelectableActorList`.
    *   Transmet la liste `actorEvents` (événements filtrés) à `ActorEventList`.

## 3. Flux de Données

1.  L'utilisateur arrive sur la vue `ActorEventsView`.
2.  Les données (acteurs, événements, groupes) sont chargées depuis le store Redux.
3.  `ActorEventsView` filtre les acteurs humains et, si aucun acteur n'est sélectionné, sélectionne le premier de la liste filtrée par défaut.
4.  L'utilisateur peut interagir avec `SelectableActorList` :
    *   **Recherche :** Saisit un terme dans le champ de recherche. `onSearchChange` est appelée, `ActorEventsView` met à jour son `searchTerm`, ce qui recalcule `filteredActors` et met à jour la liste affichée par `SelectableActorList`.
    *   **Sélection :** Clique sur un acteur dans la liste. `onSelectActor` est appelée, `ActorEventsView` met à jour son `selectedActorId`.
5.  Suite à un changement de `selectedActorId` ou des données `allEvents` / `groupsById`, `ActorEventsView` recalcule la liste `actorEvents`.
6.  `ActorEventList` reçoit la nouvelle liste `actorEvents` et met à jour l'affichage des événements.

## 4. Implications pour le Backend

Pour que cette fonctionnalité opère correctement, le backend doit fournir les données suivantes via des endpoints API :

*   **Endpoint `/api/actors` (ou similaire) :**
    *   **Rôle :** Fournir la liste complète des acteurs.
    *   **Données par acteur :** `id`, `type` (e.g., `HUMAN`, `LOCATION`, `OBJECT`), `firstName`, `lastName`, `role`, `photo` (URL).

*   **Endpoint `/api/events` (ou similaire) :**
    *   **Rôle :** Fournir la liste complète des événements.
    *   **Données par événement :**
        *   `id` (unique)
        *   `title` (String)
        *   `start` (String, format ISO 8601, e.g., "2023-10-27T10:00:00Z")
        *   `end` (String, format ISO 8601)
        *   `backgroundColor` (String, optionnel, couleur hex ou nom CSS)
        *   `extendedProps` (Object) :
            *   `location` (Object | null) : Si un lieu est associé, `{ id: String, name: String, type: 'LOCATION' }`.
            *   `participants` (Array<Object>) : Liste des participants à l'événement. Chaque participant doit avoir au minimum :
                *   `id` (String) : ID de l'acteur ou du groupe.
                *   `type` (String) : Type de participant (e.g., `ACTOR_TYPES.HUMAN`, `ACTOR_TYPES.GROUP`). Ceci est crucial pour que le frontend puisse distinguer un acteur individuel d'un groupe.
            *   `description` (String | null) : Description de l'événement.

*   **Endpoint `/api/groups` (ou similaire) :**
    *   **Rôle :** Fournir la liste complète des groupes.
    *   **Données par groupe :**
        *   `id` (unique)
        *   `name` (String)
        *   `members` (Array<String>) : Tableau des ID des acteurs membres de ce groupe.

**Considérations supplémentaires pour le backend :**
*   **Performance :** Actuellement, toute la logique de filtrage des événements pour un acteur spécifique (incluant la résolution de l'appartenance aux groupes) est effectuée côté client. Pour des applications avec un très grand nombre d'événements, d'acteurs ou de groupes, cela pourrait impacter les performances. Une optimisation future pourrait impliquer la création d'un endpoint backend dédié, par exemple `/api/actors/{actorId}/events`, qui retournerait directement les événements pertinents pour un acteur donné, en encapsulant la logique de participation directe et via groupe.
*   **Cohérence des Données :** Il est vital que les ID référencés (ID d'acteurs dans les groupes, ID d'acteurs/groupes dans les participants d'événements, ID de lieux) soient cohérents à travers la base de données.

## 5. Résumé

La fonctionnalité de "Vue des Événements d'un Acteur" offre un moyen puissant pour les utilisateurs de suivre l'implication d'un acteur spécifique dans les activités planifiées. Elle repose sur une architecture frontend claire où `ActorEventsView` agit comme un conteneur intelligent, gérant l'état et la logique, tandis que `SelectableActorList` et `ActorEventList` se concentrent sur la présentation. Le backend doit fournir des données structurées et complètes pour alimenter cette vue efficacement.
