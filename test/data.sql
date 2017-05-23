-- bhima test database

-- locations (enterprise location only)
INSERT INTO `country` VALUES (HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f'),'Democratiq Republic of Congo'),(HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a51'), 'Test Hook Country');
INSERT INTO `province` VALUES (HUID('f6fc7469-7e58-45cb-b87c-f08af93edade'),'Bas Congo', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a5f')), (HUID('dbe330b6-5cdf-4830-8c30-dc00eccd1a21'), 'Test Hook Province', HUID('dbe330b6-5cde-4830-8c30-dc00eccd1a51'));
INSERT INTO `sector` VALUES (HUID('0404e9ea-ebd6-4f20-b1f8-6dc9f9313450'),'Tshikapa',HUID('f6fc7469-7e58-45cb-b87c-f08af93edade')), (HUID('dbe330b6-5cdf-4830-8c30-dc00eccd1a22'), 'Test Hook Sector', HUID('dbe330b6-5cdf-4830-8c30-dc00eccd1a21'));
INSERT INTO `village` VALUES (HUID('1f162a10-9f67-4788-9eff-c1fea42fcc9b'),'KELE2',HUID('0404e9ea-ebd6-4f20-b1f8-6dc9f9313450')), (HUID('dbe330b6-5cdf-4830-8c30-dc00eccd1a22'), 'Test Hook Village',HUID('dbe330b6-5cdf-4830-8c30-dc00eccd1a22'));

-- Enterprise
INSERT INTO `enterprise` VALUES (1,'Test Enterprise','TE','243 81 504 0540','enterprise@test.org',HUID('1f162a10-9f67-4788-9eff-c1fea42fcc9b'),NULL,2,103, NULL, NULL);

-- Project
INSERT INTO `project` VALUES (1,'Test Project A','TPA',1,1,0),(2,'Test Project B','TPB',1,2,0),(3,'Test Project C','TPC',1,2,0);

-- Accounts
INSERT INTO `account` VALUES
  (3626,4,1,1000,'Test Capital Account',0,0,NULL,NULL,'2015-11-04 13:25:12',1,NULL,NULL,NULL,1,1),
  (3627,3,1,1100,'Test Capital One',3626,0,NULL,NULL,'2015-11-04 13:26:13',1,1,NULL,0,NULL,0),
  (3628,3,1,1200,'Test Capital Two',3626,0,NULL,NULL,'2015-11-04 13:27:13',1,1,NULL,0,NULL,0),
  (3629,4,1,40000,'Test Balance Accounts',0,0,NULL,NULL,'2015-11-04 13:29:11',4,NULL,NULL,NULL,1,1),
  (3630,3,1,41001,'Test Debtor Accounts1',3629,0,NULL,NULL,'2015-11-04 13:30:46',4,NULL,NULL,NULL,NULL,0),
  (3631,3,1,41002,'Test Debtor Accounts2',3629,0,NULL,NULL,'2015-11-04 13:32:22',4,NULL,NULL,NULL,NULL,1),
  (3635,3,1,41003,'Test Debtor Accounts3',3629,0,NULL,NULL,'2015-11-04 13:32:22',4,NULL,NULL,NULL,NULL,1),
  (3636,4,1,46000,'Test Inventory Accounts',3629,0,NULL,NULL,'2015-11-04 13:32:22',4,NULL,NULL,NULL,NULL,1),
  (3637,3,1,46001,'First Test Item Account',3636,0,NULL,NULL,'2015-11-04 13:32:22',4,NULL,NULL,NULL,NULL,0),
  (3638,3,1,47001,'Test Debtor Group Account',3626,0,NULL,NULL,'2015-11-04 13:32:22',4,NULL,NULL,0,NULL,0),
  (3639,4,1,57000,'Test Income Accounts',0,0,NULL,NULL,'2015-11-04 13:32:22',4,NULL,NULL,0,NULL,0),
  (3640,3,1,57003,'Test Gain Account',3639,0,NULL,NULL,'2015-11-04 13:32:22',4,NULL,NULL,0,NULL,0),
  (3641,4,1,67000,'Test Expense Accounts',0,0,NULL,NULL,'2015-11-04 13:32:22',4,NULL,NULL,0,NULL,0),
  (3642,3,1,67003,'Test Loss Account',3641,0,NULL,NULL,'2015-11-04 13:32:22',4,NULL,NULL,0,NULL,0),
  (3643,3,1,42001,'Test Creditor Accounts1',3629,0,NULL,NULL,'2015-11-04 13:32:22',4,NULL,NULL,NULL,NULL,1),
  (3644,3,1,42002,'Test Creditor Accounts2',3629,0,NULL,NULL,'2015-11-04 13:32:22',4,NULL,NULL,NULL,NULL,1),
  (3645,3,1,42003,'Test Creditor Accounts3',3629,0,NULL,NULL,'2015-11-04 13:32:22',4,NULL,NULL,NULL,NULL,1);

-- attach gain/loss accounts to the enterprise
UPDATE enterprise SET `gain_account_id` = 3640, `loss_account_id` = 3641;

-- create test users
INSERT INTO user (id, username, password, display_name, email, deactivated) VALUES
  (1, 'superuser', PASSWORD('superuser'), 'Super User', 'SuperUser@test.org', 0),
  (2, 'RegularUser', PASSWORD('RegularUser'), 'Regular User', 'RegUser@test.org', 0),
  (3, 'NoUserPermissions', PASSWORD('NoUserPermissions'), 'No Permissrepertoireions', 'Invalid@test.org', 0),
  (4, 'admin', PASSWORD('1'), 'Admin User', 'admin@test.org', 1);


-- Only modules updated and written to 2X standards should be registered in the application tree
INSERT INTO permission (unit_id, user_id) VALUES

-- [Folder] Administration
(1,1),

-- Enterprise Management
(2,1),

-- Patient Invoice
(3,1),

-- Users and permissions
(4,1),

-- [Folder] Finance
(5,1),

-- Account Management
(6,1),

-- Posting Journal Management
(9,1),

-- General ledger
(10,1),

-- [Folder] Hospital
(12,1),

-- Fiscal Year
(13,1),

-- Patient Registration
(14,1),

-- Patient Search
(15,1),

-- Patient Invoice
(16,1),

-- Cash Payments
(18,1),

-- Supplier Management
(19,1),

-- Price list Management
(21, 1),

-- Location Management
(26,1),

-- Service Management
(48, 1),

-- Payroll Management
(57, 1),

-- Employee Management
(61, 1),

-- subsidie Management
(82, 1),

--  Cashbox Management
(105,1),

--  Debtor Groups Management
(107,1),

-- Simple Journal Vouchers
(134, 1),

-- Billing Services Module
(135, 1),

-- Patient Group Module
(29, 1),

-- complex Journal Vouchers
(137, 1),

-- inventory module
(138, 1),

-- inventory list module
(139, 1),

-- inventory configuration module
(140, 1),

-- Voucher records
(141, 1),

-- Update permission for Regular user

-- Account Management
(6,2),

-- [Folder] Finance
(5,2),

-- Fiscal Year
(13,2),

-- transaction type
(143, 1),

-- [Folder] Finance/Reports
(144,1),

-- Cashflow Report
(145,1),

-- Creditor groups Management
(146,1),

-- Cash Payment Registry
(147,1),

(148, 1),

-- Income Expense Report
(149,1),

-- Balance report
(150, 1),

-- The Report accounts
(152,1),


-- Report Customer Debts
(151,1),

-- Posted Journal
(158,1),

-- Purchase order folder 
(154, 1), (155, 1), (156, 1),

-- Stock 
(160, 1), (161, 1), (162, 1), (163, 1), (164, 1), (165, 1), (166, 1), (167, 1),

 -- Clients report
(159, 1),

-- Aged Debts
(168, 1),

-- Account statement
(170, 1);

-- Fiscal Year 2015
SET @fiscalYear2015 = 0;
CALL CreateFiscalYear(1, NULL, 1, 'Test Fiscal Year 2015', 12, DATE('2015-01-01'), DATE('2015-12-31'), 'Note for 2015', @fiscalYear2015);

-- Fiscal Year 2016
SET @fiscalYear2016 = 0;
CALL CreateFiscalYear(1, @fiscalYear2015, 1, 'Test Fiscal Year 2016', 12, DATE('2016-01-01'), DATE('2016-12-31'), 'Note for 2016', @fiscalYear2016);

-- Fiscal Year 2017
SET @fiscalYear2017 = 0;
CALL CreateFiscalYear(1, @fiscalYear2016, 1, 'Test Fiscal Year 2017', 12, DATE('2017-01-01'), DATE('2017-12-31'), 'Note for 2017', @fiscalYear2017);

-- give test permission to both projects
INSERT INTO `project_permission` VALUES (1,1,1),(2,1,2),(3,2,1), (4, 4, 1);

INSERT INTO `cash_box` (id, label, project_id, is_auxiliary) VALUES
  (1,'Test Primary Cashbox A',1,0),
  (2,'Test Aux Cashbox A',1,1),
  (3,'Test Aux Cashbox B',1,1);

INSERT INTO `cash_box_account_currency` VALUES
  (1,1,1,3626,3627),
  (2,2,1,3627,3626),
  (3,1,2,3626,3627),
  (4,2,2,3626,3627);

INSERT INTO `inventory_group` VALUES
  (HUID('1410dfe0-b478-11e5-b297-023919d3d5b0'),'Test inventory group','INVGRP',3636,NULL,NULL,NULL);

INSERT INTO `inventory` VALUES
  (1, HUID('cf05da13-b477-11e5-b297-023919d3d5b0'), 'INV0', 'First Test Inventory Item', 25.0, 1, HUID('1410dfe0-b478-11e5-b297-023919d3d5b0'), 2, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, CURRENT_TIMESTAMP, NULL),
  (1, HUID('289cc0a1-b90f-11e5-8c73-159fdc73ab02'), 'INV1', 'Second Test Inventory Item', 10.0, 20, HUID('1410dfe0-b478-11e5-b297-023919d3d5b0'), 2, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, CURRENT_TIMESTAMP, NULL),
  (1, HUID('c48a3c4b-c07d-4899-95af-411f7708e296'), 'INV2', 'Third Test Inventory Item', 105.0, 1, HUID('1410dfe0-b478-11e5-b297-023919d3d5b0'), 2, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, CURRENT_TIMESTAMP, NULL);

INSERT INTO `debtor_group` VALUES
  (1,HUID('4de0fe47-177f-4d30-b95f-cff8166400b4'),'First Test Debtor Group',3631,HUID('1f162a10-9f67-4788-9eff-c1fea42fcc9b'),NULL,NULL,NULL,0,10,0,NULL,1,1,1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (1,HUID('66f03607-bfbc-4b23-aa92-9321ca0ff586'),'Second Test Debtor Group',3631,HUID('1f162a10-9f67-4788-9eff-c1fea42fcc9b'),NULL,NULL,NULL,0,300,1,NULL,1,1,1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (1,HUID('a11e6b7f-fbbb-432e-ac2a-5312a66dccf4'),'Third Test Debtor Group',3631,HUID('1f162a10-9f67-4788-9eff-c1fea42fcc9b'),NULL,NULL,NULL,0,20,1,NULL,1,1,1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO `patient_group` VALUES
  (HUID('0b8fcc00-8640-479d-872a-31d36361fcfd'),1,NULL,'Test Patient Group 1','Test Patient Group 1 Note','2016-03-10 08:44:23'),
  (HUID('112a9fb5-847d-4c6a-9b20-710fa8b4da24'),1,NULL,'Test Patient Group 2','Test Patient Group 2 Note','2016-03-10 08:44:23'),
  (HUID('112a9fb5-847d-4c6a-9b20-710fa8b4da22'),1,NULL,'Test Patient Group 3','Test Patient Group 2 Note','2016-03-12 08:44:23');

INSERT INTO `debtor` (uuid, group_uuid, text) VALUES
  (HUID('3be232f9-a4b9-4af6-984c-5d3f87d5c107'),HUID('66f03607-bfbc-4b23-aa92-9321ca0ff586'),'Patient/2/Patient'),
  (HUID('a11e6b7f-fbbb-432e-ac2a-5312a66dccf4'),HUID('4de0fe47-177f-4d30-b95f-cff8166400b4'),'Patient/1/Patient'),
  (HUID('be0096dd-2929-41d2-912e-fb2259356fb5'),HUID('4de0fe47-177f-4d30-b95f-cff8166400b4'),'Employee/Test Debtor');

INSERT INTO `patient` VALUES
  (HUID('274c51ae-efcc-4238-98c6-f402bfb39866'),1,2,HUID('3be232f9-a4b9-4af6-984c-5d3f87d5c107'),'Test 2 Patient','1990-06-01 00:00:00', FALSE, NULL,NULL,NULL,NULL,NULL,NULL,NULL,'M',NULL,NULL,NULL,NULL,NULL,NULL,HUID('1f162a10-9f67-4788-9eff-c1fea42fcc9b'),HUID('1f162a10-9f67-4788-9eff-c1fea42fcc9b'),'2015-11-14 07:04:49',NULL,NULL,'110', '', 1,'2015-11-14 07:04:49'),
  (HUID('81af634f-321a-40de-bc6f-ceb1167a9f65'),1,1,HUID('a11e6b7f-fbbb-432e-ac2a-5312a66dccf4'),'Test 1 Patient','1990-06-01 00:00:00', FALSE, NULL,NULL,NULL,NULL,NULL,NULL,NULL,'F',NULL,NULL,NULL,NULL,NULL,NULL,HUID('1f162a10-9f67-4788-9eff-c1fea42fcc9b'),HUID('1f162a10-9f67-4788-9eff-c1fea42fcc9b'),'2016-03-14 07:04:49',NULL,NULL,'100', '', 2,'2015-11-14 07:04:49');

INSERT INTO `patient_visit` (`uuid`, `patient_uuid`, `start_date`, `end_date`, `start_notes`, `end_notes`, `start_diagnosis_id`, `end_diagnosis_id`, `user_id`) VALUES
  (HUID('5d3f87d5c107-a4b9-4af6-984c-3be232f9'), HUID('274c51ae-efcc-4238-98c6-f402bfb39866'), '2016-04-25 00:00:00', '2016-04-29 00:00:00', 'He was sick', 'He got better', NULL, NULL, 1),
  (HUID('710fa8b4da22-847d-4c6a-9b20-112a9fb5'), HUID('81af634f-321a-40de-bc6f-ceb1167a9f65'), '2015-11-14 14:25:00', '2015-11-15 00:00:00', 'He was sick', 'He got better', NULL, NULL, 1);

INSERT INTO `assignation_patient` VALUES
  (HUID('49b90fec-e69c-11e5-8606-843a4bc830ac'),HUID('112a9fb5-847d-4c6a-9b20-710fa8b4da24'),HUID('81af634f-321a-40de-bc6f-ceb1167a9f65'));

-- Creditor group
INSERT INTO `creditor_group` VALUES
  (1,HUID('8bedb6df-6b08-4dcf-97f7-0cfbb07cf9e2'),'Fournisseur [Creditor Group Test]',3643,0),
  (1,HUID('b0fa5ed2-04f9-4cb3-92f7-61d6404696e7'),'Personnel [Creditor Group Test]',3644,0);

-- Creditor
INSERT INTO `creditor` VALUES
  (HUID('42d3756a-7770-4bb8-a899-7953cd859892'),HUID('b0fa5ed2-04f9-4cb3-92f7-61d6404696e7'),'Personnel'),
  (HUID('7ac4e83c-65f2-45a1-8357-8b025003d794'),HUID('8bedb6df-6b08-4dcf-97f7-0cfbb07cf9e2'),'Fournisseur');

-- Supplier
INSERT INTO `supplier` (uuid, creditor_uuid, display_name, address_1, address_2, email) VALUES
  (HUID('3ac4e83c-65f2-45a1-8357-8b025003d793'), HUID('7ac4e83c-65f2-45a1-8357-8b025003d794'), 'Test Supplier', '12th Avenue', 'New York City, NY 34305', 'supplier@test.org');

-- Grade
INSERT INTO `grade` VALUES
  (HUID('71e9f21c-d9b1-11e5-8ab7-78eb2f2a46e0'),'G1','grade 1',500.0000),
  (HUID('9ee06e4a-7b59-48e6-812c-c0f8a00cf7d3'),'A1','1.1',50.0000);

INSERT INTO `section_bilan` VALUES (1,'Section Bilan 1',1,1), (2, 'Section Bilan 2', 1, 1);
INSERT INTO `section_resultat` VALUES (1,'Section Resultat 1',1,1);

INSERT INTO `reference_group` VALUES (1,'AA','Reference Group 1',1,1);

INSERT INTO `reference` VALUES
  (1,0,'AB','Reference bilan 1',1,1,NULL),
  (3,0,'AC','Reference resultat 1',1,NULL,1),
  (4,0,'XX','Deletable reference 1',1,NULL,NULL);

INSERT INTO `cost_center` VALUES
  (1,1,'cost center 1','cost note',1),
  (1,2,'cost center 2','cost note 2',0),
  (1,3,'cost center 3', 'cost note 3', 1);

INSERT INTO `profit_center` VALUES
  (1,1,'profit center 1','profit note'),
  (1,2,'profit center 2','profit note 2'),
  (1,3,'profit center 3', 'profit note 3');

-- Services
INSERT INTO `service` VALUES
  (1, HUID('aff85bdc-d7c6-4047-afe7-1724f8cd369e'), 1, 'Test Service', 1, 1),
  (2, HUID('b1816006-5558-45f9-93a0-c222b5efa6cb'), 1, 'Administration', 2, 2),
  (3, HUID('e3988489-ef66-41df-88fa-8b8ed6aa03ac'), 1, 'Medecine Interne', 1, 2);

-- billing service configuration

INSERT INTO `billing_service` VALUES
  (1, 3626, 'Test Billing Service', 'Example billing service', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 3626, 'Second Test Billing Service', 'Example billing service 2', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO `patient_group_billing_service` VALUES
  (1, HUID('112a9fb5-847d-4c6a-9b20-710fa8b4da24'), 1, CURRENT_TIMESTAMP);

INSERT INTO `debtor_group_billing_service` VALUES
  (1, HUID('4de0fe47-177f-4d30-b95f-cff8166400b4'), 2, CURRENT_TIMESTAMP);

-- subsidy configuration

INSERT INTO `subsidy` VALUES
  (1, 3626, 'Test Subsidy', 'Subsidy for test purposes', 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 3626, 'Second Test Subsidy', 'Second subsidy for test purposes', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO `patient_group_subsidy` VALUES
  (1, HUID('112a9fb5-847d-4c6a-9b20-710fa8b4da24'), 1, CURRENT_TIMESTAMP);

INSERT INTO `debtor_group_subsidy` VALUES
  (1, HUID('4de0fe47-177f-4d30-b95f-cff8166400b4'), 1, CURRENT_TIMESTAMP);

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
  (HUID(UUID()), 3627, 100, 0, @first_voucher, HUID(UUID()), HUID(UUID())),
  (HUID(UUID()), 3628, 0, 100, @first_voucher, HUID(UUID()), HUID(UUID())),
  (HUID(UUID()), 3627, 200, 0, @second_voucher, HUID(UUID()), HUID(UUID())),
  (HUID(UUID()), 3628, 0, 200, @second_voucher, HUID(UUID()), HUID(UUID())),
  (HUID(UUID()), 3627, 300, 0, @third_voucher, HUID(UUID()), HUID(UUID())),
  (HUID(UUID()), 3628, 0, 300, @third_voucher, HUID(UUID()), HUID(UUID()));

-- patient invoices
SET @first_invoice = HUID('957e4e79-a6bb-4b4d-a8f7-c42152b2c2f6');
SET @second_invoice = HUID('c44619e0-3a88-4754-a750-a414fc9567bf');
SET @fourth_voucher = HUID('8fefadec-c036-48ce-bc4e-e307d1301960');

INSERT INTO invoice (project_id, reference, uuid, cost, debtor_uuid, service_id, user_id, date, description, created_at) VALUES
  (1,2,@first_invoice,75.0000,HUID('3be232f9-a4b9-4af6-984c-5d3f87d5c107'),1,1,'2016-01-07 14:35:55','TPA_VENTE/Thu Jan 07 2016 15:35:46 GMT+0100 (WAT)/Test 2 Patient','2016-01-07 14:35:55'),
  (1,1,@second_invoice,25.0000,HUID('3be232f9-a4b9-4af6-984c-5d3f87d5c107'),1,1,'2016-01-07 14:34:35','TPA_VENTE/Thu Jan 07 2016 15:30:59 GMT+0100 (WAT)/Test 2 Patient','2016-01-07 14:31:14');

INSERT INTO invoice_item VALUES
  (@first_invoice,HUID('2e1332a7-3e63-411e-827d-42ad585ff518'),HUID('cf05da13-b477-11e5-b297-023919d3d5b0'),3,25.0000,25.0000,0.0000,75.0000),
  (@second_invoice,HUID('ffb0350d-7d46-4204-b19d-f2e0506b386c'),HUID('cf05da13-b477-11e5-b297-023919d3d5b0'),1,25.0000,25.0000,0.0000,25.0000);

-- caution payment
SET @cash_payment = HUID('2e1332b7-3e63-411e-827d-42ad585ff517');

-- @todo Make sure this is in the posting_journal
INSERT INTO cash (uuid, project_id, reference, date, debtor_uuid, currency_id, amount, user_id, cashbox_id, description, is_caution) VALUES
  (@cash_payment, 1, 1, '2016-01-09 14:33:13', HUID('3be232f9-a4b9-4af6-984c-5d3f87d5c107'), 1, 100, 1, 2, "Some cool description", 1);

INSERT INTO `posting_journal` VALUES
  (HUID(UUID()),1,1,16,'TRANS1','2016-01-09 14:35:55',@first_invoice, 'description x',3631,75.0000,0.0000,75.0000,0.0000,2,HUID('3be232f9-a4b9-4af6-984c-5d3f87d5c107'),NULL,NULL,1,2,1,NULL),
  (HUID(UUID()),1,1,16,'TRANS1','2016-01-09 14:35:55',@first_invoice,'description x',3638,0.0000,75.0000,0.0000,75.0000,2,NULL,NULL,NULL,1,2,1,NULL),
  (HUID(UUID()),1,1,16,'TRANS2','2016-01-09 17:04:27',@second_invoice,'description x',3631,25.0000,0.0000,25.0000,0.0000,2,HUID('3be232f9-a4b9-4af6-984c-5d3f87d5c107'),NULL,NULL,1,2,1,NULL),
  (HUID(UUID()),1,1,16,'TRANS2','2016-01-09 17:04:27',@second_invoice,'description x',3638,0.0000,25.0000,0.0000,25.0000,2,NULL,NULL,NULL,1,2,1,NULL),
  -- vouchers data
  (HUID(UUID()),1,1,16,'TRANS3','2016-01-09 17:04:27',@first_voucher,'description x',3627,100.0000,0.0000,100.0000,0.0000,2,NULL,NULL,'Sample voucher data one',1,2,1,NULL),
  (HUID(UUID()),1,1,16,'TRANS3','2016-01-09 17:04:27',@first_voucher,'description x',3628,0.0000,100.0000,0.0000,100.0000,2,NULL,NULL,'Sample voucher data one',1,2,1,NULL),
  (HUID(UUID()),1,1,16,'TRANS4','2016-01-09 17:04:27',@second_voucher,'description x',3627,200.0000,0.0000,200.0000,0.0000,2,NULL,NULL,'Sample voucher data two',1,2,1,NULL),
  (HUID(UUID()),1,1,16,'TRANS4','2016-01-09 17:04:27',@second_voucher,'description x',3628,0.0000,200.0000,0.0000,200.0000,2,NULL,NULL,'Sample voucher data two',1,2,1,NULL),
  (HUID(UUID()),1,1,16,'TRANS5','2016-02-08 17:04:27',@third_voucher,'description x',3627,300.0000,0.0000,300.0000,0.0000,2,NULL,NULL,'Sample voucher data three',1,2,1,NULL),
  (HUID(UUID()),1,1,16,'TRANS5','2016-02-08 17:04:27',@third_voucher,'unique',3628,0.0000,300.0000,0.0000,300.0000,2,NULL,NULL,'Sample voucher data three',1,2,1,NULL),
  (HUID(UUID()),1,1,16,'TRANS6','2017-04-07 09:18:00',@fourth_voucher, 'description x',3641,1000.0000,0.0000,1000.0000,0.0000,2,NULL,NULL,NULL,1,2,1,NULL),
  (HUID(UUID()),1,1,16,'TRANS6','2017-04-07 09:18:00',@fourth_voucher,'description x',3643,0.0000,1000.0000,0.0000,1000.0000,2,NULL,NULL,NULL,1,2,1,NULL);

-- zones des santes SNIS
INSERT INTO `mod_snis_zs` VALUES
  (1,'Zone Sante A','Territoire A','Province A'),
  (2,'Zone Sante B','Territoire B','Province B');

-- exchange rate for the current date
INSERT INTO `exchange_rate` VALUES
  (1,1,1,900.0000, DATE('2016-01-01')),
  (2,1,1,930.0000, NOW());

INSERT INTO `employee` VALUES
  (1,'E1','Dedrick Kitamuka Mvuezolo','M','1980-02-01 00:00:00','2016-02-02 00:00:00',1,3,HUID('71e9f21c-d9b1-11e5-8ab7-78eb2f2a46e0'),500,NULL,NULL,'kinshasa','0896611111','my@email.com',1,3,HUID('1f162a10-9f67-4788-9eff-c1fea42fcc9b'),HUID('42d3756a-7770-4bb8-a899-7953cd859892'),HUID('be0096dd-2929-41d2-912e-fb2259356fb5'),NULL);

INSERT INTO `price_list` VALUES
  (HUID('75e09694-dd5c-11e5-a8a2-6c29955775b0'), 1, 'Test Price List', 'Price list for test purposes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO `price_list_item` VALUES
  (HUID(UUID()), HUID('cf05da13-b477-11e5-b297-023919d3d5b0'), HUID('75e09694-dd5c-11e5-a8a2-6c29955775b0'), 'label 1', 100, 1, CURRENT_TIMESTAMP),
  (HUID(UUID()), HUID('289cc0a1-b90f-11e5-8c73-159fdc73ab02'), HUID('75e09694-dd5c-11e5-a8a2-6c29955775b0'), 'label 2', 100, 1, CURRENT_TIMESTAMP);

UPDATE debtor_group SET price_list_uuid = HUID('75e09694-dd5c-11e5-a8a2-6c29955775b0') WHERE uuid = HUID('4de0fe47-177f-4d30-b95f-cff8166400b4');

SET @purchase_order = HUID('e07ceadc-82cf-4ae2-958a-6f6a78c87588');
INSERT INTO `purchase` VALUES
  (@purchase_order, 1, 1, 300, 2, HUID('3ac4e83c-65f2-45a1-8357-8b025003d793'), DATE('2016-02-19'), CURRENT_TIMESTAMP, 1, NULL, NULL, 0, 0, 0, 0);

INSERT INTO `purchase_item` VALUES
  (HUID(UUID()), @purchase_order, HUID('289cc0a1-b90f-11e5-8c73-159fdc73ab02'), 1, 200, 200),
  (HUID(UUID()), @purchase_order, HUID('c48a3c4b-c07d-4899-95af-411f7708e296'), 10, 10, 100);

-- confirmed purchase order
SET @purchase = HUID('8027d1c8-dd68-4686-9f4c-8860f856f8ba');
INSERT INTO `purchase` VALUES
  (@purchase, 1, 2, (1000 * 0.05), 2, HUID('3ac4e83c-65f2-45a1-8357-8b025003d793'), DATE('2017-03-29'), CURRENT_TIMESTAMP, 1, NULL, 'Purchase Order Confirmed', 1, 0, 0, 0);

INSERT INTO `purchase_item` VALUES
  (HUID(UUID()), @purchase, HUID('c48a3c4b-c07d-4899-95af-411f7708e296'), 1000, 0.05, (1000 * 0.05));

-- default depots
SET @depot_uuid = HUID("f9caeb16-1684-43c5-a6c4-47dbac1df296");
SET @second_depot_uuid = HUID("d4bb1452-e4fa-4742-a281-814140246877");
INSERT INTO `depot` VALUES 
  (@depot_uuid, 'Depot Principal', 1, 1),
  (@second_depot_uuid, 'Depot Secondaire', 1, 0);

-- stock lots 
INSERT INTO `lot` (`uuid`, `label`, `initial_quantity`, `quantity`, `unit_cost`, `expiration_date`, `inventory_uuid`, `origin_uuid`, `delay`, `entry_date`) VALUES 
  (HUID('064ab1d9-5246-4402-ae8a-958fcdb07b35'), 'VITAMINE-A', 100, 100, 1.2000, '2019-04-30', HUID('289cc0a1-b90f-11e5-8c73-159fdc73ab02'), HUID('e07ceadc-82cf-4ae2-958a-6f6a78c87588'), 0, '2017-02-02 11:09:25'),
  (HUID('5a0e06c2-6ca7-4633-8b17-92e2a59db44c'), 'VITAMINE-B', 20, 20, 0.5000, '2020-04-30', HUID('289cc0a1-b90f-11e5-8c73-159fdc73ab02'), HUID('e07ceadc-82cf-4ae2-958a-6f6a78c87588'), 0, '2017-02-02 11:09:25'),
  (HUID('6f80748b-1d94-4247-804e-d4be99e827d2'), 'QUININE-B', 200, 200, 0.8000, '2018-04-30', HUID('cf05da13-b477-11e5-b297-023919d3d5b0'), HUID('e07ceadc-82cf-4ae2-958a-6f6a78c87588'), 0, '2017-02-02 11:09:25'),
  (HUID('ae735e99-8faf-417b-aa63-9b404fca99ac'), 'QUININE-A', 100, 100, 1.2000, '2018-04-30', HUID('cf05da13-b477-11e5-b297-023919d3d5b0'), HUID('e07ceadc-82cf-4ae2-958a-6f6a78c87588'), 0, '2017-02-02 11:09:25'),
  (HUID('ef24cf1a-d5b9-4846-b70c-520e601c1ea6'), 'QUININE-C', 50, 50, 2.0000, '2017-04-30', HUID('cf05da13-b477-11e5-b297-023919d3d5b0'), HUID('e07ceadc-82cf-4ae2-958a-6f6a78c87588'), 0, '2017-02-02 11:09:25');


-- stock lots movements 
INSERT INTO `stock_movement` (`uuid`, `lot_uuid`, `document_uuid`, `depot_uuid`, `entity_uuid`, `flux_id`, `date`, `quantity`, `unit_cost`, `is_exit`, `user_id`) VALUES 
  (HUID('5b7dd0d6-9273-4955-a703-126fbd504b61'), HUID('ae735e99-8faf-417b-aa63-9b404fca99ac'), HUID('682e11c0-93a7-49f8-b79b-a4bc8e3e6f47'), HUID('f9caeb16-1684-43c5-a6c4-47dbac1df296'), '', 1, '2017-02-02', 100, 1.2000, 0, 1),
  (HUID('6529ba0c-aef4-4527-b572-5ae77273de62'), HUID('6f80748b-1d94-4247-804e-d4be99e827d2'), HUID('682e11c0-93a7-49f8-b79b-a4bc8e3e6f47'), HUID('f9caeb16-1684-43c5-a6c4-47dbac1df296'), '', 1, '2017-02-02', 200, 0.8000, 0, 1),
  (HUID('a4ff7358-f1f8-4301-86e4-e9e6fe99bd31'), HUID('5a0e06c2-6ca7-4633-8b17-92e2a59db44c'), HUID('682e11c0-93a7-49f8-b79b-a4bc8e3e6f47'), HUID('f9caeb16-1684-43c5-a6c4-47dbac1df296'), '', 1, '2017-02-02', 20, 0.5000, 0, 1),
  (HUID('d8c83ad9-a3ea-4f9f-96f9-456a435f480d'), HUID('ef24cf1a-d5b9-4846-b70c-520e601c1ea6'), HUID('682e11c0-93a7-49f8-b79b-a4bc8e3e6f47'), HUID('f9caeb16-1684-43c5-a6c4-47dbac1df296'), '', 1, '2017-02-02', 50, 2.0000, 0, 1),
  (HUID('f9aa33f1-65e2-4e37-89cb-843d27b2c586'), HUID('064ab1d9-5246-4402-ae8a-958fcdb07b35'), HUID('682e11c0-93a7-49f8-b79b-a4bc8e3e6f47'), HUID('f9caeb16-1684-43c5-a6c4-47dbac1df296'), '', 1, '2017-02-02', 100, 1.2000, 0, 1);

-- general ledger data
INSERT INTO `general_ledger` VALUES 
  (HUID('6b2b8aa9-3ff3-11e7-b0b2-507b9dd6e004'), 1, 3, 34, 'TPB10', '2017-05-23 13:06:46', HUID('3b2754c2-969f-4767-8a10-bb0bca06a370'), 'Facture a Test 2 Patient (PA.TPA.2) pour 1 items dans le service Administration. ', 3631, 25.0000, 0.0000, 25.0000, 0.0000, 2, HUID('3be232f9-a4b9-4af6-984c-5d3f87d5c107'), '', NULL, 11, 1, NULL, NULL),
  (HUID('6b2b9882-3ff3-11e7-b0b2-507b9dd6e004'), 1, 3, 34, 'TPB11', '2017-05-23 13:06:46', HUID('3b2754c2-969f-4767-8a10-bb0bca06a370'), 'Facture a Test 2 Patient (PA.TPA.2) pour 1 items dans le service Administration. ', 3642, 0.0000, 25.0000, 0.0000, 25.0000, 2, '', '', NULL, 11, 1, NULL, NULL);
