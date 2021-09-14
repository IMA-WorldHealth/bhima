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

/**
author: @jmcameron
date: 2021-09-01
description: adds allocation basis data to cost centers
*/
CREATE TABLE IF NOT EXISTS `cost_center_basis` (
  `id` MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY  (`name`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cost_center_basis_value` (
  `id` MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT,
  `quantity` DECIMAL(19,4) NOT NULL DEFAULT 0,
  `cost_center_id` MEDIUMINT(8) UNSIGNED NOT NULL,
  `basis_id` MEDIUMINT(8) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `cost_center_basis_value__fee_center` FOREIGN KEY (`cost_center_id`) REFERENCES `fee_center` (`id`),
  CONSTRAINT `cost_center_basis_value__basis` FOREIGN KEY (`basis_id`) REFERENCES `cost_center_basis` (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

/**
author: @jmcameron
date: 2021-09-07
description: Edit cost center allocation basis
*/
CALL add_column_if_missing('cost_center_basis', 'units', "VARCHAR(30) DEFAULT '' AFTER `name`");

/*
 * @author: mbayopanda
 * @date: 2021-09-02
 * @desc: fee center report tables and test data
 */
CALL add_column_if_missing('fee_center', 'step_order', 'SMALLINT(5) NOT NULL DEFAULT 0');
CALL add_column_if_missing('fee_center', 'allocation_basis_id', 'MEDIUMINT(8) UNSIGNED');
CALL add_column_if_missing('fee_center', 'allocation_method', "VARCHAR(14) NOT NULL DEFAULT 'proportional'");

INSERT IGNORE INTO `unit` VALUES 
  (298, 'Cost Center Step-down','TREE.COST_CENTER_STEPDOWN','The fee center report with step-down algorithm', 286,'/reports/cost_center_step_down');

ALTER TABLE `cost_center_basis` MODIFY COLUMN `name` VARCHAR(200) NOT NULL;

/**
author: @jmcameron
date: 2021-09-09
description: Create cost basis items
*/
CALL add_column_if_missing('cost_center_basis', 'is_predefined', 'BOOLEAN NOT NULL DEFAULT 0 AFTER `description`');

/**
author: @jniles
date: 2021-09-02
description: rename all cost centers to cost centers
*/

/**
 * THE USE OF RENAME IMPLY THAT TABLES EXISTS BEFORE TO RENAME
 * AFTER A FRESH BUILD (yarn build:db) THIS CODES ARE NOT NECESSARY
 */
RENAME TABLE fee_center TO cost_center,
             reference_fee_center TO reference_cost_center,
             fee_center_distribution TO cost_center_allocation,
             service_fee_center TO service_cost_center;

ALTER TABLE `cost_center_allocation` RENAME COLUMN `auxiliary_fee_center_id` TO `auxiliary_cost_center_id`;
ALTER TABLE `cost_center_allocation` RENAME COLUMN `principal_fee_center_id` TO `principal_cost_center_id`;
ALTER TABLE `service_cost_center` RENAME COLUMN `fee_center_id` TO `cost_center_id`;

/**
author: mbayopanda
date: 2021-09-14
description: rename allocation tables
*/
RENAME TABLE cost_center_basis TO cost_center_allocation_basis,
             cost_center_basis_value TO cost_center_allocation_basis_value;
