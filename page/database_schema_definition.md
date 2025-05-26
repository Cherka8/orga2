# Définition du Schéma de la Base de Données OrganAIzer

Ce document décrit la structure des tables de la base de données pour l'application OrganAIzer, en se basant sur l'ensemble des documents de spécification.

## Table `accounts`

Table principale pour stocker les informations de tous les comptes utilisateurs, qu'ils soient individuels ou de type entreprise.

| Colonne             | Type                                | Contraintes                           | Description                                                                 |
|---------------------|-------------------------------------|---------------------------------------|-----------------------------------------------------------------------------|
| `id`                | UUID / INT AUTO_INCREMENT           | PRIMARY KEY                           | Identifiant unique du compte.                                               |
| `email`             | VARCHAR(255)                        | UNIQUE, NOT NULL                      | Adresse email de l'utilisateur, utilisée pour la connexion.                 |
| `password_hash`     | VARCHAR(255)                        | NOT NULL                              | Hash sécurisé du mot de passe de l'utilisateur.                               |
| `account_type`      | ENUM('individual', 'company')       | NOT NULL                              | Type de compte : 'individual' ou 'company'.                                 |
| `first_name`        | VARCHAR(255)                        | NULLABLE                              | Prénom (pour individu ou contact principal d'entreprise).                    |
| `last_name`         | VARCHAR(255)                        | NULLABLE                              | Nom de famille (pour individu ou contact principal d'entreprise).              |
| `phone`             | VARCHAR(50)                         | NULLABLE                              | Numéro de téléphone (personnel ou du contact/entreprise).                   |
| `address`           | TEXT                                | NULLABLE                              | Adresse (personnelle ou de l'entreprise).                                    |
| `city`              | VARCHAR(100)                        | NULLABLE                              | Ville.                                                                      |
| `postal_code`       | VARCHAR(20)                         | NULLABLE                              | Code postal.                                                                |
| `country`           | VARCHAR(100)                        | NULLABLE                              | Pays.                                                                       |
| `birth_date`        | DATE                                | NULLABLE                              | Date de naissance (pour les individus).                                       |
| `occupation`        | VARCHAR(255)                        | NULLABLE                              | Profession (pour les individus).                                              |
| `contact_position`  | VARCHAR(255)                        | NULLABLE                              | Poste du contact principal (pour les comptes entreprise).                     |
| `view_preferences`  | JSON                                | NULLABLE                              | Préférences d'affichage de l'utilisateur (ex: panneaux visibles, vue calendrier par défaut). |
| `is_active`         | BOOLEAN                             | NOT NULL, DEFAULT TRUE                | Indique si le compte est actif.                                             |
| `email_verified_at` | TIMESTAMP                           | NULLABLE                              | Date et heure de la vérification de l'email.                               |
| `created_at`        | TIMESTAMP                           | NOT NULL, DEFAULT CURRENT_TIMESTAMP   | Date et heure de création du compte.                                        |
| `updated_at`        | TIMESTAMP                           | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Date et heure de la dernière modification du compte. |

## Table `companies`

Table pour stocker les informations spécifiques aux comptes de type entreprise.

| Colonne        | Type                        | Contraintes                                     | Description                                                                      |
|----------------|-----------------------------|-------------------------------------------------|----------------------------------------------------------------------------------|
| `id`           | UUID / INT AUTO_INCREMENT   | PRIMARY KEY                                     | Identifiant unique de l'entreprise.                                              |
| `account_id`   | UUID / INT                  | FOREIGN KEY (`accounts.id`), UNIQUE, NOT NULL | Lie l'entreprise à un enregistrement dans `accounts` avec `account_type='company'`. |
| `company_name` | VARCHAR(255)                | NOT NULL                                        | Nom officiel de l'entreprise.                                                    |
| `industry`     | VARCHAR(255)                | NULLABLE                                        | Secteur d'activité de l'entreprise.                                              |
| `created_at`   | TIMESTAMP                   | NOT NULL, DEFAULT CURRENT_TIMESTAMP             | Date et heure de création de l'enregistrement entreprise.                         |
| `updated_at`   | TIMESTAMP                   | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Date et heure de la dernière modification.          |

**Note sur les informations d'entreprise :**
Les informations générales de contact pour une entreprise (téléphone, adresse, etc.) sont stockées dans l'enregistrement `accounts` correspondant (celui lié par `companies.account_id`), où les champs `first_name` et `last_name` peuvent désigner le contact principal. Les champs `phone`, `address`, `city`, `postal_code`, `country` de la table `accounts` serviront alors pour l'entreprise elle-même si `account_type` est 'company'.

## Table `actors`

Stocke les acteurs (humains ou lieux) en utilisant une approche STI (Single Table Inheritance). Le champ `account_id` a été ajouté pour lier chaque acteur à un compte principal qui le gère, en accord avec la logique globale de l'application.

| Colonne         | Type                                | Contraintes                                         | Description                                                                       |
|-----------------|-------------------------------------|-----------------------------------------------------|-----------------------------------------------------------------------------------|
| `id`            | INT AUTO_INCREMENT                  | PRIMARY KEY                                         | Identifiant unique de l'acteur.                                                   |
| `account_id`    | UUID / INT                          | FOREIGN KEY (`accounts.id`), NOT NULL               | Compte propriétaire/gestionnaire de cet acteur.                                   |
| `type`          | VARCHAR(50)                         | NOT NULL                                            | Type d'acteur : 'human', 'location'.                                              |
| `photo_url`     | VARCHAR(2048)                       | NULLABLE                                            | URL de l'image de l'acteur.                                                       |
| `color_representation` | VARCHAR(7)                     | NULLABLE                                            | Code couleur HEX (ex: #RRGGBB) pour affichage dans le calendrier.                 |
| `created_at`    | TIMESTAMP                           | NOT NULL, DEFAULT CURRENT_TIMESTAMP                 | Date et heure de création.                                                      |
| `updated_at`    | TIMESTAMP                           | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Date et heure de la dernière modification.                                      |
| `first_name`    | VARCHAR(255)                        | NULLABLE                                            | Prénom (si `type`='human').                                                       |
| `last_name`     | VARCHAR(255)                        | NULLABLE                                            | Nom de famille (si `type`='human').                                               |
| `role`          | VARCHAR(255)                        | NULLABLE                                            | Rôle (si `type`='human').                                                         |
| `email`         | VARCHAR(255)                        | NULLABLE                                            | Adresse email (si `type`='human', potentiellement UNIQUE selon règles métier).      |
| `phone`         | VARCHAR(50)                         | NULLABLE                                            | Numéro de téléphone (si `type`='human').                                         |
| `location_name` | VARCHAR(255)                        | NULLABLE                                            | Nom du lieu (si `type`='location').                                               |
| `address`       | TEXT                                | NULLABLE                                            | Adresse du lieu (si `type`='location').                                           |

**Notes pour la table `actors`:**
- La colonne `color_representation` a été ajoutée en se basant sur les besoins de l'interface utilisateur pour distinguer les acteurs dans le calendrier (mentionné dans `acteurs_liste_page.md`).
- Les contraintes `NOT NULL` pour les champs spécifiques au type (ex: `first_name` pour 'human') devront être gérées au niveau applicatif.

## Table `events`

Stocke les informations sur les événements planifiés.

| Colonne             | Type                        | Contraintes                           | Description                                                                   |
|---------------------|-----------------------------|---------------------------------------|-------------------------------------------------------------------------------|
| `id`                | UUID / INT AUTO_INCREMENT   | PRIMARY KEY                           | Identifiant unique de l'événement.                                            |
| `account_id`        | UUID / INT                  | FOREIGN KEY (`accounts.id`), NOT NULL | Compte propriétaire de l'événement.                                         |
| `title`             | VARCHAR(255)                | NOT NULL                              | Titre de l'événement.                                                         |
| `description`       | TEXT                        | NULLABLE                              | Description détaillée de l'événement.                                         |
| `start_time`        | TIMESTAMP                   | NOT NULL                              | Date et heure de début de l'événement.                                       |
| `end_time`          | TIMESTAMP                   | NOT NULL                              | Date et heure de fin de l'événement.                                         |
| `location_actor_id` | INT                         | FOREIGN KEY (`actors.id`), NULLABLE   | Lie à un acteur de type 'location' (si l'événement a un lieu spécifique).    |
| `presenter_actor_id`| INT                         | FOREIGN KEY (`actors.id`), NULLABLE   | Lie à un acteur de type 'human' (si l'événement a un présentateur).        |
| `event_color`       | VARCHAR(7)                  | NULLABLE                              | Couleur de l'événement dans le calendrier (ex: #RRGGBB).                      |
| `created_at`        | TIMESTAMP                   | NOT NULL, DEFAULT CURRENT_TIMESTAMP   | Date et heure de création.                                                  |
| `updated_at`        | TIMESTAMP                   | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Date et heure de la dernière modification.                                  |

**Notes pour la table `events`:**
- `location` est maintenant `location_actor_id` pour référencer un acteur de type 'location'.
- `presenterId` est devenu `presenter_actor_id`.
- `backgroundColor` et `borderColor` sont consolidés en `event_color`.

## Table `event_participants`

Table de jonction pour lier les événements à leurs participants (acteurs).

| Colonne             | Type                        | Contraintes                                                 | Description                                                                   |
|---------------------|-----------------------------|-------------------------------------------------------------|-------------------------------------------------------------------------------|
| `event_id`          | UUID / INT                  | PRIMARY KEY, FOREIGN KEY (`events.id`) ON DELETE CASCADE    | Identifiant de l'événement.                                                   |
| `actor_id`          | INT                         | PRIMARY KEY, FOREIGN KEY (`actors.id`) ON DELETE CASCADE    | Identifiant de l'acteur participant.                                          |
| `participation_status`| ENUM('accepted', 'declined', 'tentative', 'needsAction') | NOT NULL, DEFAULT 'needsAction' | Statut de participation.                                                    |
| `added_at`          | TIMESTAMP                   | NOT NULL, DEFAULT CURRENT_TIMESTAMP                         | Date et heure d'ajout du participant.                                         |

## Table `groups`

Permet de regrouper des acteurs.

| Colonne             | Type                        | Contraintes                           | Description                                                                 |
|---------------------|-----------------------------|---------------------------------------|-----------------------------------------------------------------------------|
| `id`                | UUID / INT AUTO_INCREMENT   | PRIMARY KEY                           | Identifiant unique du groupe.                                               |
| `account_id`        | UUID / INT                  | FOREIGN KEY (`accounts.id`), NOT NULL | Compte propriétaire du groupe.                                              |
| `name`              | VARCHAR(255)                | NOT NULL                              | Nom du groupe.                                                              |
| `description`       | TEXT                        | NULLABLE                              | Description du groupe.                                                      |
| `created_at`        | TIMESTAMP                   | NOT NULL, DEFAULT CURRENT_TIMESTAMP   | Date et heure de création.                                                |
| `updated_at`        | TIMESTAMP                   | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Date et heure de la dernière modification.                                |

## Table `group_members`

Table de jonction pour lier les groupes à leurs membres (acteurs).

| Colonne      | Type                        | Contraintes                                                 | Description                                                        |
|--------------|-----------------------------|-------------------------------------------------------------|--------------------------------------------------------------------|
| `group_id`   | UUID / INT                  | PRIMARY KEY, FOREIGN KEY (`groups.id`) ON DELETE CASCADE    | Identifiant du groupe.                                             |
| `actor_id`   | INT                         | PRIMARY KEY, FOREIGN KEY (`actors.id`) ON DELETE CASCADE    | Identifiant de l'acteur membre.                                    |
| `added_at`   | TIMESTAMP                   | NOT NULL, DEFAULT CURRENT_TIMESTAMP                         | Date et heure d'ajout du membre au groupe.                         |

## Table `shared_calendar_access_tokens`

Stocke les jetons pour l'accès aux calendriers partagés.

| Colonne         | Type                        | Contraintes                                       | Description                                                               |
|-----------------|-----------------------------|---------------------------------------------------|---------------------------------------------------------------------------|
| `id`            | UUID / INT AUTO_INCREMENT   | PRIMARY KEY                                       | Identifiant unique du jeton.                                              |
| `account_id`    | UUID / INT                  | FOREIGN KEY (`accounts.id`), NOT NULL           | Compte qui a généré le lien de partage.                                   |
| `token`         | VARCHAR(255)                | UNIQUE, NOT NULL                                  | Le jeton d'accès unique.                                                  |
| `actor_id_context` | INT                      | FOREIGN KEY (`actors.id`), NULLABLE             | Acteur spécifique pour lequel la vue calendrier est partagée (si applicable). |
| `group_id_context` | UUID / INT               | FOREIGN KEY (`groups.id`), NULLABLE             | Groupe spécifique pour lequel la vue calendrier est partagée (si applicable). |
| `expires_at`    | TIMESTAMP                   | NULLABLE                                          | Date et heure d'expiration du jeton (NULL si jamais).                      |
| `permissions`   | JSON                        | NOT NULL                                          | Droits associés au jeton (ex: 'view_only', filtres spécifiques).          |
| `created_at`    | TIMESTAMP                   | NOT NULL, DEFAULT CURRENT_TIMESTAMP             | Date et heure de création du jeton.                                       |
| `last_used_at`  | TIMESTAMP                   | NULLABLE                                          | Date et heure de la dernière utilisation du jeton.                         |

