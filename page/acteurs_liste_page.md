# Documentation Page de Liste et Gestion des Acteurs

## 1. Composant Principal : `ActorsPage.js`

*   **Emplacement :** `frontend/src/components/actors/ActorsPage.js`

### 1.1. But Principal
    *   Servir de conteneur principal pour la section de gestion des acteurs.
    *   Gérer la navigation entre différents onglets (Liste d'acteurs, Groupes, Time, Events, Share) via des paramètres d'URL (`?tab=...`).
    *   Afficher la barre d'outils (`ActorsToolbar`) pour les actions communes (changement d'onglet, filtres, recherche, ajout d'acteur).
    *   Afficher le contenu de l'onglet actif :
        *   `ActorsList` pour l'onglet "actors".
        *   `GroupsTab` pour l'onglet "groups".
        *   `TimeView` pour l'onglet "time".
        *   `ActorEventsView` pour l'onglet "events".
        *   `ShareView` pour l'onglet "share".
    *   Gérer l'ouverture et la fermeture de la modale `ActorFormModal` pour l'ajout et la modification d'acteurs.

### 1.2. Analyse du Code
    *   **Hooks :** `useState`, `useEffect`, `useDispatch`, `useSelector`, `useLocation`, `useNavigate`.
    *   **Composants Importés Clés :** `ActorsToolbar`, `ActorsList`, `GroupsTab`, `ActorFormModal`, `TimeView`, `ActorEventsView`, `ShareView`.
    *   **État Interne :** `activeTab` (dérivé de l'URL), `isModalOpen`, `currentActorType`, `editingActor`, `tabFading`.
    *   **Logique Clé :**
        *   `handleTabChange` : Met à jour l'URL, gère l'animation de fondu.
        *   `handleFilterChange`, `handleSearch` : Dispatchent les actions Redux `setTypeFilter`, `setSearchFilter`.
        *   `handleAddActor`, `handleEditActor`, `handleCloseModal` : Gèrent l'ouverture/fermeture et le contexte de `ActorFormModal`.
    *   **Rendu :** Affiche `ActorsToolbar`, puis conditionnellement le composant de l'onglet actif (`ActorsList`, `GroupsTab`, etc.), et enfin `ActorFormModal` si nécessaire.

### 1.3. Interaction avec Redux
    *   Récupère `filteredActors` via `selectFilteredActors`.
    *   Dispatch `setTypeFilter` et `setSearchFilter`.

## 2. Composant de Liste : `ActorsList.js`

*   **Emplacement :** `frontend/src/components/actors/list/ActorsList.js`

### 2.1. But Principal
    *   Afficher la liste des acteurs (passés en props) sous forme de cartes (`ActorCard`).
    *   Gérer l'affichage d'une modale de détails (`ActorDetailsModal`) lorsqu'un acteur est sélectionné pour consultation.
    *   Permettre la suppression d'un acteur (avec confirmation).
    *   Déléguer l'action de modification à la fonction `onEditActor` passée en props (qui est `handleEditActor` de `ActorsPage.js`).

### 2.2. Analyse du Code
    *   **Props Reçues :**
        *   `actors` (array) : La liste des acteurs à afficher.
        *   `onEditActor` (function) : Callback appelé lorsqu'on clique sur "modifier" un acteur.
    *   **Hooks :** `useState` (pour `selectedActor`), `useDispatch`, `useTranslation`.
    *   **Composants Importés Clés :**
        *   `ActorCard` : Composant pour afficher un acteur individuel.
        *   `ActorDetailsModal` : Modale pour afficher les détails complets d'un acteur.
    *   **État Interne :**
        *   `selectedActor` (object) : L'acteur dont les détails sont actuellement affichés dans `ActorDetailsModal`. `null` si aucune modale de détails n'est ouverte.
    *   **Logique Clé :**
        *   `handleDeleteActor(actorId)` : Demande une confirmation (`window.confirm`), puis dispatch l'action Redux `deleteActor(actorId)`.
        *   `handleViewDetails(actor)` : Met à jour `selectedActor` pour ouvrir `ActorDetailsModal`.
        *   `handleCloseModal()` : Réinitialise `selectedActor` à `null` pour fermer la modale de détails.
    *   **Rendu :**
        *   Si `actors.length === 0`, affiche un message "No actors found".
        *   Sinon, mappe sur la liste `actors` et rend un composant `ActorCard` pour chaque acteur.
            *   `ActorCard` reçoit l'acteur et les callbacks `onViewDetails`, `onEdit` (qui appelle `onEditActor` de la prop), et `onDelete`.
        *   Affiche `ActorDetailsModal` si `selectedActor` n'est pas `null`.

### 2.3. Interaction avec Redux
    *   Dispatch `deleteActor` pour supprimer un acteur.
    *   Les acteurs affichés (`actors` prop) proviennent de `ActorsPage.js`, qui les obtient via `useSelector(selectFilteredActors)`.

## 3. Composant Carte : `ActorCard.js`

*   **Emplacement :** `frontend/src/components/actors/list/ActorCard.js`

### 3.1. But Principal
    *   Afficher une représentation concise d'un acteur unique dans une liste.
    *   Adapter son apparence (icône, couleur, titre) en fonction du type d'acteur (Humain, Lieu).
    *   Fournir des boutons d'action pour "Voir Détails", "Modifier", et "Supprimer" l'acteur.

### 3.2. Analyse du Code
    *   **Props Reçues :**
        *   `actor` (object) : L'objet acteur contenant ses informations.
        *   `onViewDetails` (function) : Callback pour afficher les détails de l'acteur.
        *   `onEdit` (function) : Callback pour initier la modification de l'acteur.
        *   `onDelete` (function) : Callback pour initier la suppression de l'acteur.
    *   **Hooks :** `useTranslation`.
    *   **Composants Importés :** Icônes de `@heroicons/react/24/outline` (`EyeIcon`, `PencilIcon`, `TrashIcon`).
    *   **Logique Clé :**
        *   `getActorTitle()` : Retourne `firstName lastName` pour les humains, `name` pour les lieux.
        *   `getActorIcon()` : Retourne un SVG d'icône différent pour Humain et Lieu.
        *   `getCardColor()` : Retourne des classes Tailwind CSS pour la couleur de fond/bordure de la carte, spécifique au type.
        *   `getBadgeColor()` : Retourne des classes Tailwind CSS pour la couleur du badge de type, spécifique au type.
    *   **Rendu :**
        *   Un `div` principal stylisé avec `getCardColor()`.
        *   Affiche l'icône de l'acteur (`getActorIcon()`) et le titre (`getActorTitle()`).
        *   Affiche un badge avec le type d'acteur traduit (ex: "Humain", "Lieu") stylisé avec `getBadgeColor()`.
        *   Affiche trois boutons d'action avec les icônes respectives, chacun appelant les callbacks `onViewDetails`, `onEdit`, ou `onDelete`.

### 3.3. Internationalisation
    *   Utilise `useTranslation` pour afficher le type d'acteur (`t('actorTypes.${actor.type}')`) et les `aria-label` des boutons.


## 4. Modale de Détails : `ActorDetailsModal.js`

*   **Emplacement :** `frontend/src/components/actors/details/ActorDetailsModal.js`

### 4.1. But Principal
    *   Afficher une vue détaillée des informations d'un acteur spécifique dans une interface modale.
    *   Permettre la fermeture de la modale en cliquant à l'extérieur, en appuyant sur la touche "Echap", ou via un bouton "Fermer".
    *   Adapter l'affichage des champs en fonction du type d'acteur (Humain ou Lieu).

### 4.2. Analyse du Code
    *   **Props Reçues :**
        *   `actor` (object) : L'objet acteur complet dont les détails doivent être affichés.
        *   `onClose` (function) : Callback pour fermer la modale.
    *   **Hooks :** `useRef` (pour `modalRef`), `useEffect` (pour gérer les écouteurs d'événements de fermeture), `useTranslation`.
    *   **Composants Importés :** Aucun composant enfant spécifique autre que les éléments HTML/SVG pour les icônes.
    *   **Logique Clé :**
        *   **Gestion de la Fermeture :**
            *   `useEffect` met en place et nettoie des écouteurs d'événements pour `mousedown` (clic extérieur) et `keydown` (touche Echap) pour appeler `onClose`.
        *   **Affichage Dynamique (similaire à `ActorCard.js`) :**
            *   `getActorTitle()` : Détermine le titre de la modale (Nom complet pour Humain, Nom du lieu pour Lieu).
            *   `getActorIcon()` : Fournit l'icône appropriée pour l'en-tête.
            *   `getBadgeColor()` : Fournit la couleur pour le badge de type dans l'en-tête.
        *   **Rendu Conditionnel des Champs :**
            *   Le corps de la modale affiche des sections et des champs différents en fonction de `actor.type`.
            *   **Pour Humain (`ACTOR_TYPES.HUMAN`) :**
                *   Affiche la photo (avec fallback), Prénom, Nom, Rôle.
                *   Section "Coordonnées" : Email, Téléphone.
            *   **Pour Lieu (`ACTOR_TYPES.LOCATION`) :**
                *   Affiche la photo (avec fallback).
                *   Section "Informations sur le Lieu" : Nom du Lieu, Adresse.
    *   **Structure du Rendu (JSX) :**
        *   Structure de modale classique avec un fond semi-transparent.
        *   En-tête de la modale avec icône, titre, et badge de type.
        *   Corps de la modale avec les champs d'information rendus conditionnellement.
        *   Pied de page de la modale avec un bouton "Fermer".

### 4.3. Internationalisation
    *   Utilise `useTranslation` pour les libellés des champs (`t('actorDetailsModal.fields.email')`), les titres de section, le texte du bouton "Fermer", et les messages de fallback d'image.

### 4.4. Interaction avec le Backend
    *   Principalement pour l'affichage des données. Si les données de `actor` passées en prop sont suffisantes, aucun appel backend direct n'est fait par cette modale.
    *   Si des détails plus complets étaient nécessaires (non présents dans l'objet `actor` initial de la liste), un `GET /api/actors/:id` pourrait être envisagé ici, mais ce n'est pas le cas actuellement d'après le code.

## 5. Barre d'Outils : `ActorsToolbar.js`

*   **Emplacement :** `frontend/src/components/actors/ActorsToolbar.js`

### 5.1. But Principal
    *   Fournir la navigation principale par onglets au sein de la section Acteurs (`Actors`, `Groups`, `Time`, `Events`, `Share`).
    *   Afficher des contrôles contextuels (boutons d'ajout, filtres, barre de recherche) en fonction de l'onglet actif.
    *   Permettre à l'utilisateur d'initier l'ajout de nouveaux acteurs (Humains, Lieux) ou groupes.
    *   Permettre le filtrage de la liste des acteurs par type.
    *   Permettre la recherche textuelle dans la liste des acteurs.

### 5.2. Analyse du Code
    *   **Props Reçues :**
        *   `activeTab` (string) : L'onglet actuellement sélectionné.
        *   `onTabChange` (function) : Callback pour changer l'onglet actif.
        *   `onFilterChange` (function) : Callback pour appliquer un filtre de type d'acteur.
        *   `onSearch` (function) : Callback pour exécuter une recherche textuelle.
        *   `onAddActor` (function) : Callback pour initier l'ajout d'un acteur (déclenche l'ouverture de `ActorFormModal`).
    *   **State :**
        *   `searchText` (string) : Gère la valeur actuelle du champ de recherche.
    *   **Hooks :** `useState` (pour `searchText`), `useTranslation`, `useSelector` (pour lire `currentFilter` de Redux).
    *   **Composants Importés :** `PlusCircleIcon` de `@heroicons/react/24/solid`.
    *   **Logique Clé :**
        *   **Gestion des Onglets :** Des boutons sont rendus pour chaque onglet. Le style de l'onglet actif est différent. Le clic sur un onglet appelle `onTabChange(tabName)`.
        *   **Boutons d'Ajout Conditionnels :**
            *   Si `activeTab === 'actors'`, les boutons "Ajouter Humain" et "Ajouter Lieu" sont affichés. Ils appellent `onAddActor(ACTOR_TYPES.HUMAN)` ou `onAddActor(ACTOR_TYPES.LOCATION)`.
            *   Si `activeTab === 'groups'`, un bouton "Ajouter Groupe" est affiché (sa logique de clic n'est pas complètement détaillée dans ce snippet, mais on s'attendrait à ce qu'il appelle une fonction similaire à `onAddGroup`).
        *   **Filtres Conditionnels :**
            *   Si `activeTab === 'actors'`, des boutons de filtre ("Tous", "Humains", "Lieux") sont affichés. Le style du filtre actif (basé sur `currentFilter` de Redux) est différent. Le clic appelle `onFilterChange(filterType)`.
        *   **Recherche Conditionnelle :**
            *   Si `activeTab === 'actors'`, un champ de recherche est affiché. La modification de sa valeur met à jour `searchText` et appelle `onSearch(text)`.
    *   **Structure du Rendu (JSX) :**
        *   Un `div` conteneur principal.
        *   Une section supérieure avec le titre de la page et les boutons d'ajout.
        *   Une section inférieure avec les boutons d'onglets et, conditionnellement, les filtres et la barre de recherche.

### 5.3. Internationalisation
    *   Utilise `useTranslation` pour le titre (`t('actorsToolbar.title')`), les libellés des boutons d'ajout (`t('actorsToolbar.addHuman')`), les noms d'onglets (`t('actorsToolbar.tabs.actors')`), les libellés de filtres (`t('actorsToolbar.filters.all')`), et le placeholder de la recherche.

### 5.4. Interaction avec Redux
    *   `useSelector(state => state.actors.filter.type)` est utilisé pour récupérer `currentFilter` afin de styliser correctement le bouton de filtre actif. Les actions de filtrage elles-mêmes (`onFilterChange`) sont gérées par `ActorsPage.js` qui dispatche l'action Redux.

### 5.5. Interaction avec d'autres Composants
    *   Ce composant est un enfant direct de `ActorsPage.js`.
    *   Il communique avec `ActorsPage.js` via les callbacks passés en props (`onTabChange`, `onFilterChange`, `onSearch`, `onAddActor`).
    *   L'appel à `onAddActor` dans `ActorsPage.js` est responsable d'ouvrir `ActorFormModal.js`.

## 6. Considérations pour le Backend (NestJS & MySQL) - Lister, Supprimer

En plus des endpoints `POST` et `PUT` (pour la création/modification via `ActorFormModal` gérée par `ActorsPage`), cette vue de liste nécessitera principalement :

*   **`GET /api/actors` :**
    -   Pour récupérer la liste complète des acteurs.
    -   Doit supporter la pagination.
    -   Doit supporter le filtrage par `type` (envoyé en query param, ex: `?type=human`).
    -   Doit supporter la recherche textuelle (envoyé en query param, ex: `?search=John`). Le backend devra déterminer sur quels champs effectuer la recherche (nom, email, rôle, etc.).
    -   Doit supporter le tri par différentes colonnes (ex: `?sortBy=lastName&order=asc`).

*   **`DELETE /api/actors/:id` :**
    -   Pour supprimer un acteur spécifique. L'action Redux `deleteActor` devra appeler cet endpoint.

*   **`GET /api/actors/:id` :**
    -   Pourrait être utilisé par `ActorDetailsModal` si elle a besoin de charger des informations plus complètes que celles déjà disponibles dans la liste initiale.

