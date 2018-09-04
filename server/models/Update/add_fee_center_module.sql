/*
  ADD FEE CENTER MODULES @lomamech : 
  ===================================
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


INSERT INTO unit VALUES
(208, 'Fee Center Management','TREE.FEE_CENTER','',1,'/modules/fee_center','/fee_center');

/*
  END : ADD FEE CENTER MODULES @lomamech : 2018-08-17
  ===================================================
*/