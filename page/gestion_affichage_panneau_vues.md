# Documentation de la Fonctionnalité d'Affichage (Views Panel)

## Introduction

Le panneau d'affichage (Views Panel) est un composant crucial de l'interface utilisateur d'OrganAIzer. Il permet aux utilisateurs de contrôler dynamiquement la visibilité des différents éléments (acteurs, groupes, couleurs associées aux événements) sur la vue principale du calendrier ou de la planification. Il offre également une fonctionnalité de recherche pour les acteurs et gère un "mode focus" pour mettre en évidence des éléments spécifiques.

Cette documentation détaille l'analyse des composants frontend impliqués, le flux de données, les interactions utilisateur typiques, et les implications pour le développement backend.

## 1. Analyse des Composants Frontend

La fonctionnalité s'articule principalement autour de deux composants : `ViewsPanel.js` et `ViewsSection.js`, avec `ViewItem.js` pour le rendu individuel.

### 1.1. `ViewsPanel.js`

-   **Rôle :** Sert de conteneur principal pour l'ensemble du panneau d'affichage. Il orchestre les différentes sections (Acteurs, Groupes, Couleurs), gère la barre de recherche pour les acteurs, et l'affichage de l'indicateur du mode focus.
-   **Sources de Données (Redux) :**
    -   `viewsSlice` : Pour l'état de visibilité (`selectAllVisibleActors`, `selectAllVisibleGroups`, `selectAllVisibleColors`) et l'état du mode focus (`selectFocusActive`, `selectFocusTarget`).
    -   `actorsSlice` : Pour les détails des acteurs (`selectActorsByIdMap`).
    -   `groupsSlice` : Pour les détails des groupes (`selectGroupsByIdMap`).
-   **Logique Principale :**
    -   Prépare les listes d'éléments (`actorItems`, `groupItems`, `colorItems`) à passer aux composants `ViewsSection` en se basant sur les données du store et l'état de visibilité.
    -   Gère un état local `actorSearchTerm` pour filtrer la liste des acteurs.
    -   Dispatch les actions Redux pour basculer la visibilité des éléments (`toggleActorVisibility`, `toggleGroupVisibility`, `toggleColorVisibility`) et pour désactiver le mode focus (`deactivateFocus`).
    -   Affiche un en-tête conditionnel pour le mode focus avec un bouton de retour.

### 1.2. `ViewsSection.js`

-   **Rôle :** Affiche une section individuelle (par exemple, "Acteurs") dans le `ViewsPanel`. Chaque section peut être développée ou réduite et liste les éléments correspondants.
-   **Props Reçues (de `ViewsPanel`) :** `title`, `type` (actor, group, color), `items` (la liste préparée), `visibilityState`, `toggleVisibility` (fonction de rappel), `focusState`, `initialExpanded`.
-   **Logique Principale :**
    -   Gère un état local `isExpanded` pour l'ouverture/fermeture de la section et `shouldRenderContent` pour optimiser le rendu DOM (le contenu n'est rendu que si la section est ouverte).
    -   Utilise un composant interne `ItemsList` (qui utilise `useMemo` pour optimiser les re-rendus) pour afficher la liste des `ViewItem`.
    -   Si la liste d'items est vide, un message approprié est affiché.

### 1.3. `ViewItem.js`

-   **Rôle :** Affiche un élément individuel (acteur, groupe, ou couleur) au sein d'une `ViewsSection`. Il est responsable de l'affichage du nom de l'élément, d'un indicateur visuel approprié (image pour acteurs/groupes, carré de couleur pour le type couleur), et d'une icône "œil" pour contrôler la visibilité de l'élément.
-   **Props Clés Reçues :** `id`, `name`, `type`, `isVisible`, `color` (pour type couleur), `image` (pour type acteur/groupe), `toggleVisibility` (fonction de rappel), `isFocusActive`, `isFocused`.
-   **Logique d'Affichage :**
    -   **Nom :** Pour les éléments de type 'color', il utilise une fonction utilitaire (`getColorName`) pour afficher un nom de couleur traduit ou lisible au lieu du code hexadécimal brut. Pour les autres types, il affiche le nom fourni.
    -   **Indicateur Visuel :** Affiche un carré coloré pour le type 'color', une image de fond pour les types 'actor' et 'group' si disponible, ou un placeholder.
    -   **Icône de Visibilité :** Affiche une icône "œil ouvert" si `isVisible` est vrai, sinon une icône "œil barré". Le tooltip de l'icône est également adapté.
-   **Interactions Utilisateur :**
    -   **Activation du Focus :** Un clic sur le corps principal de l'item (en dehors de l'icône de visibilité) déclenche la fonction `handleItemClick`. Celle-ci `dispatch` l'action Redux `activateFocus({ id, type })` (de `viewsSlice`), mettant l'application en mode focus sur cet item spécifique.
    -   **Basculement de la Visibilité :** Un clic sur l'icône "œil" déclenche `handleVisibilityToggle`. Cette fonction appelle `toggleVisibility(id)` (passée en prop depuis `ViewsPanel`), qui met à jour l'état de visibilité de l'item dans `viewsSlice`.
-   **Stylage Dynamique :** Applique des classes CSS (`view-item-hidden`, `view-item-focused`) pour refléter l'état de visibilité et de focus de l'item.

## 2. Flux de Données et Gestion d'État (Redux)

-   **`viewsSlice` :** Ce slice Redux est central. Il détient :
    -   L'état de visibilité de chaque acteur, groupe, et couleur.
    -   L'état du mode focus (si actif, et quel est l'élément cible).
    -   Les actions pour modifier ces états sont dispatchées par `ViewsPanel`.
-   **`actorsSlice` et `groupsSlice` :** Fournissent les données brutes (listes et détails) pour les acteurs et les groupes, qui sont ensuite utilisées par `ViewsPanel` pour construire les `items` à afficher.

## 3. Interactions Utilisateur

-   **Basculer la Visibilité :** L'utilisateur peut cocher/décocher des acteurs, groupes ou couleurs pour les afficher/masquer sur la vue principale (par exemple, un calendrier).
-   **Développer/Réduire les Sections :** L'utilisateur peut cliquer sur l'en-tête d'une section pour afficher ou masquer la liste des éléments qu'elle contient.
-   **Recherche d'Acteurs :** Un champ de recherche permet de filtrer la liste des acteurs par nom.
-   **Mode Focus :** Bien que non directement activé depuis ce panneau, le panneau réagit au mode focus (activé par d'autres interactions dans l'application) en affichant un indicateur et en permettant de le désactiver. Les `ViewItem` s'adaptent également visuellement.

## 4. Implications et Besoins Backend

La logique actuelle de `ViewsPanel` et `ViewsSection` est majoritairement gérée côté frontend.

-   **Données de Base :**
    -   Nécessite des endpoints backend (probablement déjà existants) pour récupérer la liste complète des acteurs (ex: `GET /api/actors`) et des groupes (ex: `GET /api/groups`).
    -   Les couleurs sont actuellement définies et gérées côté client (mappées à des traductions), mais pourraient à l'avenir provenir de catégories d'événements définies en backend.

-   **Persistance des Préférences Utilisateur (Optionnel/Futur) :**
    -   Actuellement, les choix de visibilité et l'état d'expansion des sections ne sont pas persistants entre les sessions ou les appareils. Si cette fonctionnalité est souhaitée, elle nécessiterait un support backend :
        -   **Nouvel Endpoint :** `GET /api/users/me/view-preferences` pour charger les préférences de l'utilisateur au démarrage de l'application.
        -   **Nouvel Endpoint :** `PUT /api/users/me/view-preferences` pour sauvegarder les préférences de l'utilisateur lorsqu'elles changent.
    -   **Structure des Données de Préférences :** Pourrait être un objet JSON stocké en backend, reflétant une partie de l'état de `viewsSlice` :
        ```json
        {
          "visibleActors": { "actorId1": true, "actorId2": false, ... },
          "visibleGroups": { "groupId1": true, ... },
          "visibleColors": { "#FF0000": true, ... },
          "expandedSections": { "actors": true, "groups": false, "colors": true }
        }
        ```

-   **Aucun autre endpoint backend n'est directement requis** par la logique actuelle des composants `ViewsPanel` et `ViewsSection` tels qu'analysés.

## 5. Schéma de Données Backend (pour la persistance optionnelle des préférences)

Si la persistance des préférences est implémentée, une table ou une structure de document pourrait être nécessaire :

-   **Table `user_view_preferences`** (exemple pour SQL) :
    -   `user_id` (PRIMARY KEY, FOREIGN KEY vers la table des utilisateurs)
    -   `preferences_data` (JSON ou TEXT) : Contiendrait l'objet JSON des préférences (comme décrit ci-dessus).

    (Alternativement, pour NoSQL, cela pourrait être un champ dans le document utilisateur.)

## Conclusion

Le système d'affichage `ViewsPanel` et ses composants enfants fournissent un contrôle flexible de la visibilité des données pour l'utilisateur. Il est bien intégré avec Redux pour la gestion d'état côté client. Les implications backend actuelles sont limitées à la fourniture des données de base, avec une extension possible pour la persistance des préférences utilisateur si cette fonctionnalité devient une exigence.
