/*
  NOTE: bhima is the 1.x database of thikaji

  Run: 
  ./sh/build-init-database.sh for creating an init database and from this database ex. bhima_test, and the run 
  the following script : source migrate.sql
  
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
INSERT INTO province (`uuid`, name, country_uuid) 
SELECT HUID(`uuid`), name, HUID(country_uuid) FROM bhima.province
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.province.`uuid`), name = bhima.province.name;

/* SECTOR */
INSERT INTO sector (`uuid`, name, province_uuid) 
SELECT HUID(`uuid`), name, HUID(province_uuid) FROM bhima.sector
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.sector.`uuid`), name = bhima.sector.name;

/* VILLAGE */
INSERT INTO village (`uuid`, name, sector_uuid) 
SELECT HUID(`uuid`), name, HUID(sector_uuid) FROM bhima.village
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.village.`uuid`), name = bhima.village.name;

/* ENTERPRISE  */
INSERT INTO enterprise (id, name, abbr, phone, email, location_id, logo, currency_id, po_box, gain_account_id, loss_account_id)
SELECT id, name, abbr, phone, email, HUID(location_id), logo, currency_id, po_box, NULL, NULL FROM bhima.enterprise
ON DUPLICATE KEY UPDATE id = bhima.enterprise.id, name = bhima.enterprise.name, abbr = bhima.enterprise.abbr, phone = bhima.enterprise.phone, email = bhima.enterprise.email, location_id = HUID(bhima.enterprise.location_id), logo = bhima.enterprise.logo, currency_id = bhima.enterprise.currency_id, po_box = bhima.enterprise.po_box;

/* PROJECT */
INSERT INTO project (id, name, abbr, enterprise_id, zs_id, locked) 
SELECT id, name, abbr, enterprise_id, zs_id, 0 FROM bhima.project
ON DUPLICATE KEY UPDATE id = bhima.project.id;

/* USER */
/*
  FIX: THE LAST LOGIN BY CONVERTING CORRECTLY date INTO timestamp
*/
ALTER TABLE `user` DROP KEY `user_1`;
INSERT INTO `user` (id, username, password, display_name, email, active, deactivated, pin, last_login) 
SELECT id, username, password, CONCAT(first, ' ', last), email, active, 0, pin, CURRENT_TIMESTAMP() FROM bhima.`user`
ON DUPLICATE KEY UPDATE id = bhima.`user`.id;
ALTER TABLE `user` ADD CONSTRAINT `user_1` UNIQUE (username);

/*
  CREATE THE SUPERUSER for attributing permissions
*/
INSERT INTO `user` (id, username, password, display_name, email, active, deactivated, pin) VALUE 
  (1000, 'superuser', PASSWORD('superuser'), 'The Admin User', 'support@bhi.ma', 1, 0, 1000);

INSERT INTO `permission` (unit_id, user_id)
SELECT id, 1000 FROM unit;

INSERT INTO `project_permission` (project_id, user_id)
SELECT id, 1000 FROM project;

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

/* user role */
INSERT INTO `user_role`(`uuid`, user_id, role_uuid)
VALUES(HUID(uuid()), 1000, @roleUuid);

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
  WITH : SELECT CONCAT(YEAR(start_date), IF(LPAD(number,2,'0') = '00', '0', LPAD(number,2,'0'))) AS NUMER FROM period;
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

/* POSTING JOURNAL*/
/*
  NOTE: CONVERT DOC_NUM TO RECORD_UUID
*/
INSERT INTO posting_journal (uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, record_uuid, description, account_id, debit, credit, debit_equiv, credit_equiv, currency_id, entity_uuid, reference_uuid, comment, transaction_type_id, user_id, cc_id, pc_id, created_at, updated_at)
SELECT HUID(uuid), project_id, bhima.posting_journal.fiscal_year_id, IF(bhima.posting_journal.fiscal_year_id = 6 OR bhima.posting_journal.fiscal_year_id = 7, 50 + period_number, period_id), trans_id, trans_date, IFNULL(doc_num, HUID(UUID())), description, account_id, debit, credit, debit_equiv, credit_equiv, currency_id, HUID(deb_cred_uuid), HUID(inv_po_id), comment, origin_id, user_id, cc_id, pc_id, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP() FROM bhima.posting_journal JOIN bhima.period ON bhima.period.id = bhima.posting_journal.period_id 
ON DUPLICATE KEY UPDATE uuid = HUID(bhima.posting_journal.uuid);
