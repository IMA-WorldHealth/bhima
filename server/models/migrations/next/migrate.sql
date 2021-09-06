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

CALL add_constraint_if_missing('posting_journal', 'pg__cost_center_1', 'FOREIGN KEY (`cost_center_id`) REFERENCES `fee_center` (`id`) ON UPDATE CASCADE');
CALL add_constraint_if_missing('posting_journal', 'pg__cost_center_2', 'FOREIGN KEY (`principal_center_id`) REFERENCES `fee_center` (`id`) ON UPDATE CASCADE');

CALL add_column_if_missing('general_ledger', 'cost_center_id', 'MEDIUMINT(8) UNSIGNED NULL');
CALL add_column_if_missing('general_ledger', 'principal_center_id', 'MEDIUMINT(8) UNSIGNED NULL');

CALL add_constraint_if_missing('general_ledger', 'general_ledger__cost_center_1', 'FOREIGN KEY (`cost_center_id`) REFERENCES `fee_center` (`id`) ON UPDATE CASCADE');
CALL add_constraint_if_missing('general_ledger', 'general_ledger__cost_center_2', 'FOREIGN KEY (`principal_center_id`) REFERENCES `fee_center` (`id`) ON UPDATE CASCADE');
