SET names 'utf8';
SET character_set_database = 'utf8';

-- bhima test database

-- Enterprise
INSERT INTO `enterprise` VALUES
  (1, 'Test Enterprise', 'TE', '243 81 504 0540', 'enterprise@test.org', HUID('1f162a10-9f67-4788-9eff-c1fea42fcc9b'), NULL, 2, 103, NULL, NULL);

-- Project
INSERT INTO `project` VALUES
  (1, 'Test Project A', 'TPA', 1, 1, 0),
  (2, 'Test Project B', 'TPB', 1, 2, 0),
  (3, 'Test Project C', 'TPC', 1, 2, 0);

-- Accounts
INSERT INTO `account` (`id`, `type_id`, `enterprise_id`, `number`, `label`, `parent`, `locked`, `cc_id`, `pc_id`, `created`, `reference_id`, `is_title`) VALUES
  (1, 6, 1, 1, 'CLASSE 1: COMPTES DE RESSOURCES DURABLES', 0, 0, NULL, NULL, '2016-10-22 14:37:09', NULL, 0),
  (2, 6, 1, 2, 'CLASSE 2: COMPTES D\'ACTIFS IMMOBILISES', 0, 0, NULL, NULL, '2016-10-22 14:39:01', NULL, 0),
  (3, 6, 1, 3, 'CLASSE 3: COMPTES DE STOCKS', 0, 0, NULL, NULL, '2016-10-22 14:39:36', NULL, 0),
  (4, 6, 1, 4, 'CLASSE 4: COMPTES DE TIERS', 0, 0, NULL, NULL, '2016-10-22 14:40:00', NULL, 0),
  (5, 6, 1, 5, 'CLASSE 5: COMPTES DE TRESORERIE', 0, 0, NULL, NULL, '2016-10-22 14:40:26', NULL, 0),
  (6, 6, 1, 6, 'CLASSE 6: COMPTES DES CHARGES DES ACTIVITES ORDINAIRES', 0, 0, NULL, NULL, '2016-10-22 14:40:45', NULL, 0),
  (7, 6, 1, 7, 'CLASSE 7: COMPTES DES PRODUITS DES ACTIVITES ORDINAIRES', 0, 0, NULL, NULL, '2016-10-22 14:41:12', NULL, 0),
  (8, 6, 1, 8, 'CLASSE 8: COMPTES DES AUTRES CHARGES ET DES AUTRES PRODUITS', 0, 0, NULL, NULL, '2016-10-22 14:41:34', NULL, 0),
  (9, 6, 1, 10, 'CAPITAL', 1, 0, NULL, NULL, '2016-10-22 16:27:40', NULL, 0),
  (10, 6, 1, 11, 'RESERVES', 1, 0, NULL, NULL, '2016-10-22 16:28:02', NULL, 0),
  (11, 6, 1, 12, 'REPORT A NOUVEAU', 1, 0, NULL, NULL, '2016-10-22 16:28:24', NULL, 0),
  (12, 6, 1, 13, 'RESULTAT NET DE L\'EXERCICE', 1, 0, NULL, NULL, '2016-10-22 16:28:45', NULL, 0),
  (13, 6, 1, 14, 'SUBVENTIONS D\'INVESTISSEMENT', 1, 0, NULL, NULL, '2016-10-22 16:29:16', NULL, 0),
  (14, 6, 1, 16, 'EMPRUNTS ET DETTES ASSIMILEES', 1, 0, NULL, NULL, '2016-10-22 16:29:41', NULL, 0),
  (15, 6, 1, 17, 'DETTES DE CREDIT-BAIL ET CONTRATS ASSIMILES', 1, 0, NULL, NULL, '2016-10-22 16:30:08', NULL, 0),
  (16, 6, 1, 18, 'DETTES LIEES A DES PARTICIPATIONS ET COMPTES DE LIAISON DES ETABLISSEMENTS ET SOCIETES EN PARTICIPATION', 1, 0, NULL, NULL, '2016-10-22 16:30:32', NULL, 0),
  (17, 6, 1, 19, 'PROVISIONS FINANCIERES POUR RISQUES ET CHARGES', 1, 0, NULL, NULL, '2016-10-22 16:30:49', NULL, 0),
  (18, 6, 1, 20, 'CHARGES IMMOBILISEES', 2, 0, NULL, NULL, '2016-10-22 16:31:19', NULL, 0),
  (19, 6, 1, 21, 'IMMOBILISATIONS INCORPORELLES', 2, 0, NULL, NULL, '2016-10-22 16:32:58', NULL, 0),
  (20, 6, 1, 22, 'TERRAINS', 2, 0, NULL, NULL, '2016-10-22 16:33:24', NULL, 0),
  (21, 6, 1, 23, 'BATIMENTS, INSTALLATIONS TECHNIQUES ET AGENCEMENTS', 2, 0, NULL, NULL, '2016-10-22 16:33:44', NULL, 0),
  (22, 6, 1, 24, 'MATERIELS', 2, 0, NULL, NULL, '2016-10-22 16:34:05', NULL, 0),
  (23, 6, 1, 27, 'AUTRES IMMOBILISATIONS FINANCIERES', 2, 0, NULL, NULL, '2016-10-22 16:34:41', NULL, 0),
  (24, 6, 1, 28, 'AMORTISSEMENTS', 2, 0, NULL, NULL, '2016-10-22 16:34:59', NULL, 0),
  (25, 6, 1, 29, 'PROVISIONS POUR DEPRECIATIONS', 2, 0, NULL, NULL, '2016-10-22 16:35:16', NULL, 0),
  (26, 6, 1, 31, 'MARCHANDISES', 3, 0, NULL, NULL, '2016-10-22 16:35:40', NULL, 0),
  (27, 6, 1, 32, 'MATIERES PREMIERES ET FOURNITURES LIEES', 3, 0, NULL, NULL, '2016-10-22 16:36:00', NULL, 0),
  (28, 6, 1, 33, 'AUTRES APPROVISIONNEMENTS', 3, 0, NULL, NULL, '2016-10-22 16:36:19', NULL, 0),
  (29, 6, 1, 36, 'PRODUITS FINIS', 3, 0, NULL, NULL, '2016-10-22 16:36:39', NULL, 0),
  (30, 6, 1, 38, 'STOCKS EN COURS DE ROUTE, EN CONSIGNATION OU EN DÉPÔT', 3, 0, NULL, NULL, '2016-10-22 16:37:19', NULL, 0),
  (31, 6, 1, 39, 'DÉPRÉCIATIONS DES STOCKS', 3, 0, NULL, NULL, '2016-10-22 16:37:39', NULL, 0),
  (32, 6, 1, 40, 'FOURNISSEURS ET COMPTE  RATTACHES', 4, 0, NULL, NULL, '2016-10-22 16:38:02', NULL, 0),
  (33, 6, 1, 41, 'CLIENTS ET COMPTE RATTACHES', 4, 0, NULL, NULL, '2016-10-22 16:38:22', NULL, 0),
  (34, 6, 1, 42, 'PERSONNEL', 4, 0, NULL, NULL, '2016-10-22 16:38:43', NULL, 0),
  (35, 6, 1, 43, 'ORGANISMES  SOCIAUX', 4, 0, NULL, NULL, '2016-10-22 16:38:59', NULL, 0),
  (36, 6, 1, 44, 'ETAT ET COLLECTIVITES PUBLIQUES', 4, 0, NULL, NULL, '2016-10-22 16:39:20', NULL, 0),
  (37, 6, 1, 47, 'DEBITEURS  ET CREDITEURS  DIVERS', 4, 0, NULL, NULL, '2016-10-22 16:39:45', NULL, 0),
  (38, 6, 1, 48, 'CREANCES ET DETTES  HORS ACTIVITE ORDINAIRE', 4, 0, NULL, NULL, '2016-10-22 16:39:59', NULL, 0),
  (39, 6, 1, 49, 'DEPRECIATION ET RISQUES PROVISIONNES (Tiers)', 4, 0, NULL, NULL, '2016-10-22 16:40:23', NULL, 0),
  (40, 6, 1, 51, 'VALEURS A ENCAISSER', 5, 0, NULL, NULL, '2016-10-22 16:40:48', NULL, 0),
  (41, 6, 1, 52, 'BANQUES', 5, 0, NULL, NULL, '2016-10-22 16:41:05', NULL, 0),
  (42, 6, 1, 53, 'ETABLISSEMENTS FINANCIERS ET ASSIMILES', 5, 0, NULL, NULL, '2016-10-22 16:41:19', NULL, 0),
  (43, 6, 1, 56, 'BANQUES, CREDIT DE TRESORERIE ET D\'ESCOMPTE', 5, 0, NULL, NULL, '2016-10-22 16:41:40', NULL, 0),
  (44, 6, 1, 57, 'CAISSE', 5, 0, NULL, NULL, '2016-10-22 16:42:13', NULL, 0),
  (45, 6, 1, 58, 'REGIES D\'AVANCES, ACCREDITIFS ET VIREMENTS INTERNE', 5, 0, NULL, NULL, '2016-10-22 16:42:34', NULL, 0),
  (46, 6, 1, 59, 'DEPRECIATIONS ET RISQUES PROVISIONNES', 5, 0, NULL, NULL, '2016-10-22 16:43:12', NULL, 0),
  (47, 6, 1, 60, 'ACHATS ET VARIATIONS DE STOCKS', 6, 0, NULL, NULL, '2016-10-22 16:43:34', NULL, 0),
  (48, 6, 1, 61, 'TRANSPORTS', 6, 0, NULL, NULL, '2016-10-22 16:43:57', NULL, 0),
  (49, 6, 1, 62, 'SERVICES EXTÉRIEURS A', 6, 0, NULL, NULL, '2016-10-22 16:44:10', NULL, 0),
  (50, 6, 1, 63, 'SERVICES EXTÉRIEURS B', 6, 0, NULL, NULL, '2016-10-22 16:44:30', NULL, 0),
  (51, 6, 1, 64, 'IMPÔTS ET TAXES', 6, 0, NULL, NULL, '2016-10-22 16:44:49', NULL, 0),
  (52, 6, 1, 65, 'AUTRES CHARGES', 6, 0, NULL, NULL, '2016-10-22 16:45:02', NULL, 0),
  (53, 6, 1, 66, 'CHARGES DE PERSONNEL', 6, 0, NULL, NULL, '2016-10-22 16:45:18', NULL, 0),
  (54, 6, 1, 67, 'FRAIS FINANCIERS ET CHARGES ASSIMILÉES', 6, 0, NULL, NULL, '2016-10-22 16:45:36', NULL, 0),
  (55, 6, 1, 68, 'DOTATIONS AUX AMORTISSEMENTS', 6, 0, NULL, NULL, '2016-10-22 16:45:52', NULL, 0),
  (56, 6, 1, 69, 'DOTATIONS AUX PROVISIONS', 6, 0, NULL, NULL, '2016-10-22 16:46:07', NULL, 0),
  (57, 6, 1, 70, 'VENTES', 7, 0, NULL, NULL, '2016-10-22 16:47:00', NULL, 0),
  (58, 6, 1, 71, '71 SUBVENTIONS D\'EXPLOITATION', 7, 0, NULL, NULL, '2016-10-22 16:47:15', NULL, 0),
  (59, 6, 1, 72, 'PRODUCTION IMMOBILISÉE', 7, 0, NULL, NULL, '2016-10-22 16:47:29', NULL, 0),
  (60, 6, 1, 73, 'VARIATIONS DES STOCKS DE BIENS ET DE SERVICES PRODUITS', 7, 0, NULL, NULL, '2016-10-22 16:47:48', NULL, 0),
  (61, 6, 1, 75, 'AUTRES PRODUITS', 7, 0, NULL, NULL, '2016-10-22 16:48:15', NULL, 0),
  (62, 6, 1, 77, 'REVENUS FINANCIERS ET PRODUITS ASSIMILÉS', 7, 0, NULL, NULL, '2016-10-22 16:48:31', NULL, 0),
  (63, 6, 1, 78, 'TRANSFERTS DE CHARGES', 7, 0, NULL, NULL, '2016-10-22 16:48:49', NULL, 0),
  (64, 6, 1, 79, 'REPRISES DE PROVISIONS', 7, 0, NULL, NULL, '2016-10-22 16:49:07', NULL, 0),
  (65, 6, 1, 81, 'VALEURS COMPTABLE DES CESSIONS D\'IMMOBILISATIONS', 8, 0, NULL, NULL, '2016-10-22 16:49:36', NULL, 0),
  (66, 6, 1, 82, 'PRODUITS DES CESSIONS D\'IMMOBILISATIONS', 8, 0, NULL, NULL, '2016-10-22 16:49:50', NULL, 0),
  (67, 6, 1, 83, 'CHARGES HORS ACTIVITES ORDINAIRES', 8, 0, NULL, NULL, '2016-10-22 16:50:03', NULL, 0),
  (68, 6, 1, 84, 'PRODUITS HORS ACTIVITES ORDINAIRES', 8, 0, NULL, NULL, '2016-10-22 16:50:22', NULL, 0),
  (69, 6, 1, 85, 'DOTATIONS HORS ACTIVITES ORDINAIRES', 8, 0, NULL, NULL, '2016-10-22 16:50:43', NULL, 0),
  (70, 6, 1, 86, 'REPRISES HORS ACTIVITES ORDINAIRES', 8, 0, NULL, NULL, '2016-10-22 16:50:57', NULL, 0),
  (71, 6, 1, 88, 'SUBVENTIONS D\'EQUILIBRE', 8, 0, NULL, NULL, '2016-10-22 16:51:15', NULL, 0),
  (72, 6, 1, 89, 'IMPOTS SUR LE RESULTAT', 8, 0, NULL, NULL, '2016-10-22 16:51:30', NULL, 0),
  (73, 6, 1, 101, 'Capital Social', 9, 0, NULL, NULL, '2016-10-22 16:56:20', NULL, 0),
  (74, 6, 1, 105, 'Primes liées aux capitaux propres', 9, 0, NULL, NULL, '2016-10-22 16:56:46', NULL, 0),
  (75, 6, 1, 106, 'Ecart de réévaluation', 9, 0, NULL, NULL, '2016-10-22 16:57:30', NULL, 0),
  (76, 6, 1, 109, 'Actionnaire, Capital souscrit, non appelé', 9, 0, NULL, NULL, '2016-10-22 16:58:03', NULL, 0),
  (77, 6, 1, 1013, 'Capital souscrit, appelé,  versé, non amorti', 73, 0, NULL, NULL, '2016-10-22 16:59:19', NULL, 0),
  (81, 3, 1, 10133000, 'Compte - Capital souscrit, appelé,  versé, non amorti', 77, 0, NULL, NULL, '2016-10-22 17:25:29', NULL, 0),
  (82, 6, 1, 1052, 'Primes d\'apport', 74, 0, NULL, NULL, '2016-10-22 20:55:08', NULL, 0),
  (83, 3, 1, 10521010, 'Compte Primes d\'apport', 82, 0, NULL, NULL, '2016-10-22 20:56:08', NULL, 0),
  (84, 6, 1, 1053, 'Primes de fusion', 74, 0, NULL, NULL, '2016-10-22 20:57:27', NULL, 0),
  (85, 3, 1, 10531010, 'Compte Primes de fusion', 84, 0, NULL, NULL, '2016-10-22 20:58:15', NULL, 0),
  (86, 6, 1, 1054, 'Primes de conversion', 74, 0, NULL, NULL, '2016-10-22 20:59:49', NULL, 0),
  (87, 3, 1, 10541010, 'Compte Primes de conversion', 86, 0, NULL, NULL, '2016-10-22 21:00:28', NULL, 0),
  (88, 6, 1, 1061, 'Ecart de réévaluation *', 75, 0, NULL, NULL, '2016-10-22 21:02:53', NULL, 0),
  (89, 3, 1, 10610000, 'Ecart de réévaluation légal', 88, 0, NULL, NULL, '2016-10-22 21:03:47', NULL, 0),
  (90, 6, 1, 1091, 'Actionnaire, Capital souscrit, non appelé *', 76, 0, NULL, NULL, '2016-10-22 21:06:36', NULL, 0),
  (91, 3, 1, 10911010, 'Compte Actionnaire, Capital souscrit, non appelé', 90, 0, NULL, NULL, '2016-10-22 21:07:10', NULL, 0),
  (92, 6, 1, 111, 'Reserve légale', 10, 0, NULL, NULL, '2016-10-22 23:39:20', NULL, 0),
  (93, 6, 1, 1111, 'Reserve légale *', 92, 0, NULL, NULL, '2016-10-22 23:40:17', NULL, 0),
  (94, 3, 1, 11110000, 'Compte Reserve légale', 93, 0, NULL, NULL, '2016-10-22 23:41:23', NULL, 0),
  (95, 6, 1, 112, 'Reserve statutaires ou contractuelles', 10, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (96, 6, 1, 118, 'Autres reserves', 10, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (97, 6, 1, 1121, 'Reserve statutaires ou contractuelles *', 95, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (98, 6, 1, 1181, 'Autres reserves *', 96, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (99, 6, 1, 1188, 'Reserves diverses', 96, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (100, 6, 1, 121, 'Report à nouveau créditeur', 11, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (101, 6, 1, 129, 'Report à nouveau debiteur', 11, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (102, 6, 1, 1211, 'Report à nouveau créditeur *', 100, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (103, 6, 1, 1291, 'Perte nette à reporter', 101, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (104, 6, 1, 1292, 'Perte-Amortissements réputés différés', 101, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (105, 6, 1, 130, 'Résultat en instance d\'affectation', 12, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (106, 6, 1, 131, 'Résusltat net : Bénéfice', 12, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (107, 6, 1, 139, 'Résultat net: perte', 12, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (108, 6, 1, 1301, 'Résultat en instance d\'affectation: Benefice', 105, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (109, 6, 1, 1309, 'Résultat en instance d\'affectation: Perte', 105, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (111, 6, 1, 1311, 'Résusltat net : Bénéfice *', 106, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (112, 6, 1, 1391, 'Résultat net: perte *', 107, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (113, 6, 1, 141, 'Subventions d\'équipement', 13, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (114, 6, 1, 1411, 'Etat', 113, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (115, 6, 1, 1417, 'Entreprises et organismes privés', 113, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (116, 6, 1, 1418, 'Autres', 113, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (117, 6, 1, 165, 'Depots et Cautionnement recus *', 14, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (118, 6, 1, 168, 'Autres emprunts et dettes', 14, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (119, 6, 1, 1651, 'Depots', 117, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (120, 6, 1, 1652, 'Cautionnement', 117, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (121, 6, 1, 1688, 'Autres emprunts et dettes *', 118, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (122, 6, 1, 172, 'Emprunts équivalents de crédit-bail immobilier', 15, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (123, 6, 1, 186, 'Comptes de liaison charges', 16, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (124, 6, 1, 187, 'Comptes de liaison produits', 16, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (125, 6, 1, 1861, 'Comptes de liaison charges *', 123, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (126, 6, 1, 1871, 'Comptes de liaison produits *', 124, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (127, 6, 1, 191, 'Provisions pour litiges', 17, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (128, 6, 1, 194, 'Provisions pour pertes de change', 17, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (129, 6, 1, 195, 'Provisions pour impôts', 17, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (130, 6, 1, 196, 'Provisions pour pensions et obligations similaires', 17, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (131, 6, 1, 197, 'Provisions pour charges à repartir sur plusieurs exercices', 17, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (132, 6, 1, 198, 'Autres provisions financières pour risques et charges', 17, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (133, 6, 1, 1911, 'Provisions pour litiges *', 127, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (134, 6, 1, 1941, 'Provisions pour pertes de change *', 128, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (135, 6, 1, 1951, 'Provisions pour impôts *', 129, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (136, 6, 1, 1961, 'Provisions pour pensions et obligations similaires *', 130, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (137, 6, 1, 1971, 'Provisions pour charges à repartir sur plusieurs exercices *', 131, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (138, 6, 1, 1981, 'Autres provisions financières pour risques et charges *', 132, 0, NULL, NULL, '2016-10-22 21:37:09', NULL, 0),
  (150, 1, 1, 22321000, 'Batiment Hopital', 20, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (151, 1, 1, 23131000, 'Batiment Hopital *', 21, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (152, 1, 1, 24480040, 'Mobiliers Hopital', 21, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (156, 1, 1, 28310010, 'Amortissement Batiments', 24, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (160, 6, 1, 311, 'MARCHANDISES A', 26, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (161, 6, 1, 3111, 'Medicaments', 160, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (162, 1, 1, 31110010, 'Medicaments en comprimes *', 161, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (163, 1, 1, 31110011, 'Medicaments en Sirop *', 161, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (170, 6, 1, 4011, 'Fournisseurs', 32, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (171, 1, 1, 41111000, 'SNEL', 173, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (172, 1, 1, 41111001, 'REGIDESO', 173, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (173, 6, 1, 4111, 'Client (Groupe Debiteur)', 32, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (174, 1, 1, 41111010, 'CHURCH', 173, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (175, 1, 1, 41111011, 'NGO', 173, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (176, 1, 1, 41111012, 'CASH PAYMENT CLIENT', 173, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (177, 1, 1, 41111013, 'GUEST HOUSE', 173, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (178, 6, 1, 422, 'REMUNERATION DUE', 34, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (179, 1, 1, 42210010, 'Salaires à payer', 178, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (180, 6, 1, 521, 'Banques locales', 41, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (181, 6, 1, 5211, 'Banques en Franc congolais', 180, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (182, 1, 1, 52111010, 'BCDC CDF', 181, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (183, 6, 1, 5212, 'Banques locales en Devises', 180, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (184, 1, 1, 52121010, 'BCDC USD', 183, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (185, 6, 1, 571, 'Caisse HOPITAL', 44, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (186, 6, 1, 5711, 'Caisse en franc congolais', 185, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (187, 1, 1, 57110010, 'Caisse Principale CDF', 186, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (188, 1, 1, 57110011, 'Caisse Auxiliaire CDF', 187, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (189, 6, 1, 5712, 'Caisse en devises', 185, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (190, 1, 1, 57120010, 'Caisse Principale USD', 189, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (191, 1, 1, 57120011, 'Caisse Auxiliaire USD', 189, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (192, 6, 1, 585, 'Virement des fonds', 45, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (193, 6, 1, 5851, 'Virement des fonds *', 192, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (194, 1, 1, 58511010, 'Virement des fonds Caisse Auxiliaire - Caisse Principale USD', 193, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (195, 1, 1, 58511011, 'Virement des fonds Caisse Principale - Caisse Auxiliaire USD', 193, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (196, 1, 1, 58511012, 'Virement des fonds Banque-Caisse Principale USD', 193, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (197, 1, 1, 58511013, 'Virement des fonds Caisse Auxiliaire - Caisse Principale CDF', 193, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (198, 1, 1, 58511014, 'Virement des fonds Caisse Principale - Caisse Auxiliaire CDF', 193, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (199, 1, 1, 58511015, 'Virement des fonds Banque-Caisse Principale CDF', 193, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (200, 6, 1, 601, 'ACHATS DE MARCHANDISES', 47, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (201, 5, 1, 60111010, 'Achat Médicaments en comprimés', 200, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (202, 5, 1, 60111011, 'Achat Médicaments en Sirop', 200, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (203, 5, 1, 60111012, 'Achat Médicaments en crème', 200, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (204, 5, 1, 60111013, 'Achat Médicaments en Poudre et Capsul', 200, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (205, 5, 1, 60111014, 'Achat Injectables', 200, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (206, 5, 1, 60111015, 'Achat Produit  de Perfusion', 200, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (207, 5, 1, 60111016, 'Achat Produits Ophtamologiques', 200, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (208, 6, 1, 603, 'VARIATIONS DES STOCKS DE BIENS ACHETÉS', 47, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (209, 5, 1, 60310010, 'Médicaments en comprimés', 208, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (210, 5, 1, 60310011, 'Médicaments en Sirop', 208, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (211, 5, 1, 60310012, 'Achat Médicaments en crème', 208, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (212, 5, 1, 60310013, 'Achat Médicaments en Poudre et Capsul', 208, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (213, 5, 1, 60310014, 'Achat Injectables', 208, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (214, 5, 1, 60310015, 'Achat Produit  de Perfusion', 208, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (215, 5, 1, 60310016, 'Achat Produits Ophtamologiques', 208, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (216, 6, 1, 605, 'AUTRES ACHATS', 47, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (217, 5, 1, 60511010, 'Eau', 216, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (218, 5, 1, 60521010, 'Electricité', 216, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (219, 6, 1, 661, 'RÉMUNÉRATIONS DIRECTES VERSÉES AU PERSONNEL NATIONAL', 53, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (220, 5, 1, 66110011, 'Remunération Personnel', 219, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (221, 6, 1, 676, 'PERTES DE CHANGE', 54, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (222, 5, 1, 67611010, 'Différences de change', 221, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (240, 6, 1, 701, 'VENTES DE MARCHANDISES', 57, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (241, 6, 1, 7011, 'Vente des medicaments dans la Region Ohada', 240, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (242, 4, 1, 70111010, 'Vente Medicaments en comprimes', 241, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (243, 4, 1, 70111011, 'Vente Medicaments en Sirop', 241, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (244, 6, 1, 706, 'SERVICES VENDUS', 57, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (245, 6, 1, 7061, 'Services vendus dans la Region ohada', 244, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (246, 4, 1, 70611010, 'Consultations', 245, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (247, 4, 1, 70611011, 'Optique', 245, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (248, 4, 1, 70611012, 'Hospitalisation', 245, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (249, 4, 1, 70611017, 'Administration', 245, 0, NULL, 1, '2016-10-23 16:05:34', NULL, 0),
  (250, 4, 1, 70611036, 'URGENCES', 245, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (251, 6, 1, 754, 'PRODUITS DES CESSIONS D IMMOBILISATIONS', 61, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (252, 4, 1, 75411010, 'Produits des Cessions d Immobilisations *', 251, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (253, 6, 1, 758, 'PRODUITS DIVERS', 61, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (254, 6, 1, 7581, 'Jetons de presence et autres remunerations d\'administrateurs', 253, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (255, 4, 1, 75811010, 'Jeton de presence', 254, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (256, 4, 1, 75811011, 'Autres remunerations d administrateurs', 254, 0, NULL, 1, '2016-10-23 16:05:34', NULL, 0),
  (257, 6, 1, 7582, 'Indemnites d\'assurances recues', 253, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (258, 4, 1, 75821010, 'Indemnites d\'assurances recues', 257, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (259, 6, 1, 7588, 'Autres Produits divers', 253, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (260, 4, 1, 75881010, 'Autres revenus', 259, 0, NULL, 1, '2016-10-23 16:05:34', NULL, 0),
  (261, 6, 1, 771, 'INTERETS DE PRETS', 62, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (262, 4, 1, 77111010, 'Interets de Prets *', 261, 0, NULL, 1, '2016-10-23 16:05:34', NULL, 0),
  (264, 6, 1, 773, 'ESCOMPTES OBTENUS', 62, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (265, 4, 1, 77311010, 'Escomptes obtenus *', 264, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (266, 6, 1, 776, 'GAINS DE CHANGE', 62, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (267, 4, 1, 77611010, 'Gain de change *', 266, 0, NULL, 1, '2016-10-23 16:05:34', NULL, 0),
  (280, 5, 1, 81111010, 'Compte Immobilisations incorporelles', 65, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (281, 5, 1, 81211010, 'Compte Immobilisations corporelles', 65, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (282, 5, 1, 81611010, 'Compte Immobilisations financières', 65, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (283, 3, 1, 13110001, 'Résusltat de l\'exercise', 111, 0, NULL, NULL, '2017-06-09 12:29:04', NULL, 0),
  (284, 1, 1, 40111000, 'SNEL SUPPLIER', 170, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (285, 1, 1, 40111001, 'REGIDESO SUPPLIER', 170, 0, NULL, NULL, '2016-10-23 16:05:34', NULL, 0),
  (300, 5, 1, 40111002, 'SUPPLIER\'S ACCOUNT 1', 170, 0, NULL, NULL, '2017-11-06 15:07:21', NULL, 0),
  (301, 5, 1, 40111003, 'SUPPLIER\'S ACCOUNT 2', 170, 0, NULL, NULL, '2017-11-06 15:07:21', NULL, 0);


-- attach gain/loss accounts to the enterprise
UPDATE enterprise SET `gain_account_id` = 267, `loss_account_id` = 134;

-- create test users
INSERT INTO user (id, username, password, display_name, email, deactivated) VALUES
  (1, 'superuser', PASSWORD('superuser'), 'Super User', 'SuperUser@test.org', 0),
  (2, 'RegularUser', PASSWORD('RegularUser'), 'Regular User', 'RegUser@test.org', 0),
  (3, 'NoUserPermissions', PASSWORD('NoUserPermissions'), 'No Permissrepertoireions', 'Invalid@test.org', 0),
  (4, 'admin', PASSWORD('1'), 'Admin User', 'admin@test.org', 1);

SET @superUser = 1;

-- the super user has permission to everything user
INSERT INTO permission (unit_id, user_id)
SELECT unit.id, @superUser FROM unit ON DUPLICATE KEY UPDATE unit_id = unit_id, user_id = user_id;

-- Update permission for Regular user
INSERT INTO permission (unit_id, user_id) VALUES
-- Account Management
(6,2),

-- [Folder] Finance
(5,2),

-- Fiscal Year
(13,2);


-- Fiscal Year 2015
SET @fiscalYear2015 = 0;
CALL CreateFiscalYear(1, NULL, @superUser, 'Test Fiscal Year 2015', 12, DATE('2015-01-01'), DATE('2015-12-31'), 'Note for 2015', @fiscalYear2015);

-- Fiscal Year 2016
SET @fiscalYear2016 = 0;
CALL CreateFiscalYear(1, @fiscalYear2015, @superUser, 'Test Fiscal Year 2016', 12, DATE('2016-01-01'), DATE('2016-12-31'), 'Note for 2016', @fiscalYear2016);

-- Fiscal Year 2017
SET @fiscalYear2017 = 0;
CALL CreateFiscalYear(1, @fiscalYear2016, @superUser, 'Test Fiscal Year 2017', 12, DATE('2017-01-01'), DATE('2017-12-31'), 'Note for 2017', @fiscalYear2017);

SET @fiscalYear2018 = 0;
CALL CreateFiscalYear(1, @fiscalYear2017, @superUser, 'Fiscal Year 2018', 12, DATE('2018-01-01'), DATE('2018-12-31'), 'Notes for 2018', @fiscalYear2018);

-- give test permission to all projects
INSERT INTO `project_permission` VALUES (1, 1, 1),(2, 1, 2),(3, 2, 1),(4, 4, 1);

SET @USD = 1;
SET @FC = 2;

-- exchange rate for the current date
INSERT INTO `exchange_rate` VALUES
  (1, 1, @USD, 900.0000, DATE('2016-01-01')),
  (2, 1, @USD, 930.0000, NOW());

INSERT INTO `cash_box` (id, label, project_id, is_auxiliary) VALUES
  (1, 'Caisse Principale', 1, 0),
  (2, 'Caisse Auxiliaire', 1, 1);

SET @CaissePrincipale = 1;
SET @CaisseAux = 2;

INSERT INTO `cash_box_account_currency` (id, currency_id, cash_box_id, account_id, transfer_account_id) VALUES
  (1, @USD, @CaissePrincipale, 190, 195),
  (2, @FC, @CaissePrincipale, 187, 198),
  (3, @USD, @CaisseAux, 191, 194),
  (4, @FC, @CaisseAux, 188, 197);

-- Set Cashbox Management By User
INSERT INTO cashbox_permission (user_id, cashbox_id) VALUES
  (@superUser, 1),
  (@superUser, 2),
  (2, 1);

INSERT INTO `inventory_group` (`uuid`,           `name`,                                             `code`, `sales_account`, `cogs_account`, `stock_account`, `donation_account`) VALUES
  (HUID('1a5e9a0f-94de-441e-b73f-652c8755af3e'), 'Accouchement',                                     '26',   0,               NULL,           NULL,            NULL),
  (HUID('Cb5614cc-cd18-4bdd-9b9c-275e274dd984'), 'Administration',                                   '24',   0,               NULL,           NULL,            NULL),
  (HUID('5e702a4e-ee44-4379-879f-492efa09cc69'), 'Chirurgie',                                        '22',   0,               NULL,           NULL,            NULL),
  (HUID('52a4823c-6d66-4746-8eb6-3e778f7cb03e'), 'Consultation',                                     '5',    0,               NULL,           NULL,            NULL),
  (HUID('931453f4-c344-477a-b0a7-a3ee795ad65c'), 'Endodontie',                                       '1',    0,               NULL,           NULL,            NULL),
  (HUID('07f65e28-9b82-46ff-ba51-51f92acefdc6'), 'Equipements medicaux (gants,blouses, masques...)', '29',   0,               NULL,           NULL,            NULL),
  (HUID('2ae82e9a-c811-40f9-8d27-7ab999163b77'), 'Externe',                                          '35',   0,               NULL,           NULL,            NULL),
  (HUID('000dee1d-9bf5-4b06-9344-f124afa49fe6'), 'Extration dentaire',                               '36',   0,               NULL,           NULL,            NULL),
  (HUID('8031296e-b943-49cc-933c-064ad6f16bbc'), 'Fourniture nursing(bistouris,sparadraps,...)',     '15',   0,               NULL,           NULL,            NULL),
  (HUID('B4303940-ba4b-443f-b885-fd69096f4022'), 'Fournitures Electriques et Soudures',              '19',   0,               NULL,           NULL,            NULL),
  (HUID('50cbf281-e1d0-4be2-a487-742bcca55b1a'), 'Fournitures Papeterie',                            '16',   0,               NULL,           NULL,            NULL),
  (HUID('0abbd8a8-5e65-4055-b573-0e86994532d7'), 'Hospitalization',                                  '11',   0,               NULL,           NULL,            NULL),
  (HUID('10eb24ce-a984-423a-8eda-b37b7ef7c3b9'), 'IMA Subsidy',                                      '17',   0,               NULL,           NULL,            NULL),
  (HUID('995e934f-7933-4d75-b67e-7a3c31fdf1c8'), 'Injectable',                                       '32',   0,               NULL,           NULL,            NULL),
  (HUID('70fe26ae-1665-4b9d-bc43-cbde0469bc6d'), 'Labo',                                             '23',   0,               NULL,           NULL,            NULL),
  (HUID('F6466c49-4904-4c94-a862-f97a7b6677d5'), 'Lunettes',                                         '3',    0,               NULL,           NULL,            NULL),
  (HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 'Medicaments en comprimes',                         '34',   242,             209,            162,             NULL),
  (HUID('7b8dae20-a8e9-4ed0-8099-e00e774c91e6'), 'Medicaments en Poudre et Capsul',                  '6',    0,               NULL,           NULL,            NULL),
  (HUID('4f804446-16cc-47e4-a40f-8d915107d431'), 'Medicaments en Sirop',                             '20',   243,             210,            163,             NULL),
  (HUID('Ed8371c3-8962-45ea-8305-4c0f69267109'), 'obturation provisoire',                            '37',   0,               NULL,           NULL,            NULL),
  (HUID('549b2a7b-c6fd-4376-bee5-24f73eec5b62'), 'Ophtamologie',                                     '10',   0,               NULL,           NULL,            NULL),
  (HUID('B872a804-cdf5-4f3b-b338-bbc1bdf62565'), 'Optique',                                          '8',    0,               NULL,           NULL,            NULL),
  (HUID('2572c155-1fd1-45b6-86c7-79e4f9e1d265'), 'Orl',                                              '33',   0,               NULL,           NULL,            NULL),
  (HUID('0fb9451a-b69e-49b1-a449-0db50f4d16a2'), 'Orthodontie',                                      '38',   0,               NULL,           NULL,            NULL),
  (HUID('82066670-a986-472d-accf-041079d6d86b'), 'Parodontie',                                       '18',   0,               NULL,           NULL,            NULL),
  (HUID('16eeb94a-39bc-4139-b6c5-c8832d33dcac'), 'Perfusion',                                        '39',   0,               NULL,           NULL,            NULL),
  (HUID('1b571ce7-01b5-47b9-9a1d-ab34c674e5c7'), 'Petite chirurgie sutures',                         '14',   0,               NULL,           NULL,            NULL),
  (HUID('3cab95e2-8be6-4e5e-b5e8-1e842967c897'), 'Platre',                                           '21',   0,               NULL,           NULL,            NULL),
  (HUID('11573272-996c-4121-ae47-3ecdeb69d3d1'), 'Produit dentaire',                                 '2',    0,               NULL,           NULL,            NULL),
  (HUID('4daeeca1-52f7-4ae7-b5be-fb283a9a03f7'), 'produit entretien nettoyage020',                   '27',   0,               NULL,           NULL,            NULL),
  (HUID('8771596c-b5f1-4a04-ae49-9ef54973439a'), 'Produits Radio',                                   '13',   0,               NULL,           NULL,            NULL),
  (HUID('4dccb06e-a480-4830-8edd-610cf7c4a3fb'), 'Radiologie',                                       '30',   0,               NULL,           NULL,            NULL),
  (HUID('F2466570-be05-4e2d-84e2-65a8e60f5faf'), 'Reactifs Labo',                                    '28',   0,               NULL,           NULL,            NULL),
  (HUID('0fce8191-7ef0-4da4-a411-6680b66405f5'), 'service preventif',                                '12',   0,               NULL,           NULL,            NULL),
  (HUID('153e5616-a79f-4c8d-bb74-de5151cee471'), 'Soins dentaire',                                   '31',   0,               NULL,           NULL,            NULL),
  (HUID('7745a00f-2c07-4731-9215-7bbf52b7e69f'), 'Sondes',                                           '4',    0,               NULL,           NULL,            NULL),
  (HUID('3824817c-c1c8-434f-8fed-10e1b3459921'), 'Suppositoires',                                    '7',    0,               NULL,           NULL,            NULL),
  (HUID('602b8f2f-eadb-4f2e-862e-37ceac62c0d5'), 'Urgence',                                          '25',   0,               NULL,           NULL,            NULL),
  (HUID('1581149f-ff40-46d6-a012-e742cf770db1'), 'Visite speciale',                                  '9',    0,               NULL,           NULL,            NULL);

INSERT INTO `inventory` (`enterprise_id`, `uuid`, `code`, `text`, `price`, `default_quantity`, `group_uuid`, `unit_id`, `unit_weight`, `unit_volume`, `stock`, `stock_max`, `stock_min`, `type_id`, `consumable`, `locked`, `delay`, `avg_consumption`, `purchase_interval`, `created_at`, `updated_at`) VALUES
  (1, HUID('c8a406a9-53d6-429f-84d8-fc497875a580'), '110001', 'ampicilline susp \'100 ml125mg/5ml', 0.6600,1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'),2, 0, 0,1,100000000, 0,1,1, 0,1,1.0000,1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('d8a406a9-53d6-419f-84d8-fc497875a580'), '00010001', 'ACT 100mg/270mg adulte',                                 0.6451,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 9,  0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('8d857fba-c9fc-43c0-b9c7-3e73ce3f5bb2'), '0004001',  'ACT 25mg / 63.5mg de 0 a 11 mois',                       0.4838,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 9,  0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('3c558990-5a52-4463-bd83-d5b95b1a1555'), '002001',   'ACT 100mg/270ml 6 a 13 ans',                             0.4838,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 9,  0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('8d58bc5b-eec0-4231-98fb-1c860386c9f5'), '003001',   'ACT 50mg/135mg 1 a 5 ans',                               0.4838,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 9,  0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('ade83cab-f580-4f3a-beb9-55d5ae4ea71a'), '005001',   'Cotrimoxazol 960mg tab',                                 0.7930,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 9,  0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('d03e7870-0c8e-47d4-a7a8-a17a9924b3f4'), '100001',   'Acetazolamide 250mg',                                    0.8900,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('6597eb4d-0211-422d-b886-3635e141c307'), '100002',   'Acide folique 5mg',                                      0.0200,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('7c5adff2-d218-4d6e-9ba5-6f6857e452a6'), '100003',   'Albendazole',                                            0.1300,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('363ba0e1-43d5-4010-9c3f-77b14387da8c'), '100004',   'Allopurinol 100mg100mg',                                 0.0300,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('d765ba61-5573-4970-b04f-62e92ac40f7c'), '100005',   'Aminophyline 100mg',                                     0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('e7e69eb6-b4e1-4d91-9870-d4c4f05a983f'), '100006',   'Amitriptyline 25mg',                                     0.0200,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('f8a4a00d-aad7-465e-bbd3-d82f8d627acf'), '100007',   'Amoxycilline 250mg',                                     0.0400,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('308fd608-700b-43cc-8899-6d5bc9ba49d2'), '100008',   'Amoxycilline 500mg 500mg',                               0.0800,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('d23ca00a-bc84-4cdb-8603-75738d4b40f5'), '100009',   'Ampicilline 250mg caps',                                 0.0300,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('2b9bca8e-fdf7-4e83-8557-04a939b57bff'), '100010',   'Ampicilline 500mg caps',                                 0.0900,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('f2f291df-ec49-48a6-8630-6b873b685969'), '100011',   'Ampicilline 875mg 875mg',                                0.1500,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('a0f8ba11-c12e-4903-9109-21b36519fb60'), '100012',   'Anti Acide Maalox 400/500mg/tab',                        0.0200,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('6067573a-af30-4902-b303-a1659c12aa2c'), '100013',   'Aspirine adulte 500mg tab (EML)',                        0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('1300bc86-1951-4668-a29b-9b0f9b40891a'), '100014',   'Atenolol 100mg tab',                                     0.2000,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('8c0f269a-c82c-4135-bdc2-065e230ffad6'), '100015',   'Biperiden 2mg2mg',                                       0.1500,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('7faf72f8-11bb-4d59-88e2-dfc465207c08'), '100016',   'Bisacodyl5mg',                                           0.0200,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('d027c492-dc5b-4823-8b37-a25d472f2cd9'), '100018',   'Calcium lactate 300mg',                                  0.0300,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('98714c33-d99a-4ed4-8253-1317472f822f'), '100019',   'Captopril 25mg25mg',                                     0.3700,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('66ae2ec7-68a6-4439-9b46-7d70c0769ecb'), '100020',   'Carbimazole 5mg5mg',                                     0.0400,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('87af6287-3594-4fc0-9fc0-823a1bd60203'), '100022',   'Cefaclor (cifidine) cefixine250mg',                      0.2700,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('7ff876cc-03f3-45b4-88ed-2cb50fd9ec05'), '100023',   'Chloroquine phosph 100mg base',                          0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('4c8f6914-f02e-4bb3-b2a9-b326e5034b0b'), '100024',   'Chloramine 500mg 500mg',                                 0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('e4500d6e-f60d-4803-b5e8-df3bdfe45dd3'), '100026',   'Chloroquine phosph150mg base tab',                       0.0200,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('07fa420e-42b4-45cd-af4e-6555a26cfc74'), '100028',   'Chlorpromazine 25mg',                                    0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('fe5503ea-58d1-4f3e-80cd-99cc7d398db0'), '100029',   'Cimetidine tagamet,pintapro 200mg',                      0.0500,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('cd9b3e91-bf31-4f20-998e-54e4aa79663e'), '100030',   'Ciprofloxacine (cifin) 500mg tab',                       0.0900,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('d64fcc7d-cc04-4442-89bc-b37016c10231'), '100031',   'Ciprofloxacin100mg',                                     0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('d182a94b-7cdb-4c8b-a557-6ff09cc954bf'), '100032',   'Clarythromycine (biaxin) 250mg',                         0.3200,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('9faa57de-a27f-4f33-b02d-50d31699ca39'), '100033',   'Clofazimine (lamprene) 100mg',                           0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('f1cb6832-2cef-4559-8365-37e93e7d729b'), '100035',   'Co trimoxazole 400/80mg tab',                            0.0200,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('821ba3e8-8695-4f2e-ad0d-d0355d2baa6e'), '100036',   'Co trimoxazole 100/20mg tab',                            0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('b4897625-b01d-45fb-ae4e-d74fce9b4076'), '100037',   'Colchicine',                                             0.1000,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('1064efbe-8525-4402-9968-1ffc2db53f50'), '100038',   'Cyclophosphamide 50mg',                                  0.3100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('b764cf50-3db9-4150-abfe-930827af5dd2'), '100039',   'Dapson 5mg (pt)',                                        0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('c0d8431c-b258-4b33-99fb-21043ad3f800'), '100040',   'Diazepam5mg',                                            0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('9b983de1-6573-47d7-9fdc-4c411e4d2517'), '100041',   'Diclofenac sodium 25mg tab',                             0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('4399233c-d94a-402c-aff3-f44352158e6c'), '100042',   'Diethylcarbamazine citrate 50mg',                        0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('315e12d6-3273-494c-8c94-5be62fc44676'), '100043',   'Digoxine 0.25mg tab blister',                            0.1500,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('5bcfb8b5-1ac0-49fa-8668-dad254a7de3d'), '100044',   'Doxycyline100mg',                                        0.0200,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('b0504f30-ded0-4bf2-9c6b-052b13ba7c73'), '100045',   'Ephedrine HCL 30mg',                                     0.2700,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('d7bd9519-78c5-48fc-b84a-da94a0de8495'), '100046',   'Ergotamine 1 mg + caffeine 100 tab blister',             0.6900,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('4d6ffa1f-0998-48c4-a500-8d42dddc32ed'), '100047',   'Erythromycine 250mg tab',                                0.0700,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('f9b8a3f3-269a-407a-8819-959b4c384947'), '100048',   'Erythromycine 500mg tab',                                0.1500,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('dcf11733-6da7-4c54-9b83-20b7ff63b4df'), '100049',   'Ethambutol 400mg',                                       0.0600,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('4fcc580c-0d66-4765-8da0-5db81e61fdfa'), '100050',   'Ethinyloestradiol0.05mg',                                0.6100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('0082e186-6f41-4440-aa02-10fe741f7035'), '100053',   'Furosemide 40mg tab',                                    0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('c0fcd3d5-10e0-49e7-b8db-af3cb59a9a23'), '100054',   'Glibenclamide 5mg tab',                                  0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('816eddc0-fb8c-4862-b58d-22c33fbfc6da'), '100055',   'Griseofulvine 500mg tab',                                0.1100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('f0bc7d39-6dd5-4942-ab3d-b6962f8257a3'), '100056',   'Griseofulvine125mg tab',                                 0.0200,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('77802d33-a50e-4558-9511-cbb61c1360b8'), '100057',   'Hydralazine25mg',                                        0.0500,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('ab73b0ac-1b74-44a7-9587-b86b90166d01'), '100058',   'Hydrochorthiazide 50mg',                                 0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('87052ed8-0ea3-4c3d-b7a3-3b9ae00029e4'), '100059',   'Hyoscine tab 10mg BP',                                   0.0500,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('c1b1a0ef-f997-4d8d-961d-4a1f1fea78bc'), '100060',   'Ibuprofen 400mg',                                        0.0200,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('8fa95456-cf73-4071-8e7a-884e5b1f75ff'), '100061',   'Indomethacine25mg',                                      0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('f21ca746-850a-4e8c-8be2-d2fbd551bb27'), '100062',   'Isoniazide (inh) 100mg',                                 0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('9d8a0c0e-a90e-48d3-be26-756c2d89b588'), '100063',   'Isoniazide/thiacetazone300/150mg',                       0.0300,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('14af5392-77ae-41d0-abb4-1a97ea2fe6d1'), '100064',   'Isoniazide/thiacetazone100/50mg',                        0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('581f44f6-8505-4b8d-ae0e-18375b26679e'), '100065',   'Isosorbide dinitrate 5mg blister',                       0.0800,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('4d6fbfad-a555-4e66-b313-4e8fb7ab4793'), '100067',   'Levamizole 50mg tab',                                    0.0200,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('3c7c8101-3e5a-40ba-a5fe-a21cadc87e66'), '100069',   'Mebendazole100mg',                                       0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('d2f7ef71-6f3e-44bd-8056-378c5ca26e20'), '100070',   'Mefloquine250mg',                                        0.9600,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('badb3639-eb51-4e26-bc20-b33ba69f3adb'), '100071',   'Methotrexate2.5mg',                                      0.2600,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('eeff113e-00ce-4c9b-9359-af552816cebe'), '100072',   'Methyldopa250mg',                                        0.0500,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('49e4e08f-9723-4720-bf3a-804328f43e6d'), '100073',   'Metoclopramide 10mg tab',                                0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('4b8842f2-79dc-4cbf-8ea2-4131070474d2'), '100074',   'Metronidazole flagyl 250mg tab',                         0.0500,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('f6556e72-9d05-4799-8cbd-0a03b1810185'), '100075',   'Multivitamine tab',                                      0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('fb2f7c2e-ea2d-47ab-8bb0-4020ba272cc1'), '100076',   'Niclosamide 500mg',                                      0.0600,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('5f68869d-cc84-4fa9-84df-c86eb382fc68'), '100077',   'Nifedipine 10mg10mg',                                    0.3000,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('0f9d897c-91de-4899-b6ae-56e66059032a'), '100078',   'Nitrofurantoine (furadatin) 100mg',                      0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('2fd95bb5-d67f-4474-bb22-ec46afd3ff9a'), '100079',   'Norethisterone 5mg tab',                                 0.1400,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('84c458d4-6365-45b6-9541-9529492af967'), '100081',   'Noscapine 15mg',                                         0.0200,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('067756f8-2087-48f0-b09d-32d4ea4051c2'), '100082',   'Nystatin orale500, 000iu tab',                           0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('5d9cfff9-1ca8-43af-b400-3786c73b5632'), '100084',   'Ovidon (lo-femenal)',                                    0.3900,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('f46e978d-d5b3-4261-999c-659da3fe5124'), '100085',   'Papaverine 40mg',                                        0.0200,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('6b4825f1-4e6e-4799-8a81-860531281437'), '100086',   'Paracetamol 500mg',                                      0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('4cc78159-2732-407e-a1ae-3380d932ee59'), '100087',   'Paracetamol 500mg tab',                                  0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('d8d087e6-f415-45f1-bbd9-2ca16cbdcec5'), '100088',   'Paracetamol 100mg tab',                                  0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('fe4f724f-ec3c-44f1-95c8-5e16e087add4'), '100089',   'Penicilline-phenoxymethyl Pen VK125mg',                  0.0300,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('886255c4-f47d-43a3-a2e6-88fb14b50d18'), '100090',   'Penicilline-phenoxymethyl Pen VK250mg',                  0.0700,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('69e1e05d-3e65-4904-8709-356a4c133ce3'), '100092',   'Phenobarbital 50mg tab',                                 0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('38e48cb9-2c11-4f32-a17f-e3b50d88090d'), '100093',   'Phenytoin Sodium (dilatin) 100mg',                       0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('d0e1de57-d56b-42f2-a573-a0377c679d18'), '100094',   'Piracetam 400mg (nootropil) 400mg',                      0.3400,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('49ab7c4a-6814-45b2-bc25-0ab83439defe'), '100095',   'Praziquantel (biltricide) 600mg',                        0.2500,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('c3fd5a02-6a75-49fc-b2f3-76ee4c3fbfb7'), '100096',   'Prednisone 5mg',                                         0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('7a9480cc-b2cd-4975-a1dc-e8c167070481'), '100097',   'Proguanil (paludrine) 100mg',                            0.0700,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('b3891fb0-4c62-437c-8410-b236bb542ea0'), '100098',   'Promethazine 25mg tab',                                  0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('3f6f8827-a408-4f3d-832f-5ffa3b16c3fe'), '100099',   'Propantheline bromide15mg',                              0.0200,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('2e61dfb4-18fa-4dea-b1a2-bdeb5f18abbf'), '100100',   'Propranolol 40mg',                                       0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('1459ce89-5d67-4019-84d8-b2bcb808eacb'), '100101',   'Pyrazinamide 500mg',                                     0.0700,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('43f3decb-fce9-426e-940a-bc2150e62186'), '100102',   'Quinine sulphate 500mg',                                 0.1500,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('290ce9a6-415e-4e8a-9d56-18c79d1cfbec'), '100103',   'Quinine sulphate 300mg tab',                             0.1600,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('732d3c85-3160-4326-befd-e8e6370af4cc'), '100104',   'Reserpine 0.25mg',                                       0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('7d07fd39-3099-4f1b-aa19-5202518f6e1f'), '100105',   'Rifampicine 300mg',                                      0.1400,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('9f9c8a19-8a76-4f64-8519-c4eee7fc5337'), '100106',   'Rifampicine 150mg',                                      0.0700,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('feaeb547-2be2-44dc-a328-fb963c89e29d'), '100107',   'Salbutamol 4mg tab',                                     0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('a50a1d09-5ac5-4130-a57f-24430ed0a8b7'), '100108',   'Spironolactone 25mg',                                    0.0800,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('5d28815e-339a-45c2-af6a-7ce1b74eb798'), '100109',   'Sulphamethoxypyridazine (fansidar) 500mg',               0.0700,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('3df74037-9eef-450a-82b0-d08220d91a6c'), '100113',   'Thyroxine (levothyroxine)',                              0.0900,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('63321925-3128-4d4d-a223-2efd99eb7e07'), '100114',   'Tolbutamide 500mg',                                      0.0400,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('69c1a7ae-5338-4484-ac0c-1c94c65526d9'), '100115',   'Tribexfort (bte de 30 ces)',                             0.0700,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('b7d66f77-2f43-490f-a3fd-0feb3941ef4d'), '100117',   'Vitamine B complex tab',                                 0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('cbf49141-1556-4b53-9ad0-e97b5c528d64'), '100118',   'Vitamine B6 (pyridoxine) 50mg',                          0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('70dff794-6c16-4ddb-9c9e-72166d8be60a'), '100119',   'Vitamine C (acide ascorbic) 250mg tab',                  0.0200,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('b3ec22ab-d0d5-4828-b0da-ba76c6096430'), '100120',   'VitamineB1 (thiamine) 100mg',                            0.0100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('cd686114-024d-47a8-acba-2c87ebe04236'), '100124',   'Acide nalidixique 500mg tab',                            0.0807,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 15, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('36ae7228-69a9-490f-a0e0-58a27b3ec9c4'), '100125',   'Arinate',                                                0.4400,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 5,  0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('adc5dc61-e2c0-4570-8e2b-8d6d98fbaba2'), '100126',   'Aciclovir 200mg tab 100 vrac',                           0.0379,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 15, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('287b29a7-b350-4631-bd52-7683eae9e5ce'), '100128',   'Gliben M Plus en plaquette',                             0.0425,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 15, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('06d624de-9532-476c-9e31-63ed2436ea4e'), '100129',   'Glycophage 500mg tab',                                   0.1924,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 15, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('ef43cc87-932f-4c17-9f65-27c02ea1ea45'), '100130',   'Glyciphage 850mg tab',                                   0.2470,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 15, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('67aae749-4d10-4568-b4ae-9a7aa52845aa'), '100131',   'Sulphate de Zinc',                                       0.7000,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 5,  0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('f87a44f0-e196-4af2-a568-d5763efb85e6'), '100140',   'Chlorpromazine HCL 100mg tab',                           0.0262,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 15, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('fc5df30d-1863-4e00-b281-c1f7a2bdabc8'), '100141',   'Na DCC 167mg tab 200 Vrac',                              0.1008,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 15, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('0846af13-8d28-47ea-a09f-dcbc0c667923'), '100142',   'Mebendazol 500mg tab',                                   0.0136,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 15, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('d333eda1-6f67-4c15-b1fa-fe3f8f28fa6e'), '100800',   'Cotrimoxazol 480mg tab',                                 0.0197,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 15, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('6877b7f6-6579-404d-acd4-8e8d37f73685'), '100801',   'Ibuprofen 200mg tab',                                    0.0153,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 15, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('cce513e2-c3df-4c07-b3a7-73a75d60e1b5'), '110002',   'Ampicillin susp250mg',                                   2.0000,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('9c9d70cc-1422-4ad5-ad48-372c5752c20e'), '110003',   'Amoxicillin 125mg/5ml dry powder40/100ml',               0.6600,   1, HUID('4f804446-16cc-47e4-a40f-8d915107d431'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('b9496e86-b729-42e7-933a-53bebe53287b'), '110004',   'Barium sulphate susp. pde1 gr',                          1.9200,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('a595dbd5-f52f-44a7-b6fc-24e8ba966e84'), '110006',   'Cefaclor suspension125/5ml',                             1.6600,   1, HUID('4f804446-16cc-47e4-a40f-8d915107d431'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('d34cb3e8-adb5-409c-9d44-3c38ce34764d'), '110007',   'Chloramphenicol susp \'60 ml125/5ml',                    2.1000,   1, HUID('4f804446-16cc-47e4-a40f-8d915107d431'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('8158de96-32a7-4029-aecb-bb8f24f6db5d'), '110008',   'Cotrimoxazole susp 100 ml200/40mg/5ml',                  2.3200,   1, HUID('4f804446-16cc-47e4-a40f-8d915107d431'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('b39b45f2-c778-4c85-b68b-2a31fbe9b290'), '110009',   'Erythromycine 125mg/5ml',                                2.3100,   1, HUID('4f804446-16cc-47e4-a40f-8d915107d431'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('dcfbcd6d-b50f-48b3-8561-4a0b8a4efba5'), '110010',   'Multivitamine sirop500 ml',                              1.9000,   1, HUID('4f804446-16cc-47e4-a40f-8d915107d431'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('702462be-01b3-4096-86cc-7c2ad7c231d3'), '110011',   'Penicilline VK susp \'100 ml125mg/5ml',                  1.3900,   1, HUID('4f804446-16cc-47e4-a40f-8d915107d431'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('e8eaf378-d3ff-4728-8ddb-91a2bb123d92'), '110013',   'Metronidazole sirop 125mg / 5 ml100 ml',                 1.3100,   1, HUID('4f804446-16cc-47e4-a40f-8d915107d431'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('4816a95d-3afe-4e51-9f4b-a7391241508c'), '110014',   'Salbutamol oral 0.5',                                    3.7000,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('c560e79c-e57a-4bc9-ba53-406aa861f858'), '110016',   'Tylenol sirop (cold multivit)',                          5.1200,   1, HUID('4f804446-16cc-47e4-a40f-8d915107d431'), 8,  0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('44ce0f96-40ac-4bc6-81ad-356cee6de9f6'), '110017',   'Erythromycine 250mg/5ml 100ml',                          1.9000,   1, HUID('4f804446-16cc-47e4-a40f-8d915107d431'), 10, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('9005e213-65bb-443a-8e1c-8c367d4b295f'), '110018',   'Tinidazol 500mg tab',                                    0.0520,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 15, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('366ff0fa-cc48-4b65-96b4-a0ac71caf371'), '1100200',  'Amoxycilline 125mg/5ml susp',                            0.6600,   1, HUID('4f804446-16cc-47e4-a40f-8d915107d431'), 8,  0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('c8219610-249a-45c0-9bbb-14fc0da0543d'), '1100201',  'Griseofuvine 250mg 1000 vrac',                           0.0422,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 15, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('b312f3da-6feb-490a-a747-c2acb20603c4'), '1100202',  'Phenobarbital 100mg 1000 vrac',                          0.0227,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 15, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('bcfd81dd-2853-432b-b272-d6507e8e6ddc'), '1100203',  'Ranitidine,150mg tab 100',                               0.4960,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 15, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('910dd20d-d411-417c-8b23-0423e56f040b'), '1100204',  'Artesinate+Amodiaquine 100mg+270mg base tab 3, 6-13ans', 0.2629,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 15, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('5a354098-ad9a-4218-b54e-e579fc9a4d45'), '1100205',  'Artesinate+Amodiaquine 100mg+270mg base tab 6 adulte',   0.2048,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 15, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('1aa3be0d-15be-4942-a1c0-e0160e6a7c86'), '1100206',  'Clotrimazole 500mg tab gynecologique 6',                 0.2935,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 15, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('cdbc4cae-bbb0-4833-99a7-3885c171f169'), '1100207',  'Misoprostol 0.2mg tab 100',                              0.1690,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 15, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('628e8153-acde-4564-b411-6bd9bb1a904c'), '1100208',  'Azithromycine 250mg tab 6',                              0.1810,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 15, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('004f20c1-f0cc-402d-b681-1cda0c0820ac'), '1100209',  'Levonorgestrel 0.75mg tab 2',                            0.3867,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 15, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('07db1f70-057b-4d01-b337-cde944d90a9b'), '110020',   'Amoxycilline 250mg/5ml 100ml fl',                        0.9148,   1, HUID('4f804446-16cc-47e4-a40f-8d915107d431'), 10, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('f5bfef44-70c6-418b-941d-b66a18f76497'), '1100210',  'Zidovudine (ZDV) 300mg+Lamivudine (3TC) 150mg tab 60',   0.2991,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 15, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('6d9abcd8-11a6-4474-94a2-b6b804c9468e'), '1100214',  'Artesinate+Amodiaquine 25mg+67.5mg base tab 3 2-11mois', 0.0251,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 15, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('684444e6-92a0-4ede-b7db-93e5ee6ea844'), '1100215',  'Artesinate+Amodiaquine 50mg+135mg base tab 3 1-5ans',    0.1849,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 15, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('29973d0e-63fb-4b22-bfc4-d68351af0418'), '120016',   'Cyclophosphamide200mg',                                  17.1900,  1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('cf4a511b-82d6-476d-877a-995ba6c38be8'), '120066',   'Ceftriaxon 1 gr Fl',                                     5.0000,   1, HUID('4f804446-16cc-47e4-a40f-8d915107d431'), 10, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('1d9507a7-b6ce-4e80-b63a-ff10c6cda039'), '120080',   'Coartem tab',                                            0.1397,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 15, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('b75c748c-81c2-4bc5-ba57-a52e003be95c'), '120081',   'Artthefan tab',                                          0.1397,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 15, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('b19259b0-1153-478b-be3f-0a3408e1e7c1'), '120803',   'Promethazine Chlorhydrate 5mg/5ml sirop, 100ml',         0.7654,   1, HUID('4f804446-16cc-47e4-a40f-8d915107d431'), 10, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('64cd3db6-bf30-4ec4-a569-9063d294d5c9'), '140001',   'Anti-snake vehum 10ml',                                  295.8900, 1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('a771aa32-6c9b-4ad0-ac11-c75d4a525865'), '150061',   'Tosylochloramine sodique 500mg',                         0.9000,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('0761a3c9-8c39-4741-9629-b2b55ea832a6'), '160001',   'Amethocaine 0.5%Flc 5cc',                                0.8100,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('a0525113-8177-4e08-bc38-9147af93b9be'), '160002',   'Atropine 1%Flc 5cc',                                     0.9400,   1, HUID('8d85a207-7c04-4d60-8891-fec7e5774b3d'), 2,  0, 0, 1, 100000000, 0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('07dc0762-c9a6-4e67-a08f-ccfae34f7f7e'), '170448',   'Nystatin 100.000UI/ml suspension orale 30ml fl',         1.5000,   1, HUID('4f804446-16cc-47e4-a40f-8d915107d431'), 10, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL),
  (1, HUID('6fd1e156-e703-4c95-b64d-65859464fd99'), '170449',   'Nevirapine (NVP) Sirop 10mg/ml 240ml fl',                5.4534,   1, HUID('4f804446-16cc-47e4-a40f-8d915107d431'), 10, 0, 0, 0, 0,         0, 1, 1, 0, 1, 1.0000, 1.0000, '2016-10-23 08:35:08', NULL);

INSERT INTO `debtor_group` VALUES
  (1, HUID('4de0fe47-177f-4d30-b95f-cff8166400b4'), 'Church Employees', 174, HUID('1f162a10-9f67-4788-9eff-c1fea42fcc9b'), NULL, NULL, NULL, 0, 10, 0, NULL, 1, 1, 1, '#ff0000', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (1, HUID('66f03607-bfbc-4b23-aa92-9321ca0ff586'), 'NGO IMA World Health', 175, HUID('1f162a10-9f67-4788-9eff-c1fea42fcc9b'), NULL, NULL, NULL, 0, 300, 1, NULL, 1, 1, 1, '#00ff00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (1, HUID('a11e6b7f-fbbb-432e-ac2a-5312a66dccf4'), 'Cash Paying Clients', 176, HUID('1f162a10-9f67-4788-9eff-c1fea42fcc9b'), NULL, NULL, NULL, 0, 20, 1, NULL, 1, 1, 1, '#0000ff',CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO `patient_group` VALUES
  (HUID('0b8fcc00-8640-479d-872a-31d36361fcfd'), 1, NULL, 'Test Patient Group 1', 'Test Patient Group 1 Note', '2016-03-10 08:44:23'),
  (HUID('112a9fb5-847d-4c6a-9b20-710fa8b4da24'), 1, NULL, 'Test Patient Group 2', 'Test Patient Group 2 Note', '2016-03-10 08:44:23'),
  (HUID('112a9fb5-847d-4c6a-9b20-710fa8b4da22'), 1, NULL, 'Test Patient Group 3', 'Test Patient Group 2 Note', '2016-03-12 08:44:23');

INSERT INTO `debtor` (uuid, group_uuid, text) VALUES
  (HUID('3be232f9-a4b9-4af6-984c-5d3f87d5c107'), HUID('4de0fe47-177f-4d30-b95f-cff8166400b4'), 'Patient/2/Patient'),
  (HUID('a11e6b7f-fbbb-432e-ac2a-5312a66dccf4'), HUID('4de0fe47-177f-4d30-b95f-cff8166400b4'), 'Patient/1/Patient');

-- Patients
INSERT INTO `patient` VALUES
  (HUID('274c51ae-efcc-4238-98c6-f402bfb39866'), 1, 2, HUID('3be232f9-a4b9-4af6-984c-5d3f87d5c107'), 'Test 2 Patient', '1990-06-01 00:00:00', FALSE, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'M', NULL, NULL, NULL, NULL, NULL, NULL, HUID('1f162a10-9f67-4788-9eff-c1fea42fcc9b'), HUID('1f162a10-9f67-4788-9eff-c1fea42fcc9b'), NOW(), NULL, NULL, '110', '', 1, '2015-11-14 07:04:49'),
  (HUID('81af634f-321a-40de-bc6f-ceb1167a9f65'), 1, 1, HUID('a11e6b7f-fbbb-432e-ac2a-5312a66dccf4'), 'Test 1 Patient', '1990-06-01 00:00:00', FALSE, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'F', NULL, NULL, NULL, NULL, NULL, NULL, HUID('1f162a10-9f67-4788-9eff-c1fea42fcc9b'), HUID('1f162a10-9f67-4788-9eff-c1fea42fcc9b'), NOW(), NULL, NULL, '100', '', 2, '2015-11-14 07:04:49');

-- Patient Visits
INSERT INTO `patient_visit` (`uuid`, `patient_uuid`, `start_date`, `end_date`, `start_notes`, `end_notes`, `start_diagnosis_id`, `end_diagnosis_id`, `user_id`) VALUES
  (HUID('5d3f87d5c107-a4b9-4af6-984c-3be232f9'), HUID('274c51ae-efcc-4238-98c6-f402bfb39866'), '2016-04-25 00:00:00', '2016-04-29 00:00:00', 'He was sick', 'He got better', NULL, NULL, 1),
  (HUID('710fa8b4da22-847d-4c6a-9b20-112a9fb5'), HUID('81af634f-321a-40de-bc6f-ceb1167a9f65'), '2015-11-14 14:25:00', '2015-11-15 00:00:00', 'He was sick', 'He got better', NULL, NULL, 1);

INSERT INTO `patient_assignment` VALUES
  (HUID('49b90fec-e69c-11e5-8606-843a4bc830ac'),HUID('112a9fb5-847d-4c6a-9b20-710fa8b4da24'),HUID('81af634f-321a-40de-bc6f-ceb1167a9f65')),
  (HUID('e35b525e-923b-4fee-87f1-a069c7dc7234'),HUID('112a9fb5-847d-4c6a-9b20-710fa8b4da24'),HUID('274c51ae-efcc-4238-98c6-f402bfb39866'));

-- Creditor Groups
INSERT INTO `creditor_group` VALUES
  (1, HUID('8bedb6df-6b08-4dcf-97f7-0cfbb07cf9e2'), 'SNEL', 171, 0),
  (1, HUID('b0fa5ed2-04f9-4cb3-92f7-61d6404696e7'), 'Employees', 179, 0),
  (1, HUID('c0fa5ed2-04f9-4cb3-93f7-61d6404696e7'), 'Regideso', 172, 0);

-- Creditors
INSERT INTO `creditor` VALUES
  (HUID('42d3756a-7770-4bb8-a899-7953cd859892'), HUID('b0fa5ed2-04f9-4cb3-92f7-61d6404696e7'), 'Personnel'),
  (HUID('7ac4e83c-65f2-45a1-8357-8b025003d794'), HUID('8bedb6df-6b08-4dcf-97f7-0cfbb07cf9e2'), 'SNEL');

-- Supplier
INSERT INTO `supplier` (uuid, creditor_uuid, display_name, address_1, address_2, email) VALUES
  (HUID('3ac4e83c-65f2-45a1-8357-8b025003d793'), HUID('7ac4e83c-65f2-45a1-8357-8b025003d794'), 'SNEL', '12th Avenue', 'New York City, NY 34305', 'supplier@test.org');

-- Grade
INSERT INTO `grade` VALUES
  (HUID('71e9f21c-d9b1-11e5-8ab7-78eb2f2a46e0'), 'G1', 'grade 1', 500.0000),
  (HUID('9ee06e4a-7b59-48e6-812c-c0f8a00cf7d3'), 'A1', '1.1', 50.0000);

INSERT INTO `section_bilan` VALUES (1, 'Section Bilan 1', 1, 1), (2, 'Section Bilan 2', 1, 1);
INSERT INTO `section_resultat` VALUES (1, 'Section Resultat 1', 1, 1);
INSERT INTO `reference_group` VALUES (1, 'AA', 'Reference Group 1', 1, 1);

INSERT INTO `reference` VALUES
  (1, 0, 'AB', 'Reference bilan 1', 1, 1, NULL),
  (3, 0, 'AC', 'Reference resultat 1', 1, NULL, 1),
  (4, 0, 'XX', 'Deletable reference 1', 1, NULL, NULL);

INSERT INTO `cost_center` VALUES
  (1, 1, 'cost center 1', 'cost note', 1),
  (1, 2, 'cost center 2', 'cost note 2', 0),
  (1, 3, 'cost center 3', 'cost note 3', 1);

INSERT INTO `profit_center` VALUES
  (1, 1, 'profit center 1', 'profit note'),
  (1, 2, 'profit center 2', 'profit note 2'),
  (1, 3, 'profit center 3', 'profit note 3');

-- Services
INSERT INTO `service` VALUES
  (1, HUID('aff85bdc-d7c6-4047-afe7-1724f8cd369e'), 1, 'Test Service', 1, 1),
  (2, HUID('b1816006-5558-45f9-93a0-c222b5efa6cb'), 1, 'Administration', 2, 2),
  (3, HUID('e3988489-ef66-41df-88fa-8b8ed6aa03ac'), 1, 'Medecine Interne', 1, 2);

-- invoicing fee configuration

-- both these are "autres revenues"
SET @AutresRevenuesAccount = 260;

INSERT INTO `invoicing_fee` VALUES
  (1, @AutresRevenuesAccount, 'Test Invoicing Fee', 'Example Invoicing Fee', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, @AutresRevenuesAccount, 'Second Test Invoicing Fee', 'Example Invoicing Fee 2', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO `patient_group_invoicing_fee` VALUES
  (1, HUID('112a9fb5-847d-4c6a-9b20-710fa8b4da24'), 1, CURRENT_TIMESTAMP);

INSERT INTO `debtor_group_invoicing_fee` VALUES
  (1, HUID('4de0fe47-177f-4d30-b95f-cff8166400b4'), 2, CURRENT_TIMESTAMP);

-- subsidy configuration
-- both these are "Remuneration Personnel"
SET @RemunerationPersonnelAccount = 220;
INSERT INTO `subsidy` VALUES
  (1, @RemunerationPersonnelAccount, 'Test Subsidy', 'Subsidy for test purposes', 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, @RemunerationPersonnelAccount, 'Second Test Subsidy', 'Second subsidy for test purposes', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO `patient_group_subsidy` VALUES
  (1, HUID('112a9fb5-847d-4c6a-9b20-710fa8b4da24'), 1, CURRENT_TIMESTAMP);

INSERT INTO `debtor_group_subsidy` VALUES
  (1, HUID('4de0fe47-177f-4d30-b95f-cff8166400b4'), 1, CURRENT_TIMESTAMP);

-- patient invoices
SET @first_invoice = HUID('957e4e79-a6bb-4b4d-a8f7-c42152b2c2f6');
SET @second_invoice = HUID('c44619e0-3a88-4754-a750-a414fc9567bf');
SET @third_invoice = HUID('f24619e0-3a88-4784-a750-a414fc9567bf');

INSERT INTO invoice (project_id, reference, uuid, cost, debtor_uuid, service_id, user_id, date, description, created_at) VALUES
  (1, 2, @first_invoice, 75.0000, HUID('3be232f9-a4b9-4af6-984c-5d3f87d5c107'), 1, 1, NOW(), 'TPA_VENTE/ TODAY GMT+0100 (WAT)/Test 2 Patient', NOW()),
  (1, 1, @second_invoice, 25.0000, HUID('3be232f9-a4b9-4af6-984c-5d3f87d5c107'), 1, 1, '2016-01-07 14:34:35', 'TPA_VENTE/Thu Jan 07 2016 15:30:59 GMT+0100 (WAT)/Test 2 Patient', '2016-01-07 14:31:14'),
  (1, 3, @third_invoice, 5.1300, HUID('3be232f9-a4b9-4af6-984c-5d3f87d5c107'), 1, 1, '2016-01-02 09:34:35', 'TPA_VENTE/Thu Jan 02 2016 09:30:59 GMT+0100 (WAT)/Test 2 Patient', '2016-01-02 09:31:14');

-- inventory items to use in invoice
SET @quinine = HUID('43f3decb-fce9-426e-940a-bc2150e62186');
SET @paracetemol = HUID('6b4825f1-4e6e-4799-8a81-860531281437');
SET @multivitamine = HUID('f6556e72-9d05-4799-8cbd-0a03b1810185');
SET @prednisone = HUID('c3fd5a02-6a75-49fc-b2f3-76ee4c3fbfb7');

INSERT INTO invoice_item VALUES
  (@first_invoice, HUID(UUID()), @quinine, 3,25.0000,25.0000,0.0000,75.0000),
  (@second_invoice, HUID(UUID()), @paracetemol,1,25.0000,25.0000,0.0000,25.0000),
  (@third_invoice, HUID(UUID()), @multivitamine,1,5.13,5.13,0.0000,5.130000);

CALL PostInvoice(@first_invoice);
CALL PostInvoice(@second_invoice);
CALL PostInvoice(@third_invoice);

-- cash payment
SET @cash_payment = HUID('2e1332b7-3e63-411e-827d-42ad585ff517');
SET @cash_payment_2 = HUID('2e1332b7-3e23-411e-527d-42ac585ff517');

INSERT INTO cash (uuid, project_id, reference, date, debtor_uuid, currency_id, amount, user_id, cashbox_id, description, is_caution) VALUES
  (@cash_payment, 1, 1, NOW(), HUID('3be232f9-a4b9-4af6-984c-5d3f87d5c107'), 1, 100, 1, 2, "Some cool description", 1),
  (@cash_payment_2, 1, 2, '2016-01-10 15:33:00', HUID('3be232f9-a4b9-4af6-984c-5d3f87d5c107'), 1, 25, 1, 2, "This will be deleted in tests", 1);

INSERT INTO cash_item (uuid, cash_uuid, amount, invoice_uuid) VALUES
  (HUID('f21ba860-a4f1-11e7-b598-507b9dd6de91'), @cash_payment, 10, @first_invoice);

CALL PostCash(@cash_payment);
CALL PostCash(@cash_payment_2);

-- voucher sample data
SET @first_voucher = HUID('a5a5f950-a4c9-47f0-9a9a-2bfc3123e534');
SET @second_voucher = HUID('304cfa94-0249-466c-9870-95eb3c221b0a');
SET @third_voucher = HUID('3688e9ce-85ea-4b5c-9144-688177edcb63');

INSERT INTO `voucher` (uuid, `date`,  project_id, currency_id, amount, description, user_id, type_id) VALUES
  (@first_voucher, CURRENT_TIMESTAMP, 1,  2, 100, 'Sample voucher data one', 1, 1),
  (@second_voucher, CURRENT_TIMESTAMP, 2, 2, 200, 'Sample voucher data two', 1, NULL),
  (@third_voucher, CURRENT_TIMESTAMP, 3, 1, 300, 'Sample voucher data three', 1, NULL);

-- voucher items sample data
INSERT INTO `voucher_item` VALUES
  (HUID(UUID()), 187, 100, 0, @first_voucher, @first_invoice, HUID(UUID())),
  (HUID(UUID()), 182, 0, 100, @first_voucher, NULL, NULL),
  (HUID(UUID()), 188, 200, 0, @second_voucher, NULL, NULL),
  (HUID(UUID()), 200, 0, 200, @second_voucher, NULL, NULL),
  (HUID(UUID()), 125, 300, 0, @third_voucher, @cash_payment, HUID(UUID())),
  (HUID(UUID()), 117, 0, 300, @third_voucher, NULL, NULL);

-- post voucher data to the general ledger
CALL PostVoucher(@first_voucher);
CALL PostVoucher(@second_voucher);
CALL PostVoucher(@third_voucher);

-- zones des santes SNIS
INSERT INTO `mod_snis_zs` VALUES
  (1, 'Zone Sante A', 'Territoire A', 'Province A'),
  (2, 'Zone Sante B', 'Territoire B', 'Province B');

INSERT INTO `employee` VALUES
  (1,'E1','2016-02-02 00:00:00',HUID('71e9f21c-d9b1-11e5-8ab7-78eb2f2a46e0'),1,3,500,'TMB', '1201-3456-5423-03',1,3,HUID('42d3756a-7770-4bb8-a899-7953cd859892'),NULL,HUID('274c51ae-efcc-4238-98c6-f402bfb39866'), 0);

INSERT INTO `price_list` VALUES
  (HUID('75e09694-dd5c-11e5-a8a2-6c29955775b0'), 1, 'Test Price List', 'Price list for test purposes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO `price_list_item` VALUES
  (HUID(UUID()), @quinine, HUID('75e09694-dd5c-11e5-a8a2-6c29955775b0'), 'label 1', 100, 1, CURRENT_TIMESTAMP),
  (HUID(UUID()), @prednisone, HUID('75e09694-dd5c-11e5-a8a2-6c29955775b0'), 'label 2', 100, 1, CURRENT_TIMESTAMP);

UPDATE debtor_group SET price_list_uuid = HUID('75e09694-dd5c-11e5-a8a2-6c29955775b0') WHERE uuid = HUID('4de0fe47-177f-4d30-b95f-cff8166400b4');

SET @purchase_order = HUID('e07ceadc-82cf-4ae2-958a-6f6a78c87588');
INSERT INTO `purchase` VALUES
  (@purchase_order, 1, 1, 300, 2, HUID('3ac4e83c-65f2-45a1-8357-8b025003d793'), DATE('2016-02-19'), CURRENT_TIMESTAMP, 1, NULL, NULL, 1);

INSERT INTO `purchase_item` VALUES
  (HUID(UUID()), @purchase_order, @quinine, 1, 200, 200),
  (HUID(UUID()), @purchase_order, @prednisone, 10, 10, 100);

-- confirmed purchase order
SET @purchase = HUID('8027d1c8-dd68-4686-9f4c-8860f856f8ba');
INSERT INTO `purchase` VALUES
  (@purchase, 1, 2, (1000 * 0.05), 2, HUID('3ac4e83c-65f2-45a1-8357-8b025003d793'), DATE('2017-03-29'), CURRENT_TIMESTAMP, 1, NULL, 'Purchase Order Confirmed', 2);

INSERT INTO `purchase_item` VALUES
  (HUID(UUID()), @purchase, @prednisone, 1000, 0.05, (1000 * 0.05));

-- default depots
SET @depot_uuid = HUID("f9caeb16-1684-43c5-a6c4-47dbac1df296");
SET @second_depot_uuid = HUID("d4bb1452-e4fa-4742-a281-814140246877");

INSERT INTO `depot` VALUES
  (@depot_uuid, 'Depot Principal', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
  (@second_depot_uuid, 'Depot Secondaire', 1, 0, 1, 1, 1, 1, 1, 1, 1, 1);

-- Set Depot Management By User
INSERT INTO depot_permission (id, user_id, depot_uuid) VALUES
  (NULL, @superUser, @depot_uuid);

-- TODO : As soon as the stored Procedure for Stock accounting landed, stock movement records should be posted also
SET @quinine = HUID('43f3decb-fce9-426e-940a-bc2150e62186');
SET @paracetemol = HUID('6b4825f1-4e6e-4799-8a81-860531281437');
SET @multivitamine = HUID('f6556e72-9d05-4799-8cbd-0a03b1810185');

-- stock lots
INSERT INTO `lot` (`uuid`, `label`, `initial_quantity`, `quantity`, `unit_cost`, `expiration_date`, `inventory_uuid`, `origin_uuid`, `delay`, `entry_date`) VALUES
  (HUID('064ab1d9-5246-4402-ae8a-958fcdb07b35'), 'VITAMINE-A', 100, 100, 1.2000, '2019-04-30', @multivitamine, HUID('e07ceadc-82cf-4ae2-958a-6f6a78c87588'), 0, '2017-02-02 11:09:25'),
  (HUID('5a0e06c2-6ca7-4633-8b17-92e2a59db44c'), 'VITAMINE-B', 20, 20, 0.5000, '2020-04-30', @multivitamine, HUID('e07ceadc-82cf-4ae2-958a-6f6a78c87588'), 0, '2017-02-02 11:09:25'),
  (HUID('6f80748b-1d94-4247-804e-d4be99e827d2'), 'QUININE-B', 200, 200, 0.8000, '2018-04-30', @quinine, HUID('e07ceadc-82cf-4ae2-958a-6f6a78c87588'), 0, '2017-02-02 11:09:25'),
  (HUID('ae735e99-8faf-417b-aa63-9b404fca99ac'), 'QUININE-A', 100, 100, 1.2000, '2018-04-30', @quinine, HUID('e07ceadc-82cf-4ae2-958a-6f6a78c87588'), 0, '2017-02-02 11:09:25'),
  (HUID('ef24cf1a-d5b9-4846-b70c-520e601c1ea6'), 'QUININE-C', 50, 50, 2.0000, '2017-04-30',   @quinine, HUID('e07ceadc-82cf-4ae2-958a-6f6a78c87588'), 0, '2017-02-02 11:09:25');

-- stock lots movements
INSERT INTO `stock_movement` (`uuid`, `lot_uuid`, `document_uuid`, `depot_uuid`, `entity_uuid`, `flux_id`, `date`, `quantity`, `unit_cost`, `is_exit`, `user_id`) VALUES
  (HUID('5b7dd0d6-9273-4955-a703-126fbd504b61'), HUID('ae735e99-8faf-417b-aa63-9b404fca99ac'), HUID('682e11c0-93a7-49f8-b79b-a4bc8e3e6f47'), HUID('f9caeb16-1684-43c5-a6c4-47dbac1df296'), '', 1, '2017-02-02', 100, 1.2000, 0, 1),
  (HUID('6529ba0c-aef4-4527-b572-5ae77273de62'), HUID('6f80748b-1d94-4247-804e-d4be99e827d2'), HUID('682e11c0-93a7-49f8-b79b-a4bc8e3e6f47'), HUID('f9caeb16-1684-43c5-a6c4-47dbac1df296'), '', 1, '2017-02-02', 200, 0.8000, 0, 1),
  (HUID('a4ff7358-f1f8-4301-86e4-e9e6fe99bd31'), HUID('5a0e06c2-6ca7-4633-8b17-92e2a59db44c'), HUID('682e11c0-93a7-49f8-b79b-a4bc8e3e6f47'), HUID('f9caeb16-1684-43c5-a6c4-47dbac1df296'), '', 1, '2017-02-02', 20, 0.5000, 0, 1),
  (HUID('d8c83ad9-a3ea-4f9f-96f9-456a435f480d'), HUID('ef24cf1a-d5b9-4846-b70c-520e601c1ea6'), HUID('682e11c0-93a7-49f8-b79b-a4bc8e3e6f47'), HUID('f9caeb16-1684-43c5-a6c4-47dbac1df296'), '', 1, '2017-02-02', 50, 2.0000, 0, 1),
  (HUID('f9aa33f1-65e2-4e37-89cb-843d27b2c586'), HUID('064ab1d9-5246-4402-ae8a-958fcdb07b35'), HUID('682e11c0-93a7-49f8-b79b-a4bc8e3e6f47'), HUID('f9caeb16-1684-43c5-a6c4-47dbac1df296'), '', 1, '2017-02-02', 100, 1.2000, 0, 1),
  (HUID('e8502c3e-7483-11e7-a8de-507b9dd6de91'), HUID('064ab1d9-5246-4402-ae8a-958fcdb07b35'), HUID('0cc6c435-7484-11e7-a8de-507b9dd6de91'), HUID('f9caeb16-1684-43c5-a6c4-47dbac1df296'), HUID('d4bb1452-e4fa-4742-a281-814140246877'), 8, '2017-02-02', 75, 1.2000, 1, 1);
