RENAME TABLE `assignation_patient` TO `patient_assignment`;

ALTER TABLE `cash` ADD COLUMN `edited` TINYINT NOT NULL DEFAULT 0;
ALTER TABLE `invoice` ADD COLUMN `edited` TINYINT NOT NULL DEFAULT 0;
ALTER TABLE `voucher` ADD COLUMN `edited` TINYINT NOT NULL DEFAULT 0;

ALTER TABLE `cash_box_account_currency` CHANGE `transfer_account_id` `transfer_account_id` INT UNSIGNED DEFAULT NULL;

ALTER TABLE `config_paiement_period` CHANGE `id` `id` int(10) unsigned NOT NULL;

ALTER TABLE `depot` ADD COLUMN `allow_entry_purchase` tinyint(1) unsigned NOT NULL DEFAULT 0;
ALTER TABLE `depot` ADD COLUMN `allow_entry_donation` tinyint(1) unsigned NOT NULL DEFAULT 0;
ALTER TABLE `depot` ADD COLUMN `allow_entry_integration` tinyint(1) unsigned NOT NULL DEFAULT 0;
ALTER TABLE `depot` ADD COLUMN `allow_entry_transfer` tinyint(1) unsigned NOT NULL DEFAULT 0;
ALTER TABLE `depot` ADD COLUMN `allow_exit_debtor` tinyint(1) unsigned NOT NULL DEFAULT 0;
ALTER TABLE `depot` ADD COLUMN `allow_exit_service` tinyint(1) unsigned NOT NULL DEFAULT 0;
ALTER TABLE `depot` ADD COLUMN `allow_exit_loss` tinyint(1) unsigned NOT NULL DEFAULT 0;
ALTER TABLE `depot` ADD COLUMN `allow_exit_transfer` tinyint(1) unsigned NOT NULL DEFAULT 0;

ALTER TABLE `employee` DROP COLUMN `display_name`;
ALTER TABLE `employee` DROP COLUMN `sex`;
ALTER TABLE `employee` DROP COLUMN `dob`;

-- this can't be a ALTER TABLE because of a MySQL bug.
ALTER TABLE `employee` DROP FOREIGN KEY `employee_ibfk_4`;
ALTER TABLE `employee` DROP COLUMN `grade_id`;
ALTER TABLE `employee` ADD COLUMN `grade_uuid` BINARY(16) NOT NULL;
ALTER TABLE `employee` ADD FOREIGN KEY (`grade_uuid`) REFERENCES `grade` (`uuid`);

ALTER TABLE `employee` DROP COLUMN `adresse`;
ALTER TABLE `employee` DROP COLUMN `phone`;
ALTER TABLE `employee` DROP COLUMN `email`;
ALTER TABLE `employee` ADD COLUMN `is_medical`    TINYINT(1) DEFAULT 0;

ALTER TABLE `inventory` ADD COLUMN `locked` TINYINT(1) NOT NULL DEFAULT 0;

ALTER TABLE `inventory_unit` ADD COLUMN `abbr` VARCHAR(10) NOT NULL;

ALTER TABLE `price_list_item` CHANGE COLUMN `value` `value` DOUBLE NOT NULL;

ALTER TABLE `purchase` DROP COLUMN `is_confirmed`;
ALTER TABLE `purchase` DROP COLUMN `is_received`;
ALTER TABLE `purchase` DROP COLUMN `is_partially_received`;
ALTER TABLE `purchase` DROP COLUMN `is_cancelled`;
ALTER TABLE `purchase` ADD COLUMN `status_id` TINYINT(3) UNSIGNED NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS `purchase_status` (
  `id` TINYINT(3) UNSIGNED NOT NULL AUTO_INCREMENT,
  `text` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `purchase_status` (`id`, `text`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `purchase` ADD FOREIGN KEY (`status_id`) REFERENCES `purchase_status` (`id`);

ALTER TABLE `stock_movement` CHANGE `date` `date` DATETIME NOT NULL;

-- stock consumption total
CREATE TABLE `stock_consumption` (
  `inventory_uuid`  BINARY(16) NOT NULL,
  `depot_uuid`      BINARY(16) NOT NULL,
  `period_id`       MEDIUMINT(8) NOT NULL,
  `quantity`        INT(11) DEFAULT 0,
  PRIMARY KEY (`inventory_uuid`, `depot_uuid`, `period_id`),
  KEY `inventory_uuid` (`inventory_uuid`),
  KEY `depot_uuid` (`depot_uuid`),
  KEY `period_id` (`period_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/*
  The transaction_history table stores the editing history of transactions that
  have gone through the posting process.  The record_uuid should be the same
  record_uuid as that found in the posting_journal/general_ledger.
*/
CREATE TABLE `transaction_history` (
  `uuid`  BINARY(16) NOT NULL,
  `record_uuid`      BINARY(16) NOT NULL,
  `timestamp`        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id`         SMALLINT(5) UNSIGNED NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `record_uuid` (`record_uuid`),
  KEY `user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `depot_permission`;

CREATE TABLE `depot_permission` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` smallint(5) unsigned NOT NULL,
  `depot_uuid`  BINARY(16) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `depot_permission_1` (`user_id`,`depot_uuid`),
  KEY `user_id` (`user_id`),
  KEY `depot_uuid` (`depot_uuid`),
  FOREIGN KEY (`depot_uuid`) REFERENCES `depot` (`uuid`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `cashbox_permission`;

CREATE TABLE `cashbox_permission` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` smallint(5) unsigned NOT NULL,
  `cashbox_id`  MEDIUMINT(8) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cashbox_permission_1` (`user_id`,`cashbox_id`),
  KEY `user_id` (`user_id`),
  KEY `cashbox_id` (`cashbox_id`),
  FOREIGN KEY (`cashbox_id`) REFERENCES `cash_box` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

RENAME TABLE `billing_service` TO `invoicing_fee`;
RENAME TABLE `debtor_group_billing_service` TO `debtor_group_invoicing_fee`;
RENAME TABLE `patient_group_billing_service` TO `patient_group_invoicing_fee`;
RENAME TABLE `invoice_billing_service` TO `invoice_invoicing_fee`;

ALTER TABLE `debtor_group` CHANGE COLUMN `apply_billing_services` `apply_invoicing_fees` BOOLEAN NOT NULL DEFAULT TRUE;

-- ALTER TABLE `debtor_group_invoicing_fee` DROP FOREIGN KEY `billing_service_id`;
ALTER TABLE `debtor_group_invoicing_fee` CHANGE COLUMN `billing_service_id` `invoicing_fee_id`  SMALLINT UNSIGNED NOT NULL;
ALTER TABLE `debtor_group_invoicing_fee` ADD FOREIGN KEY (`invoicing_fee_id`) REFERENCES `invoicing_fee` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- ALTER TABLE `patient_group_invoicing_fee` DROP FOREIGN KEY `billing_service_id`;
ALTER TABLE `patient_group_invoicing_fee` CHANGE COLUMN `billing_service_id` `invoicing_fee_id`  SMALLINT UNSIGNED NOT NULL;
ALTER TABLE `patient_group_invoicing_fee` ADD FOREIGN KEY (`invoicing_fee_id`) REFERENCES `invoicing_fee` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- ALTER TABLE `invoice_invoicing_fee` DROP FOREIGN KEY `billing_service_id`;
ALTER TABLE `invoice_invoicing_fee` CHANGE COLUMN `billing_service_id` `invoicing_fee_id`  SMALLINT UNSIGNED NOT NULL;
ALTER TABLE `invoice_invoicing_fee` ADD FOREIGN KEY (`invoicing_fee_id`) REFERENCES `invoicing_fee` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
