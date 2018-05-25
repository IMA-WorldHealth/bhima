SET autocommit=0;
SET unique_checks=0;

/*
  NOTES:
   - the script assumes IMCK's database is named "bhima".  Please rename the IMCK
   database to "bhima" if it is not called that already.

  TO RUN:
    1. Create a clean database by running ./sh/build-init-database.sh or yarn build:clean.
    2. Log into mysql's command line:  mysql $DB_NAME
    3. Run the script: source server/models/migrations/Tshikaji/migrate.sql

  Importing posting_journal
  -------------------------
  Here are posting_journal dependencies :
  1. currency
  2. country
  3. province
  4. sector
  6. village
  7. enterprise
  8. fiscal_year
  9. project
  10. transaction_type
  11. user
  12. cost center
  13. profit center
  14. period
  15. account_type
  16. reference
  17. account
  18. posting_journal
*/

/* CURRENCY */
/*
  WRONG NAME : min_monentary_unit instead of min_monentary_unit
*/
INSERT INTO currency (id, name, format_key, symbol, note, min_monentary_unit)
SELECT id, name, format_key, symbol, note, min_monentary_unit FROM bhima.currency
ON DUPLICATE KEY UPDATE id = bhima.currency.id, name = bhima.currency.name, format_key = bhima.currency.format_key, symbol = bhima.currency.symbol, note = bhima.currency.note, min_monentary_unit = bhima.currency.min_monentary_unit;

/* COUNTRY */
INSERT INTO country (`uuid`, name)
SELECT HUID(`uuid`), country_fr FROM bhima.country
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.country.`uuid`), name = bhima.country.country_fr;

/* PROVINCE */
ALTER TABLE `province` DROP KEY `province_1`;
INSERT INTO province (`uuid`, name, country_uuid)
SELECT HUID(`uuid`), name, HUID(country_uuid) FROM bhima.province
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.province.`uuid`), name = bhima.province.name;
ALTER TABLE `province` ADD CONSTRAINT `province_1` UNIQUE (name, country_uuid);

/* SECTOR */
ALTER TABLE `sector` DROP KEY `sector_1`;
INSERT INTO sector (`uuid`, name, province_uuid)
SELECT HUID(`uuid`), name, HUID(province_uuid) FROM bhima.sector
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.sector.`uuid`), name = bhima.sector.name;
ALTER TABLE `sector` ADD CONSTRAINT `sector_1` UNIQUE (name, province_uuid);

/* VILLAGE */
ALTER TABLE `village` DROP KEY `village_1`;
INSERT INTO village (`uuid`, name, sector_uuid)
SELECT HUID(`uuid`), name, HUID(sector_uuid) FROM bhima.village
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.village.`uuid`), name = bhima.village.name;
ALTER TABLE `village` ADD CONSTRAINT `village_1` UNIQUE (name, sector_uuid);

/* ENTERPRISE  */
INSERT INTO enterprise (id, name, abbr, phone, email, location_id, logo, currency_id, po_box, gain_account_id, loss_account_id)
SELECT id, name, abbr, phone, email, HUID(location_id), logo, currency_id, po_box, NULL, NULL FROM bhima.enterprise
ON DUPLICATE KEY UPDATE id = bhima.enterprise.id, name = bhima.enterprise.name, abbr = bhima.enterprise.abbr, phone = bhima.enterprise.phone, email = bhima.enterprise.email, location_id = HUID(bhima.enterprise.location_id), logo = bhima.enterprise.logo, currency_id = bhima.enterprise.currency_id, po_box = bhima.enterprise.po_box;

/* PROJECT */
INSERT INTO project (id, name, abbr, enterprise_id, zs_id, locked)
SELECT id, name, abbr, enterprise_id, zs_id, 0 FROM bhima.project
ON DUPLICATE KEY UPDATE id = bhima.project.id;

/* USER */
ALTER TABLE `user` DROP KEY `user_1`;
INSERT INTO `user` (id, username, password, display_name, email, active, deactivated, pin, last_login)
SELECT id, username, password, CONCAT(first, ' ', last), email, active, 0, pin, IF(TIMESTAMP(last_login), TIMESTAMP(last_login), NOW()) FROM bhima.`user`
ON DUPLICATE KEY UPDATE id = bhima.`user`.id;
ALTER TABLE `user` ADD CONSTRAINT `user_1` UNIQUE (username);

/*
  CREATE THE SUPERUSER for attributing permissions
*/
SET @SUPERUSER_ID = 1000;
INSERT INTO `user` (id, username, password, display_name, email, active, deactivated, pin) VALUE 
  (@SUPERUSER_ID, 'superuser', PASSWORD('superuser'), 'The Admin User', 'support@bhi.ma', 1, 0, 1000);

INSERT INTO `permission` (unit_id, user_id)
SELECT id, @SUPERUSER_ID FROM unit;

INSERT INTO `project_permission` (project_id, user_id)
SELECT id, @SUPERUSER_ID FROM project;

SET @roleUuid = HUID('7b7dd0d6-9273-4955-a703-126fbd504b61');

/* project role */
/*
  FOR EACH PROJECT DO WE NEED A NEW ROLE ???
  NEED TO BE FIXED
*/
INSERT INTO `role` (`uuid`, label, project_id)
  SELECT @roleUuid, 'Superuser', id FROM project LIMIT 1;

/* unit role */
INSERT INTO role_unit
  SELECT HUID(uuid()) as uuid, @roleUuid, id FROM unit;

/* action role */
INSERT INTO role_actions
  SELECT HUID(uuid()) as uuid, @roleUuid, id FROM actions;

/* user role */
INSERT INTO `user_role`(`uuid`, user_id, role_uuid)
VALUES(HUID(uuid()), @SUPERUSER_ID, @roleUuid);

/* FISCAL YEAR */
/*
  WARNING: USE OF bhima_test HERE, PLEASE USE THE NAME OF NEW DATABASE USED
  FOR GETTING THE OLD ID
    SEE: ON DUPLICATE KEY UPDATE id = bhima_test.fiscal_year.id;
*/
INSERT INTO fiscal_year (enterprise_id, id, number_of_months, label, start_date, end_date, previous_fiscal_year_id, locked, created_at, updated_at, user_id, note)
SELECT enterprise_id, id, number_of_months, fiscal_year_txt, MAKEDATE(start_year, 1), DATE_ADD(DATE_ADD(MAKEDATE(start_year, 1), INTERVAL (12)-1 MONTH), INTERVAL (31)-1 DAY), previous_fiscal_year, 0, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), 1, start_year FROM bhima.fiscal_year
ON DUPLICATE KEY UPDATE id = bhima_test.fiscal_year.id;

/* TRANSACTION TYPE */
INSERT INTO transaction_type (id, `text`, type, prefix, fixed)
SELECT id, service_txt, service_txt, service_txt, 1 FROM bhima.transaction_type
ON DUPLICATE KEY UPDATE id = bhima.transaction_type.id;

/* COST CENTER */
INSERT INTO cost_center (project_id, id, `text`, note, is_principal)
SELECT project_id, id, `text`, note, is_principal FROM bhima.cost_center
ON DUPLICATE KEY UPDATE id = bhima.cost_center.id;

/* PROFIT CENTER */
INSERT INTO profit_center (project_id, id, `text`, note)
SELECT project_id, id, `text`, note FROM bhima.profit_center
ON DUPLICATE KEY UPDATE id = bhima.profit_center.id;

/* PERIOD */
/*
  NOTE : PLEASE CONVERT ALL ID TO YYYYN+ ex. 20180, 201812
  WITH : SELECT CONCAT(YEAR(start_date), IF(LPAD(number,2,'0') = '00', '0', LPAD(number,2,'0'))) AS NUMBER FROM period;
  FISCAL_YEAR_ID IN (6. 7) ARE FOR DUPLICATED 2018
*/
INSERT INTO period (id, fiscal_year_id, `number`, start_date, end_date, locked)
SELECT id, fiscal_year_id, period_number, IF(period_start=0, NULL, period_start), IF(period_stop=0, NULL, period_stop), locked FROM bhima.period WHERE bhima.period.fiscal_year_id NOT IN (6, 7)
ON DUPLICATE KEY UPDATE id = bhima.period.id;

/* ACCOUNT TYPE */
/*
  NOTE: UPDATE ALL ACCOUNT_CATEGORY USED TO BE AS 2.X WANT
  NO NEED TO ADD OTHER ACCOUNT_CATEGORY
  FIX: FIX THE ACCOUNT_CATEGORY_ID FOR EXPENSE ACCOUNT
*/
INSERT INTO account_type (id, type, translation_key, account_category_id)
SELECT id, type, type, IF(type = 'balance', 3, IF(type = 'title', 4, IF(type = 'income/expense', 1, 2))) FROM bhima.account_type
ON DUPLICATE KEY UPDATE id = bhima.account_type.id;

/* REFERENCE */
INSERT INTO reference (id, is_report, ref, `text`, `position`, `reference_group_id`, `section_resultat_id`)
SELECT id, is_report, ref, `text`, `position`, `reference_group_id`, `section_resultat_id` FROM bhima.reference
ON DUPLICATE KEY UPDATE id = bhima.reference.id;

/* ACCOUNT */
ALTER TABLE `account` DROP KEY `account_1`;
INSERT INTO account (id, type_id, enterprise_id, `number`, label, parent, locked, cc_id, pc_id, created, classe, reference_id)
SELECT id, account_type_id, enterprise_id, account_number, account_txt, parent, locked, cc_id, pc_id, created, classe, reference_id FROM bhima.account
ON DUPLICATE KEY UPDATE id = bhima.account.id;
ALTER TABLE `account` ADD CONSTRAINT `account_1` UNIQUE (`number`);

CREATE TEMPORARY TABLE `inventory_group_dups` AS
  SELECT COUNT(code) as N, code FROM bhima.inventory_group GROUP BY code HAVING COUNT(code) > 1;

/* INVENTORY GROUP */
ALTER TABLE `inventory_group` DROP KEY `inventory_group_1`;
ALTER TABLE `inventory_group` DROP KEY `inventory_group_2`;

INSERT INTO inventory_group (`uuid`, name, code, sales_account, cogs_account, stock_account, donation_account, expires, unique_item)
  SELECT HUID(`uuid`), name, code, sales_account, cogs_account, stock_account, donation_account, 1, 0
  FROM bhima.inventory_group
  WHERE code NOT IN (SELECT code from inventory_group_dups)
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.inventory_group.`uuid`);

INSERT INTO inventory_group (`uuid`, name, code, sales_account, cogs_account, stock_account, donation_account, expires, unique_item)
  SELECT HUID(`uuid`), name, CONCAT(code, FLOOR(RAND() * 10000)) , sales_account, cogs_account, stock_account, donation_account, 1, 0
  FROM bhima.inventory_group
  WHERE code IN (SELECT code from inventory_group_dups)
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.inventory_group.`uuid`);

ALTER TABLE `inventory_group` ADD CONSTRAINT `inventory_group_1` UNIQUE (`name`);
ALTER TABLE `inventory_group` ADD CONSTRAINT `inventory_group_2` UNIQUE (`code`);

/* INVENTORY UNIT */
INSERT INTO inventory_unit (id, abbr, `text`)
SELECT id, `text`, `text` FROM bhima.inventory_unit
ON DUPLICATE KEY UPDATE id = bhima.inventory_unit.id;

/* INVENTORY TYPE */
INSERT INTO inventory_type (id, `text`)
SELECT id, `text` FROM bhima.inventory_type
ON DUPLICATE KEY UPDATE id = bhima.inventory_type.id;

/*
Unfortunately, the IMCK database does not have unique inventory item labels, so
we have to make them unique.  The following code first imports all inventory
that have unique labels and then makes the others unique by appending their code
to the description.
*/

CREATE TEMPORARY TABLE `inventory_dups` AS
  SELECT COUNT(text) as N, text FROM bhima.inventory GROUP BY text HAVING COUNT(text) > 1;

/* INVENTORY */
ALTER TABLE `inventory` DROP KEY `inventory_1`;
ALTER TABLE `inventory` DROP KEY `inventory_2`;

INSERT INTO inventory (enterprise_id, `uuid`, code, `text`, price, default_quantity, group_uuid, unit_id, unit_weight, unit_volume, stock, stock_max, stock_min, type_id, consumable, sellable, note, locked, delay, avg_consumption, purchase_interval, num_purchase, num_delivery, created_at, updated_at)
SELECT enterprise_id, HUID(`uuid`), code, `text`, price, 1, HUID(group_uuid), unit_id, unit_weight, unit_volume, stock, stock_max, stock_min, type_id, consumable, 1, `text`, 0, 1, 1, 1, 0, 0, origin_stamp, origin_stamp
  FROM bhima.inventory WHERE text NOT IN (SELECT text FROM `inventory_dups`) ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.inventory.`uuid`);

INSERT INTO inventory (enterprise_id, `uuid`, code, `text`, price, default_quantity, group_uuid, unit_id, unit_weight, unit_volume, stock, stock_max, stock_min, type_id, consumable, sellable, note, locked, delay, avg_consumption, purchase_interval, num_purchase, num_delivery, created_at, updated_at)
  SELECT enterprise_id, HUID(`uuid`), code, CONCAT(`text`, ' (', code, ')'), price, 1, HUID(group_uuid), unit_id, unit_weight, unit_volume, stock, stock_max, stock_min, type_id, consumable, 1, `text`, 0, 1, 1, 1, 0, 0, origin_stamp, origin_stamp
    FROM bhima.inventory WHERE text IN (SELECT text from `inventory_dups`) ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.inventory.`uuid`);

ALTER TABLE `inventory` ADD CONSTRAINT `inventory_1` UNIQUE (group_uuid, `text`);
ALTER TABLE `inventory` ADD CONSTRAINT `inventory_2` UNIQUE (code);

/* PRICE LIST */
INSERT INTO price_list (`uuid`, enterprise_id, label, description, created_at, updated_at)
SELECT HUID(`uuid`), enterprise_id, title, description, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP() FROM bhima.price_list
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.price_list.`uuid`);

/* PRICE LIST ITEM */
/* AMPICILINE_UUID IS A DEFAULT EXISTING INVENTORY_UUID FOR AVOIDING ERRORS IN CASE OF NULL */
SET @AMPICILINE_UUID = '00efb27b-0d50-4561-bf13-94337c069c2a';
INSERT INTO price_list_item (`uuid`, inventory_uuid, price_list_uuid, label, value, is_percentage, created_at)
SELECT HUID(`uuid`), IFNULL(HUID(inventory_uuid), HUID(@AMPICILINE_UUID)), HUID(price_list_uuid), CAST(description AS CHAR(250)), value, 0, CURRENT_TIMESTAMP() FROM bhima.price_list_item
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.price_list_item.`uuid`);

/* DEBTOR GROUP */
/* Account with Ids : 210, 257, 1074 doesn't exist */
ALTER TABLE `debtor_group` DROP KEY `debtor_group_1`;
ALTER TABLE `debtor_group` DROP KEY `debtor_group_2`;
INSERT INTO debtor_group (enterprise_id, `uuid`, name, account_id, location_id, phone, email, note, locked, max_credit, is_convention, price_list_uuid, apply_discounts, apply_invoicing_fees, apply_subsidies, created_at, updated_at)
SELECT enterprise_id, HUID(`uuid`), name, account_id, HUID(location_id), phone, email, note, locked, max_credit, is_convention, HUID(price_list_uuid), 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP() FROM bhima.debitor_group WHERE bhima.debitor_group.account_id NOT IN (210, 257, 1074)
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.debitor_group.`uuid`);
ALTER TABLE `debtor_group` ADD CONSTRAINT `debtor_group_1` UNIQUE (`name`);
ALTER TABLE `debtor_group` ADD CONSTRAINT `debtor_group_2` UNIQUE (`name`, `account_id`);

/* DEBTOR */
/*
  THERE IS DEBTOR WHO BELONGS TO A GROUP WHICH DOESN'T HAVE AN EXISTING ACCOUNT ID
*/
INSERT INTO debtor (`uuid`, group_uuid, `text`)
SELECT HUID(`uuid`), HUID(group_uuid), SUBSTRING(`text`, 0, 99) FROM bhima.debitor WHERE bhima.debitor.uuid NOT IN (
  SELECT d.uuid FROM bhima.debitor d JOIN bhima.debitor_group dg ON dg.uuid = d.group_uuid WHERE dg.account_id IN (210, 257, 1074))
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.debitor.`uuid`);

/* CREDITOR GROUP */
INSERT INTO creditor_group (enterprise_id, `uuid`, name, account_id, locked)
SELECT enterprise_id, HUID(`uuid`), name, account_id, locked FROM bhima.creditor_group
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.creditor_group.`uuid`);

/* CREDITOR */
INSERT INTO creditor (`uuid`, group_uuid, `text`)
SELECT HUID(`uuid`), HUID(group_uuid), SUBSTRING(`text`, 0, 99) FROM bhima.creditor
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.creditor.`uuid`);

/* SERVICE */
INSERT INTO service (id, `uuid`, enterprise_id, name, cost_center_id, profit_center_id)
SELECT id, HUID(UUID()), 200, name, cost_center_id, profit_center_id FROM bhima.service
ON DUPLICATE KEY UPDATE id = bhima.service.id;

/* INVOICE */
/*
  THERE ARE SALE (58) MADE BY USER (SELLER_ID) WHO DOESN'T EXIST IN THE USER TABLE
  select count(*) from sale where sale.seller_id not in (select id from `user`);
  I WILL CONSIDER JUST SALE MADE BY EXISTING USERS
*/
/* INSERT INTO invoice (project_id, reference, `uuid`, cost, debtor_uuid, service_id, user_id, `date`, description)
SELECT project_id, reference, HUID(`uuid`), cost, HUID(debitor_uuid), service_id, seller_id, invoice_date, note FROM bhima.sale WHERE bhima.sale.seller_id IN (SELECT id FROM bhima.user)
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.sale.`uuid`); */

/* INVOICE ITEM */
/*
  SELECT JUST invoice_item for invoice who exist
  THIS QUERY TAKE TOO LONG TIME
*/
-- ALTER TABLE `invoice_item` DROP KEY `invoice_item_1`;
-- INSERT INTO invoice_item (invoice_uuid, `uuid`, inventory_uuid, quantity, inventory_price, transaction_price, debit, credit)
-- SELECT HUID(sale_uuid), HUID(`uuid`), HUID(inventory_uuid), quantity, inventory_price, transaction_price, debit, credit FROM bhima.sale_item WHERE bhima.sale_item.sale_uuid IN (
--   SELECT BUID(`uuid`) COLLATE utf8_unicode_ci FROM invoice
-- )
-- ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.sale_item.`uuid`);
-- ALTER TABLE `invoice_item` ADD CONSTRAINT `invoice_item_1` UNIQUE (`invoice_uuid`, `inventory_uuid`);



/* POSTING JOURNAL*/
/*
  NOTE: CONVERT DOC_NUM TO RECORD_UUID
*/
/* INSERT INTO posting_journal (uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, record_uuid, description, account_id, debit, credit, debit_equiv, credit_equiv, currency_id, entity_uuid, reference_uuid, comment, transaction_type_id, user_id, cc_id, pc_id, created_at, updated_at)
SELECT HUID(uuid), project_id, bhima.posting_journal.fiscal_year_id, IF(bhima.posting_journal.fiscal_year_id = 6 OR bhima.posting_journal.fiscal_year_id = 7, 50 + period_number, period_id), trans_id, TIMESTAMP(trans_date), IFNULL(doc_num, HUID(UUID())), description, account_id, debit, credit, debit_equiv, credit_equiv, currency_id, HUID(deb_cred_uuid), HUID(inv_po_id), comment, origin_id, user_id, cc_id, pc_id, TIMESTAMP(trans_date), CURRENT_TIMESTAMP() FROM bhima.posting_journal JOIN bhima.period ON bhima.period.id = bhima.posting_journal.period_id
ON DUPLICATE KEY UPDATE uuid = HUID(bhima.posting_journal.uuid); */

/* GENERAL LEDGER */
/*
  HBB4229 HAS AS INV_PO_ID PCE29850 WHICH CANNOT BE CONVERTED BY HUID
  SO WE CONVERT PCE29850 TO 36 CHARS BEFORE PASSING IT TO HUID
  WE WILL USE 8d344ed2-5db0-11e8-8061-54e1ad7439c7 AS UUID
*/
/* INSERT INTO general_ledger (uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, record_uuid, description, account_id, debit, credit, debit_equiv, credit_equiv, currency_id, entity_uuid, reference_uuid, comment, transaction_type_id, user_id, cc_id, pc_id, created_at, updated_at)
SELECT HUID(`uuid`), project_id, bhima.general_ledger.fiscal_year_id, IF(bhima.general_ledger.fiscal_year_id = 6 OR bhima.general_ledger.fiscal_year_id = 7, 50 + period_number, period_id), trans_id, TIMESTAMP(trans_date), IFNULL(doc_num, HUID(UUID())), description, account_id, debit, credit, debit_equiv, credit_equiv, currency_id, IF(deb_cred_uuid = 'null', HUID(NULL), IF(deb_cred_uuid = 'undefined', HUID(NULL), HUID(REPLACE(deb_cred_uuid, '"', '')))), IF(inv_po_id = 'null', HUID(NULL), IF(inv_po_id = 'undefined', HUID(NULL), if (inv_po_id = 'pce29850', HUID('8d344ed2-5db0-11e8-8061-54e1ad7439c7'), HUID(REPLACE(inv_po_id, '"', ''))))), comment, origin_id, user_id, cc_id, pc_id, TIMESTAMP(trans_date), CURRENT_TIMESTAMP() FROM bhima.general_ledger JOIN bhima.period ON bhima.period.id = bhima.general_ledger.period_id
ON DUPLICATE KEY UPDATE uuid = HUID(bhima.general_ledger.uuid); */

/* PERIOD TOTAL */
/* INSERT INTO period_total (enterprise_id, fiscal_year_id, period_id, account_id, credit, debit, locked) 
SELECT enterprise_id, fiscal_year_id, period_id, account_id, credit, debit, locked FROM bhima.period_total
; */

/* PATIENT */
/*
  1.x DOESN'T LINK PATIENT TO USER WHO CREATE THE PATIENT,
  SO WE USE 2.X SUPERUSER ACCOUNT

  DEBTOR UUID WITH BAD GROUP : e27aecd1-5122-4c34-8aa6-1187edc8e597
  SELECT d.`uuid` FROM bhima.debitor d JOIN bhima.debitor_group dg ON dg.uuid = d.group_uuid WHERE dg.account_id IN (210, 257, 1074)
*/
SET autocommit=0;
SET unique_checks=0;
SET foreign_key_checks=0;

ALTER TABLE `patient` DROP KEY `patient_1`;
ALTER TABLE `patient` DROP KEY `patient_2`;
INSERT INTO patient (`uuid`, project_id, reference, debtor_uuid, display_name, dob, dob_unknown_date, father_name, mother_name, profession, employer, spouse, spouse_profession, spouse_employer, sex, religion, marital_status, phone, email, address_1, address_2, registration_date, origin_location_id, current_location_id, title, notes, hospital_no, avatar, user_id, health_zone, health_area, created_at) 
SELECT HUID(`uuid`), project_id, reference, HUID(debitor_uuid), IFNULL(CONCAT(first_name, ' ', last_name, ' ', middle_name), 'Unknown'), dob, 0, father_name, mother_name, profession, employer, spouse, spouse_profession, spouse_employer, sex, religion, marital_status, phone, email, address_1, address_2, IF(registration_date = 0, CURRENT_DATE(), registration_date), HUID(origin_location_id), HUID(current_location_id), title, notes, SUBSTRING(hospital_no, 0, 19), NULL, 1000, NULL, NULL, IF(registration_date = 0, CURRENT_DATE(), registration_date) FROM bhima.patient  WHERE bhima.patient.debitor_uuid NOT IN ('e27aecd1-5122-4c34-8aa6-1187edc8e597')
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.patient.uuid);
ALTER TABLE `patient` ADD CONSTRAINT `patient_1` UNIQUE (`hospital_no`);
ALTER TABLE `patient` ADD CONSTRAINT `patient_2` UNIQUE (`project_id`, `reference`);
COMMIT;

/* CASH_BOX */
INSERT INTO cash_box (id, label, project_id, is_auxiliary) 
SELECT id, `text`, project_id, is_auxillary FROM bhima.cash_box
ON DUPLICATE KEY UPDATE id = bhima.cash_box.id;

/* CASH_BOX ACCOUNT CURRENCY */
INSERT INTO cash_box_account_currency (id, currency_id, cash_box_id, account_id, transfer_account_id) 
SELECT id, currency_id, cash_box_id, account_id, virement_account_id FROM bhima.cash_box_account_currency 
ON DUPLICATE KEY UPDATE id = bhima.cash_box_account_currency.id;

/* FOREIGN KEY CHECKS */
SET autocommit=0;
SET unique_checks=0;
SET foreign_key_checks=0;

/* CASH */
/*
  c54a8769-3e4f-4899-bc43-ef896d3919b3 is a deb_cred_uuid with type D which doesn't exist in the debitor table in 1.x
  with as cash uuid 524475fb-9762-4051-960c-e5796a14d300
*/
ALTER TABLE `cash` DROP KEY `cash_1`;
INSERT INTO cash (`uuid`, project_id, reference, `date`, debtor_uuid, currency_id, amount, user_id, cashbox_id, description, is_caution, reversed, edited, created_at) 
SELECT HUID(bhima.cash.`uuid`), bhima.cash.project_id, bhima.cash.reference, bhima.cash.`date`, HUID(bhima.cash.deb_cred_uuid), bhima.cash.currency_id, bhima.cash.cost, bhima.cash.user_id, bhima.cash.cashbox_id, bhima.cash.description, bhima.cash.is_caution, IF(bhima.cash_discard.`uuid` <> NULL, 1, 0), 0, CURRENT_TIMESTAMP() FROM bhima.cash LEFT JOIN bhima.cash_discard ON bhima.cash_discard.cash_uuid = bhima.cash.`uuid` 
WHERE bhima.cash.deb_cred_uuid NOT IN (
  SELECT d.uuid FROM bhima.debitor d JOIN bhima.debitor_group dg ON dg.uuid = d.group_uuid WHERE dg.account_id IN (210, 257, 1074)) AND bhima.cash.deb_cred_uuid <> 'c54a8769-3e4f-4899-bc43-ef896d3919b3'
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.cash.`uuid`);
ALTER TABLE `cash` ADD CONSTRAINT `cash_1` UNIQUE (`reference`, `project_id`);
COMMIT;

/* CASH ITEM */
/*
  skiped cash 524475fb-9762-4051-960c-e5796a14d30
*/
INSERT INTO cash_item (`uuid`, cash_uuid, amount, invoice_uuid) 
SELECT HUID(`uuid`), HUID(cash_uuid), allocated_cost, HUID(invoice_uuid) FROM bhima.cash_item WHERE bhima.cash_item.cash_uuid <> '524475fb-9762-4051-960c-e5796a14d30'
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.cash_item.`uuid`);

/* RECOMPUTE */
Call ComputeAccountClass();
Call zRecomputeEntityMap();
Call zRecomputeDocumentMap();
Call zRecalculatePeriodTotals();


/* ENABLE AUTOCOMMIT AFTER THE SCRIPT */
SET autocommit=1;
SET unique_checks=1;
SET foreign_key_checks=1;
