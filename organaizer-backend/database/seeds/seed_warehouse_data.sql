-- Ce script initialise la base de données avec un jeu de données de test pour un entrepôt.
-- Il est conçu pour être exécuté après la création des tables (migrations).
-- IMPORTANT : Ce script supprime les données existantes pour le compte 24 avant d'insérer les nouvelles.

-- Vider les tables existantes pour éviter les conflits et les doublons.
-- L'ordre est crucial pour respecter les contraintes de clés étrangères.
DELETE FROM `event_participants` WHERE `event_id` IN (SELECT `id` FROM `events` WHERE `account_id` = 24);
DELETE FROM `group_members` WHERE `group_id` IN (SELECT `id` FROM `groups` WHERE `account_id` = 24);
-- Assurez-vous que la table `groups` existe et a une colonne account_id si vous utilisez des groupes.
DELETE FROM `events` WHERE `account_id` = 24;
DELETE FROM `actors` WHERE `account_id` = 24;

-- Réinitialiser l'auto-incrémentation pour un jeu de données propre.
-- Attention : ne pas utiliser en production si les IDs sont référencés ailleurs.
ALTER TABLE `actors` AUTO_INCREMENT = 1;
ALTER TABLE `events` AUTO_INCREMENT = 1;
ALTER TABLE `event_participants` AUTO_INCREMENT = 1;


-- =================================================================
-- 1. CRÉATION DES ACTEURS (EMPLOYES ET LIEUX)
-- =================================================================
-- Tous les acteurs sont liés à account_id = 24

-- Employés (type: human)
INSERT INTO `actors` (`type`, `first_name`, `last_name`, `role`, `email`, `phone`, `account_id`, `created_at`, `updated_at`) VALUES
('human', 'Jean', 'Martin', 'Responsable d''entrepôt', 'jean.martin@example.com', '0601020304', 24, NOW(), NOW()),
('human', 'Sophie', 'Dubois', 'Chef d''équipe (Matin)', 'sophie.dubois@example.com', '0601020305', 24, NOW(), NOW()),
('human', 'Luc', 'Moreau', 'Chef d''équipe (Après-midi)', 'luc.moreau@example.com', '0601020306', 24, NOW(), NOW()),
('human', 'Pierre', 'Girard', 'Cariste', 'pierre.girard@example.com', '0601020307', 24, NOW(), NOW()),
('human', 'Marie', 'Lefebvre', 'Cariste', 'marie.lefebvre@example.com', '0601020308', 24, NOW(), NOW()),
('human', 'Paul', 'Roux', 'Préparateur de commandes', 'paul.roux@example.com', '0601020309', 24, NOW(), NOW()),
('human', 'Julie', 'Mercier', 'Préparatrice de commandes', 'julie.mercier@example.com', '0601020310', 24, NOW(), NOW()),
('human', 'Alain', 'David', 'Emballeur', 'alain.david@example.com', '0601020311', 24, NOW(), NOW()),
('human', 'Isabelle', 'Bertrand', 'Agente de quai (Réception)', 'isabelle.bertrand@example.com', '0601020312', 24, NOW(), NOW()),
('human', 'Thomas', 'Robert', 'Agent de quai (Expédition)', 'thomas.robert@example.com', '0601020313', 24, NOW(), NOW());

-- Lieux (type: location)
INSERT INTO `actors` (`type`, `location_name`, `address`, `account_id`, `created_at`, `updated_at`) VALUES
('location', 'Quai de Réception A', 'Zone 1', 24, NOW(), NOW()),
('location', 'Quai de Réception B', 'Zone 1', 24, NOW(), NOW()),
('location', 'Quai d''Expédition C', 'Zone 2', 24, NOW(), NOW()),
('location', 'Zone de Stockage Allée 5', 'Zone 3', 24, NOW(), NOW()),
('location', 'Zone de Préparation Commandes', 'Zone 4', 24, NOW(), NOW()),
('location', 'Bureau du Responsable', 'Administratif', 24, NOW(), NOW()),
('location', 'Salle de Pause', 'Administratif', 24, NOW(), NOW());


-- =================================================================
-- 2. CRÉATION DES ÉVÉNEMENTS
-- =================================================================
-- Événements pour la semaine du 7 au 11 Juillet 2025

INSERT INTO `events` (`title`, `description`, `start_time`, `end_time`, `event_color`, `location_actor_id`, `presenter_actor_id`, `is_all_day`, `account_id`, `created_at`, `updated_at`) VALUES
-- Lundi
('Briefing équipe du matin', 'Objectifs de la journée et répartition des tâches.', '2025-07-07 08:00:00', '2025-07-07 08:30:00', 'Bleu', 15, 2, 0, 24, NOW(), NOW()),
('Réception Fournisseur TechCorp', 'Contrôle et rangement de la marchandise.', '2025-07-07 09:00:00', '2025-07-07 11:00:00', 'Vert', 11, 9, 0, 24, NOW(), NOW()),
('Préparation Commandes Amazon #1-50', 'Préparation des commandes urgentes.', '2025-07-07 10:00:00', '2025-07-07 12:30:00', 'Orange', 15, 6, 0, 24, NOW(), NOW()),
('Briefing équipe de l''après-midi', 'Passage des consignes et objectifs.', '2025-07-07 13:30:00', '2025-07-07 14:00:00', 'Bleu', 15, 3, 0, 24, NOW(), NOW()),
('Expédition Client ProShop', 'Chargement du camion pour le client ProShop.', '2025-07-07 15:00:00', '2025-07-07 16:30:00', 'Rouge', 13, 10, 0, 24, NOW(), NOW()),

-- Mardi
('Formation Sécurité : Gestes et Postures', 'Formation obligatoire pour les nouveaux et rappel pour les anciens.', '2025-07-08 10:00:00', '2025-07-08 11:30:00', 'Jaune', 17, 1, 0, 24, NOW(), NOW()),
('Inventaire Allée 5', 'Inventaire tournant de la zone de stockage.', '2025-07-08 14:00:00', '2025-07-08 16:00:00', 'Violet', 14, 3, 0, 24, NOW(), NOW()),

-- Mercredi
('Réunion de performance Hebdo', 'Analyse des KPIs de la semaine passée.', '2025-07-09 11:00:00', '2025-07-09 12:00:00', 'Indigo', 16, 1, 0, 24, NOW(), NOW()),
('Réception Fournisseur GlobalParts', 'Déchargement et vérification.', '2025-07-09 14:00:00', '2025-07-09 16:00:00', 'Vert', 12, 9, 0, 24, NOW(), NOW()),

-- Jeudi
('Maintenance préventive Chariot #3', 'Intervention de la société de maintenance.', '2025-07-10 09:00:00', '2025-07-10 10:30:00', 'Gris', 14, NULL, 0, 24, NOW(), NOW()),
('Préparation Commandes CDiscount #51-100', 'Préparation des commandes.', '2025-07-10 13:30:00', '2025-07-10 17:00:00', 'Orange', 15, 7, 0, 24, NOW(), NOW()),

-- Vendredi
('Nettoyage général de l''entrepôt', 'Participation de toutes les équipes.', '2025-07-11 16:00:00', '2025-07-11 17:00:00', 'Marron', NULL, 1, 0, 24, NOW(), NOW());


-- =================================================================
-- 3. ASSIGNATION DES PARTICIPANTS AUX ÉVÉNEMENTS
-- =================================================================
-- Les IDs des événements et des acteurs sont ceux définis ci-dessus.

-- Briefing matin (event 1) -> Equipe du matin
INSERT INTO `event_participants` (`event_id`, `actor_id`, `participation_status`) VALUES
(1, 2, 'accepted'), (1, 4, 'accepted'), (1, 6, 'accepted'), (1, 8, 'accepted'), (1, 9, 'accepted');

-- Réception Fournisseur TechCorp (event 2) -> Cariste + Agent de quai
INSERT INTO `event_participants` (`event_id`, `actor_id`, `participation_status`) VALUES
(2, 4, 'accepted'), (2, 9, 'accepted');

-- Préparation Commandes Amazon (event 3) -> Préparateurs
INSERT INTO `event_participants` (`event_id`, `actor_id`, `participation_status`) VALUES
(3, 6, 'accepted'), (3, 7, 'needsAction');

-- Briefing après-midi (event 4) -> Equipe de l''après-midi
INSERT INTO `event_participants` (`event_id`, `actor_id`, `participation_status`) VALUES
(4, 3, 'accepted'), (4, 5, 'accepted'), (4, 7, 'accepted'), (4, 10, 'accepted');

-- Expédition Client ProShop (event 5) -> Cariste + Agent de quai
INSERT INTO `event_participants` (`event_id`, `actor_id`, `participation_status`) VALUES
(5, 5, 'accepted'), (5, 10, 'accepted');

-- Formation Sécurité (event 6) -> Tout le monde est invité
INSERT INTO `event_participants` (`event_id`, `actor_id`, `participation_status`) VALUES
(6, 2, 'accepted'), (6, 3, 'accepted'), (6, 4, 'accepted'), (6, 5, 'accepted'), (6, 6, 'accepted'), (6, 7, 'accepted'), (6, 8, 'accepted'), (6, 9, 'accepted'), (6, 10, 'accepted');

-- Inventaire (event 7) -> Equipe après-midi
INSERT INTO `event_participants` (`event_id`, `actor_id`, `participation_status`) VALUES
(7, 3, 'accepted'), (7, 5, 'accepted'), (7, 7, 'accepted');

-- Réunion de performance (event 8) -> Manager + Chefs d''équipe
INSERT INTO `event_participants` (`event_id`, `actor_id`, `participation_status`) VALUES
(8, 1, 'accepted'), (8, 2, 'accepted'), (8, 3, 'accepted');

-- Réception Fournisseur GlobalParts (event 9) -> Cariste + Agent de quai
INSERT INTO `event_participants` (`event_id`, `actor_id`, `participation_status`) VALUES
(9, 4, 'accepted'), (9, 9, 'accepted');

-- Maintenance Chariot (event 10) -> Caristes informés
INSERT INTO `event_participants` (`event_id`, `actor_id`, `participation_status`) VALUES
(10, 4, 'tentative'), (10, 5, 'tentative');

-- Préparation Commandes CDiscount (event 11) -> Préparateurs
INSERT INTO `event_participants` (`event_id`, `actor_id`, `participation_status`) VALUES
(11, 6, 'needsAction'), (11, 7, 'accepted');

-- Nettoyage général (event 12) -> Tout le monde
INSERT INTO `event_participants` (`event_id`, `actor_id`, `participation_status`) VALUES
(12, 1, 'accepted'), (12, 2, 'accepted'), (12, 3, 'accepted'), (12, 4, 'accepted'), (12, 5, 'accepted'), (12, 6, 'accepted'), (12, 7, 'accepted'), (12, 8, 'accepted'), (12, 9, 'accepted'), (12, 10, 'accepted');
