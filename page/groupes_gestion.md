# Gestion des Groupes d'Acteurs

Ce document détaille la fonctionnalité de gestion des groupes d'acteurs dans l'application OrganAIzer, en se concentrant sur les composants frontend et les implications backend nécessaires.

## 1. Point d'Entrée : `ActorsPage.js`

Lorsque l'utilisateur navigue vers l'onglet "Groups" (accessible via `/actors?tab=groups`), le composant `ActorsPage.js` est responsable de l'affichage du contenu approprié.

Comme vu dans son code, si `activeTab` est égal à `'groups'`, le composant `<GroupsTab />` (situé dans `frontend/src/components/actors/groups/GroupsTab.js`) est rendu.

Les sections suivantes analyseront `GroupsTab.js` et ses sous-composants pour documenter la création, la visualisation, la modification et la gestion des membres des groupes.

## 2. Composant Principal de l'Onglet : `GroupsTab.js`

*   **Emplacement :** `frontend/src/components/actors/groups/GroupsTab.js`

### 2.1. But Principal
    *   Servir de conteneur principal pour toute la fonctionnalité de gestion des groupes.
    *   Coordonner l'affichage de la liste des groupes, le formulaire de création/modification de groupe, et la zone d'affichage/gestion des membres du groupe sélectionné.
    *   Gérer la logique de sélection d'un groupe, et l'ouverture/fermeture du formulaire de groupe.

### 2.2. Analyse du Code
    *   **Layout :**
        *   Un panneau de gauche (1/3 de la largeur) affichant `GroupsList.js` et un bouton "Ajouter un Groupe".
        *   Un panneau de droite (2/3 de la largeur) affichant `GroupMembers.js` si un groupe est sélectionné, sinon un message invitant à sélectionner ou créer un groupe.
    *   **State Management :**
        *   **Redux :**
            *   Récupère `groups` via `useSelector(selectAllGroups)`.
            *   Récupère `actors` via `useSelector(selectAllActors)` (pour `GroupMembers`).
            *   Récupère `selectedGroup` et ses détails.
            *   Dispatch les actions: `addGroup`, `updateGroup`, `deleteGroup`, `selectGroupAction` (de `groupsSlice`).
        *   **Local State (`useState`) :**
            *   `isFormOpen` (boolean) : Contrôle la visibilité de la modale contenant `GroupForm`.
            *   `editingGroup` (object | null) : Stocke le groupe en cours d'édition ou `null` pour une création.
    *   **Composants Enfants Clés :**
        *   `GroupsList.js` : Affiche la liste des groupes et gère les actions de sélection, édition et suppression d'un groupe de la liste.
        *   `GroupForm.js` : Formulaire modal pour la création et la modification des informations d'un groupe (nom, description, photo).
        *   `GroupMembers.js` : Affiche les acteurs membres du groupe sélectionné et permet potentiellement d'ajouter/retirer des membres (la partie drag-and-drop serait ici).
    *   **Gestionnaires d'Événements Principaux :**
        *   `handleAddGroup()`: Ouvre la modale `GroupForm` pour créer un nouveau groupe.
        *   `handleEditGroup(group)`: Ouvre la modale `GroupForm` pour modifier le `group` sélectionné.
        *   `handleDeleteGroup(groupId)`: Demande confirmation et dispatche `deleteGroup`.
        *   `handleSelectGroup(groupId)`: Dispatche `selectGroupAction` pour mettre à jour le groupe sélectionné dans l'état Redux.
        *   `handleCloseForm()`: Ferme la modale `GroupForm`.
        *   `handleSubmitGroup(groupData)`: Dispatche `addGroup` ou `updateGroup` en fonction de si `editingGroup` est défini, puis ferme la modale.
    *   **Internationalisation :** Utilise `useTranslation` (`t`) pour les libellés de boutons, titres, messages de confirmation, etc.

### 2.3. Interactions et Flux de Données

## 3. Liste des Groupes : `GroupsList.js`

*   **Emplacement :** `frontend/src/components/actors/groups/GroupsList.js`

### 3.1. But Principal
    *   Afficher une liste des groupes existants.
    *   Permettre la sélection d'un groupe dans la liste.
    *   Fournir des actions rapides pour modifier ou supprimer un groupe directement depuis la liste.

### 3.2. Analyse du Code
    *   **Props Reçues :**
        *   `groups` (array) : La liste des objets groupe à afficher.
        *   `selectedGroupId` (number | null) : L'ID du groupe actuellement sélectionné (pour le style visuel).
        *   `onSelectGroup` (function) : Callback appelé avec l'ID du groupe lors d'un clic sur un élément de la liste.
        *   `onEditGroup` (function) : Callback appelé avec l'objet groupe lors d'un clic sur le bouton "Modifier".
        *   `onDeleteGroup` (function) : Callback appelé avec l'ID du groupe lors d'un clic sur le bouton "Supprimer".
    *   **Hooks :** `useTranslation`.
    *   **Composants Importés :** Icônes de `@heroicons/react/24/outline` (`PencilSquareIcon`, `TrashIcon`).
    *   **Logique Clé :**
        *   Si `groups.length === 0`, affiche un message "Aucun groupe pour le moment".
        *   Itère sur le tableau `groups` pour rendre chaque groupe comme un élément `<li>`.
        *   Chaque élément de liste affiche :
            *   Une image/icône du groupe (avec fallback si `group.photo` est absent).
            *   Le nom du groupe (`group.name`).
            *   Le nombre de membres du groupe (`group.members?.length || 0`).
        *   L'élément de liste est cliquable et appelle `onSelectGroup(group.id)`.
        *   L'élément du groupe sélectionné (`selectedGroupId === group.id`) a un style visuel distinct (fond `bg-indigo-50`).
        *   Deux boutons d'action sont présents pour chaque groupe :
            *   **Modifier** : Appelle `onEditGroup(group)`. Utilise `e.stopPropagation()` pour éviter de déclencher `onSelectGroup`.
            *   **Supprimer** : Appelle `onDeleteGroup(group.id)`. Utilise `e.stopPropagation()`.
    *   **Internationalisation :** `t('groupsList.noGroupsYet')`, `t('groupsList.member', { count: ... })`, `aria-label` pour les boutons.

### 3.3. Interactions
    *   Un clic sur un groupe dans la liste déclenche `onSelectGroup` dans `GroupsTab.js`, ce qui met à jour l'état Redux et affiche les détails/membres du groupe dans le panneau de droite.
    *   Un clic sur l'icône "Modifier" déclenche `onEditGroup` dans `GroupsTab.js`, ce qui ouvre la modale `GroupForm` avec les données du groupe à éditer.
    *   Un clic sur l'icône "Supprimer" déclenche `onDeleteGroup` dans `GroupsTab.js`, ce qui initie le processus de suppression du groupe.

## 4. Formulaire de Groupe : `GroupForm.js`

*   **Emplacement :** `frontend/src/components/actors/groups/GroupForm.js`

### 4.1. But Principal
    *   Fournir une interface utilisateur (généralement dans une modale) pour créer un nouveau groupe ou modifier les informations d'un groupe existant.
    *   Gérer la saisie des données du groupe : nom, description, et URL d'une photo.
    *   Valider les entrées de l'utilisateur (ex: nom du groupe requis).

### 4.2. Analyse du Code
    *   **Props Reçues :**
        *   `group` (object, optionnel) : L'objet groupe à éditer. Si `null` ou non fourni, le formulaire est en mode création.
        *   `onSubmit` (function) : Callback appelé avec l'objet `formData` lorsque le formulaire est soumis avec succès.
        *   `onCancel` (function) : Callback appelé lorsque l'utilisateur clique sur le bouton "Annuler".
    *   **State Local (`useState`) :**
        *   `formData` (object) : Contient les valeurs actuelles des champs du formulaire (`{ name: '', description: '', photo: '' }`).
        *   `errors` (object) : Stocke les messages d'erreur de validation, par exemple `{ name: 'Le nom est requis' }`.
    *   **Effets (`useEffect`) :**
        *   Si la prop `group` change (et est fournie), `formData` est initialisé ou mis à jour avec les valeurs du groupe existant.
    *   **Gestionnaires d'Événements Clés :**
        *   `handleChange(e)` : Met à jour `formData` en fonction des modifications de l'utilisateur dans les champs. Efface également les erreurs pour un champ dès que l'utilisateur commence à le corriger.
        *   `validateForm()` : Vérifie si le champ `name` est rempli. Met à jour l'état `errors`. Retourne `true` si valide, `false` sinon.
        *   `handleSubmit(e)` : Empêche la soumission par défaut, appelle `validateForm()`. Si la validation réussit, appelle `onSubmit(formData)`.
    *   **Rendu (JSX) :**
        *   Un élément `<form>` HTML.
        *   Champ de saisie pour le nom (`name`), obligatoire.
        *   Zone de texte pour la description (`description`).
        *   Champ de saisie pour l'URL de la photo (`photo`).
        *   Affiche les messages d'erreur (`errors.name`) sous les champs concernés.
        *   Si une URL de photo est saisie dans `formData.photo`, un aperçu de l'image est affiché (avec un fallback si l'URL est invalide).
        *   Boutons "Annuler" (appelle `onCancel`) et "Créer" / "Mettre à jour" (appelle `handleSubmit`). Le libellé du bouton de soumission s'adapte en fonction de la présence de la prop `group`.
    *   **Internationalisation :** Utilise `useTranslation` (`t`) pour tous les textes visibles par l'utilisateur (libellés, placeholders, messages d'erreur, boutons).

### 4.3. Validation
    *   Actuellement, seule la présence du nom du groupe (`formData.name`) est validée comme étant obligatoire.
    *   Des validations supplémentaires pourraient être ajoutées (ex: format de l'URL de la photo, longueur maximale des champs).

### 4.4. Interaction
    *   Ce formulaire est généralement affiché dans une modale par `GroupsTab.js`.
    *   Lors de la soumission, `GroupsTab.js` reçoit les `formData` et dispatche une action Redux (`addGroup` ou `updateGroup`).

### 2.3. Interactions et Flux de Données (pour `GroupsTab.js`)

## 5. Gestion des Membres du Groupe : `GroupMembers.js`

*   **Emplacement :** `frontend/src/components/actors/groups/GroupMembers.js`

### 5.1. But Principal
    *   Fournir une interface pour visualiser et modifier les acteurs membres d'un groupe spécifique.
    *   Afficher une liste des membres actuels du groupe et une liste des acteurs disponibles qui peuvent être ajoutés.
    *   Permettre l'ajout et le retrait d'acteurs du groupe via une fonctionnalité de glisser-déposer (drag-and-drop) et des boutons d'action directe.
    *   Permettre le filtrage de la liste des acteurs disponibles.

### 5.2. Props Reçues
    *   `group` (object) : L'objet du groupe actuellement sélectionné. Doit contenir une propriété `members` (tableau d'IDs d'acteurs).
    *   `allActors` (array) : Un tableau de tous les objets acteur disponibles dans l'application.

### 5.3. Bibliothèques et Concepts Clés Utilisés
    *   **`@dnd-kit/core` et `@dnd-kit/sortable` :** Pour implémenter la fonctionnalité de glisser-déposer.
        *   `DndContext` : Conteneur principal pour la logique D&D.
        *   `SortableContext` : Utilisé pour les listes où les éléments peuvent être réordonnés ou glissés.
        *   `useSortable` (dans `SortableItem`) : Hook pour rendre un élément draggable et sortable.
        *   `useDroppable` (dans `DroppableContainer`) : Hook pour définir une zone comme cible de dépôt.
        *   `DragOverlay` : Affiche un aperçu visuel de l'élément en cours de glissement.
        *   `closestCenter` : Algorithme de détection de collision.
        *   `KeyboardSensor`, `PointerSensor` : Pour l'accessibilité et les interactions utilisateur.
    *   **Redux (`useDispatch`, `useSelector`) :** Pour dispatcher les actions `addActorToGroup` et `removeActorFromGroup` (du `groupsSlice`).
    *   **Internationalisation (`useTranslation`) :** Pour les textes de l'interface.

### 5.4. Structure du Composant et Layout
    *   **Deux colonnes principales :**
        *   **Colonne de gauche ("Membres du Groupe") :**
            *   Titre : "Membres du Groupe" avec le nombre actuel de membres.
            *   Une zone `DroppableContainer` (ID: `members-container`) qui contient une liste de `SortableItem` représentant chaque membre du groupe.
            *   Affiche un message si aucun membre n'est présent.
        *   **Colonne de droite ("Acteurs Disponibles") :**
            *   Titre : "Acteurs Disponibles" avec le nombre d'acteurs disponibles (après filtrage).
            *   Un champ de saisie pour **filtrer** les acteurs disponibles par nom/prénom.
            *   Une zone `DroppableContainer` (ID: `available-container`) qui contient une liste de `SortableItem` représentant chaque acteur disponible (et non membre du groupe actuel).
            *   Affiche un message si aucun acteur disponible ne correspond au filtre ou si tous les acteurs sont déjà membres.
    *   **`DragOverlay` :** S'affiche pendant une opération de glissement pour montrer une copie de l'élément glissé.

### 5.5. Composants Internes
    *   **`SortableItem({ actor, type, onRemove })` :**
        *   Affiche les informations d'un acteur : avatar/icône (selon le type et la présence d'une photo), nom complet, et type d'acteur (avec un badge de couleur distinct).
        *   Utilise `useSortable` pour être draggable.
        *   `type` (prop) : Peut être `'member'` ou `'available'`. Détermine si le bouton d'action est un "-" (retirer) ou un "+" (ajouter).
        *   `onRemove` (prop) : Callback appelé lorsque le bouton +/- est cliqué (correspond à `handleRemoveFromGroup` ou `handleAddToGroup` du composant parent).
        *   Contient des fonctions utilitaires pour l'affichage : `getActorTitle`, `getActorAvatar`, `getActorIcon`, `getBadgeColor`.
    *   **`DroppableContainer({ id, children, className })` :**
        *   Un composant wrapper qui utilise `useDroppable` pour rendre ses `children` une zone de dépôt valide pour les `SortableItem`.

### 5.6. Gestion d'État et Logique Détaillée
    *   **État Local (`useState`) :**
        *   `groupMembersList` (array) : Liste des *objets* acteur qui sont membres du groupe actuel. Dérivée de `group.members` et `allActors` via `useEffect`.
        *   `availableActorsList` (array) : Liste des *objets* acteur qui sont disponibles pour être ajoutés (non-membres). Dérivée de `allActors` et `group.members` via `useEffect`, puis filtrée par `filter`.
        *   `activeId` (string | null) : L'ID de l'acteur en cours de glissement.
        *   `activeActor` (object | null) : L'objet acteur complet en cours de glissement (pour l'affichage dans `DragOverlay`).
        *   `filter` (string) : La valeur du champ de recherche pour les acteurs disponibles.
    *   **Synchronisation des listes (`useEffect`) :**
        *   Un `useEffect` surveille les changements dans `group` et `allActors`. Il met à jour `groupMembersList` (en résolvant les IDs de `group.members` en objets acteur) et une liste initiale d'acteurs disponibles.
    *   **Filtrage des Acteurs Disponibles :**
        *   La liste `availableActorsList` affichée est dynamiquement filtrée en fonction de la chaîne `filter` (recherche insensible à la casse sur nom/prénom).
    *   **Logique de Glisser-Déposer :**
        *   `handleDragStart(event)` : Met à jour `activeId` (ID de l'élément glissé) et `activeActor`.
        *   `handleDragEnd(event)` :
            *   Si `active.id` (élément glissé) et `over.id` (zone de dépôt) sont valides.
            *   **Déplacement entre conteneurs :**
                *   Si un acteur de la colonne "Acteurs Disponibles" est déposé sur "Membres du Groupe" (`over.id === 'members-container'`) : Dispatche `addActorToGroup({ groupId: group.id, actorId: active.id })`.
                *   Si un acteur de la colonne "Membres du Groupe" est déposé sur "Acteurs Disponibles" (`over.id === 'available-container'`) : Dispatche `removeActorFromGroup({ groupId: group.id, actorId: active.id })`.
            *   **Réorganisation dans le même conteneur :**
                *   Si le dépôt a lieu dans le même conteneur que l'origine (ex: réordonner les membres), utilise `arrayMove` pour mettre à jour l'état local de `groupMembersList` ou `availableActorsList`. *Note : cette réorganisation locale n'est pas persistée par les actions Redux actuelles.*
            *   Réinitialise `activeId` et `activeActor`.
    *   **Actions Directes via Boutons :**
        *   `handleAddToGroup(actorId)` : Appelé par le bouton "+" sur un `SortableItem` disponible. Dispatche `addActorToGroup`.

        *   `handleRemoveFromGroup(actorId)` : Appelé par le bouton "-" sur un `SortableItem` membre. Dispatche `removeActorFromGroup`.
    *   **Redux Actions Dispatchées :**
        *   `addActorToGroup({ groupId, actorId })`
        *   `removeActorFromGroup({ groupId, actorId })`

### 5.7. Fonctions Utilitaires (Partagées/Répétées)
    *   Des fonctions comme `getActorTitle`, `getActorAvatar`, `getActorIcon`, `getBadgeColor` sont définies à la fois dans `SortableItem` et au niveau de `GroupMembers` (pour le `DragOverlay`). Elles assurent un affichage cohérent des informations de l'acteur.

### 5.8. Implications Backend (Rappel)
    *   Les actions Redux (`addActorToGroup`, `removeActorFromGroup`) devront déclencher des appels API pour mettre à jour la table de jonction `actor_group` en base de données.
        *   `POST /api/groups/:groupId/actors` (avec `{ actorId }` dans le corps) pour ajouter.
        *   `DELETE /api/groups/:groupId/actors/:actorId` pour retirer.

## 6. Gestion d'État Frontend : `groupsSlice.js`

*   **Emplacement :** `frontend/src/redux/slices/groupsSlice.js`

### 6.1. Rôle Principal
    *   Gérer l'état global des groupes d'acteurs côté client (dans le store Redux).
    *   Définir les actions synchrones et asynchrones (thunks) pour interagir avec cet état.
    *   Fournir des sélecteurs pour accéder aux données des groupes de manière optimisée depuis les composants React.
    *   Servir de pont entre l'interface utilisateur et les appels API vers le backend pour la persistance des données des groupes.

### 6.2. Structure de l'État (`initialState`)
    *   `byId` (object) : Dictionnaire stockant les objets groupe, avec leurs IDs comme clés. Permet un accès rapide par ID.
        *   Ex: `{ "1": { id: "1", name: "Famille", members: ["a", "b"] }, "2": { ... } }`
    *   `allIds` (array) : Tableau des IDs de tous les groupes. Maintient l'ordre et permet une itération facile.
        *   Ex: `["1", "2"]`
    *   `loading` (boolean) : Indicateur d'état pour les opérations asynchrones (ex: `true` pendant un appel API).
    *   `error` (string | null) : Stocke un message d'erreur si une opération asynchrone échoue.
    *   `selectedGroupId` (string | null) : L'ID du groupe actuellement sélectionné par l'utilisateur dans l'interface.

### 6.3. Actions Asynchrones (`createAsyncThunk`)

Ces fonctions gèrent la communication avec le backend. **Actuellement, elles simulent les appels API.** Dans une implémentation complète, elles utiliseraient `fetch` ou une bibliothèque comme `axios`.

*   **`fetchGroups = createAsyncThunk('groups/fetchGroups', async () => { ... })`**
    *   **But :** Récupérer tous les groupes depuis le backend.
    *   **Interaction Backend :** Devrait appeler `GET /api/groups`.
    *   **Retour Attendu (API) :** Un tableau d'objets groupe.

*   **`addGroup = createAsyncThunk('groups/addGroup', async (groupData) => { ... })`**
    *   **But :** Créer un nouveau groupe.
    *   **Paramètres :** `groupData` (objet contenant `{ name, description, photo }`).
    *   **Interaction Backend :** Devrait appeler `POST /api/groups` avec `groupData` dans le corps de la requête.
    *   **Retour Attendu (API) :** L'objet du groupe nouvellement créé (avec son `id` assigné par le backend).

*   **`updateGroup = createAsyncThunk('groups/updateGroup', async (groupData) => { ... })`**
    *   **But :** Mettre à jour les informations d'un groupe existant.
    *   **Paramètres :** `groupData` (objet contenant `{ id, name, description, photo, members }`). `members` est inclus car la simulation actuelle le passe, mais généralement la mise à jour des membres se fait via des endpoints dédiés.
    *   **Interaction Backend :** Devrait appeler `PUT /api/groups/:groupId` avec les champs à mettre à jour.
    *   **Retour Attendu (API) :** L'objet du groupe mis à jour.

*   **`deleteGroup = createAsyncThunk('groups/deleteGroup', async (groupId) => { ... })`**
    *   **But :** Supprimer un groupe.
    *   **Paramètres :** `groupId`.
    *   **Interaction Backend :** Devrait appeler `DELETE /api/groups/:groupId`.
    *   **Retour Attendu (API) :** Confirmation de suppression (souvent l'ID du groupe supprimé ou un statut 204).

*   **`addActorToGroup = createAsyncThunk('groups/addActorToGroup', async ({ groupId, actorId }) => { ... })`**
    *   **But :** Ajouter un acteur à un groupe spécifique.
    *   **Paramètres :** `{ groupId, actorId }`.
    *   **Interaction Backend :** Devrait appeler `POST /api/groups/:groupId/actors` avec `{ actorId }` dans le corps.
    *   **Retour Attendu (API) :** L'état mis à jour du groupe (ou au moins une confirmation), typiquement l'objet groupe avec sa liste `members` actualisée.

*   **`removeActorFromGroup = createAsyncThunk('groups/removeActorFromGroup', async ({ groupId, actorId }) => { ... })`**
    *   **But :** Retirer un acteur d'un groupe spécifique.
    *   **Paramètres :** `{ groupId, actorId }`.
    *   **Interaction Backend :** Devrait appeler `DELETE /api/groups/:groupId/actors/:actorId`.
    *   **Retour Attendu (API) :** L'état mis à jour du groupe, ou confirmation.

### 6.4. Reducers Synchrones (`reducers`)
    *   **`selectGroup(state, action)` :**
        *   Met à jour `state.selectedGroupId` avec `action.payload` (l'ID du groupe sélectionné).

### 6.5. Gestion des Thunks (`extraReducers`)
    *   Pour chaque action asynchrone (thunk), des `case reducers` sont définis pour les états `.pending`, `.fulfilled`, et `.rejected`.
    *   **`.pending` :** Généralement, met `state.loading = true` et réinitialise `state.error = null`.
    *   **`.fulfilled` :** Met `state.loading = false` et met à jour l'état `byId` et `allIds` en fonction des données retournées par l'action (ex: ajouter un nouveau groupe, mettre à jour un groupe existant, supprimer un groupe, mettre à jour la liste des membres d'un groupe).
    *   **`.rejected` :** Met `state.loading = false` et stocke le message d'erreur dans `state.error`.

### 6.6. Sélecteurs (`createSelector`)

Des sélecteurs mémorisés sont fournis pour un accès efficace et optimisé aux données du slice depuis les composants.
    *   `selectGroupsByIdMap`: Retourne l'objet `state.groups.byId`.
    *   `selectAllGroups`: Retourne un tableau de tous les objets groupe.
    *   `selectGroupById(state, groupId)`: Retourne un groupe spécifique par son ID.
    *   `selectSelectedGroup`: Retourne l'objet du groupe actuellement sélectionné (basé sur `state.groups.selectedGroupId`).
    *   `selectGroupMembers(state, groupId)`: Un sélecteur important qui prend un `groupId`, récupère l'objet groupe correspondant, puis utilise `state.actors.byId` pour résoudre les IDs des membres du groupe en objets acteur complets. Crucial pour le composant `GroupMembers.js`.

### 6.7. Points Clés pour l'Implémentation Backend
    *   Les `createAsyncThunk` définis ici dictent les endpoints API que le backend NestJS devra exposer.
    *   La structure des données retournées par ces endpoints devra correspondre à ce que les reducers .fulfilled attendent pour mettre à jour l'état client correctement.
