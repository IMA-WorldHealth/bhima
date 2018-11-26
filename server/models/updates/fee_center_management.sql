/*
  @lomamech : 
  ============
*/

DROP TABLE IF EXISTS `fee_center`;
CREATE TABLE `fee_center` (
  `id` MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT,
  `label` VARCHAR(200) NOT NULL,
  `is_principal` tinyint(1) UNSIGNED DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fee_center_1` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `reference_fee_center`;
CREATE TABLE `reference_fee_center` (
  `id` MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT,
  `fee_center_id` MEDIUMINT(8) UNSIGNED NOT NULL,
  `account_reference_id` MEDIUMINT(8) UNSIGNED NOT NULL,
  `is_cost` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference_fee_center_1` (`account_reference_id`),
  KEY `fee_center_id` (`fee_center_id`),
  KEY `account_reference_id` (`account_reference_id`),
  FOREIGN KEY (`fee_center_id`) REFERENCES `fee_center` (`id`),
  FOREIGN KEY (`account_reference_id`) REFERENCES `account_reference` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `fee_center_distribution`;
CREATE TABLE `fee_center_distribution` (
  `id` MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT,
  `trans_uuid` BINARY(16) NOT NULL,
  `trans_id` VARCHAR(100) NOT NULL,
  `account_id` INT(10) UNSIGNED NOT NULL,
  `is_cost` tinyint(1) DEFAULT 0,
  `auxiliary_fee_center_id` MEDIUMINT(8) UNSIGNED NOT NULL,
  `principal_fee_center_id` MEDIUMINT(8) UNSIGNED NOT NULL,
  `debit_equiv` DECIMAL(19,4) NOT NULL DEFAULT 0.00,
  `credit_equiv` DECIMAL(19,4) NOT NULL DEFAULT 0.00,
  `currency_id` TINYINT(3) UNSIGNED NOT NULL,
  `date_distribution` DATETIME NOT NULL, 
  `user_id`           SMALLINT(5) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `currency_id` (`currency_id`),
  KEY `user_id` (`user_id`),
  INDEX `trans_uuid` (`trans_uuid`),
  INDEX `account_id` (`account_id`),
  INDEX `trans_id` (`trans_id`),
  INDEX `auxiliary_fee_center_id` (`auxiliary_fee_center_id`),
  INDEX `principal_fee_center_id` (`principal_fee_center_id`),  
  FOREIGN KEY (`trans_uuid`) REFERENCES `general_ledger` (`uuid`),
  FOREIGN KEY (`account_id`) REFERENCES `account` (`id`),
  FOREIGN KEY (`auxiliary_fee_center_id`) REFERENCES `fee_center` (`id`),
  FOREIGN KEY (`principal_fee_center_id`) REFERENCES `fee_center` (`id`),
  FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `service_fee_center`;
CREATE TABLE `service_fee_center` (
  `id` MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT,
  `fee_center_id` MEDIUMINT(8) UNSIGNED NOT NULL,
  `service_id` SMALLINT(5) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `service_fee_center_1` (`service_id`),
  KEY `fee_center_id` (`fee_center_id`),
  KEY `service_id` (`service_id`),
  FOREIGN KEY (`service_id`) REFERENCES `service` (`id`),
  FOREIGN KEY (`fee_center_id`) REFERENCES `fee_center` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
