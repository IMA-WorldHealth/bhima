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

-- optimisations for bulk data import
-- see https://dev.mysql.com/doc/refman/5.7/en/optimizing-innodb-bulk-data-loading.html
SET autocommit=0;
SET foreign_key_checks=0;
SET unique_checks=0;

/*!40101 SET NAMES utf8 */;
/*!40101 SET character_set_client = utf8 */;


/*
Useful Functions/ Procedures
*/

DELIMITER $$

CREATE PROCEDURE MergeSector(
  IN beforeUuid CHAR(36),
  IN afterUuid CHAR(36)
) BEGIN
  DECLARE `isDuplicate` BOOL DEFAULT 0;
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET `isDuplicate` = 1;
  UPDATE village SET sector_uuid = HUID(afterUuid) WHERE sector_uuid = HUID(beforeUuid);
  DELETE FROM sector WHERE sector.uuid = HUID(beforeUuid);
END $$

CREATE PROCEDURE ComputePeriodZero(
  IN year INT
) BEGIN
  DECLARE fyId INT;
  DECLARE previousFyId INT;
  DECLARE enterpriseId INT;
  DECLARE periodZeroId INT;

  SELECT id, previous_fiscal_year_id, enterprise_id
    INTO fyId, previousFyId, enterpriseId
  FROM fiscal_year WHERE YEAR(start_date) = year;

  SET periodZeroId = CONCAT(year, 0);

  INSERT INTO period_total (enterprise_id, fiscal_year_id, period_id, account_id, credit, debit, locked)
    SELECT enterpriseId, fyId, periodZeroId, account_id, SUM(credit), SUM(debit), 0
    FROM period_total
    WHERE fiscal_year_id = previousFyId
    GROUP BY account_id;
END $$

DELIMITER ;

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
-- NOTE: Bandundu and Kasai Oriental are duplicated.  These are removed later.
INSERT INTO province (`uuid`, name, country_uuid)
SELECT HUID(`uuid`), name, HUID(country_uuid) FROM bhima.province
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.province.`uuid`), name = bhima.province.name;

/* SECTOR */
INSERT INTO sector (`uuid`, name, province_uuid)
SELECT HUID(`uuid`), name, HUID(province_uuid) FROM bhima.sector
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.sector.`uuid`), name = bhima.sector.name;

-- remove extra Bandundu and Kasai Oriental provinces
SET @KO_UUID_OLD = '525ecb4f-ae8d-40e1-9f86-913c5fe9b5a7';
SET @KO_UUID_NEW = '5891deb5-e725-48b2-a720-cbfcb95da36b';

SET @BA_UUID_OLD = '2feea5a1-b738-45de-95b6-947e35e11f79';
SET @BA_UUID_NEW = '47927e29-2da0-4566-b6e5-a74a9670c4c5';

UPDATE sector SET province_uuid = @KO_UUID_NEW WHERE province_uuid = @KO_UUID_OLD;
UPDATE sector SET province_uuid = @BA_UUID_NEW WHERE province_uuid = @BA_UUID_OLD;
DELETE FROM province WHERE uuid IN (@KO_UUID_OLD, @BA_UUID_OLD);

/* VILLAGE */
INSERT INTO village (`uuid`, name, sector_uuid)
SELECT HUID(`uuid`), name, HUID(sector_uuid) FROM bhima.village
  ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.village.`uuid`), name = bhima.village.name;

/*
Merge duplicate sectors

All these sectors have the same name, but are registered in both KO and Bas Congo.
Here, I delete the Bas Congo ones and keep the KO ones.
*/
CALL MergeSector('61414179-25e1-494a-895b-90d44138491c', '87055ace-2f6f-4a8f-9c07-1743079f01e9');
CALL MergeSector('449f5802-f33c-4455-b90a-aedb993e3c63', 'f9608a66-b425-4e90-878d-458174e392e1');
CALL MergeSector('6912ae18-c57f-444b-a3f1-47cf539d2b16', '9ab1a069-be59-419a-842c-2a3ad8c71e0d');
CALL MergeSector('4c9d1f3d-d5af-47ca-80fd-357c2f1fa807', '9cf5a7f2-4199-4a87-905b-709c7a0df73f');
CALL MergeSector('a3b5109b-3b9e-439e-8af0-732ecdc5d904', 'dd248048-b687-4fb6-a97c-81e73f95cb49');
CALL MergeSector('00712a73-694f-463e-b111-995871395bc1', '7d2740c1-aac9-40dc-8469-b1f74916afee');
CALL MergeSector('c43d8e55-7a42-4fee-9378-a830c0f42b43', 'd96f7e9a-1917-493b-bce7-c55b601e98aa');
CALL MergeSector('5d7ccadc-ddf6-41eb-93f7-a505e3280558', 'e2016756-76be-4ac9-a842-e39db81f251c');
CALL MergeSector('0404e9ea-ebd6-4f20-b1f8-6dc9f9313450', '32fac9d5-843a-4503-b142-21a3396c6f50');

/*
We should also merge locations, but only once the entire database is built.
*/

/* ENTERPRISE  */
INSERT INTO enterprise (id, name, abbr, phone, email, location_id, logo, currency_id, po_box, gain_account_id, loss_account_id)
SELECT id, name, abbr, phone, email, HUID(location_id), logo, currency_id, po_box, NULL, NULL FROM bhima.enterprise
ON DUPLICATE KEY UPDATE id = bhima.enterprise.id, name = bhima.enterprise.name, abbr = bhima.enterprise.abbr, phone = bhima.enterprise.phone, email = bhima.enterprise.email, location_id = HUID(bhima.enterprise.location_id), logo = bhima.enterprise.logo, currency_id = bhima.enterprise.currency_id, po_box = bhima.enterprise.po_box;

SET @enterpriseId = (SELECT id FROM bhima.enterprise LIMIT 1);
INSERT INTO enterprise_setting (enterprise_id) VALUES  (@enterpriseId);

/* PROJECT */
INSERT INTO project (id, name, abbr, enterprise_id, zs_id, locked)
SELECT id, name, abbr, enterprise_id, zs_id, 0 FROM bhima.project
ON DUPLICATE KEY UPDATE id = bhima.project.id;

/* USER */
INSERT INTO `user` (id, username, password, display_name, email, active, deactivated, pin, last_login)
  SELECT id, username, password, CONCAT(first, ' ', last), email, active, 0, pin, IF(TIMESTAMP(last_login), TIMESTAMP(last_login), NOW()) FROM bhima.`user`
ON DUPLICATE KEY UPDATE id = bhima.`user`.id;

/*
  CREATE THE SUPERUSER for attributing permissions
*/
SET @SUPERUSER_ID = 1000;
SET @JOHN_DOE = 1001;
INSERT INTO `user` (id, username, password, display_name, email, active, deactivated, pin) VALUE
  (@SUPERUSER_ID, 'superuser', PASSWORD('superuser'), 'The Admin User', 'support@bhi.ma', 1, 0, 1000),
  (@JOHN_DOE, 'johndoe', PASSWORD('superuser'), 'An Unknown User (John Doe)', 'support@bhi.ma', 1, 0, 1000);

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

-- migrate exchange rate
INSERT INTO exchange_rate (id, enterprise_id, currency_id, rate, `date`)
SELECT id, @enterpriseId, foreign_currency_id, rate, IF(`date` = 0, NOW(), `date`) FROM bhima.exchange_rate;

/* FISCAL YEAR */
/*
  WARNING: USE OF bhima_test HERE, PLEASE USE THE NAME OF NEW DATABASE USED
  FOR GETTING THE OLD ID
    SEE: ON DUPLICATE KEY UPDATE id = bhima_test.fiscal_year.id;
*/
-- remove duplicate FYs
DELETE FROM bhima.period WHERE fiscal_year_id IN (6, 7);
DELETE FROM bhima.fiscal_year WHERE id IN (6, 7);

INSERT INTO fiscal_year (enterprise_id, id, number_of_months, label, start_date, end_date, previous_fiscal_year_id, locked, created_at, updated_at, user_id, note)
SELECT enterprise_id, id, number_of_months, fiscal_year_txt, MAKEDATE(start_year, 1), DATE_ADD(DATE_ADD(MAKEDATE(start_year, 1), INTERVAL (12)-1 MONTH), INTERVAL (31)-1 DAY), previous_fiscal_year, 0, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), 1, start_year FROM bhima.fiscal_year
ON DUPLICATE KEY UPDATE id = bhima_test.fiscal_year.id;

/* TRANSACTION TYPE */
/*
 NOTE: Transaction Types were completely re-written in 2.x and certain transaction
types are hard-coded "fixed" types.  These need to be handled manually.

NOTE: These are the distributions of data in the transct3
*/
INSERT INTO transaction_type (id, `text`, type, fixed)
SELECT id, service_txt, service_txt, 1 FROM bhima.transaction_type
ON DUPLICATE KEY UPDATE id = bhima.transaction_type.id, `text` = bhima.transaction_type.service_txt, `type` = bhima.transaction_type.service_txt;

/* COST CENTER */
INSERT INTO cost_center (project_id, id, `text`, note, is_principal)
SELECT project_id, id, `text`, note, is_principal FROM bhima.cost_center
ON DUPLICATE KEY UPDATE id = bhima.cost_center.id;

/* PROFIT CENTER */
INSERT INTO profit_center (project_id, id, `text`, note)
SELECT project_id, id, `text`, note FROM bhima.profit_center
ON DUPLICATE KEY UPDATE id = bhima.profit_center.id;

/*
Migrate period information.  Since we have foreign keys off, the easiest way is
to delete the default data created by init database and then smash in IMCK's data.
*/
DELETE FROM period;

INSERT INTO period (id, fiscal_year_id, `number`, start_date, end_date, locked)
  SELECT id, fiscal_year_id, period_number, IF(period_start=0, NULL, period_start), IF(period_stop=0, NULL, period_stop), locked
    FROM bhima.period;

DELETE FROM period WHERE number = 0;

-- insert period 0 for all fiscal years.
INSERT INTO period (id, fiscal_year_id, `number`, start_date, end_date)
  SELECT CONCAT(start_year, 0), id, 0, NULL, NULL FROM bhima.fiscal_year;


/* ACCOUNT TYPE */
/*
  NOTE: UPDATE ALL ACCOUNT_CATEGORY USED TO BE AS 2.X WANT
  NO NEED TO ADD OTHER ACCOUNT_CATEGORY
  FIX: FIX THE ACCOUNT_CATEGORY_ID FOR EXPENSE ACCOUNT

  FIXME(@jniles) - I don't think we need to migrate account types.  They are already
  built in the initial database engine. We just need to update the 1.x account
  type links to point to the correct account types.

INSERT INTO account_type (id, type, translation_key, account_category_id)
  SELECT id, type, type, IF(type = 'balance', 3, IF(type = 'title', 4, IF(type = 'income/expense', 1, 2))) FROM bhima.account_type
ON DUPLICATE KEY UPDATE id = bhima.account_type.id;
*/

/* REFERENCE */
INSERT INTO reference (id, is_report, ref, `text`, `position`, `reference_group_id`, `section_resultat_id`)
  SELECT id, is_report, ref, `text`, `position`, `reference_group_id`, `section_resultat_id` FROM bhima.reference
ON DUPLICATE KEY UPDATE id = bhima.reference.id;

/*
Migrating accounts is kind of tricky.  We need to fit the 2.x model of accounts
and account types.  This means eliminating duplicate accounts and migrating
account types based on account class.

First we eliminate duplicates from the accounts.  We do this by appending random
text to the label and prepending 9 to the account number.
*/

-- SELECT account_number from account GROUP BY account_number HAVING COUNT(account_number) = 2;
ALTER TABLE account DROP KEY `account_1`;
INSERT INTO account (id, type_id, enterprise_id, `number`, label, parent, locked, cc_id, pc_id, created, classe, reference_id)
  SELECT id, account_type_id, enterprise_id, account_number, account_txt, parent, IF(locked, 1, IF(is_ohada, 0, 1)), cc_id, pc_id, created, classe, reference_id FROM bhima.account
ON DUPLICATE KEY UPDATE id = bhima.account.id, number = bhima.account.account_number, label = bhima.account.account_txt, parent = bhima.account.parent;
-- ALTER TABLE account ADD UNIQUE KEY `account_1` (`number`);

/*
First, we treat the title accounts.  These are any accounts with children, and
all accounts with the previous title type.

Then we do income/expense.  These are any accounts that are not title accounts
and are in the appropriate class.

Finally, assets/liabilities are pretty brutally forced in.
*/

SET @asset = 1;
SET @liability = 2;
SET @equity = 3;
SET @income = 4;
SET @expense = 5;
SET @title = 6;

-- setting up accounts for processing
CREATE TEMPORARY TABLE title_accounts AS (SELECT DISTINCT parent AS id FROM account);

-- title accounts
UPDATE account SET type_id = @title WHERE id IN (SELECT id FROM title_accounts);

-- income accounts
UPDATE account SET type_id = @income WHERE id NOT IN (SELECT id FROM title_accounts) AND LEFT(number, 1) = '7';

-- expense accounts
UPDATE account SET type_id = @expense WHERE id NOT IN (SELECT id FROM title_accounts) AND LEFT(number, 1) = '6';

-- liability accounts
UPDATE account SET type_id = @liability WHERE id NOT IN (SELECT id FROM title_accounts) AND LEFT(number, 1) = '4';

-- asset accounts
UPDATE account SET type_id = @asset WHERE id NOT IN (SELECT id FROM title_accounts) AND LEFT(number, 1) IN ('1', '2', '3', '5', '8');

DROP TABLE title_accounts;

CREATE TEMPORARY TABLE `inventory_group_dups` AS
  SELECT COUNT(code) as N, code FROM bhima.inventory_group GROUP BY code HAVING COUNT(code) > 1;

/* INVENTORY GROUP */
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
INSERT INTO inventory (enterprise_id, `uuid`, code, `text`, price, default_quantity, group_uuid, unit_id, unit_weight, unit_volume, stock, stock_max, stock_min, type_id, consumable, sellable, note, locked, delay, avg_consumption, purchase_interval, num_purchase, num_delivery, created_at, updated_at)
SELECT enterprise_id, HUID(`uuid`), code, `text`, price, 1, HUID(group_uuid), unit_id, unit_weight, unit_volume, stock, stock_max, stock_min, type_id, consumable, 1, `text`, 0, 1, 1, 1, 0, 0, origin_stamp, origin_stamp
  FROM bhima.inventory WHERE text NOT IN (SELECT text FROM `inventory_dups`) ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.inventory.`uuid`);

INSERT INTO inventory (enterprise_id, `uuid`, code, `text`, price, default_quantity, group_uuid, unit_id, unit_weight, unit_volume, stock, stock_max, stock_min, type_id, consumable, sellable, note, locked, delay, avg_consumption, purchase_interval, num_purchase, num_delivery, created_at, updated_at)
  SELECT enterprise_id, HUID(`uuid`), code, CONCAT(`text`, ' (', code, ')'), price, 1, HUID(group_uuid), unit_id, unit_weight, unit_volume, stock, stock_max, stock_min, type_id, consumable, 1, `text`, 0, 1, 1, 1, 0, 0, origin_stamp, origin_stamp
    FROM bhima.inventory WHERE text IN (SELECT text from `inventory_dups`) ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.inventory.`uuid`);

/* PRICE LIST */
INSERT INTO price_list (`uuid`, enterprise_id, label, description, created_at, updated_at)
SELECT HUID(`uuid`), enterprise_id, title, description, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP() FROM bhima.price_list
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.price_list.`uuid`);

/* PRICE LIST ITEM */
/* AMPICILINE_UUID IS A DEFAULT EXISTING INVENTORY_UUID FOR AVOIDING ERRORS IN CASE OF NULL */
SET @AMPICILINE_UUID = HUID('00efb27b-0d50-4561-bf13-94337c069c2a');
INSERT INTO price_list_item (`uuid`, inventory_uuid, price_list_uuid, label, value, is_percentage, created_at)
SELECT HUID(`uuid`), IFNULL(HUID(inventory_uuid), @AMPICILINE_UUID), HUID(price_list_uuid), CAST(description AS CHAR(250)), value, 0, CURRENT_TIMESTAMP() FROM bhima.price_list_item
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.price_list_item.`uuid`);

COMMIT;

/* DEBTOR GROUP */
/* Account with Ids : 210, 257, 1074 doesn't exist */
INSERT INTO debtor_group (enterprise_id, `uuid`, name, account_id, location_id, phone, email, note, locked, max_credit, is_convention, price_list_uuid, apply_discounts, apply_invoicing_fees, apply_subsidies, created_at, updated_at)
SELECT enterprise_id, HUID(`uuid`), name, account_id, HUID(location_id), phone, email, note, locked, max_credit, is_convention, HUID(price_list_uuid), 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP() FROM bhima.debitor_group WHERE bhima.debitor_group.account_id NOT IN (210, 257, 1074)
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.debitor_group.`uuid`);

/* DEBTOR */
/*
  THERE IS DEBTOR WHO BELONGS TO A GROUP WHICH DOESN'T HAVE AN EXISTING ACCOUNT ID
*/
INSERT INTO debtor (`uuid`, group_uuid, `text`)
SELECT HUID(`uuid`), HUID(group_uuid), SUBSTRING(`text`, 1, 100) FROM bhima.debitor WHERE bhima.debitor.uuid NOT IN (
  SELECT d.uuid FROM bhima.debitor d JOIN bhima.debitor_group dg ON dg.uuid = d.group_uuid WHERE dg.account_id IN (210, 257, 1074))
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.debitor.`uuid`);

/* CREDITOR GROUP */
INSERT INTO creditor_group (enterprise_id, `uuid`, name, account_id, locked)
SELECT enterprise_id, HUID(`uuid`), name, account_id, locked FROM bhima.creditor_group
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.creditor_group.`uuid`);

/* CREDITOR */
INSERT INTO creditor (`uuid`, group_uuid, `text`)
SELECT HUID(`uuid`), HUID(group_uuid), SUBSTRING(`text`, 1, 100) FROM bhima.creditor
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.creditor.`uuid`);

/* SERVICE */
INSERT INTO service (id, `uuid`, enterprise_id, name, cost_center_id, profit_center_id)
SELECT id, HUID(UUID()), 200, name, cost_center_id, profit_center_id FROM bhima.service
ON DUPLICATE KEY UPDATE id = bhima.service.id;

/*

sale --> invoice

The following code deals with invoices and invoice links to the posting journal.
In 1.x, we used inv_po_id to link the `posting_journal` to the `sale` table.
*/

/*!40000 ALTER TABLE `bhima`.`posting_journal` DISABLE KEYS */;
/*!40000 ALTER TABLE `bhima`.`general_ledger` DISABLE KEYS */;
CREATE TEMPORARY TABLE `sale_record_map` AS
  SELECT HUID(s.uuid) AS uuid, p.trans_id FROM bhima.sale s JOIN bhima.posting_journal p ON s.uuid = p.inv_po_id;

INSERT INTO `sale_record_map`
  SELECT HUID(s.uuid) AS uuid, g.trans_id FROM bhima.sale s JOIN bhima.general_ledger g ON s.uuid = g.inv_po_id;
/*!40000 ALTER TABLE `bhima`.`posting_journal` ENABLE KEYS */;
/*!40000 ALTER TABLE `bhima`.`general_ledger` ENABLE KEYS */;

/* INDEX FOR SALE RECORD MAP */
ALTER TABLE sale_record_map ADD INDEX `uuid` (`uuid`);

/* INVOICE */
/*
  THERE ARE SALE (58) MADE BY USER (SELLER_ID) WHO DOESN'T EXIST IN THE USER TABLE
  select count(*) from sale where sale.seller_id not in (select id from `user`);
  I WILL CONSIDER JUST SALE MADE BY EXISTING USERS
*/
INSERT INTO invoice (project_id, reference, `uuid`, cost, debtor_uuid, service_id, user_id, `date`, description)
  SELECT project_id, reference, HUID(`uuid`), cost, HUID(debitor_uuid), service_id, IF(seller_id = 0, 1, seller_id), invoice_date, note FROM bhima.sale
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.sale.`uuid`);

/* INVOICE ITEM */
/*
  SELECT JUST invoice_item for invoice who exist
  THIS QUERY TAKE TOO LONG TIME
*/
CREATE TEMPORARY TABLE temp_sale_item AS SELECT HUID(sale_uuid) AS sale_uuid, HUID(`uuid`) AS `uuid`, HUID(inventory_uuid) AS inventory_uuid, quantity, inventory_price, transaction_price, debit, credit
FROM bhima.sale_item WHERE HUID(bhima.sale_item.sale_uuid) IN (
  SELECT uuid from sale_record_map
);

/* remove the unique key for boosting the insert operation */
-- ALTER TABLE invoice_item DROP KEY `invoice_item_1`;
INSERT INTO invoice_item (invoice_uuid, `uuid`, inventory_uuid, quantity, inventory_price, transaction_price, debit, credit)
  SELECT sale_uuid, `uuid`, inventory_uuid, quantity, inventory_price, transaction_price, debit, credit FROM temp_sale_item
ON DUPLICATE KEY UPDATE `uuid` = temp_sale_item.`uuid`;
-- ALTER TABLE invoice_item ADD UNIQUE KEY `invoice_item_1` (`invoice_uuid`, `inventory_uuid`);

COMMIT;

/* POSTING JOURNAL*/
/*
  NOTE: CONVERT DOC_NUM TO RECORD_UUID
*/
INSERT INTO posting_journal (uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, record_uuid, description, account_id, debit, credit, debit_equiv, credit_equiv, currency_id, entity_uuid, reference_uuid, comment, transaction_type_id, user_id, cc_id, pc_id, created_at, updated_at)
  SELECT HUID(uuid), project_id, bhima.posting_journal.fiscal_year_id, IF(bhima.posting_journal.fiscal_year_id = 6 OR bhima.posting_journal.fiscal_year_id = 7, 50 + period_number, period_id), trans_id, TIMESTAMP(trans_date), IFNULL(doc_num, HUID(UUID())), description, account_id, debit, credit, debit_equiv, credit_equiv, currency_id, IF(LENGTH(deb_cred_uuid) = 36, HUID(deb_cred_uuid), NULL), NULL, comment, origin_id, user_id, cc_id, pc_id, TIMESTAMP(trans_date), CURRENT_TIMESTAMP() FROM bhima.posting_journal JOIN bhima.period ON bhima.period.id = bhima.posting_journal.period_id
ON DUPLICATE KEY UPDATE uuid = HUID(bhima.posting_journal.uuid);
COMMIT;

-- TODO - deal with this in a better way
-- account for data corruption (modifies HBB's dataset!)
UPDATE bhima.general_ledger SET deb_cred_uuid = NULL WHERE LEFT(deb_cred_uuid, 1) = '"';

/* GENERAL LEDGER */
/*
  HBB4229 HAS AS INV_PO_ID PCE29850 WHICH CANNOT BE CONVERTED BY HUID
  SO WE CONVERT PCE29850 TO 36 CHARS BEFORE PASSING IT TO HUID
  WE WILL USE 8d344ed2-5db0-11e8-8061-54e1ad7439c7 AS UUID
*/
INSERT INTO general_ledger (uuid, project_id, fiscal_year_id, period_id, trans_id, trans_date, record_uuid, description, account_id, debit, credit, debit_equiv, credit_equiv, currency_id, entity_uuid, reference_uuid, comment, transaction_type_id, user_id, cc_id, pc_id, created_at, updated_at)
  SELECT HUID(`uuid`), project_id, bhima.general_ledger.fiscal_year_id, IF(bhima.general_ledger.fiscal_year_id = 6 OR bhima.general_ledger.fiscal_year_id = 7, 50 + period_number, period_id), trans_id, TIMESTAMP(trans_date), IFNULL(doc_num, HUID(UUID())), description, account_id, debit, credit, debit_equiv, credit_equiv, currency_id, IF(LENGTH(deb_cred_uuid) = 36, HUID(deb_cred_uuid), NULL), NULL, comment, origin_id, user_id, cc_id, pc_id, TIMESTAMP(trans_date), CURRENT_TIMESTAMP() FROM bhima.general_ledger JOIN bhima.period ON bhima.period.id = bhima.general_ledger.period_id
ON DUPLICATE KEY UPDATE uuid = HUID(bhima.general_ledger.uuid);
COMMIT;

UPDATE general_ledger gl JOIN sale_record_map srm ON gl.trans_id = srm.trans_id SET gl.record_uuid = srm.uuid;
UPDATE posting_journal pj JOIN sale_record_map srm ON pj.trans_id = srm.trans_id SET pj.record_uuid = srm.uuid;

/* PERIOD TOTAL */
INSERT INTO period_total (enterprise_id, fiscal_year_id, period_id, account_id, credit, debit, locked)
SELECT enterprise_id, fiscal_year_id, period_id, account_id, credit, debit, locked FROM bhima.period_total;

COMMIT;

/* PATIENT */
/*
  1.x DOESN'T LINK PATIENT TO USER WHO CREATE THE PATIENT,
  SO WE USE 2.X SUPERUSER ACCOUNT

  DEBTOR UUID WITH BAD GROUP : e27aecd1-5122-4c34-8aa6-1187edc8e597
  SELECT d.`uuid` FROM bhima.debitor d JOIN bhima.debitor_group dg ON dg.uuid = d.group_uuid WHERE dg.account_id IN (210, 257, 1074)
*/

-- drop the FULLTEXT index for a perf boost
ALTER TABLE `patient` DROP KEY `display_name`;

/*!40000 ALTER TABLE `patient` DISABLE KEYS */;
INSERT INTO patient (
  `uuid`, project_id, reference, debtor_uuid, display_name, dob, dob_unknown_date, father_name, mother_name,
  profession, employer, spouse, spouse_profession, spouse_employer, sex, religion, marital_status,
  phone, email, address_1, address_2, registration_date, origin_location_id, current_location_id,
  title, notes, hospital_no, avatar, user_id, health_zone, health_area, created_at
)
SELECT
  HUID(`uuid`), project_id, reference, HUID(debitor_uuid), IFNULL(CONCAT(first_name, ' ', last_name, ' ', middle_name), 'Unknown'), dob, 0, father_name, mother_name,
  profession, employer, spouse, spouse_profession, spouse_employer, sex, religion, marital_status,
  phone, email, address_1, address_2, IF(registration_date = 0, CURRENT_DATE(), registration_date), HUID(origin_location_id), HUID(current_location_id),
  title, notes, REPLACE(hospital_no, ' ', ''), NULL, 1000, NULL, NULL, IF(registration_date = 0, CURRENT_DATE(), registration_date)
FROM bhima.patient WHERE bhima.patient.debitor_uuid <> 'e27aecd1-5122-4c34-8aa6-1187edc8e597'
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.patient.uuid);
/*!40000 ALTER TABLE `patient` ENABLE KEYS */;

COMMIT;

/* CASH_BOX */
INSERT INTO cash_box (id, label, project_id, is_auxiliary)
SELECT id, `text`, project_id, is_auxillary FROM bhima.cash_box
ON DUPLICATE KEY UPDATE id = bhima.cash_box.id;

/* CASH_BOX ACCOUNT CURRENCY */
INSERT INTO cash_box_account_currency (id, currency_id, cash_box_id, account_id, transfer_account_id)
SELECT id, currency_id, cash_box_id, account_id, virement_account_id FROM bhima.cash_box_account_currency
ON DUPLICATE KEY UPDATE id = bhima.cash_box_account_currency.id;

COMMIT;

-- filter for the cash table
CREATE TEMPORARY TABLE deb_cred_filter AS
  SELECT d.uuid FROM bhima.debitor d JOIN bhima.debitor_group dg ON dg.uuid = d.group_uuid WHERE dg.account_id IN (210, 257, 1074);

/* CASH */
/*
  c54a8769-3e4f-4899-bc43-ef896d3919b3 is a deb_cred_uuid with type D which doesn't exist in the debitor table in 1.x
  with as cash uuid 524475fb-9762-4051-960c-e5796a14d300
*/
INSERT INTO cash (`uuid`, project_id, reference, `date`, debtor_uuid, currency_id, amount, user_id, cashbox_id, description, is_caution, reversed, edited, created_at)
SELECT HUID(bhima.cash.`uuid`), bhima.cash.project_id, bhima.cash.reference, bhima.cash.`date`, HUID(bhima.cash.deb_cred_uuid), bhima.cash.currency_id, bhima.cash.cost, bhima.cash.user_id, bhima.cash.cashbox_id, bhima.cash.description, bhima.cash.is_caution, IF(bhima.cash_discard.`uuid` <> NULL, 1, 0), 0, CURRENT_TIMESTAMP() FROM bhima.cash LEFT JOIN bhima.cash_discard ON bhima.cash_discard.cash_uuid = bhima.cash.`uuid`
WHERE bhima.cash.deb_cred_uuid NOT IN (SELECT uuid FROM deb_cred_filter) AND bhima.cash.uuid <> '524475fb-9762-4051-960c-e5796a14d30'
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.cash.`uuid`);

/* CASH ITEM */
/*
  skipped cash 524475fb-9762-4051-960c-e5796a14d30
*/
INSERT INTO cash_item (`uuid`, cash_uuid, amount, invoice_uuid)
  SELECT HUID(`uuid`), HUID(cash_uuid), allocated_cost, HUID(invoice_uuid) FROM bhima.cash_item WHERE bhima.cash_item.cash_uuid <> '524475fb-9762-4051-960c-e5796a14d30'
ON DUPLICATE KEY UPDATE `uuid` = HUID(bhima.cash_item.`uuid`);

CREATE TEMPORARY TABLE `cash_record_map` AS SELECT HUID(c.uuid) AS uuid, p.trans_id FROM bhima.cash c JOIN bhima.posting_journal p ON c.uuid = p.inv_po_id;
INSERT INTO `cash_record_map` SELECT HUID(c.uuid) AS uuid, p.trans_id FROM bhima.cash c JOIN bhima.general_ledger p ON c.uuid = p.inv_po_id;

UPDATE general_ledger gl JOIN cash_record_map crm ON gl.trans_id = crm.trans_id SET gl.record_uuid = crm.uuid;
UPDATE posting_journal pj JOIN cash_record_map crm ON pj.trans_id = crm.trans_id SET pj.record_uuid = crm.uuid;

COMMIT;

/* TEMPORARY FOR JOURNAL AND GENERAL LEDGER */
/*!40000 ALTER TABLE `bhima`.`posting_journal` DISABLE KEYS */;
/*!40000 ALTER TABLE `bhima`.`general_ledger` DISABLE KEYS */;
CREATE TEMPORARY TABLE combined_ledger AS SELECT account_id, debit, credit, deb_cred_uuid, inv_po_id FROM (
  SELECT account_id, debit, credit, deb_cred_uuid, inv_po_id FROM bhima.posting_journal
  UNION ALL
  SELECT account_id, debit, credit, deb_cred_uuid, inv_po_id FROM bhima.general_ledger
) as combined;
/*!40000 ALTER TABLE `bhima`.`posting_journal` ENABLE KEYS */;
/*!40000 ALTER TABLE `bhima`.`general_ledger` ENABLE KEYS */;

/* INDEX IN COMBINED */
ALTER TABLE combined_ledger ADD INDEX `inv_po_id` (`inv_po_id`);

/* VOUCHER */
INSERT INTO voucher (`uuid`, `date`, project_id, reference, currency_id, amount, description, user_id, created_at, type_id, reference_uuid, edited)
SELECT HUID(pc.`uuid`), pc.`date`, pc.project_id, pc.reference, pc.currency_id, pc.cost, pc.description, pc.user_id, pc.`date`, pc.origin_id, HUID(pci.document_uuid), 0 FROM bhima.primary_cash pc
  JOIN bhima.primary_cash_item pci ON pci.primary_cash_uuid = pc.uuid
ON DUPLICATE KEY UPDATE `uuid` = HUID(pc.`uuid`);

/* FIX UNKNOWN USERS */
UPDATE voucher SET user_id = @JOHN_DOE WHERE user_id NOT IN (SELECT u.id FROM user u);

/* TEMPORARY VOUCHER ITEMS JOINED TO COMBINED LEDGER */
CREATE TEMPORARY TABLE temp_voucher_item AS
  SELECT HUID(pci.`uuid`) AS `uuid`, cl.account_id, cl.debit, cl.credit, HUID(pci.primary_cash_uuid) AS voucher_uuid, HUID(pci.document_uuid) AS document_uuid, HUID(pc.deb_cred_uuid) AS deb_cred_uuid
  FROM bhima.primary_cash_item pci
  JOIN bhima.primary_cash pc ON pc.uuid = pci.primary_cash_uuid
  JOIN combined_ledger cl ON cl.inv_po_id = pci.document_uuid;

/* INDEX IN TEMP VOUCHER ITEM */
ALTER TABLE temp_voucher_item ADD INDEX `uuid` (`uuid`);

/* REMOVE DUPLICATED UUID BY SETTING UP NEW UUID FOR EACH ROW */
UPDATE temp_voucher_item SET `uuid` = HUID(UUID()) WHERE `uuid` IS NOT NULL;

/* VOUCHER ITEM */
/* GET DATA DIRECTLY FROM POSTING JOURNAL AND GENERAL LEDGER */
INSERT INTO voucher_item (`uuid`, account_id, debit, credit, voucher_uuid, document_uuid, entity_uuid)
SELECT `uuid`, account_id, debit, credit, voucher_uuid, document_uuid, deb_cred_uuid FROM temp_voucher_item;

COMMIT;

CREATE TEMPORARY TABLE `pcash_record_map` AS SELECT HUID(c.uuid) AS uuid, p.trans_id FROM bhima.primary_cash c JOIN bhima.posting_journal p ON c.uuid = p.inv_po_id;
INSERT INTO `pcash_record_map` SELECT HUID(c.uuid) AS uuid, p.trans_id FROM bhima.primary_cash c JOIN bhima.general_ledger p ON c.uuid = p.inv_po_id;

UPDATE general_ledger gl JOIN pcash_record_map crm ON gl.trans_id = crm.trans_id SET gl.record_uuid = crm.uuid;
UPDATE posting_journal pj JOIN pcash_record_map crm ON pj.trans_id = crm.trans_id SET pj.record_uuid = crm.uuid;

COMMIT;

/*
Hack hack hack
*/
UPDATE general_ledger gl JOIN project p ON gl.project_id = p.id JOIN enterprise e ON p.enterprise_id = e.id SET credit_equiv = credit, debit_equiv = debit WHERE gl.currency_id = e.currency_id;
UPDATE posting_journal gl JOIN project p ON gl.project_id = p.id JOIN enterprise e ON p.enterprise_id = e.id SET credit_equiv = credit, debit_equiv = debit WHERE gl.currency_id = e.currency_id;

/* ENABLE AUTOCOMMIT AFTER THE SCRIPT */
SET autocommit=1;
SET foreign_key_checks=1;
SET unique_checks=1;


/* RECOMPUTE */
Call ComputeAccountClass();
Call zRecomputeEntityMap();
Call zRecomputeDocumentMap();
Call zRecalculatePeriodTotals();

DROP PROCEDURE MergeSector;

-- compute period 0 for the following fiscal years
CALL ComputePeriodZero(2015);
CALL ComputePeriodZero(2016);
CALL ComputePeriodZero(2017);
CALL ComputePeriodZero(2018);

COMMIT;
