# Suivi du Temps des Acteurs

Ce document détaille l'analyse du frontend pour la fonctionnalité de suivi du temps des acteurs dans OrganAIzer, principalement basée sur le composant `TimeView.js`.

## 1. Frontend : Vue de Suivi du Temps (`TimeView.js`)

### 1.1. Objectif du Composant

Le composant `TimeView.js` (situé dans `frontend/src/components/actors/TimeView.js`) a pour objectif de permettre aux utilisateurs de visualiser et d'analyser le temps total passé par les acteurs (spécifiquement les humains) en fonction de leur participation à des événements planifiés dans le calendrier. 

Il offre les fonctionnalités suivantes :
*   Affichage d'une liste d'acteurs humains avec leur temps total calculé sur une période donnée.
*   Présentation d'un graphique (via le composant enfant `ActorHoursChart`) pour visualiser les heures des acteurs sélectionnés.
*   Mécanismes de recherche et de sélection/désélection d'acteurs pour affichage dans le graphique.
*   Filtres par période (date de début et date de fin) pour restreindre les calculs de temps à un intervalle spécifique.

### 1.2. Analyse Détaillée du Composant

#### 1.2.1. Sources de Données (Redux)

Le composant s'appuie sur le store Redux pour récupérer les données brutes nécessaires aux calculs :
*   `events = useSelector(selectEvents)`: La liste complète de tous les événements.
*   `actorsById = useSelector(selectActorsByIdMap)`: Une map des acteurs, indexée par leur ID.
*   `groupsById = useSelector(selectGroupsByIdMap)`: Une map des groupes, indexée par leur ID.

#### 1.2.2. État Local Géré

Plusieurs états locaux sont gérés via `useState` :
*   `selectedActorIdsForChart (array)`: Contient les IDs des acteurs qui ont été sélectionnés pour être inclus dans le graphique.
*   `searchTerm (string)`: Le terme de recherche utilisé pour filtrer la liste des acteurs.
*   `startDate (Date | null)`: La date de début de la période de filtrage.
*   `endDate (Date | null)`: La date de fin de la période de filtrage.

#### 1.2.3. Logique Principale et Calculs (Optimisés avec `useMemo`)

La transformation des données brutes en informations affichables est effectuée via plusieurs étapes mémorisées :

1.  **`humanActors`**: Uniquement les acteurs de type "humain" sont extraits de `actorsById` (via `getHumanActors` depuis `timeUtils.js`).
2.  **`actorsWithHours`**: C'est l'étape de calcul principale. Pour chaque acteur humain, la fonction `calculateActorHours(actor.id, events, groupsById, startDate, endDate)` (issue de `utils/timeUtils.js`) est appelée. Cette fonction externe est responsable de sommer les durées des événements auxquels l'acteur a participé (directement ou via un groupe) pendant la période `startDate` - `endDate`. Le résultat est un tableau d'objets acteurs, chacun enrichi des propriétés `totalHours` (temps en millisecondes) et `totalHoursFormatted` (chaîne de caractères lisible).
3.  **`filteredActorsWithHours`**: La liste `actorsWithHours` est ensuite filtrée en fonction du `searchTerm` pour affiner la liste des acteurs affichée.
4.  **`selectedActorsForChart`**: La liste `actorsWithHours` est filtrée pour ne conserver que les acteurs dont l'ID est présent dans `selectedActorIdsForChart`. Ce sous-ensemble est ensuite passé au composant `ActorHoursChart` pour le rendu graphique.

#### 1.2.4. Interactions Utilisateur

Le composant gère plusieurs interactions :
*   `handleActorSelect(actorId)`: Ajoute ou retire un `actorId` de `selectedActorIdsForChart`.
*   `handleSearchChange(event)`: Met à jour l'état `searchTerm`.
*   `handleSelectAll(selectAll)`: Permet de sélectionner ou désélectionner tous les acteurs actuellement visibles dans la liste filtrée.
*   Sélection des dates `startDate` et `endDate` via des composants `DatePicker` de `react-datepicker`.

#### 1.2.5. Composants Enfants Clés

*   `ActorTimeList`: Responsable de l'affichage de la liste des acteurs (`filteredActorsWithHours`) avec leur temps calculé. Il gère également la partie UI de la recherche et de la sélection des acteurs.
*   `ActorHoursChart`: Prend en entrée `selectedActorsForChart` et affiche le graphique correspondant.

### 1.3. Implications pour le Backend

Actuellement, la conception de `TimeView.js` suggère les points suivants pour le backend :

*   **Calculs Principalement Côté Frontend**: La logique de calcul du temps total par acteur est intégralement gérée côté client, au sein de la fonction `calculateActorHours` (dans `frontend/src/utils/timeUtils.js`).
*   **Pas d'Endpoints d'Agrégation Spécifiques Requis (Initialement)**: Le backend doit "simplement" fournir des endpoints robustes pour récupérer la totalité des données nécessaires : la liste complète des événements (avec détails des participants, y compris les groupes et leurs membres), la liste des acteurs, et la liste des groupes. Le frontend se charge ensuite de croiser et d'agréger ces informations.
*   **Considérations de Performance Futures**: Si le volume de données (nombre d'événements, d'acteurs, de groupes) devient très important, les calculs effectués par le client pourraient entraîner des lenteurs. Dans un tel scénario, il pourrait devenir nécessaire de déporter une partie de la logique d'agrégation (par exemple, le calcul des heures par acteur sur une période donnée) vers le backend via des endpoints API dédiés.

### 1.4. Analyse Détaillée de `utils/timeUtils.js`

Le fichier `frontend/src/utils/timeUtils.js` contient la logique métier essentielle pour le calcul du temps. Les fonctions clés sont :

*   **`getHumanActors(actorsState)`**: Filtre la liste globale des acteurs pour ne conserver que ceux de type `ACTOR_TYPES.HUMAN`. Seuls ces acteurs sont pris en compte pour le suivi du temps.

*   **`calculateEventDuration(event)`**: Calcule la durée brute d'un événement en millisecondes, basée sur ses propriétés `start` et `end`. Retourne `0` si les dates sont invalides ou si la durée est négative.

*   **`formatDuration(ms)`**: Convertit une durée en millisecondes en une chaîne de caractères formatée et lisible (ex: "2h 15m").

*   **`filterEventsByDateRange(events, startDate, endDate)`**: Prend une liste d'événements et la filtre pour ne retourner que ceux dont la date de début (`event.start`) est comprise dans l'intervalle `[startDate, endDate]`. Les dates `startDate` et `endDate` sont considérées comme le début et la fin de la journée respective pour le filtrage.

*   **`calculateActorHours(actorId, events, groupsById, startDate = null, endDate = null)`**: C'est la fonction centrale qui calcule le temps total pour un acteur spécifique sur une période donnée.
    1.  **Filtrage Initial des Événements**: Si `startDate` et `endDate` sont fournies, la liste `events` est d'abord filtrée en utilisant une logique similaire à `filterEventsByDateRange` pour ne considérer que les événements pertinents pour la période.
    2.  **Itération et Sommation**: La fonction itère ensuite sur chaque événement filtré.
        *   Pour chaque événement, elle détermine si l'`actorId` y participe. La participation est avérée si :
            *   L'acteur est listé comme participant direct dans `event.extendedProps.participants` (et son type n'est pas 'group').
            *   OU, un des participants listés dans `event.extendedProps.participants` est un groupe, et l'`actorId` est membre de ce groupe (vérifié via `groupsById`).
        *   Si l'acteur participe à l'événement (directement ou via un groupe), la durée de cet événement (obtenue via `calculateEventDuration`) est ajoutée à un compteur total pour l'acteur.
    3.  **Retour**: La fonction retourne la somme totale des durées (en millisecondes) des événements auxquels l'acteur a participé pendant la période spécifiée.

#### Règles Métier Implicites dans les Calculs :

*   Un acteur est crédité de la **durée totale** de chaque événement auquel il participe.
*   Si un acteur participe à un événement à la fois directement et via un groupe, la durée de l'événement est comptabilisée **une seule fois** pour cet acteur.
*   Les calculs se basent sur les heures de début et de fin précises des événements.
*   Le filtre de période s'applique à la date de **début** de l'événement. Un événement commençant dans la période mais se terminant après sera compté pour sa durée totale.
