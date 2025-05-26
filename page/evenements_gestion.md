# Gestion des Événements

Ce document détaille l'analyse du frontend et les spécifications backend pour la fonctionnalité de gestion des événements dans OrganAIzer.

## 1. Frontend : Modal de Création/Modification d'Événement (`EventFormModal.js`)

### 1.1. Objectif du Composant

Le composant `EventFormModal.js` est responsable de fournir une interface utilisateur pour la création et la modification des événements du calendrier. Il permet de définir les détails de l'événement tels que le titre, la date/heure, la durée, la description, les participants, le lieu, et la couleur.

### 1.2. Analyse Détaillée

#### 1.2.1. Props du Composant

D'après la signature de la fonction `EventFormModal({ isOpen, onClose, position, initialDate, onSave, eventRect, updateTempEvent, eventToEdit })`, les props sont :

*   `isOpen (boolean)`: Contrôle la visibilité de la modale.
*   `onClose (function)`: Fonction appelée pour fermer la modale.
*   `position (object)`: Contient les coordonnées `{ x, y }` pour le positionnement initial de la modale.
*   `initialDate (Date)`: Date initiale proposée lors de la création d'un nouvel événement.
*   `onSave (function)`: Callback cruciale exécutée lors de la sauvegarde. Elle reçoit l'objet événement complet, définissant ainsi le **contrat de données avec le backend**.
*   `eventRect (object)`: Peut-être les dimensions/position de la cellule du calendrier cliquée, utilisé pour l'animation ou le positionnement de la modale.
*   `updateTempEvent (function)`: Probablement utilisée pour mettre à jour un aperçu ou un événement temporaire (ex: lors du glisser-déposer sur le calendrier pour créer un événement).
*   `eventToEdit (object)`: L'objet événement existant à modifier. Si fourni, la modale passe en mode édition. La structure de cet objet est **essentielle pour comprendre le modèle de données d'un événement**.

#### 1.2.2. Gestion de l'État Interne (Principaux États Identifiés)

Le composant utilise `useState` et `useReducer` (notamment `dateTimeReducer` et `pickerStateReducer`) pour gérer un état local complexe :

*   **Informations de base de l'événement :**
    *   `title (string)`: Titre de l'événement.
    *   `selectedColor (string)`: Code hexadécimal de la couleur de l'événement (ex: `DEFAULT_EVENT_COLOR`).
    *   `description (string)`: Description détaillée de l'événement.
*   **Date et Heure (géré via `dateTimeReducer` et `pickerStateReducer`) :**
    *   `dateTimeState.startDate (Date)`: Date et heure de début.
    *   `dateTimeState.endDate (Date)`: Date et heure de fin.
    *   `dateTimeState.isAllDay (boolean)`: Si l'événement dure toute la journée.
    *   `pickerState.startTime (string)`: Heure de début affichée/sélectionnée (format "HH:mm").
    *   `pickerState.endTime (string)`: Heure de fin affichée/sélectionnée (format "HH:mm").
    *   États pour la visibilité des sélecteurs de date/heure (ex: `showDatePicker`, `showStartTimePicker`).
*   **Lieu et Participants :**
    *   `selectedLocation (object)`: L'objet acteur (de type `LIEU`) sélectionné comme lieu de l'événement.
    *   `selectedParticipants (array)`: Tableau d'objets (acteurs ou groupes) participant à l'événement.
    *   `presenterId (string | null)`: ID de l'acteur (parmi `selectedParticipants`) désigné comme intervenant/présentateur principal.
*   **Recherche et Filtrage (pour ajouter lieu/participants) :**
    *   `searchTerm (string)`: Terme de recherche entré par l'utilisateur.
    *   `activeFilter (string)`: Filtre actif pour la liste des acteurs/groupes (ex: 'All', 'Actors', 'Locations', 'Groups').
    *   `filteredAndSortedActors (array)`: Liste des acteurs/groupes disponibles, filtrée et triée selon `searchTerm` et `activeFilter`.
*   **État UI de la Modale :**
    *   `modalPosition (object)`: Position calculée de la modale.
    *   `errorMessage (string | null)`: Message d'erreur à afficher dans la modale.
    *   `isLoading (boolean)`: Indicateur de chargement (ex: pendant la sauvegarde).
    *   `showColorPicker (boolean)`: Visibilité du sélecteur de couleur.
    *   `isTitleFocused (boolean)`: Indique si le champ titre a le focus.

**Initialisation de l'état :**
L'état est initialisé différemment si `eventToEdit` est fourni (mode édition) ou non (mode création). En mode édition, les champs sont pré-remplis avec les données de `eventToEdit`. Cela implique que `eventToEdit` doit contenir des champs comme `title`, `start`, `end`, `allDay`, `color`, `description`, `locationId` (ou un objet `location`), `participantIds` (ou une liste d'objets `participants`), et `presenterId`.

### 1.2.3. Fonction Clé : `handleSave()` et Structure des Données de l'Événement

La fonction `handleSave` est centrale car elle construit l'objet événement qui sera transmis (via la prop `onSave`) au composant parent, et potentiellement à une action Redux pour un appel API. Sa structure dicte ce que le backend doit attendre.

```javascript
// Extrait pertinent de EventFormModal.handleSave
const handleSave = () => {
  const eventTitle = title.trim() || t('eventForm.untitledEvent'); 
  const eventStart = new Date(dateTimeState.startDate.getTime());
  const eventEnd = new Date(dateTimeState.endDate.getTime());
  
  const newEvent = {
    id: eventToEdit ? eventToEdit.id : String(Date.now()) + '-' + Math.floor(Math.random() * 1000),
    title: eventTitle,
    start: eventStart,
    end: eventEnd,
    backgroundColor: eventColor,
    borderColor: eventColor,
    extendedProps: {
      location: selectedLocation ? { ...selectedLocation } : null,
      participants: selectedParticipants.map(p => ({ ...p })),
      presenterId: presenterId,
      description: description
    }
  };
  
  onSave(newEvent);
  // ... réinitialisation du formulaire
};
```

**Décomposition de l'objet `newEvent` (implications pour le backend) :**

*   `id (string)`: Pour un nouvel événement, ID temporaire généré côté client (ex: `"1678886400000-123"`). Le backend générera un ID permanent (UUID ou auto-incrémenté). En mode édition, l'ID de l'événement existant est utilisé.
*   `title (string)`: Titre de l'événement.
*   `start (Date)`: Date et heure de début (objet JavaScript `Date`). Sera stocké comme `DATETIME` ou `TIMESTAMP` en BDD.
*   `end (Date)`: Date et heure de fin (objet JavaScript `Date`). Sera stocké comme `DATETIME` ou `TIMESTAMP` en BDD.
*   `backgroundColor (string)`: Code couleur hexadécimal pour l'affichage (ex: `"#4f46e5"`).
*   `borderColor (string)`: Identique à `backgroundColor`. Le backend pourrait stocker un seul champ `color_theme`.
*   `extendedProps (object)`: Contient les données métier spécifiques :
    *   `description (string)`: Description textuelle de l'événement.
    *   `location (object | null)`: Représente l'acteur (de type `LIEU`) servant de lieu. Contient l'objet acteur complet (copié depuis Redux). Pour le backend, on stockera `location_id` (FK vers la table `actors`).
    *   `participants (array)`: Tableau d'objets. Chaque objet est une copie d'un acteur (humain, lieu, objet) ou d'un groupe, sélectionné comme participant. Pour le backend, cela implique une table de jonction (ex: `event_participants`) avec des colonnes comme `event_id`, `participant_actor_id` (FK vers `actors`), `participant_group_id` (FK vers `groups`). Il faudra un moyen de distinguer si le participant est un acteur ou un groupe.
    *   `presenterId (string | null)`: ID de l'acteur (humain, parmi les `participants`) désigné comme intervenant/présentateur. Sera une FK vers la table `actors`.

**Champs implicites ou à considérer pour le backend :**

*   `is_all_day (boolean)`: Bien que non explicitement dans `newEvent`, l'état `dateTimeState.isAllDay` est utilisé pour déterminer les valeurs de `start` et `end`. Le backend devra stocker cette information. Si `true`, `start` pourrait être à `00:00:00` et `end` à `23:59:59` (ou début du jour suivant selon convention FullCalendar).
*   `user_id` / `creator_id (FK)`: L'ID de l'utilisateur qui crée l'événement.
*   `company_id (FK)`: Si l'application est multi-tenant.
*   `timestamps (created_at, updated_at)`: Pour le suivi des modifications.

Cette structure est riche et nous donne une excellente base pour concevoir la table `events` et ses tables associées.

### 1.2.4. Sélection des Lieux et Participants (`handleActorSelect`)

La fonction `handleActorSelect(actor)` gère l'ajout d'un acteur (qui peut être un lieu, un personnage, un objet ou un groupe) à l'événement, soit comme lieu principal, soit comme participant.

**Logique de Sélection :**

1.  **Si `actor.type` est `ACTOR_TYPES.LOCATION` :**
    *   L'acteur est assigné comme `selectedLocation` (un seul lieu principal par événement).

2.  **Si `actor.type` n'est pas `LOCATION` (donc un participant potentiel) :**
    *   **Comportement de bascule :** Si l'acteur est déjà dans `selectedParticipants`, il en est retiré.
    *   **Si l'acteur est un Groupe (`actor.type === ACTOR_TYPES.GROUP`) :**
        *   **Vérification de conflit 1 (`hasCommonMembersWithSelectedGroups(actor)`) :** L'ajout est refusé si le groupe a des membres en commun avec des groupes déjà sélectionnés.
        *   **Déduplication :** Les acteurs individuels déjà dans `selectedParticipants` qui sont membres de ce nouveau groupe sont retirés de `selectedParticipants`.
        *   Le groupe est ajouté à `selectedParticipants`.
    *   **Si l'acteur est Individuel (ni lieu, ni groupe) :**
        *   **Vérification de conflit 2 (`isActorInSelectedGroups(actor.id)`) :** L'ajout est refusé si l'acteur est déjà membre d'un groupe présent dans `selectedParticipants`.
        *   L'acteur individuel est ajouté à `selectedParticipants`.

**Implications pour le Backend :**

*   **Lieu :** Un événement aura un champ `location_id` (FK nullable vers `actors.id` où `actors.type` = `LOCATION`).
*   **Participants :** Une table de jonction `event_participants` est nécessaire.
    *   Elle contiendra à minima : `event_id`.
    *   Pour identifier le participant, elle aura besoin de : `participant_actor_id` (FK vers `actors.id`, nullable) ET `participant_group_id` (FK vers `groups.id`, nullable), avec une colonne `participant_is_group (BOOLEAN)` ou `participant_type (ENUM('actor', 'group'))` pour discriminer.
    *   La logique de déduplication (ne pas avoir un acteur à la fois individuellement et via son groupe) est gérée par le frontend avant la sauvegarde. Le backend recevra une liste de participants "nets".

### 1.2.5. Suppression de Lieu et de Participants

*   **`handleRemoveLocation()`**: Met simplement l'état `selectedLocation` à `null`. Confirme qu'un événement a au plus un lieu.
*   **`handleRemoveParticipant(participantId)`**: Retire le participant (acteur ou groupe) de la liste `selectedParticipants` en le filtrant par son `id`.

Ces opérations mettent également à jour l'aperçu de l'événement via `debouncedUpdateTempEvent`.

### 1.2.6. Gestion du Statut d'Intervenant (`togglePresenterStatus`)

La fonction `togglePresenterStatus(participant)` permet de désigner un participant humain comme l'intervenant principal de l'événement.

**Logique de Fonctionnement :**

*   Seuls les participants de type `ACTOR_TYPES.HUMAN` peuvent être désignés comme intervenants.
*   Si le participant sélectionné est déjà l'intervenant (`presenterId === participant.id`), son statut d'intervenant est retiré (`presenterId` devient `null`).
*   Sinon, le participant sélectionné devient le nouvel intervenant (`presenterId` prend `participant.id`). Un seul intervenant est possible à la fois.

**Implications pour le Backend :**

*   La table `events` aura un champ `presenter_id` (FK nullable vers `actors.id`).
*   Le backend devra valider que si `presenter_id` est fourni, il correspond à un acteur de type `HUMAN` et qu'il est bien listé parmi les participants de l'événement.
