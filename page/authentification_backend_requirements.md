# Exigences Backend pour l'Authentification

Ce document détaille les exigences backend pour les fonctionnalités d'authentification de l'application OrganAIzer, y compris la connexion et l'inscription des utilisateurs (individuels et entreprises).

## 1. Considérations Générales de Sécurité et Gestion des Tokens

- **HTTPS :** Toutes les communications entre le client et le serveur doivent se faire via HTTPS.
- **Hachage des Mots de Passe :** Les mots de passe doivent être hachés de manière sécurisée côté backend (par exemple, en utilisant bcrypt ou Argon2) avant d'être stockés en base de données. Ne jamais stocker les mots de passe en clair.
- **Protection contre la Force Brute :** Mettre en place des mécanismes de limitation du taux de tentatives de connexion pour prévenir les attaques par force brute.
- **Tokens JWT (JSON Web Tokens) :**
    - Utiliser les JWT pour gérer les sessions utilisateur après la connexion et l'inscription (si connexion automatique).
    - Les tokens doivent contenir des informations essentielles sur l'utilisateur (au moins l'ID utilisateur, potentiellement le type de compte/rôle).
    - Définir des durées d'expiration appropriées pour les tokens. La fonctionnalité "Se souvenir de moi" peut influencer cette durée.
    - Le backend doit valider les JWT reçus dans l'en-tête `Authorization: Bearer <token>` pour toutes les routes API protégées.
- **Validation des Données :** Le backend doit systématiquement revalider toutes les données reçues du client, même si une validation a déjà eu lieu côté frontend.

## 2. Endpoint de Connexion (`POST /api/auth/login`)

Basé sur `LoginPage.js`.

### 2.1. Données Attendues en Requête (Corps JSON)

```json
{
  "email": "user@example.com",
  "password": "user_password",
  "rememberMe": true // ou false
}
```

### 2.2. Traitement Backend

1.  **Validation des entrées :** Vérifier la présence et le format de l'email et du mot de passe.
2.  **Recherche de l'utilisateur :** Trouver l'utilisateur en base de données par son `email`.
3.  **Vérification du mot de passe :** Comparer le hash du mot de passe fourni avec celui stocké.
4.  **Gestion de `rememberMe` :** Si `true`, générer un token JWT avec une durée d'expiration plus longue. Sinon, une durée standard (session navigateur).
5.  **Génération de Token :** En cas de succès, générer un JWT.

### 2.3. Réponses du Backend

-   **Succès (`200 OK`) :**
    ```json
    {
      "token": "your_generated_jwt_token",
      "user": {
        "id": "user_id",
        "email": "user@example.com",
        "firstName": "John", // si applicable
        "lastName": "Doe",   // si applicable
        "accountType": "individual" // ou "company"
        // ... autres informations utilisateur pertinentes pour le frontend
      }
    }
    ```
-   **Échec (`401 Unauthorized` - identifiants incorrects, `400 Bad Request` - validation) :**
    ```json
    // Identifiants incorrects
    { "message": "Email ou mot de passe incorrect." }

    // Erreur de validation
    {
      "message": "Erreur de validation.",
      "errors": {
        "email": "Format d'email invalide."
      }
    }
    ```

## 3. Endpoints d'Inscription

### 3.1. Endpoint d'Inscription Entreprise (`POST /api/auth/register/company`)

Basé sur `CompanyForm.js`.

#### 3.1.1. Données Attendues en Requête (Corps JSON)

```json
{
  "companyName": "Nom de l'Entreprise",
  "industry": "Secteur d'Activité", // Optionnel
  "email": "contact@entreprise.com", // Email principal du compte entreprise
  "phone": "0123456789",
  "address": "123 Rue Principale",
  "city": "Ville",
  "postalCode": "75001",
  "country": "France",
  "contactFirstName": "Prénom Contact",
  "contactLastName": "Nom Contact",
  "contactPosition": "Poste du Contact", // Optionnel
  "password": "motdepassesecurise"
}
```

#### 3.1.2. Traitement Backend

1.  **Validation approfondie** de tous les champs (requis, formats, longueurs).
2.  **Vérification de l'unicité de l'email** (`email`).
3.  **Hachage sécurisé** du `password`.
4.  **Création d'un compte principal** de type `company` lié à l'email et au mot de passe haché.
5.  **Création d'une entité "entreprise"** avec les détails `companyName`, `industry`, `phone`, adresse, liée au compte principal.
6.  **Création/liaison d'un utilisateur "contact"** (`contactFirstName`, `contactLastName`, `contactPosition`) comme administrateur initial du compte entreprise (souvent, l'email de l'entreprise est aussi utilisé pour cet utilisateur).
7.  Optionnel : Envoi d'un email de confirmation/bienvenue.

#### 3.1.3. Réponses du Backend

-   **Succès (`201 Created`) :**
    ```json
    {
      "message": "Compte entreprise créé avec succès.",
      "companyId": "nouvel_id_entreprise",
      "userId": "id_utilisateur_admin"
      // Optionnel : token et infos utilisateur pour connexion automatique
      // "token": "jwt_token",
      // "user": { ... }
    }
    ```
-   **Échec :**
    -   Email déjà utilisé (`409 Conflict` ou `400 Bad Request`) :
        ```json
        { "message": "Un compte avec cet email existe déjà.", "errors": { "email": "Email déjà utilisé." } }
        ```
    -   Erreurs de validation (`400 Bad Request`) :
        ```json
        { "message": "Erreur de validation.", "errors": { "fieldName": "Message spécifique..." } }
        ```

### 3.2. Endpoint d'Inscription Individuelle (`POST /api/auth/register/individual`)

Basé sur `IndividualForm.js`.

#### 3.2.1. Données Attendues en Requête (Corps JSON)

```json
{
  "firstName": "Prénom",
  "lastName": "Nom",
  "email": "utilisateur@example.com",
  "phone": "0612345678",
  "address": "456 Avenue Secondaire",
  "city": "AutreVille",
  "postalCode": "69001",
  "country": "France",
  "birthDate": "YYYY-MM-DD", // Format date
  "occupation": "Profession", // Optionnel
  "password": "autremotdepassesecurise"
}
```

#### 3.2.2. Traitement Backend

1.  **Validation approfondie** de tous les champs (requis, formats, longueurs, âge si applicable).
2.  **Vérification de l'unicité de l'email** (`email`).
3.  **Validation de l'âge** si c'est une contrainte (par exemple, >= 18 ans).
4.  **Hachage sécurisé** du `password`.
5.  **Création d'un compte utilisateur** de type `individual` avec toutes les informations fournies.
6.  Optionnel : Envoi d'un email de confirmation/bienvenue.

#### 3.2.3. Réponses du Backend

-   **Succès (`201 Created`) :**
    ```json
    {
      "message": "Compte individuel créé avec succès.",
      "userId": "nouvel_id_utilisateur"
      // Optionnel : token et infos utilisateur pour connexion automatique
      // "token": "jwt_token",
      // "user": { ... }
    }
    ```
-   **Échec :**
    -   Email déjà utilisé (`409 Conflict` ou `400 Bad Request`) :
        ```json
        { "message": "Un compte avec cet email existe déjà.", "errors": { "email": "Email déjà utilisé." } }
        ```
    -   Erreurs de validation (`400 Bad Request`) :
        ```json
        {
          "message": "Erreur de validation.",
          "errors": {
            "fieldName": "Message spécifique...",
            "birthDate": "L'utilisateur doit avoir au moins 18 ans." // Exemple
          }
        }
        ```

## 4. Modèle de Données Suggéré (Consolidé)

Une approche flexible pourrait utiliser une table principale `accounts` (ou `users`) et une table `companies` pour les détails spécifiques aux entreprises.

### 4.1. Table `accounts`

-   `id` (PK, UUID/Integer auto-incrémenté)
-   `email` (VARCHAR, UNIQUE, NOT NULL) - Utilisé pour la connexion.
-   `password_hash` (VARCHAR, NOT NULL)
-   `account_type` (ENUM('individual', 'company'), NOT NULL)
-   `first_name` (VARCHAR) - Pour les individus ou contact principal entreprise.
-   `last_name` (VARCHAR) - Pour les individus ou contact principal entreprise.
-   `phone` (VARCHAR) - Numéro de téléphone personnel ou du contact/entreprise.
-   `address` (VARCHAR) - Adresse personnelle ou de l'entreprise.
-   `city` (VARCHAR)
-   `postal_code` (VARCHAR)
-   `country` (VARCHAR)
-   `birth_date` (DATE) - Pour les individus.
-   `occupation` (VARCHAR) - Pour les individus.
-   `contact_position` (VARCHAR) - Pour le contact principal d'une entreprise.
-   `created_at` (TIMESTAMP, default NOW())
-   `updated_at` (TIMESTAMP, default NOW())
-   `is_active` (BOOLEAN, default TRUE)
-   `email_verified_at` (TIMESTAMP, nullable) - Pour la vérification d'email.

### 4.2. Table `companies`

-   `id` (PK, UUID/Integer auto-incrémenté)
-   `account_id` (FK vers `accounts.id`, UNIQUE, NOT NULL) - Lie l'entreprise à un enregistrement dans `accounts` qui a `account_type = 'company'`.
-   `company_name` (VARCHAR, NOT NULL)
-   `industry` (VARCHAR, nullable)
-   (*Les informations comme le téléphone de l'entreprise, l'adresse, etc., pourraient être dans la table `accounts` si l'enregistrement `accounts` avec `type='company'` représente directement l'entité entreprise, ou dupliquées/spécifiques ici si nécessaire.*)
-   `created_at` (TIMESTAMP, default NOW())
-   `updated_at` (TIMESTAMP, default NOW())

Cette structure permet de gérer tous les utilisateurs via la table `accounts`, avec des champs conditionnellement remplis ou une table `companies` liée pour les informations spécifiques aux entreprises. L'email du contact principal de l'entreprise peut être celui stocké dans l'enregistrement `accounts` correspondant.
