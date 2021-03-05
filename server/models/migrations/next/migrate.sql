
-- 2021-01-04
-- author: @jniles  (updated by jmcameron 2021-01-12)
ALTER TABLE `user` MODIFY COLUMN `last_login` TIMESTAMP NULL;

CALL add_column_if_missing('user', 'created_at', ' TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `last_login`');
CALL add_column_if_missing('user', 'updated_at', ' TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `created_at`');

-- reset all last_login information
UPDATE `user` SET `last_login` = NULL;

/*
 * @author: lomamech
 * @date: 2021-01-07
 * @subject : Using the description from the voucher_item table in the alternative where it is provided
 */
DELIMITER $$

DROP PROCEDURE IF EXISTS PostVoucher$$

CREATE PROCEDURE PostVoucher(
  IN uuid BINARY(16)
)
BEGIN
  DECLARE enterprise_id INT;
  DECLARE project_id INT;
  DECLARE currency_id INT;
  DECLARE date TIMESTAMP;

  -- variables to store core set-up results
  DECLARE fiscal_year_id MEDIUMINT(8) UNSIGNED;
  DECLARE period_id MEDIUMINT(8) UNSIGNED;
  DECLARE current_exchange_rate DECIMAL(19, 8) UNSIGNED;
  DECLARE enterprise_currency_id TINYINT(3) UNSIGNED;
  DECLARE transaction_id VARCHAR(100);
  DECLARE gain_account_id INT UNSIGNED;
  DECLARE loss_account_id INT UNSIGNED;


  DECLARE transIdNumberPart INT;
  --
  SELECT p.enterprise_id, p.id, v.currency_id, v.date
    INTO enterprise_id, project_id, currency_id, date
  FROM voucher AS v JOIN project AS p ON v.project_id = p.id
  WHERE v.uuid = uuid;

  -- populate core setup values
  CALL PostingSetupUtil(date, enterprise_id, project_id, currency_id, fiscal_year_id, period_id, current_exchange_rate, enterprise_currency_id, transaction_id, gain_account_id, loss_account_id);

  -- make sure the exchange rate is correct
  SET current_exchange_rate = GetExchangeRate(enterprise_id, currency_id, date);
  SET current_exchange_rate = (SELECT IF(currency_id = enterprise_currency_id, 1, current_exchange_rate));

  SET transIdNumberPart = GetTransactionNumberPart(transaction_id, project_id);

  -- POST to the posting journal
  -- @TODO(sfount) transaction ID number reference should be fetched seperately from full transaction ID to model this relationship better
  INSERT INTO posting_journal (uuid, project_id, fiscal_year_id, period_id,
    trans_id, trans_id_reference_number, trans_date, record_uuid, description, account_id, debit,
    credit, debit_equiv, credit_equiv, currency_id, entity_uuid,
    reference_uuid, comment, transaction_type_id, user_id)
  SELECT
    HUID(UUID()), v.project_id, fiscal_year_id, period_id, transaction_id, transIdNumberPart, v.date,
    v.uuid, IF((vi.description IS NULL), v.description, vi.description), vi.account_id, vi.debit, vi.credit,
    vi.debit * (1 / current_exchange_rate), vi.credit * (1 / current_exchange_rate), v.currency_id,
    vi.entity_uuid, vi.document_uuid, NULL, v.type_id, v.user_id
  FROM voucher AS v JOIN voucher_item AS vi ON v.uuid = vi.voucher_uuid
  WHERE v.uuid = uuid;

  -- NOTE: this does not handle any rounding - it simply converts the currency as needed.
END $$


/*
 * @author: jmcameron
 * @date: 2021-01-07
 * @description: Install default discharge_type's in all sites
 */
DROP TABLE IF EXISTS `discharge_type`;
CREATE TABLE `discharge_type` (
  `id` TINYINT(3) UNSIGNED NOT NULL AUTO_INCREMENT,
  `label` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `discharge_type_1` (`id`, `label`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

-- Default Discharge types
INSERT INTO `discharge_type` (`id`, `label`) VALUES
  (1, 'PATIENT_RECORDS.DISCHARGE.REGULAR'),
  (2, 'PATIENT_RECORDS.DISCHARGE.ON_PATIENT_WILL'),
  (3, 'PATIENT_RECORDS.DISCHARGE.EMERGENCY'),
  (4, 'PATIENT_RECORDS.DISCHARGE.SERVICE_CHANGE'),
  (5, 'PATIENT_RECORDS.DISCHARGE.DEATH'),
  (6, 'PATIENT_RECORDS.DISCHARGE.EVASION'),
  (7, 'PATIENT_RECORDS.DISCHARGE.DISCHARGE_BUT_ON_BED'),
  (8, 'PATIENT_RECORDS.DISCHARGE.STATUQUO_CLINIC'),
  (9, 'PATIENT_RECORDS.DISCHARGE.TRANSFER');

/*
 * @author: jmcameron
 * @date: 2021-01-12
 * @subject : Add description and dhis2_uid fields to the depot table
 */
CALL add_column_if_missing('depot', 'description', 'TEXT DEFAULT NULL AFTER `text`');
CALL add_column_if_missing('depot', 'dhis2_uid', 'VARCHAR(150) DEFAULT NULL AFTER `parent_uuid`');

/*
 * @author: jmcameron
 * @date: 2021-02-04
 * @subject : Add nav entry for 'Find Duplicate Lots' page
 */
INSERT INTO unit VALUES
 (294, 'Duplicate Lots','TREE.DUPLICATE_LOTS','The stock lots duplicates list',160,'/stock/lots/duplicates');

/*
 * @author: jniles
 * @date: 2021-02-04
 * @subject: drop average_consumption column
 * @issue: #5144
 * @PR: #5357
*/
CALL drop_column_if_exists('inventory', 'avg_consumption');

/*
 * @author: jniles
 * @date: 2021-02-04
 * @subject: drop stock_consumption table in favor of stock_movement_status
 * @issue: #5073
*/
DROP TABLE IF EXISTS stock_consumption;

/*
 * @author: jniles
 * @date: 2021-02-08
 * @subject: replace stock movement status table structure
 * @issue: #5332
*/
DROP TABLE IF EXISTS `stock_movement_status`;
CREATE TABLE  `stock_movement_status` (
  `depot_uuid` BINARY(16) NOT NULL,
  `inventory_uuid` BINARY(16) NOT NULL,
  `date` DATE NOT NULL,
  `quantity_delta` DECIMAL(19,4) NOT NULL, -- the difference between inflows and outflows for the day
  `in_quantity` DECIMAL(19,4) NOT NULL, -- current in flows of day
  `out_quantity_exit` DECIMAL(19,4) NOT NULL, -- current out flows of day to exits
  `out_quantity_consumption` DECIMAL(19,4) NOT NULL, -- current out flows of day to consumptions
  `sum_quantity` DECIMAL(19,4) NOT NULL,  -- cumulative quantity to date (running balance)
  `sum_in_quantity` DECIMAL(19,4) NOT NULL, -- cumulative in flows to date
  `sum_out_quantity_exit` DECIMAL(19,4) NOT NULL, -- cumulative outflows to date as exits
  `sum_out_quantity_consumption` DECIMAL(19,4) NOT NULL, -- cumulative outflows to date as consumption
  `duration` INTEGER UNSIGNED NULL DEFAULT 0, -- duration for which this row is valid
  KEY `depot_uuid` (`depot_uuid`),
  KEY `inventory_uuid` (`inventory_uuid`),
  INDEX `depot_inventory` (`depot_uuid`, `inventory_uuid`),
  INDEX `date` (`date`), -- add index on date
  CONSTRAINT `stock_movement_status__depot` FOREIGN KEY (`depot_uuid`) REFERENCES `depot` (`uuid`),
  CONSTRAINT `stock_movment_status__inventory` FOREIGN KEY (`inventory_uuid`) REFERENCES `inventory` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

/**
  * @author: mbayopanda
  * @date: 2021-02-25
  * @desc: fix stock movement report title
  */
UPDATE report SET title_key = 'REPORT.STOCK_MOVEMENT_REPORT.TITLE' WHERE report_key = 'stock_movement_report';

/*
 * @author: lomamech
 * @date: 2021-01-12
 * @subject : Allow users to record aggregate consumption information for a depot
 */
INSERT INTO unit VALUES
  (293, 'Aggregated consumption','TREE.AGGREGATED_STOCK_CONSUMPTION','Aggregated consumption',160,'/stock/aggregated_consumption');

-- Stock Movement Flux
INSERT INTO `flux` VALUES
  (16, 'STOCK_FLUX.AGGREGATE_CONSUMPTION');

ALTER TABLE `inventory_unit`
	CHANGE COLUMN `abbr` `abbr` VARCHAR(50),
	CHANGE COLUMN `text` `text` VARCHAR(50);


/*
 * @author: jniles
 * @date: 2021-03-05
 * @description: add minimum delay column to stock settings
*/
ALTER TABLE stock_setting ADD COLUMN `min_delay` DECIMAL(19,4) NOT NULL DEFAULT 0;
