/**
 * @author sfount
 * @version 0.9.0
 * @date 30/08/2018
 * @description
 * - Performance improvements for `GenerateTransactionID()` SQL method
 * - Added additional transaction ID column to the `posting_journal`
 *   and `general_ledger` tables
 * - Added additional index to `posting_journal` and `general_ledger` tables
**/

-- SQL Function delimiter definition
DELIMITER $$

-- Add integer reference numbers to posting journal and general ledger
ALTER TABLE posting_journal
  ADD COLUMN trans_id_reference_number MEDIUMINT UNSIGNED NOT NULL,
  ADD INDEX (trans_id_reference_number);

ALTER TABLE general_ledger
  ADD COLUMN trans_id_reference_number MEDIUMINT UNSIGNED NOT NULL,
  ADD INDEX (trans_id_reference_number);

-- Populate new reference numbers using the existing String equivalent
UPDATE posting_journal SET trans_id_reference_number = SUBSTR(trans_id, 4);
UPDATE general_ledger SET trans_id_reference_number = SUBSTR(trans_id, 4);

-- Remove the current implementation of `GenerateTransactionId`
DROP FUNCTION GenerateTransactionId;

-- Implement the improved performance `GenerateTransactionId` function
-- (note_ the API will not change)
-- (note_ SUBSELECT vs. JOIN was tested, SUBSELECT was used because it works when there are no rows in journals
CREATE FUNCTION GenerateTransactionId(
  target_project_id SMALLINT(5)
)
RETURNS VARCHAR(100) DETERMINISTIC
BEGIN
  RETURN (
    SELECT CONCAT(
      (SELECT abbr AS project_string FROM project WHERE id = target_project_id),
      IFNULL(MAX(current_max) + 1, 1)
    ) AS id
    FROM (
      (
        SELECT trans_id_reference_number AS current_max
        FROM general_ledger
        WHERE project_id = target_project_id
        ORDER BY trans_id_reference_number DESC
        LIMIT 1
      )
      UNION
      (
        SELECT trans_id_reference_number AS current_max FROM posting_journal
        WHERE project_id = target_project_id
        ORDER BY trans_id_reference_number DESC
        LIMIT 1
      )
    )A
  );
END $$

-- Last updated 30/08/2018 23:53 @sfount

/*
@author jniles

@description
This file removes the previous version of the BUID() function, which was slow
and cumbersome, and replaces it with a faster version of itself.
*/

DELIMITER $$

DROP FUNCTION IF EXISTS BUID;

CREATE FUNCTION BUID(b BINARY(16))
RETURNS CHAR(32) DETERMINISTIC
BEGIN
  RETURN HEX(b);
END
$$

DELIMITER ;

/*
@author mbayopanda
@description adds the OHADA Bilan to the navigation tree.
*/
INSERT IGNORE INTO unit VALUES
  (206, '[OHADA] Bilan','TREE.OHADA_BALANCE_SHEET','',144,'/modules/reports/ohada_balance_sheet_report','/reports/ohada_balance_sheet_report');

/* Record the report */
INSERT IGNORE INTO `report` (`id`, `report_key`, `title_key`) VALUES
  (20, 'ohada_balance_sheet_report', 'REPORT.OHADA.BALANCE_SHEET');

/*
@author mbayopanda

@description
  ACCOUNT REFERENCE MODULE AND REPORT
  ===================================
  NOTE : Please create `account_reference` and `account_reference_item` tables first
*/


DROP TABLE IF EXISTS `account_reference_item`;
DROP TABLE IF EXISTS `account_reference`;

CREATE TABLE `account_reference` (
  `id` MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT,
  `abbr` VARCHAR(35) NOT NULL,
  `description` VARCHAR(100) NOT NULL,
  `parent` MEDIUMINT(8) UNSIGNED NULL,
  `is_amo_dep` TINYINT(1) NULL DEFAULT 0 COMMENT 'Ammortissement or depreciation',
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_reference_1` (`abbr`, `is_amo_dep`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `account_reference_item` (
  `id` MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT,
  `account_reference_id` MEDIUMINT(8) UNSIGNED NOT NULL,
  `account_id` INT(10) UNSIGNED NOT NULL,
  `is_exception` TINYINT(1) NULL DEFAULT 0 COMMENT 'Except this for reference calculation',
  PRIMARY KEY (`id`),
  KEY `account_reference_id` (`account_reference_id`),
  KEY `account_id` (`account_id`),
  FOREIGN KEY (`account_reference_id`) REFERENCES `account_reference` (`id`),
  FOREIGN KEY (`account_id`) REFERENCES `account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT IGNORE INTO unit VALUES
  (205, 'Account Reference Management','TREE.ACCOUNT_REFERENCE_MANAGEMENT','',1,'/modules/account_reference','/account_reference'),
  (206, '[OHADA] Bilan','TREE.OHADA_BALANCE_SHEET','',144,'/modules/reports/ohada_balance_sheet_report','/reports/ohada_balance_sheet_report'),
  (207, 'Account Reference Report','TREE.ACCOUNT_REFERENCE_REPORT','',144,'/modules/reports/account_reference','/reports/account_reference');

INSERT IGNORE INTO `report` (`id`, `report_key`, `title_key`) VALUES
  (20, 'ohada_balance_sheet_report', 'REPORT.OHADA.BALANCE_SHEET'),
  (21, 'account_reference', 'REPORT.ACCOUNT_REFERENCE.TITLE');


/*
@author jniles
@description
  UPDATE ENTERPRISE_SETTING TABLE
  ===============================

  ADD BALANCE ON INVOICE RECEIPT OPTION
  If yes, the balance will be displayed on the invoice as proof.
*/

ALTER TABLE `enterprise_setting` ADD COLUMN `enable_balance_on_invoice_receipt` TINYINT(1) NOT NULL DEFAULT 1;

/*
@author jniles
@description
Add stock accounting to the enterprise settings
*/

ALTER TABLE `enterprise_setting` ADD COLUMN `enable_auto_stock_accounting` TINYINT(1) NOT NULL DEFAULT 1;

/*
@author jniles
@description
Add enable barcodes setting to the enterprise settings
*/
ALTER TABLE `enterprise_setting` ADD COLUMN `enable_barcodes` TINYINT(1) NOT NULL DEFAULT 1;

/*
@author bruce
@description
Add stock import module in the navigation tree
*/
INSERT IGNORE INTO unit VALUES
(208, 'Import Stock From File','TREE.IMPORT_STOCK_FROM_FILE','',160,'/modules/stock/import','/stock/import');