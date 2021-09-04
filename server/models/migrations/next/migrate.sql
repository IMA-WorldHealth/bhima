/*
 * @author: mbayopanda
 * @date: 2021-08-24
 * @desc: set to decimal the min months of security stock
 */
ALTER TABLE `stock_setting` MODIFY COLUMN `default_min_months_security_stock` DECIMAL(19,4) NOT NULL DEFAULT 2;
ALTER TABLE `depot` MODIFY COLUMN `min_months_security_stock` DECIMAL(19,4) NOT NULL DEFAULT 2;
ALTER TABLE `depot` MODIFY COLUMN `default_purchase_interval` DECIMAL(19,4) NOT NULL DEFAULT 2;

/* migrate v1.21.0 to next */

/**
author: @jniles
date: 2021-08-30
description: adds cost columns and indices to relevant tables
*/

DROP TABLE IF EXISTS `cost_center_aggregate`;
CREATE TABLE `cost_center_aggregate` (
  `period_id`       MEDIUMINT(8) UNSIGNED NOT NULL,
  `debit`           DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0.00,
  `credit`          DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0.00,
  `cost_center_id`  MEDIUMINT(8) UNSIGNED NOT NULL,
  `principal_center_id` MEDIUMINT(8) UNSIGNED NULL,
  KEY `cost_center_id` (`cost_center_id`),
  KEY `principal_center_id` (`principal_center_id`),
  KEY `period_id` (`period_id`),
  CONSTRAINT `cost_center_aggregate__period` FOREIGN KEY (`period_id`) REFERENCES `period` (`id`),
  CONSTRAINT `cost_center_aggregate__cost_center_id` FOREIGN KEY (`cost_center_id`) REFERENCES `fee_center` (`id`),
  CONSTRAINT `cost_center_aggregate__principal_center_id` FOREIGN KEY (`principal_center_id`) REFERENCES `fee_center` (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

CALL add_column_if_missing('posting_journal', 'cost_center_id', 'MEDIUMINT(8) UNSIGNED NULL');
CALL add_column_if_missing('posting_journal', 'principal_center_id', 'MEDIUMINT(8) UNSIGNED NULL');

ALTER TABLE `posting_journal` ADD CONSTRAINT `pg__cost_center_1` FOREIGN KEY (`cost_center_id`) REFERENCES `fee_center` (`id`) ON UPDATE CASCADE;
ALTER TABLE `posting_journal` ADD CONSTRAINT `pg__cost_center_2` FOREIGN KEY (`principal_center_id`) REFERENCES `fee_center` (`id`) ON UPDATE CASCADE;


CALL add_column_if_missing('general_ledger', 'cost_center_id', 'MEDIUMINT(8) UNSIGNED NULL');
CALL add_column_if_missing('general_ledger', 'principal_center_id', 'MEDIUMINT(8) UNSIGNED NULL');

ALTER TABLE `general_ledger` ADD CONSTRAINT `general_ledger__cost_center_1` FOREIGN KEY (`cost_center_id`) REFERENCES `fee_center` (`id`) ON UPDATE CASCADE;
ALTER TABLE `general_ledger` ADD CONSTRAINT `general_ledger__cost_center_2` FOREIGN KEY (`principal_center_id`) REFERENCES `fee_center` (`id`) ON UPDATE CASCADE;


/*
 * @author: mbayopanda
 * @date: 2021-09-02
 * @desc: fee center report tables and test data
 */
ALTER TABLE `fee_center` ADD COLUMN `step_order` SMALLINT(5) NOT NULL DEFAULT 0;
ALTER TABLE `fee_center` ADD COLUMN `default_fee_center_index_id` MEDIUMINT(8) UNSIGNED NULL;

DROP TABLE IF EXISTS `fee_center_index`;
CREATE TABLE `fee_center_index` (
  `id` MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT,
  `label` VARCHAR(100) NOT NULL,
  `constant` TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `fee_center_index_value`;
CREATE TABLE `fee_center_index_value` (
  `fee_center_index_id` MEDIUMINT(8) UNSIGNED NOT NULL,
  `fee_center_id` MEDIUMINT(8) UNSIGNED NOT NULL,
  `value` decimal(19,4) UNSIGNED DEFAULT NULL,
  KEY `fee_center_index_id` (`fee_center_index_id`),
  KEY `fee_center_id` (`fee_center_id`),
  CONSTRAINT `fc_index_value__fee_center_index_id`FOREIGN KEY (`fee_center_index_id`) REFERENCES `fee_center_index` (`id`),
  CONSTRAINT `fc_index__fee_center`FOREIGN KEY (`fee_center_id`) REFERENCES `fee_center` (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

INSERT INTO `fee_center_index` (`id`, `label`) VALUES 
  (1, "Number of employee"),
  (2, "Computer equipment"),
  (3, "Cost by department");

INSERT INTO `fee_center` (id, label, is_principal, step_order, default_fee_center_index_id) VALUES
  (10, 'Accounting', 0, 3, 3),
  (11, 'Daycare facility', 0, 0, 1),
  (12, 'IT', 0, 2, 2),
  (13, 'HR', 0, 1, 1),
  (14, 'Cutting', 1, 4, NULL),
  (15, 'Assembling', 1, 5, NULL),
  (16, 'Packaging', 1, 6, NULL);

INSERT INTO `fee_center_index_value` VALUES 
  (1, 10, 8), (1, 11, 5), (1, 12, 9), (1, 13, 4), (1, 14, 20), (1, 15, 50), (1, 16, 5),
  (2, 10, 10), (2, 11, 2), (2, 12, 10), (2, 13, 5), (2, 14, 6), (2, 15, 4), (2, 16, 8),
  (3, 10, 250000), (3, 11, 50000), (3, 12, 200000), (3, 13, 300000), (3, 14, 500000), (3, 15, 700000), (3, 16, 400000); 

INSERT INTO `cost_center_aggregate` (`period_id`, `cost_center_id`, `principal_center_id`, `debit`, `credit`) VALUES 
  (202108, 10, NULL, 250000, 0),
  (202108, 11, NULL, 50000, 0),
  (202108, 12, NULL, 200000, 0),
  (202108, 13, NULL, 300000, 0),
  (202108, 14, 14, 500000, 0),
  (202108, 15, 15, 700000, 0),
  (202108, 16, 16, 400000, 0);

INSERT INTO `unit` VALUES 
  (298, 'Fee Center Step-down','TREE.FEE_CENTER_STEPDOWN','The fee center report with step-down algorithm', 286,'/reports/fee_center_step_down');
