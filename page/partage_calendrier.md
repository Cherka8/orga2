# Partage de Calendrier par Acteur

## 1. Introduction

La fonctionnalité "Partage de Calendrier" vise à permettre aux administrateurs ou planificateurs de partager une vue personnalisée du calendrier avec des acteurs spécifiques par e-mail. Chaque acteur recevrait un lien unique qui, une fois cliqué, afficherait un calendrier contenant uniquement les événements le concernant.

Le composant principal de cette fonctionnalité côté frontend est `ShareView.js`.

## 2. Analyse du Composant Frontend (`ShareView.js`)

*   **Fichier :** `frontend/src/components/actors/ShareView.js`
*   **Rôle :** Ce composant fournit l'interface utilisateur pour sélectionner des acteurs humains, vérifier la présence de leurs adresses e-mail, et simuler l'envoi d'un lien de calendrier personnalisé.

*   **Props du Composant :** Aucune prop directe. Il interagit avec le store Redux pour obtenir les données des acteurs.

*   **État Interne (`useState`) :**
    *   `humanActors (Array<Object>)`: Liste des acteurs filtrée pour ne contenir que ceux de type `ACTOR_TYPES.HUMAN`.
    *   `selectedActors (Array<String>)`: Tableau des ID des acteurs sélectionnés pour le partage.
    *   `searchTerm (String)`: Valeur actuelle du champ de recherche pour filtrer la liste des acteurs.
    *   `notification (Object)`: Objet pour gérer les messages affichés à l'utilisateur (`{ type: 'success'|'error'|'warning', message: String }`).
    *   `isLoading (Boolean)`: Indicateur d'état de chargement pendant les simulations d'envoi.
    *   `actorsWithoutEmail (Array<Object>)`: Stocke les acteurs qui n'ont pas d'adresse e-mail lors d'une tentative de partage groupé, afin d'en informer l'utilisateur.

*   **Sources de Données (Redux via `useSelector`) :**
    *   `selectAllActors`: Pour obtenir la liste complète de tous les acteurs depuis le store.

*   **Fonctionnalités Clés et Logique :**
    *   **Filtrage des Acteurs :**
        *   Au montage, la liste `allActors` est filtrée pour ne conserver que les `humanActors`.
        *   Les `humanActors` sont ensuite filtrables via un `searchTerm` basé sur le prénom et le nom.
    *   **Sélection des Acteurs :**
        *   Chaque acteur affiché possède une case à cocher pour le sélectionner.
        *   Un bouton "Select All" / "Deselect All" permet de basculer la sélection de tous les acteurs actuellement visibles (`filteredActors`).
    *   **Logique de Partage (Simulation) :**
        *   `handleShareWithActor(actorId)`: Pour partager avec un seul acteur.
            *   Vérifie si l'acteur (`actor.email`) a une adresse e-mail. Si non, affiche une notification d'erreur et arrête.
            *   Si oui, simule un appel API via `setTimeout` et affiche une notification de succès.
        *   `handleShareWithSelected()`: Pour partager avec tous les acteurs dans `selectedActors`.
            *   Vérifie si au moins un acteur est sélectionné.
            *   Identifie les acteurs sélectionnés qui n'ont pas d'e-mail (`noEmailActors`).
            *   Si `noEmailActors` existe, une notification d'avertissement est affichée avec les noms des acteurs concernés. Le processus d'envoi simulé ne se fera que pour ceux ayant un email.
            *   Appelle `sendToActorsWithEmail(actorIdsWithEmail)` pour simuler l'envoi.
        *   `sendToActorsWithEmail(actorIds)`: Simule l'envoi effectif aux acteurs (ceux qui ont un email) et affiche une notification de succès globale.
    *   **Gestion des Notifications :**
        *   Les notifications (succès, erreur, avertissement) sont affichées de manière proéminente.
        *   Elles disparaissent automatiquement après un court délai (3-5 secondes).
    *   **Interface Utilisateur :**
        *   Affichage clair de chaque acteur avec photo/initiales, nom complet.
        *   Indication visuelle (icône et texte) de la présence ou de l'absence d'une adresse e-mail pour chaque acteur.
        *   Boutons d'action ("Share", "Share with Selected") désactivés si `isLoading` est vrai ou si les conditions ne sont pas remplies (e.g., pas d'e-mail pour un partage individuel, aucune sélection pour un partage groupé).
        *   Une note en bas de page informe l'utilisateur que la fonctionnalité actuelle est une simulation et n'envoie pas réellement d'e-mails.

## 3. Flux de Données Simulé (Frontend)

1.  L'utilisateur accède à la vue `ShareView`.
2.  La liste des acteurs humains est chargée et affichée.
3.  L'utilisateur peut rechercher des acteurs spécifiques.
4.  L'utilisateur sélectionne un ou plusieurs acteurs via les cases à cocher ou le bouton "Select All".
5.  L'utilisateur clique sur "Share" pour un acteur individuel ou "Share with Selected" pour le groupe.
6.  Le composant vérifie la présence d'adresses e-mail :
    *   Si e-mail(s) manquant(s) : notification appropriée (erreur ou avertissement).
    *   Si e-mail(s) présent(s) : `isLoading` passe à `true`.
7.  Une simulation d'appel API est lancée (`setTimeout`).
8.  Après la simulation, `isLoading` repasse à `false` et une notification de succès est affichée.

## 4. Implications pour une Implémentation Backend Complète

Pour que cette fonctionnalité soit pleinement opérationnelle, le backend devra implémenter les éléments suivants :

*   **Endpoint de Déclenchement du Partage (ex: `POST /api/calendars/share`) :**
    *   **Entrée :** Une liste d'IDs d'acteurs (`actorIds: string[]`).
    *   **Logique :**
        1.  Pour chaque `actorId` reçu :
            *   Vérifier l'existence de l'acteur et récupérer son adresse e-mail.
            *   Si l'acteur n'existe pas ou n'a pas d'e-mail, marquer cet ID pour un retour d'erreur/avertissement.
            *   Si l'e-mail existe : Générer un **token unique et sécurisé** (ex: JWT, UUID long) spécifique à cet acteur et à cette instance de partage. Ce token devrait avoir une durée de validité.
            *   Stocker le token en association avec `actorId` et sa date d'expiration (par exemple, dans une table `shared_calendar_access_tokens`).
            *   Construire une URL unique pour accéder au calendrier partagé, incluant ce token (ex: `https://[VOTRE_DOMAINE]/shared-calendar?token=[TOKEN_ICI]`).
            *   Composer et envoyer un e-mail à l'adresse de l'acteur, contenant cette URL unique.
        2.  **Réponse au Frontend :**
            *   Un statut global de succès/échec.
            *   Optionnellement, une liste des acteurs pour lesquels l'e-mail n'a pas pu être envoyé (et la raison, e.g., e-mail manquant).

*   **Endpoint d'Accès au Calendrier Partagé (ex: `GET /api/calendars/shared`) ou une route frontend qui appelle un tel endpoint :**
    *   **Entrée :** Le `token` (provenant de l'URL cliquée dans l'e-mail).
    *   **Logique :**
        1.  Valider le token :
            *   Vérifier son existence dans la table `shared_calendar_access_tokens`.
            *   Vérifier qu'il n'a pas expiré.
            *   Si le token est invalide ou expiré, retourner une erreur appropriée (ex: 403 Forbidden, 404 Not Found, ou une page d'erreur spécifique).
        2.  Si le token est valide, récupérer l'`actorId` associé.
        3.  Récupérer tous les événements auxquels cet `actorId` est associé (directement ou via un groupe). La logique de récupération des événements est la même que celle utilisée dans `ActorEventsView.js` ou `TimeView.js`.
        4.  **Réponse au Client :** Renvoyer la liste des événements filtrés pour cet acteur.

*   **Service d'Envoi d'E-mails :**
    *   Nécessité d'intégrer un service tiers robuste pour l'envoi d'e-mails transactionnels (ex: SendGrid, Mailgun, AWS SES, Postmark).
    *   Gestion des templates d'e-mails.

*   **Base de Données (Modifications) :**
    *   Table `shared_calendar_access_tokens` (ou similaire) :
        *   `token (String, PK)`
        *   `actor_id (FK vers la table des acteurs)`
        *   `expires_at (Timestamp)`
        *   `created_at (Timestamp)`

*   **Sécurité :**
    *   Les tokens doivent être suffisamment longs et cryptographiquement aléatoires pour éviter la devinette.
    *   Utiliser HTTPS pour toutes les communications.
    *   Considérer des mesures contre l'abus de la fonctionnalité d'envoi d'e-mails.

## 5. Résumé

La fonctionnalité `ShareView` est bien conçue du point de vue frontend pour simuler une expérience utilisateur de partage de calendrier. Pour la rendre opérationnelle, un travail backend significatif est requis, notamment pour la gestion des tokens, l'interaction avec un service d'e-mail, et la sécurisation des points d'accès. La gestion des acteurs sans e-mail est déjà bien prise en compte dans l'interface, ce qui simplifiera l'intégration avec le backend.
