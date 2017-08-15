SET foreign_key_checks = 0;

SET names 'utf8';
SET character_set_database = 'utf8';
SET collation_database = 'utf8_unicode_ci';

DROP TABLE IF EXISTS `account`;

CREATE TABLE `account` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `type_id` MEDIUMINT(8) UNSIGNED NOT NULL,
  `enterprise_id` SMALLINT(5) UNSIGNED NOT NULL,
  `number` INT(11) UNSIGNED NOT NULL,
  `label` VARCHAR(200) NOT NULL,
  `parent` INT(10) UNSIGNED NOT NULL,
  `locked` TINYINT(1) UNSIGNED DEFAULT 0,
  `cc_id` SMALLINT(6) DEFAULT NULL,
  `pc_id` SMALLINT(6) DEFAULT NULL,
  `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `classe` INT(11) DEFAULT NULL,
  `is_asset` TINYINT(1) DEFAULT NULL,
  `reference_id` TINYINT(3) UNSIGNED DEFAULT NULL,
  `is_brut_link` TINYINT(1) DEFAULT NULL,
  `is_title` BOOLEAN DEFAULT FALSE,
  `is_charge` TINYINT(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_1` (`number`),
  KEY `type_id` (`type_id`),
  KEY `enterprise_id` (`enterprise_id`),
  KEY `cc_id` (`cc_id`),
  KEY `reference_id` (`reference_id`),
  FOREIGN KEY (`type_id`) REFERENCES `account_type` (`id`),
  FOREIGN KEY (`enterprise_id`) REFERENCES `enterprise` (`id`),
  FOREIGN KEY (`cc_id`) REFERENCES `cost_center` (`id`),
  FOREIGN KEY (`reference_id`) REFERENCES `reference` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `account_category`;
CREATE TABLE `account_category` (
  `id` MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT,
  `category` VARCHAR(35) NOT NULL,
  `translation_key` VARCHAR(35) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_category_1` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `account_type`;
CREATE TABLE `account_type` (
  `id` MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(35) NOT NULL,
  `translation_key` VARCHAR(35) NOT NULL,
  `account_category_id` MEDIUMINT(8) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_type_1` (`type`),
  KEY `account_category_id` (`account_category_id`),
  FOREIGN KEY (`account_category_id`) REFERENCES `account_category` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `assignation_patient`;
CREATE TABLE `assignation_patient` (
  `uuid`                BINARY(16) NOT NULL,
  `patient_group_uuid`  BINARY(16) NOT NULL,
  `patient_uuid`        BINARY(16) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `patient_group_uuid` (`patient_group_uuid`),
  KEY `patient_uuid` (`patient_uuid`),
  FOREIGN KEY (`patient_group_uuid`) REFERENCES `patient_group` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`patient_uuid`) REFERENCES `patient` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS billing_service;
CREATE TABLE billing_service (
  `id`              SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `account_id`      INT(10) UNSIGNED NOT NULL,
  `label`           VARCHAR(200) NOT NULL,
  `description`     TEXT NOT NULL,
  `value`           DECIMAL(10,4) UNSIGNED NOT NULL,
  `created_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `billing_service_1` (`label`),
  UNIQUE KEY `billing_service_2` (`account_id`, `label`),
  KEY `account_id` (`account_id`),
  FOREIGN KEY (`account_id`) REFERENCES `account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `budget`;
CREATE TABLE `budget` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `account_id` INT UNSIGNED NOT NULL,
  `period_id` MEDIUMINT(8) UNSIGNED NOT NULL,
  `budget` DECIMAL(10,4) UNSIGNED DEFAULT NULL,
  KEY `account_id` (`account_id`),
  KEY `period_id` (`period_id`),
  FOREIGN KEY (`account_id`) REFERENCES `account` (`id`),
  FOREIGN KEY (`period_id`) REFERENCES `period` (`id`),
  UNIQUE KEY `budget_1` (`account_id`, `period_id`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `cash`;
CREATE TABLE `cash` (
  `uuid`            BINARY(16) NOT NULL,
  `project_id`      SMALLINT(5) UNSIGNED NOT NULL,
  `reference`       INT(10) UNSIGNED NOT NULL DEFAULT 0,
  `date`            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `debtor_uuid`     BINARY(16) NOT NULL,
  `currency_id`     TINYINT(3) UNSIGNED NOT NULL,
  `amount`          DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0.00,
  `user_id`         SMALLINT(5) UNSIGNED NOT NULL,
  `cashbox_id`      MEDIUMINT(8) UNSIGNED NOT NULL,
  `description`     TEXT,
  `is_caution`      BOOLEAN NOT NULL DEFAULT 0,
  `created_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reversed`        TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `cash_1` (`reference`, `project_id`),
  KEY `project_id` (`project_id`),
  KEY `reference` (`reference`),
  KEY `debtor_uuid` (`debtor_uuid`),
  KEY `user_id` (`user_id`),
  KEY `cashbox_id` (`cashbox_id`),
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`),
  FOREIGN KEY (`debtor_uuid`) REFERENCES `debtor` (`uuid`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  FOREIGN KEY (`cashbox_id`) REFERENCES `cash_box` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `cash_item`;
CREATE TABLE `cash_item` (
  `uuid`            BINARY(16) NOT NULL,
  `cash_uuid`       BINARY(16) NOT NULL,
  `amount`          DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0.00,
  `invoice_uuid`    BINARY(16) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `cash_uuid` (`cash_uuid`),
  INDEX (`invoice_uuid`),
  FOREIGN KEY (`cash_uuid`) REFERENCES `cash` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `cash_box`;
CREATE TABLE `cash_box` (
  `id`            MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT,
  `label`         VARCHAR(100) NOT NULL,
  `project_id`    SMALLINT(5) UNSIGNED NOT NULL,
  `is_auxiliary`  TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cash_box_1` (`label`),
  KEY `project_id` (`project_id`),
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `cash_box_account_currency`;
CREATE TABLE `cash_box_account_currency` (
  `id`                  MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `currency_id`         TINYINT UNSIGNED NOT NULL,
  `cash_box_id`         MEDIUMINT UNSIGNED NOT NULL,
  `account_id`          INT UNSIGNED NOT NULL,
  `transfer_account_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cash_box_account_currency_1` (`currency_id`, `cash_box_id`, `account_id`),
  UNIQUE KEY `cash_box_account_currency_2` (`currency_id`, `cash_box_id`, `transfer_account_id`),
  KEY `currency_id` (`currency_id`),
  KEY `cash_box_id` (`cash_box_id`),
  KEY `account_id` (`account_id`),
  KEY `transfer_account_id` (`transfer_account_id`),
  FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`),
  FOREIGN KEY (`cash_box_id`) REFERENCES `cash_box` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (`account_id`) REFERENCES `account` (`id`),
  FOREIGN KEY (`transfer_account_id`) REFERENCES `account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `config_accounting`;
CREATE TABLE `config_accounting` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `label` VARCHAR(100) NOT NULL,
  `account_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `config_accounting_1` (`label`),
  UNIQUE KEY `config_accounting_2` (`label`, `account_id`),
  KEY `account_id` (`account_id`),
  FOREIGN KEY (`account_id`) REFERENCES `account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `config_cotisation`;
CREATE TABLE `config_cotisation` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `label` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `config_cotisation_1` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `config_cotisation_item`;
CREATE TABLE `config_cotisation_item` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `config_cotisation_id` int(10) unsigned NOT NULL,
  `cotisation_id` int(10) unsigned NOT NULL,
  `payable` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `config_cotisation_item_1` (`config_cotisation_id`, `cotisation_id`, `payable`),
  KEY `config_cotisation_id` (`config_cotisation_id`),
  KEY `cotisation_id` (`cotisation_id`),
  FOREIGN KEY (`config_cotisation_id`) REFERENCES `config_cotisation` (`id`),
  FOREIGN KEY (`cotisation_id`) REFERENCES `cotisation` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `config_paiement_period`;

CREATE TABLE `config_paiement_period` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `paiement_period_id` int(10) unsigned NOT NULL,
  `weekFrom` date NOT NULL,
  `weekTo` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `config_paiement_period_1` (`paiement_period_id`),
  KEY `paiement_period_id` (`paiement_period_id`),
  FOREIGN KEY (`paiement_period_id`) REFERENCES `paiement_period` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `config_rubric`;

CREATE TABLE `config_rubric` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `label` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `config_rubric_1` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `config_rubric_item`;

CREATE TABLE `config_rubric_item` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `config_rubric_id` int(10) unsigned NOT NULL,
  `rubric_id` int(10) unsigned NOT NULL,
  `payable` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `config_rubric_item_1` (`config_rubric_id`, `rubric_id`, `payable`),
  KEY `config_rubric_id` (`config_rubric_id`),
  KEY `rubric_id` (`rubric_id`),
  FOREIGN KEY (`config_rubric_id`) REFERENCES `config_rubric` (`id`),
  FOREIGN KEY (`rubric_id`) REFERENCES `rubric` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `config_tax`;

CREATE TABLE `config_tax` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `label` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `config_tax_1` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `config_tax_item`;

CREATE TABLE `config_tax_item` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `config_tax_id` int(10) unsigned NOT NULL,
  `tax_id` int(10) unsigned NOT NULL,
  `payable` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `config_tax_item_1` (`config_tax_id`, `tax_id`, `payable`),
  KEY `config_tax_id` (`config_tax_id`),
  KEY `tax_id` (`tax_id`),
  FOREIGN KEY (`config_tax_id`) REFERENCES `config_tax` (`id`),
  FOREIGN KEY (`tax_id`) REFERENCES `tax` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `consumption`;

CREATE TABLE `consumption` (
  `uuid`            BINARY(16) NOT NULL,
  `depot_uuid`      BINARY(16) NOT NULL,
  `date`            DATE DEFAULT NULL,
  `document_id`     BINARY(16) NOT NULL,
  `tracking_number` CHAR(50) NOT NULL,
  `quantity`        INT(10) UNSIGNED DEFAULT NULL,
  `unit_price`      FLOAT UNSIGNED DEFAULT NULL,
  `canceled`        TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `consumption_1` (`document_id`),
  UNIQUE KEY `consumption_2` (`document_id`, `tracking_number`),
  KEY `depot_uuid` (`depot_uuid`),
  FOREIGN KEY (`depot_uuid`) REFERENCES `depot` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`document_id`) REFERENCES `invoice` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `consumption_loss`;

CREATE TABLE `consumption_loss` (
  `uuid` BINARY(16) NOT NULL,
  `consumption_uuid` BINARY(16) NOT NULL,
  PRIMARY KEY (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `consumption_patient`;

CREATE TABLE `consumption_patient` (
  `uuid`                BINARY(16) NOT NULL,
  `consumption_uuid`    BINARY(16) NOT NULL,
  `patient_uuid`        BINARY(16) NOT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `consumption_patient_1` (`consumption_uuid`, `patient_uuid`),
  KEY `consumption_uuid` (`consumption_uuid`),
  KEY `patient_uuid` (`patient_uuid`),
  FOREIGN KEY (`consumption_uuid`) REFERENCES `consumption` (`uuid`),
  FOREIGN KEY (`patient_uuid`) REFERENCES `patient` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `consumption_service`;

CREATE TABLE `consumption_service` (
  `uuid` BINARY(16) NOT NULL,
  `consumption_uuid` BINARY(16) NOT NULL,
  `service_id` SMALLINT(5) UNSIGNED NOT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `consumption_service_1` (`consumption_uuid`, `service_id`),
  KEY `consumption_uuid` (`consumption_uuid`),
  KEY `service_id` (`service_id`),
  FOREIGN KEY (`consumption_uuid`) REFERENCES `consumption` (`uuid`),
  FOREIGN KEY (`service_id`) REFERENCES `service` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `cost_center`;

CREATE TABLE `cost_center` (
  `project_id` smallint(5) unsigned NOT NULL,
  `id` smallint(6) NOT NULL AUTO_INCREMENT,
  `text` varchar(100) NOT NULL,
  `note` text,
  `is_principal` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `const_center_1` (`text`),
  KEY `project_id` (`project_id`),
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `cost_center_assignation`;

CREATE TABLE `cost_center_assignation` (
  `project_id` smallint(5) unsigned NOT NULL,
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `auxi_cc_id` smallint(6) NOT NULL,
  `cost` float DEFAULT 0,
  `date` date DEFAULT NULL,
  `note` text,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `auxi_cc_id` (`auxi_cc_id`),
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  FOREIGN KEY (`auxi_cc_id`) REFERENCES `cost_center` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `cost_center_assignation_item`;

CREATE TABLE `cost_center_assignation_item` (
  `cost_center_assignation_id` int(10) unsigned NOT NULL,
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `pri_cc_id` smallint(6) NOT NULL,
  `init_cost` float DEFAULT 0,
  `value_criteria` float DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `cost_center_assignation_id` (`cost_center_assignation_id`),
  KEY `pri_cc_id` (`pri_cc_id`),
  FOREIGN KEY (`cost_center_assignation_id`) REFERENCES `cost_center_assignation` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`pri_cc_id`) REFERENCES `cost_center` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `cotisation`;

CREATE TABLE `cotisation` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `label` VARCHAR(80) NOT NULL,
  `abbr` varchar(4) DEFAULT NULL,
  `is_employee` tinyint(1) DEFAULT 0,
  `is_percent` tinyint(1) DEFAULT 0,
  `four_account_id` int(10) unsigned DEFAULT NULL,
  `six_account_id` int(10) unsigned DEFAULT NULL,
  `value` float DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cotisation_1` (`label`),
  KEY `four_account_id` (`four_account_id`),
  KEY `six_account_id` (`six_account_id`),
  FOREIGN KEY (`four_account_id`) REFERENCES `account` (`id`),
  FOREIGN KEY (`six_account_id`) REFERENCES `account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `cotisation_paiement`;

CREATE TABLE `cotisation_paiement` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `paiement_uuid` BINARY(16) NOT NULL,
  `cotisation_id` int(10) unsigned NOT NULL,
  `value` float DEFAULT 0,
  `posted` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cotisation_paiement_1` (`paiement_uuid`, `cotisation_id`),
  KEY `paiement_uuid` (`paiement_uuid`),
  KEY `cotisation_id` (`cotisation_id`),
  FOREIGN KEY (`paiement_uuid`) REFERENCES `paiement` (`uuid`),
  FOREIGN KEY (`cotisation_id`) REFERENCES `cotisation` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `country`;

CREATE TABLE `country` (
  `uuid` BINARY(16) NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `country_1` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `creditor`;

CREATE TABLE `creditor` (
  `uuid` BINARY(16) NOT NULL,
  `group_uuid` BINARY(16) NOT NULL,
  `text` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `creditor_1` (`text`),
  UNIQUE KEY `creditor_2` (`text`, `group_uuid`),
  KEY `group_uuid` (`group_uuid`),
  FOREIGN KEY (`group_uuid`) REFERENCES `creditor_group` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `creditor_group`;

CREATE TABLE `creditor_group` (
  `enterprise_id` smallint(5) unsigned NOT NULL,
  `uuid` BINARY(16) NOT NULL,
  `name` varchar(80) NOT NULL,
  `account_id` int(10) unsigned NOT NULL,
  `locked` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `creditor_group_1` (`name`),
  UNIQUE KEY `credit_group_2` (`name`, `account_id`),
  KEY `account_id` (`account_id`),
  KEY `enterprise_id` (`enterprise_id`),
  FOREIGN KEY (`enterprise_id`) REFERENCES `enterprise` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`account_id`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `critere`;
CREATE TABLE `critere` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `text` varchar(50) NOT NULL,
  `note` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `currency`;
CREATE TABLE `currency` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `format_key` varchar(20) NOT NULL,
  `symbol` varchar(15) NOT NULL,
  `note` text,
  `min_monentary_unit` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `currency_1` (`name`),
  UNIQUE KEY `currency_2` (`symbol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `debtor`;
CREATE TABLE `debtor` (
  `uuid` BINARY(16) NOT NULL,
  `group_uuid` BINARY(16) NOT NULL,
  `text` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `group_uuid` (`group_uuid`),
  FOREIGN KEY (`group_uuid`) REFERENCES `debtor_group` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `debtor_group`;
CREATE TABLE `debtor_group` (
  `enterprise_id` SMALLINT(5) UNSIGNED NOT NULL,
  `uuid` BINARY(16) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `account_id` INT(10) UNSIGNED NOT NULL,
  `location_id` BINARY(16) NOT NULL,
  `phone` VARCHAR(20) DEFAULT '',
  `email` VARCHAR(100) DEFAULT '',
  `note` TEXT,
  `locked` TINYINT(1) NOT NULL DEFAULT 0,
  `max_credit` MEDIUMINT(8) UNSIGNED DEFAULT 0,
  `is_convention` TINYINT(1) NOT NULL DEFAULT 0,
  `price_list_uuid` BINARY(16) DEFAULT NULL,
  `apply_discounts` BOOLEAN NOT NULL DEFAULT TRUE,
  `apply_billing_services` BOOLEAN NOT NULL DEFAULT TRUE,
  `apply_subsidies` BOOLEAN NOT NULL DEFAULT TRUE,
  `color` VARCHAR(8) NULL,
  `created_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `debtor_group_1` (`name`),
  UNIQUE KEY `debtor_group_2` (`name`, `account_id`),
  KEY `enterprise_id` (`enterprise_id`),
  KEY `account_id` (`account_id`),
  KEY `location_id` (`location_id`),
  KEY `price_list_uuid` (`price_list_uuid`),
  FOREIGN KEY (`enterprise_id`) REFERENCES `enterprise` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`account_id`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`location_id`) REFERENCES `village` (`uuid`),
  FOREIGN KEY (`price_list_uuid`) REFERENCES `price_list` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS debtor_group_billing_service;

CREATE TABLE debtor_group_billing_service (
  `id`                      SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `debtor_group_uuid`      BINARY(16) NOT NULL,
  `billing_service_id`      SMALLINT UNSIGNED NOT NULL,
  `created_at`              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `debtor_group_uuid` (`debtor_group_uuid`),
  KEY `billing_service_id` (`billing_service_id`),
  FOREIGN KEY (`billing_service_id`) REFERENCES `billing_service` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`debtor_group_uuid`) REFERENCES `debtor_group` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `debtor_group_history`;
CREATE TABLE `debtor_group_history` (
  `uuid` BINARY(16) NOT NULL,
  `debtor_uuid` BINARY(16) DEFAULT NULL,
  `debtor_group_uuid` BINARY(16) DEFAULT NULL,
  `income_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_id` smallint(5) unsigned DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `debtor_uuid` (`debtor_uuid`),
  KEY `debtor_group_uuid` (`debtor_group_uuid`),
  KEY `user_id` (`user_id`),
  FOREIGN KEY (`debtor_uuid`) REFERENCES `debtor` (`uuid`),
  FOREIGN KEY (`debtor_group_uuid`) REFERENCES `debtor_group` (`uuid`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS debtor_group_subsidy;

CREATE TABLE debtor_group_subsidy (
  `id`                      SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `debtor_group_uuid`      BINARY(16) NOT NULL,
  `subsidy_id`              SMALLINT UNSIGNED NOT NULL,
  `created_at`              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `debtor_group_subsidy_1` (`debtor_group_uuid`, `subsidy_id`),
  KEY `debtor_group_uuid` (`debtor_group_uuid`),
  KEY `subsidy_id` (`subsidy_id`),
  FOREIGN KEY (`subsidy_id`) REFERENCES `subsidy` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`debtor_group_uuid`) REFERENCES `debtor_group` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `depot`;
CREATE TABLE `depot` (
  `uuid` BINARY(16) NOT NULL,
  `text` VARCHAR(50) NOT NULL,
  `enterprise_id` smallint(5) unsigned NOT NULL,
  `is_warehouse` smallint(5) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `depot_1` (`text`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS discount;
CREATE TABLE discount (
  `id`                  SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `label`               VARCHAR(100) NOT NULL,
  `description`         TEXT NOT NULL,
  `inventory_uuid`      BINARY(16) NOT NULL,
  `account_id`          INT(10) UNSIGNED NOT NULL,
  `value`               DECIMAL(10,4) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `discount_1` (`label`),
  UNIQUE KEY `discount_2` (`account_id`, `inventory_uuid`),
  KEY `inventory_uuid` (`inventory_uuid`),
  KEY `account_id` (`account_id`),
  FOREIGN KEY (`inventory_uuid`) REFERENCES `inventory` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`account_id`) REFERENCES `account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `document_map`;
CREATE TABLE `document_map` (
  `uuid`              BINARY(16) NOT NULL,
  `text`              TEXT NOT NULL,
  PRIMARY KEY (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `employee`;
CREATE TABLE `employee` (
  `id`            INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `code`          VARCHAR(20) NOT NULL,
  `display_name`  TEXT NOT NULL,
  `sex`           VARCHAR(1) NOT NULL,
  `dob`           DATETIME NOT NULL,
  `date_embauche` DATETIME DEFAULT NULL,
  `grade_id`      BINARY(16) NOT NULL,
  `nb_spouse`     INT(2) DEFAULT 0,
  `nb_enfant`     INT(3) DEFAULT 0,
  `daily_salary`  FLOAT DEFAULT 0,
  `bank`          VARCHAR(30) DEFAULT NULL,
  `bank_account`  VARCHAR(30) DEFAULT NULL,
  `adresse`       VARCHAR(50) DEFAULT NULL,
  `phone`         VARCHAR(20) DEFAULT NULL,
  `email`         VARCHAR(70) DEFAULT NULL,
  `fonction_id`   TINYINT(3) UNSIGNED DEFAULT NULL,
  `service_id`    SMALLINT(5) UNSIGNED DEFAULT NULL,
  `creditor_uuid` BINARY(16) DEFAULT NULL,
  `locked`        TINYINT(1) DEFAULT NULL,
  `patient_uuid`  BINARY(16) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_1` (`code`),
  KEY `fonction_id` (`fonction_id`),
  KEY `service_id` (`service_id`),
  KEY `creditor_uuid` (`creditor_uuid`),
  KEY `grade_id` (`grade_id`),
  KEY `patient_uuid` (`patient_uuid`),
  FOREIGN KEY (`fonction_id`) REFERENCES `fonction` (`id`),
  FOREIGN KEY (`service_id`) REFERENCES `service` (`id`),
  FOREIGN KEY (`creditor_uuid`) REFERENCES `creditor` (`uuid`),
  FOREIGN KEY (`grade_id`) REFERENCES `grade` (`uuid`),
  FOREIGN KEY (`patient_uuid`) REFERENCES `patient` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `enterprise`;
CREATE TABLE `enterprise` (
  `id`              SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`            VARCHAR(50) NOT NULL,
  `abbr`            VARCHAR(10) DEFAULT NULL,
  `phone`           VARCHAR(20) DEFAULT NULL,
  `email`           VARCHAR(100) DEFAULT NULL,
  `location_id`     BINARY(16) DEFAULT NULL,
  `logo`            VARCHAR(100) DEFAULT NULL,
  `currency_id`     TINYINT(3) UNSIGNED NOT NULL,
  `po_box`          VARCHAR(30) DEFAULT NULL,
  `gain_account_id` INT UNSIGNED NULL,
  `loss_account_id` INT UNSIGNED NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `enterprise_1` (`name`),
  KEY `location_id` (`location_id`),
  KEY `currency_id` (`currency_id`),
  KEY `gain_account_id` (`gain_account_id`),
  KEY `loss_account_id` (`loss_account_id`),
  FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`),
  FOREIGN KEY (`location_id`) REFERENCES `village` (`uuid`),
  FOREIGN KEY (`gain_account_id`) REFERENCES `account` (`id`),
  FOREIGN KEY (`loss_account_id`) REFERENCES `account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `entity_map`;
CREATE TABLE `entity_map` (
  `uuid`              BINARY(16) NOT NULL,
  `text`              TEXT NOT NULL,
  PRIMARY KEY (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `event`;
CREATE TABLE `event` (
  `timestamp`   TIMESTAMP NOT NULL,
  `user_id`     SMALLINT(5) UNSIGNED NOT NULL,
  `channel`     VARCHAR(25) NOT NULL,
  `entity`      VARCHAR(25) NOT NULL,
  `type`        VARCHAR(25) NOT NULL,
  `data`        TEXT NOT NULL, -- TODO, this should be JSON in newer MySQL
  KEY `user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  INDEX event_channel (channel),
  INDEX event_entity (entity),
  INDEX event_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `exchange_rate`;
CREATE TABLE `exchange_rate` (
  `id`    MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT,
  `enterprise_id`   SMALLINT(5) UNSIGNED NOT NULL,
  `currency_id`   TINYINT(3) UNSIGNED NOT NULL,
  `rate`    DECIMAL(19,8) UNSIGNED NOT NULL,
  `date`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `enterprise_id` (`enterprise_id`),
  KEY `currency_id` (`currency_id`),
  INDEX `rate` (`rate`),
  INDEX `date` (`date`),
  FOREIGN KEY (`enterprise_id`) REFERENCES `enterprise` (`id`),
  FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `fiscal_year`;
CREATE TABLE `fiscal_year` (
  `enterprise_id`             SMALLINT(5) UNSIGNED NOT NULL,
  `id`                        MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT,
  `number_of_months`          MEDIUMINT(8) UNSIGNED NOT NULL,
  `label`                     VARCHAR(50) NOT NULL,
  `start_date`                DATE NOT NULL,
  `end_date`                  DATE NOT NULL,
  `previous_fiscal_year_id`   MEDIUMINT(8) UNSIGNED DEFAULT NULL,
  `locked`                    TINYINT(1) NOT NULL DEFAULT 0,
  `created_at`                TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`                TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `user_id`                   SMALLINT(5) UNSIGNED NOT NULL,
  `note`                      TEXT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fiscal_year_1` (`label`),
  UNIQUE KEY `fiscal_year_2` (`enterprise_id`, `start_date`),
  KEY `enterprise_id` (`enterprise_id`),
  KEY `user_id` (`user_id`),
  FOREIGN KEY (`enterprise_id`) REFERENCES `enterprise` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `fonction`;
CREATE TABLE `fonction` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `fonction_txt` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fonction_1` (`fonction_txt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `general_ledger`;
CREATE TABLE `general_ledger` (
  `uuid`              BINARY(16) NOT NULL,
  `project_id`        SMALLINT(5) UNSIGNED NOT NULL,
  `fiscal_year_id`    MEDIUMINT(8) UNSIGNED DEFAULT NULL,
  `period_id`         MEDIUMINT(8) UNSIGNED DEFAULT NULL,
  `trans_id`          VARCHAR(100) NOT NULL,
  `trans_date`        DATETIME NOT NULL,
  `record_uuid`       BINARY(16) NOT NULL, -- previously doc_num
  `description`       TEXT NOT NULL,
  `account_id`        INT(10) UNSIGNED NOT NULL,
  `debit`             DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0.00,
  `credit`            DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0.00,
  `debit_equiv`       DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0.00,
  `credit_equiv`      DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0.00,
  `currency_id`       TINYINT(3) UNSIGNED NOT NULL,
  `entity_uuid`       BINARY(16),    -- previously deb_cred_uuid
  `reference_uuid`    BINARY(16),  -- previously inv_po_id
  `comment`           TEXT,
  `origin_id`         TINYINT(3) UNSIGNED NULL,
  `user_id`           SMALLINT(5) UNSIGNED NOT NULL,
  `cc_id`             SMALLINT(6),
  `pc_id`             SMALLINT(6),
  PRIMARY KEY (`uuid`),
  KEY `project_id` (`project_id`),
  KEY `fiscal_year_id` (`fiscal_year_id`),
  KEY `period_id` (`period_id`),
  KEY `currency_id` (`currency_id`),
  KEY `user_id` (`user_id`),
  KEY `cc_id` (`cc_id`),
  KEY `pc_id` (`pc_id`),
  INDEX `trans_date` (`trans_date`),
  INDEX `trans_id` (`trans_id`),
  INDEX `record_uuid` (`record_uuid`),
  INDEX `reference_uuid` (`record_uuid`),
  INDEX `entity_uuid` (`entity_uuid`),
  INDEX `account_id` (`account_id`),
  FOREIGN KEY (`fiscal_year_id`) REFERENCES `fiscal_year` (`id`),
  FOREIGN KEY (`period_id`) REFERENCES `period` (`id`),
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`account_id`) REFERENCES `account` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`cc_id`) REFERENCES `cost_center` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`pc_id`) REFERENCES `profit_center` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `grade`;
CREATE TABLE `grade` (
  `uuid` BINARY(16) NOT NULL,
  `code` varchar(30) DEFAULT NULL,
  `text` VARCHAR(50) NOT NULL,
  `basic_salary` decimal(19,4) unsigned DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `grade_1` (`code`),
  UNIQUE KEY `grade_2` (`text`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `holiday`;

CREATE TABLE `holiday` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) unsigned NOT NULL,
  `percentage` float DEFAULT 0,
  `label` varchar(100) NOT NULL,
  `dateFrom` date NOT NULL,
  `dateTo` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `holiday_1` (`employee_id`, `dateFrom`, `dateTo`),
  KEY `employee_id` (`employee_id`),
  FOREIGN KEY (`employee_id`) REFERENCES `employee` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `holiday_paiement`;

CREATE TABLE `holiday_paiement` (
  `holiday_id` int(10) unsigned NOT NULL,
  `holiday_nbdays` int(10) unsigned NOT NULL,
  `holiday_percentage` float DEFAULT 0,
  `paiement_uuid` BINARY(16) NOT NULL,
  KEY `paiement_uuid` (`paiement_uuid`),
  KEY `holiday_id` (`holiday_id`),
  FOREIGN KEY (`paiement_uuid`) REFERENCES `paiement` (`uuid`),
  FOREIGN KEY (`holiday_id`) REFERENCES `holiday` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `icd10`;

CREATE TABLE `icd10` (
  `id` INT(10) unsigned NOT NULL AUTO_INCREMENT,
  `code`  VARCHAR(8) NOT NULL,
  `label` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `icd10_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `inventory`;

CREATE TABLE `inventory` (
  `enterprise_id` SMALLINT(5) UNSIGNED NOT NULL,
  `uuid` BINARY(16) NOT NULL,
  `code` varchar(30) NOT NULL,
  `text` varchar(100) NOT NULL,
  `price` DECIMAL(10,4) UNSIGNED NOT NULL DEFAULT 0.0,
  `default_quantity` INTEGER UNSIGNED NOT NULL DEFAULT 1,
  `group_uuid` BINARY(16) NOT NULL,
  `unit_id` SMALLINT(5) UNSIGNED DEFAULT NULL,
  `unit_weight` MEDIUMINT(9) DEFAULT 0,
  `unit_volume` MEDIUMINT(9) DEFAULT 0,
  `stock` INT(10) UNSIGNED NOT NULL DEFAULT 0,
  `stock_max` INT(10) UNSIGNED NOT NULL DEFAULT 0,
  `stock_min` INT(10) UNSIGNED NOT NULL DEFAULT 0,
  `type_id` TINYINT(3) UNSIGNED NOT NULL DEFAULT 0,
  `consumable` TINYINT(1) NOT NULL DEFAULT 0,
  `delay` INT(10) UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Delai de livraison',
  `avg_consumption` DECIMAL(10,4) UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Consommation moyenne' ,
  `purchase_interval` DECIMAL(10,4) UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Intervalle de commande' ,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `inventory_1` (`group_uuid`, `text`),
  UNIQUE KEY `inventory_2` (`code`),
  KEY `enterprise_id` (`enterprise_id`),
  KEY `group_uuid` (`group_uuid`),
  KEY `unit_id` (`unit_id`),
  KEY `type_id` (`type_id`),
  FOREIGN KEY (`enterprise_id`) REFERENCES `enterprise` (`id`),
  FOREIGN KEY (`group_uuid`) REFERENCES `inventory_group` (`uuid`),
  FOREIGN KEY (`unit_id`) REFERENCES `inventory_unit` (`id`),
  FOREIGN KEY (`type_id`) REFERENCES `inventory_type` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `inventory_group`;

CREATE TABLE `inventory_group` (
  `uuid` BINARY(16) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(30) NOT NULL,
  `sales_account` mediumint(8) unsigned DEFAULT NULL,
  `cogs_account` mediumint(8) unsigned DEFAULT NULL,
  `stock_account` mediumint(8) unsigned DEFAULT NULL,
  `donation_account` mediumint(8) unsigned DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `inventory_group_1` (`name`),
  UNIQUE KEY `inventory_group_2` (`code`),
  KEY `sales_account` (`sales_account`),
  KEY `cogs_account` (`cogs_account`),
  KEY `stock_account` (`stock_account`),
  KEY `donation_account` (`donation_account`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `inventory_log`;

CREATE TABLE `inventory_log` (
  `uuid` BINARY(16) NOT NULL,
  `inventory_uuid` BINARY(16) NOT NULL,
  `log_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `price` decimal(19,4) unsigned DEFAULT NULL,
  `code` varchar(30) DEFAULT NULL,
  `text` text,
  PRIMARY KEY (`uuid`),
  KEY `inventory_uuid` (`inventory_uuid`),
  FOREIGN KEY (`inventory_uuid`) REFERENCES `inventory` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `inventory_type`;

CREATE TABLE `inventory_type` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `text` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventory_type_1` (`text`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `inventory_unit`;

CREATE TABLE `inventory_unit` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `text` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventory_unit_1` (`text`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `journal_log`;

CREATE TABLE `journal_log` (
  `uuid` BINARY(16) NOT NULL,
  `transaction_id` text NOT NULL,
  `justification` text,
  `date` date NOT NULL,
  `user_id` smallint(5) unsigned NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `language`;

CREATE TABLE `language` (
  `id` TINYINT UNSIGNED NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `key` VARCHAR(5) NOT NULL,
  `locale_key` VARCHAR(5) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `language_1` (`name`),
  UNIQUE KEY `language_2` (`key`),
  UNIQUE `locale_key` (`locale_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `mod_snis_zs`;

CREATE TABLE `mod_snis_zs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `zone` varchar(100) NOT NULL,
  `territoire` varchar(100) NOT NULL,
  `province` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mod_snis_zs_1` (`zone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `offday`;

CREATE TABLE `offday` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `label` varchar(100) NOT NULL,
  `date` date NOT NULL,
  `percent_pay` float DEFAULT '100',
  PRIMARY KEY (`id`),
  UNIQUE KEY `offday_1` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `paiement`;

CREATE TABLE `paiement` (
  `uuid` BINARY(16) NOT NULL,
  `employee_id` int(11) unsigned NOT NULL,
  `paiement_period_id` int(10) unsigned NOT NULL,
  `currency_id` tinyint(3) unsigned DEFAULT NULL,
  `paiement_date` date DEFAULT NULL,
  `working_day` int(10) unsigned NOT NULL,
  `net_before_tax` float DEFAULT 0,
  `net_after_tax` float DEFAULT 0,
  `net_salary` float DEFAULT 0,
  `is_paid` tinyint(4) DEFAULT 0,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `paiement_1` (`employee_id`, `paiement_period_id`),
  KEY `employee_id` (`employee_id`),
  KEY `paiement_period_id` (`paiement_period_id`),
  KEY `currency_id` (`currency_id`),
  FOREIGN KEY (`employee_id`) REFERENCES `employee` (`id`),
  FOREIGN KEY (`paiement_period_id`) REFERENCES `paiement_period` (`id`),
  FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `paiement_period`;

CREATE TABLE `paiement_period` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `config_tax_id` int(10) unsigned NOT NULL,
  `config_rubric_id` int(10) unsigned NOT NULL,
  `config_cotisation_id` int(10) unsigned NOT NULL,
  `config_accounting_id` int(10) unsigned NOT NULL,
  `label` VARCHAR(100) NOT NULL,
  `dateFrom` date NOT NULL,
  `dateTo` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `paiement_period_1` (`label`),
  UNIQUE KEY `paiement_period_2` (`dateFrom`, `dateTo`),
  KEY `config_tax_id` (`config_tax_id`),
  KEY `config_rubric_id` (`config_rubric_id`),
  KEY `config_cotisation_id` (`config_cotisation_id`),
  KEY `config_accounting_id` (`config_accounting_id`),
  FOREIGN KEY (`config_tax_id`) REFERENCES `config_tax` (`id`),
  FOREIGN KEY (`config_rubric_id`) REFERENCES `config_rubric` (`id`),
  FOREIGN KEY (`config_cotisation_id`) REFERENCES `config_cotisation` (`id`),
  FOREIGN KEY (`config_accounting_id`) REFERENCES `config_accounting` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `partial_paiement`;

CREATE TABLE `partial_paiement` (
  `uuid` BINARY(16) NOT NULL,
  `paiement_uuid` BINARY(16) NOT NULL,
  `currency_id` tinyint(3) unsigned DEFAULT NULL,
  `paiement_date` date DEFAULT NULL,
  `amount` float DEFAULT 0,
  PRIMARY KEY (`uuid`),
  KEY `paiement_uuid` (`paiement_uuid`),
  KEY `currency_id` (`currency_id`),
  FOREIGN KEY (`paiement_uuid`) REFERENCES `paiement` (`uuid`),
  FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `price_list`;

CREATE TABLE `price_list` (
  `uuid`                BINARY(16) NOT NULL,
  `enterprise_id`       SMALLINT(5) UNSIGNED NOT NULL,
  `label`               VARCHAR(250) NOT NULL,
  `description`         TEXT,
  `created_at`          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `prices_1` (`label`),
  KEY `enterprise_id` (`enterprise_id`),
  FOREIGN KEY (`enterprise_id`) REFERENCES `enterprise` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `price_list_item`;

CREATE TABLE `price_list_item` (
  `uuid`                BINARY(16) NOT NULL,
  `inventory_uuid`      BINARY(16) NOT NULL,
  `price_list_uuid`     BINARY(16) NOT NULL,
  `label`               VARCHAR(250) NOT NULL,
  `value`               DOUBLE NOT NULL,
  `is_percentage`       BOOLEAN NOT NULL DEFAULT 0,
  `created_at`          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `price_list_item_1` (`label`, `inventory_uuid`),
  UNIQUE KEY `price_list_item_2` (`price_list_uuid`, `inventory_uuid`),
  KEY `price_list_uuid` (`price_list_uuid`),
  KEY `inventory_uuid` (`inventory_uuid`),
  FOREIGN KEY (`price_list_uuid`) REFERENCES `price_list` (`uuid`) ON DELETE CASCADE,
  FOREIGN KEY (`inventory_uuid`) REFERENCES `inventory` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- TODO write schema change (transactions) into SQL update script
DROP TABLE IF EXISTS `patient`;

CREATE TABLE `patient` (
  `uuid`                 BINARY(16) NOT NULL,
  `project_id`           SMALLINT(5) UNSIGNED NOT NULL,
  `reference`            INT(10) UNSIGNED NOT NULL DEFAULT 0,
  `debtor_uuid`          BINARY(16) NOT NULL,
  `display_name`         VARCHAR(150) NOT NULL,
  `dob`                  DATE NOT NULL,
  `dob_unknown_date`     BOOLEAN NOT NULL DEFAULT FALSE,
  `father_name`          VARCHAR(150),
  `mother_name`          VARCHAR(150),
  `profession`           VARCHAR(150),
  `employer`             VARCHAR(150),
  `spouse`               VARCHAR(150),
  `spouse_profession`    VARCHAR(150),
  `spouse_employer`      VARCHAR(150),
  `sex`                  CHAR(1) NOT NULL,
  `religion`             VARCHAR(50),
  `marital_status`       VARCHAR(50),
  `phone`                VARCHAR(12),
  `email`                VARCHAR(40),
  `address_1`            VARCHAR(100),
  `address_2`            VARCHAR(100),
  `origin_location_id`   BINARY(16) NOT NULL,
  `current_location_id`  BINARY(16) NOT NULL,
  `registration_date`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `title`                VARCHAR(30),
  `notes`                TEXT,
  `hospital_no`          VARCHAR(20),
  `avatar`               VARCHAR(150),
  `user_id`              SMALLINT(5) UNSIGNED NOT NULL,
  `created_at`           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `patient_1` (`hospital_no`),
  UNIQUE KEY `patient_2` (`project_id`, `reference`),
  KEY `reference` (`reference`),
  KEY `project_id` (`project_id`),
  KEY `debtor_uuid` (`debtor_uuid`),
  KEY `origin_location_id` (`origin_location_id`),
  KEY `current_location_id` (`current_location_id`),

  /* @TODO analyse performance implications of indexing frequently searched columns */
  INDEX `registration_date` (`registration_date`),
  INDEX `dob` (`dob`),
  INDEX `sex` (`sex`),

  /* @TODO fulltext index may degrade INSERT performance over time */
  FULLTEXT `display_name` (`display_name`),

  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  FOREIGN KEY (`debtor_uuid`) REFERENCES `debtor` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`current_location_id`) REFERENCES `village` (`uuid`) ON UPDATE CASCADE,
  FOREIGN KEY (`origin_location_id`) REFERENCES `village` (`uuid`) ON UPDATE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `patient_document`;

CREATE TABLE `patient_document` (
  `uuid`         BINARY(16) NOT NULL,
  `patient_uuid` BINARY(16) NOT NULL,
  `label`        TEXT NOT NULL,
  `link`         TEXT NOT NULL,
  `timestamp`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mimetype`     TEXT NOT NULL,
  `size`         INTEGER unsigned NOT NULL,
  `user_id`      SMALLINT(5) unsigned NOT NULL,
  KEY `patient_uuid` (`patient_uuid`),
  FOREIGN KEY (`patient_uuid`) REFERENCES `patient` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `patient_group`;

CREATE TABLE `patient_group` (
  `uuid`              BINARY(16) NOT NULL,
  `enterprise_id`     SMALLINT(5) UNSIGNED NOT NULL,
  `price_list_uuid`   BINARY(16),
  `name`              VARCHAR(60) NOT NULL,
  `note`              TEXT NOT NULL,
  `created_at`        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (`uuid`),
   UNIQUE KEY `patient_group_1` (`name`),
   KEY `enterprise_id` (`enterprise_id`),
   KEY `price_list_uuid` (`price_list_uuid`),
   FOREIGN KEY (`enterprise_id`) REFERENCES `enterprise` (`id`),
   FOREIGN KEY (`price_list_uuid`) REFERENCES `price_list` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS patient_group_billing_service;

CREATE TABLE patient_group_billing_service (
  `id`                      SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `patient_group_uuid`      BINARY(16) NOT NULL,
  `billing_service_id`      SMALLINT UNSIGNED NOT NULL,
  `created_at`              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_group_uuid` (`patient_group_uuid`),
  KEY `billing_service_id` (`billing_service_id`),
  FOREIGN KEY (`billing_service_id`) REFERENCES `billing_service` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`patient_group_uuid`) REFERENCES `patient_group` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS patient_group_subsidy;

CREATE TABLE patient_group_subsidy (
  `id`                      SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `patient_group_uuid`      BINARY(16) NOT NULL,
  `subsidy_id`              SMALLINT UNSIGNED NOT NULL,
  `created_at`              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_group_uuid` (`patient_group_uuid`),
  KEY `subsidy_id` (`subsidy_id`),
  FOREIGN KEY (`subsidy_id`) REFERENCES `subsidy` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`patient_group_uuid`) REFERENCES `patient_group` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `patient_visit`;

CREATE TABLE `patient_visit` (
  `uuid` BINARY(16) NOT NULL,
  `patient_uuid` BINARY(16) NOT NULL,
  `start_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `end_date` datetime DEFAULT NULL,
  `start_notes` TEXT,
  `end_notes` TEXT,
  `start_diagnosis_id` INT(10) unsigned,
  `end_diagnosis_id` INT(10) unsigned,
  `user_id` smallint(5) unsigned NOT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `patient_visit_1`(`patient_uuid`, `start_date`, `end_date`),
  KEY `patient_uuid` (`patient_uuid`),
  KEY `user_id` (`user_id`),
  KEY `start_diagnosis_id` (`start_diagnosis_id`),
  KEY `end_diagnosis_id` (`end_diagnosis_id`),
  FOREIGN KEY (`patient_uuid`) REFERENCES `patient` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`start_diagnosis_id`) REFERENCES `icd10` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`end_diagnosis_id`) REFERENCES `icd10` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `period`;

CREATE TABLE `period` (
  `id`                  MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT,
  `fiscal_year_id`      MEDIUMINT(8) UNSIGNED NOT NULL,
  `number`              SMALLINT(5) UNSIGNED NOT NULL,
  `start_date`          DATE NULL,
  `end_date`            DATE NULL,
  `locked`              TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `period_1` (`start_date`, `end_date`),
  KEY `fiscal_year_id` (`fiscal_year_id`),
  FOREIGN KEY (`fiscal_year_id`) REFERENCES `fiscal_year` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `period_total`;

CREATE TABLE `period_total` (
  `enterprise_id` SMALLINT(5) UNSIGNED NOT NULL,
  `fiscal_year_id` mediumint(8) unsigned NOT NULL,
  `period_id` mediumint(8) unsigned NOT NULL,
  `account_id` int(10) unsigned NOT NULL,
  `credit` decimal(19,4) unsigned DEFAULT NULL,
  `debit` decimal(19,4) unsigned DEFAULT NULL,
  `locked` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`enterprise_id`,`fiscal_year_id`,`period_id`,`account_id`),
  KEY `fiscal_year_id` (`fiscal_year_id`),
  KEY `account_id` (`account_id`),
  KEY `enterprise_id` (`enterprise_id`),
  KEY `period_id` (`period_id`),
  FOREIGN KEY (`fiscal_year_id`) REFERENCES `fiscal_year` (`id`),
  FOREIGN KEY (`account_id`) REFERENCES `account` (`id`),
  FOREIGN KEY (`enterprise_id`) REFERENCES `enterprise` (`id`),
  FOREIGN KEY (`period_id`) REFERENCES `period` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `permission`;

CREATE TABLE `permission` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `unit_id` smallint(5) unsigned NOT NULL,
  `user_id` smallint(5) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permission_1` (`unit_id`,`user_id`),
  KEY `unit_id` (`unit_id`),
  KEY `user_id` (`user_id`),
  FOREIGN KEY (`unit_id`) REFERENCES `unit` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `posting_journal`;

CREATE TABLE `posting_journal` (
  `uuid`              BINARY(16) NOT NULL,
  `project_id`        SMALLINT(5) UNSIGNED NOT NULL,
  `fiscal_year_id`    MEDIUMINT(8) UNSIGNED DEFAULT NULL,
  `period_id`         MEDIUMINT(8) UNSIGNED DEFAULT NULL,
  `trans_id`          VARCHAR(100) NOT NULL,
  `trans_date`        DATETIME NOT NULL,
  `record_uuid`       BINARY(16) NOT NULL, -- previously doc_num
  `description`       TEXT,
  `account_id`        INT(10) UNSIGNED NOT NULL,
  `debit`             DECIMAL(19,4) NOT NULL DEFAULT 0.00,
  `credit`            DECIMAL(19,4) NOT NULL DEFAULT 0.00,
  `debit_equiv`       DECIMAL(19,4) NOT NULL DEFAULT 0.00,
  `credit_equiv`      DECIMAL(19,4) NOT NULL DEFAULT 0.00,
  `currency_id`       TINYINT(3) UNSIGNED NOT NULL,
  `entity_uuid`       BINARY(16),    -- previously deb_cred_uuid
  `reference_uuid`    BINARY(16),  -- previously inv_po_id
  `comment`           TEXT,
  `origin_id`         TINYINT(3) UNSIGNED NULL,
  `user_id`           SMALLINT(5) UNSIGNED NOT NULL,
  `cc_id`             SMALLINT(6),
  `pc_id`             SMALLINT(6),
  PRIMARY KEY (`uuid`),
  KEY `project_id` (`project_id`),
  KEY `fiscal_year_id` (`fiscal_year_id`),
  KEY `period_id` (`period_id`),
  KEY `currency_id` (`currency_id`),
  KEY `user_id` (`user_id`),
  KEY `cc_id` (`cc_id`),
  KEY `pc_id` (`pc_id`),
  INDEX `trans_date` (`trans_date`),
  INDEX `trans_id` (`trans_id`),
  INDEX `record_uuid` (`record_uuid`),
  INDEX `reference_uuid` (`record_uuid`),
  INDEX `entity_uuid` (`entity_uuid`),
  INDEX `account_id` (`account_id`),
  FOREIGN KEY (`fiscal_year_id`) REFERENCES `fiscal_year` (`id`),
  FOREIGN KEY (`period_id`) REFERENCES `period` (`id`),
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`account_id`) REFERENCES `account` (`id`),
  FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`cc_id`) REFERENCES `cost_center` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`pc_id`) REFERENCES `profit_center` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `profit_center`;

CREATE TABLE `profit_center` (
  `project_id` smallint(5) unsigned NOT NULL,
  `id` smallint(6) NOT NULL AUTO_INCREMENT,
  `text` varchar(100) NOT NULL,
  `note` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `profit_center_1` (`text`),
  KEY `project_id` (`project_id`),
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `project`;

CREATE TABLE `project` (
  `id` SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(60) NOT NULL,
  `abbr` CHAR(3) NOT NULL,
  `enterprise_id` SMALLINT(5) UNSIGNED NOT NULL,
  `zs_id` INT(11) NULL,
  `locked` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `project_1` (`name`),
  UNIQUE KEY `project_2` (`abbr`),
  KEY `enterprise_id` (`enterprise_id`),
  FOREIGN KEY (`enterprise_id`) REFERENCES `enterprise` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `project_permission`;

CREATE TABLE `project_permission` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` smallint(5) unsigned NOT NULL,
  `project_id` smallint(5) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `project_permission_1` (`user_id`,`project_id`),
  KEY `user_id` (`user_id`),
  KEY `project_id` (`project_id`),
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `province`;

CREATE TABLE `province` (
  `uuid` BINARY(16) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `country_uuid` BINARY(16) NOT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `province_1` (`name`, `country_uuid`),
  KEY `country_uuid` (`country_uuid`),
  FOREIGN KEY (`country_uuid`) REFERENCES `country` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `purchase`;

CREATE TABLE `purchase` (
  `uuid`            BINARY(16) NOT NULL,
  `project_id`      SMALLINT(5) UNSIGNED NOT NULL,
  `reference`       INT(10) UNSIGNED NOT NULL DEFAULT 0,
  `cost`            DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0.0,
  `currency_id`     TINYINT(3) UNSIGNED NOT NULL,
  `supplier_uuid`   BINARY(16) DEFAULT NULL,
  `date`            DATETIME NOT NULL,
  `created_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id`         SMALLINT(5) UNSIGNED NOT NULL,
  `payment_method`  TEXT,
  `note`            TEXT,
  `is_confirmed`    TINYINT(1) DEFAULT 0,
  `is_received`              TINYINT(1) DEFAULT 0,
  `is_partially_received`    TINYINT(1) DEFAULT 0,
  `is_cancelled`    TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `purchase_1` (`project_id`, `reference`),
  KEY `project_id` (`project_id`),
  KEY `reference` (`reference`),
  KEY `supplier_uuid` (`supplier_uuid`),
  KEY `user_id` (`user_id`),
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  FOREIGN KEY (`supplier_uuid`) REFERENCES `supplier` (`uuid`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `purchase_item`;

CREATE TABLE `purchase_item` (
  `uuid` BINARY(16) NOT NULL,
  `purchase_uuid`   BINARY(16) NOT NULL,
  `inventory_uuid`  BINARY(16) NOT NULL,
  `quantity`        int(11) NOT NULL DEFAULT 0,
  `unit_price`      decimal(10,4) unsigned NOT NULL,
  `total`           decimal(10,4) unsigned DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `purchase_item_1` (`purchase_uuid`, `inventory_uuid`),
  KEY `purchase_uuid` (`purchase_uuid`),
  KEY `inventory_uuid` (`inventory_uuid`),
  FOREIGN KEY (`purchase_uuid`) REFERENCES `purchase` (`uuid`) ON DELETE CASCADE,
  FOREIGN KEY (`inventory_uuid`) REFERENCES `inventory` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `reference`;

CREATE TABLE `reference` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `is_report` tinyint(1) DEFAULT NULL,
  `ref` char(4) NOT NULL,
  `text` text,
  `position` int(10) unsigned DEFAULT NULL,
  `reference_group_id` tinyint(3) unsigned DEFAULT NULL,
  `section_resultat_id` tinyint(3) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `reference_group`;

CREATE TABLE `reference_group` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `reference_group` char(4) NOT NULL,
  `text` text,
  `position` int(10) unsigned DEFAULT NULL,
  `section_bilan_id` tinyint(3) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `section_bilan_id` (`section_bilan_id`),
  FOREIGN KEY (`section_bilan_id`) REFERENCES `section_bilan` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `report`;

CREATE TABLE `report` (
  `id`                  tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `report_key`          TEXT NOT NULL,
  `title_key`           TEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `saved_report`;

CREATE TABLE `saved_report` (
  `uuid`                BINARY(16) NOT NULL,
  `label`               TEXT NOT NULL,
  `report_id`           tinyint(3) unsigned NOT NULL,
  `parameters`          TEXT, /* query string parameters, if they will be displayed on the report (such as filters, etc) */
  `link`                TEXT NOT NULL,
  `timestamp`           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id`             SMALLINT(5) UNSIGNED NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `user_id` (`user_id`),
  KEY `report_id` (`report_id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  FOREIGN KEY (`report_id`) REFERENCES `report` (`id`)
) ENGINE= InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `rubric`;

CREATE TABLE `rubric` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `label` text,
  `abbr` varchar(4) DEFAULT NULL,
  `is_discount` tinyint(1) DEFAULT 0,
  `is_percent` tinyint(1) DEFAULT 0,
  `value` float DEFAULT 0,
  `is_advance` tinyint(1) DEFAULT 0,
  `is_social_care` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `rubric_paiement`;

CREATE TABLE `rubric_paiement` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `paiement_uuid` BINARY(16) NOT NULL,
  `rubric_id` int(10) unsigned NOT NULL,
  `value` float DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `paiement_uuid` (`paiement_uuid`),
  KEY `rubric_id` (`rubric_id`),
  FOREIGN KEY (`paiement_uuid`) REFERENCES `paiement` (`uuid`),
  FOREIGN KEY (`rubric_id`) REFERENCES `rubric` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `invoice`;

CREATE TABLE `invoice` (
  `project_id`          SMALLINT(5) UNSIGNED NOT NULL,
  `reference`           INT(10) UNSIGNED NOT NULL DEFAULT 0,
  `uuid`                BINARY(16) NOT NULL,
  `cost`                DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0,
  `debtor_uuid`         BINARY(16) NOT NULL,
  `service_id`          SMALLINT(5) UNSIGNED DEFAULT NULL,
  `user_id`             SMALLINT(5) UNSIGNED NOT NULL,
  `date`                DATETIME NOT NULL,
  `description`         TEXT NOT NULL,
  `reversed`            TINYINT NOT NULL DEFAULT 0,
  `created_at`          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `invoice_1` (`project_id`, `reference`),
  KEY `reference` (`reference`),
  KEY `project_id` (`project_id`),
  KEY `debtor_uuid` (`debtor_uuid`),
  KEY `service_id` (`service_id`),
  KEY `user_id` (`user_id`),
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  FOREIGN KEY (`debtor_uuid`) REFERENCES `debtor` (`uuid`),
  FOREIGN KEY (`service_id`) REFERENCES `service` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS invoice_billing_service;
CREATE TABLE invoice_billing_service (
  `invoice_uuid`               BINARY(16) NOT NULL,
  `value`                      DECIMAL(10,4) NOT NULL,
  `billing_service_id`         SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (`invoice_uuid`, `value`),
  UNIQUE KEY `invoice_billing_service_1` (`invoice_uuid`, `billing_service_id`),
  KEY `invoice_uuid` (`invoice_uuid`),
  KEY `billing_service_id` (`billing_service_id`),
  FOREIGN KEY (`invoice_uuid`) REFERENCES `invoice` (`uuid`) ON DELETE CASCADE,
  FOREIGN KEY (`billing_service_id`) REFERENCES `billing_service` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `invoice_item`;

CREATE TABLE `invoice_item` (
  `invoice_uuid` BINARY(16) NOT NULL,
  `uuid` BINARY(16) NOT NULL,
  `inventory_uuid` BINARY(16) NOT NULL,
  `quantity` INT(10) UNSIGNED NOT NULL,
  `inventory_price` decimal(19,4) DEFAULT NULL,
  `transaction_price` decimal(19,4) NOT NULL,
  `debit` decimal(19,4) NOT NULL DEFAULT 0.0,
  `credit` decimal(19,4) NOT NULL DEFAULT 0.0,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `invoice_item_1` (`invoice_uuid`, `inventory_uuid`),
  KEY `invoice_uuid` (`invoice_uuid`),
  KEY `inventory_uuid` (`inventory_uuid`),
  FOREIGN KEY (`invoice_uuid`) REFERENCES `invoice` (`uuid`) ON DELETE CASCADE,
  FOREIGN KEY (`inventory_uuid`) REFERENCES `inventory` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS invoice_subsidy;

CREATE TABLE `invoice_subsidy` (
  `invoice_uuid`        BINARY(16) NOT NULL,
  `value`               DECIMAL(10,4) NOT NULL,
  `subsidy_id`          SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (`invoice_uuid`, `value`),
  UNIQUE KEY `invoice_subsidy_1` (`invoice_uuid`, `subsidy_id`),
  KEY `invoice_uuid` (`invoice_uuid`),
  KEY `subsidy_id` (`subsidy_id`),
  FOREIGN KEY (`invoice_uuid`) REFERENCES `invoice` (`uuid`) ON DELETE CASCADE,
  FOREIGN KEY (`subsidy_id`) REFERENCES `subsidy` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `section_bilan`;

CREATE TABLE `section_bilan` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `text` text,
  `is_actif` tinyint(1) DEFAULT NULL,
  `position` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `section_resultat`;

CREATE TABLE `section_resultat` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `text` text,
  `position` int(10) unsigned DEFAULT NULL,
  `is_charge` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `sector`;
CREATE TABLE `sector` (
  `uuid` BINARY(16) NOT NULL,
  `name` VARCHAR(80) NOT NULL,
  `province_uuid` BINARY(16) NOT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `sector_1` (`name`, `province_uuid`),
  KEY `province_id` (`province_uuid`),
  FOREIGN KEY (`province_uuid`) REFERENCES `province` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `service`;
CREATE TABLE `service` (
  `id` smallint(5) unsigned not null auto_increment,
  `uuid` BINARY(16) NULL,
  `enterprise_id` SMALLINT(5) UNSIGNED NOT NULL,
  `name` VARCHAR(80) NOT NULL,
  `cost_center_id` SMALLINT(6) DEFAULT NULL,
  `profit_center_id` SMALLINT(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `service_0` (`uuid`),
  UNIQUE KEY `service_1` (`name`),
  UNIQUE KEY `service_2` (`cost_center_id`, `profit_center_id`),
  KEY `enterprise_id` (`enterprise_id`),
  KEY `cost_center_id` (`cost_center_id`),
  KEY `profit_center_id` (`profit_center_id`),
  FOREIGN KEY (`enterprise_id`) REFERENCES enterprise (`id`),
  FOREIGN KEY (`cost_center_id`) REFERENCES `cost_center` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`profit_center_id`) REFERENCES `profit_center` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `subsidy`;
CREATE TABLE subsidy (
  `id`              SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `account_id`      INT UNSIGNED NOT NULL,
  `label`           VARCHAR(100) NOT NULL,
  `description`     TEXT,
  `value`           DECIMAL(10,4) NOT NULL,
  `created_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `subsidy_1` (`label`),
  KEY `account_id` (`account_id`),
  FOREIGN KEY (`account_id`) REFERENCES `account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `supplier`;
CREATE TABLE `supplier` (
  `uuid`            BINARY(16) NOT NULL,
  `reference`       INT(10) UNSIGNED NOT NULL DEFAULT 0,
  `creditor_uuid`   BINARY(16) NOT NULL,
  `display_name`    VARCHAR(45) NOT NULL,
  `address_1`       TEXT,
  `address_2`       TEXT,
  `email`           VARCHAR(45) DEFAULT NULL,
  `fax`             VARCHAR(45) DEFAULT NULL,
  `note`            TEXT,
  `phone`           VARCHAR(15) DEFAULT NULL,
  `international`   TINYINT(1) NOT NULL DEFAULT 0,
  `locked`          TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `supplier_1` (`display_name`),
  KEY `creditor_uuid` (`creditor_uuid`),
  FOREIGN KEY (`creditor_uuid`) REFERENCES `creditor` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `tax`;
CREATE TABLE `tax` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `label` VARCHAR(80) NOT NULL,
  `abbr` varchar(4) DEFAULT NULL,
  `is_employee` tinyint(1) DEFAULT 0,
  `is_percent` tinyint(1) DEFAULT 0,
  `four_account_id` int(10) unsigned DEFAULT NULL,
  `six_account_id` int(10) unsigned DEFAULT NULL,
  `value` float DEFAULT 0,
  `is_ipr` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tax_1` (`label`),
  KEY `four_account_id` (`four_account_id`),
  KEY `six_account_id` (`six_account_id`),
  FOREIGN KEY (`four_account_id`) REFERENCES `account` (`id`),
  FOREIGN KEY (`six_account_id`) REFERENCES `account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `tax_paiement`;

CREATE TABLE `tax_paiement` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `paiement_uuid` BINARY(16) NOT NULL,
  `tax_id` int(10) unsigned NOT NULL,
  `value` float DEFAULT 0,
  `posted` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tax_paiement_1` (`paiement_uuid`, `tax_id`),
  KEY `paiement_uuid` (`paiement_uuid`),
  KEY `tax_id` (`tax_id`),
  FOREIGN KEY (`paiement_uuid`) REFERENCES `paiement` (`uuid`),
  FOREIGN KEY (`tax_id`) REFERENCES `tax` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `taxe_ipr`;

CREATE TABLE `taxe_ipr` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `taux` float NOT NULL,
  `tranche_annuelle_debut` float DEFAULT NULL,
  `tranche_annuelle_fin` float DEFAULT NULL,
  `tranche_mensuelle_debut` float DEFAULT NULL,
  `tranche_mensuelle_fin` float DEFAULT NULL,
  `ecart_annuel` float DEFAULT NULL,
  `ecart_mensuel` float DEFAULT NULL,
  `impot_annuel` float DEFAULT NULL,
  `impot_mensuel` float DEFAULT NULL,
  `cumul_annuel` float DEFAULT NULL,
  `cumul_mensuel` float DEFAULT NULL,
  `currency_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `transaction_type`;
CREATE TABLE `transaction_type` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `text` varchar(100) NOT NULL,
  `type` varchar(30) NOT NULL,
  `prefix` varchar(30) NOT NULL,
  `fixed` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_type_1` (`id`, `text`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `unit`;

CREATE TABLE `unit` (
  `id` smallint(5) unsigned NOT NULL,
  `name` varchar(30) NOT NULL,
  `key` varchar(70) NOT NULL,
  `description` text NOT NULL,
  `parent` smallint(6) DEFAULT 0,
  `url` tinytext,
  `path` tinytext,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unit_1` (`name`, `key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id`            SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT,
  `username`      VARCHAR(80) NOT NULL,
  `password`      VARCHAR(100) NOT NULL,
  `display_name`  TEXT NOT NULL,
  `email`         VARCHAR(100) DEFAULT NULL,
  `active`        TINYINT(4) NOT NULL DEFAULT 0,
  `deactivated`   TINYINT(1) NOT NULL DEFAULT 0,
  `pin`           CHAR(4) NOT NULL DEFAULT 0,
  `last_login`    TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_1` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `village`;

CREATE TABLE `village` (
  `uuid`        BINARY(16) NOT NULL,
  `name`        VARCHAR(80) NOT NULL,
  `sector_uuid` BINARY(16) NOT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `village_1` (`name`, `sector_uuid`),
  KEY `sector_id` (`sector_uuid`),
  FOREIGN KEY (`sector_uuid`) REFERENCES `sector` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- NOTE: type_id is the transaction_type table.  FK not possible due to NULLs.
DROP TABLE IF EXISTS `voucher`;
CREATE TABLE IF NOT EXISTS `voucher` (
  `uuid`            BINARY(16) NOT NULL,
  `date`            DATETIME NOT NULL,
  `project_id`      SMALLINT(5) UNSIGNED NOT NULL,
  `reference`       INT(10) UNSIGNED NOT NULL DEFAULT 0,
  `currency_id`     TINYINT(3) UNSIGNED NOT NULL,
  `amount`          DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0.00,
  `description`     TEXT DEFAULT NULL,
  `user_id`         SMALLINT(5) UNSIGNED NOT NULL,
  `created_at`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `type_id`         SMALLINT(3) UNSIGNED NULL,
  `reference_uuid`  BINARY(16),
  KEY `project_id` (`project_id`),
  KEY `currency_id` (`currency_id`),
  KEY `user_id` (`user_id`),
  INDEX (`reference_uuid`),
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  UNIQUE KEY `voucher_1` (`project_id`, `reference`),
  PRIMARY KEY (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `voucher_item`;
CREATE TABLE IF NOT EXISTS `voucher_item` (
  `uuid`            BINARY(16) NOT NULL,
  `account_id`      INT UNSIGNED NOT NULL,
  `debit`           DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0.0000,
  `credit`          DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0.0000,
  `voucher_uuid`    BINARY(16) NOT NULL,
  `document_uuid`   binary(16) default null,
  `entity_uuid`     binary(16) default null,
  PRIMARY KEY (`uuid`),
  KEY `account_id` (`account_id`),
  KEY `voucher_uuid` (`voucher_uuid`),
  INDEX (`document_uuid`),
  INDEX (`entity_uuid`),
  FOREIGN KEY (`account_id`) REFERENCES `account` (`id`),
  FOREIGN KEY (`voucher_uuid`) REFERENCES `voucher` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

SET foreign_key_checks = 1;


-- stock tables

DROP TABLE IF EXISTS `flux`;
CREATE TABLE `flux` (
  `id`    INT(11) NOT NULL,
  `label` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `lot`;
CREATE TABLE `lot` (
  `uuid`              BINARY(16) NOT NULL,
  `label`             VARCHAR(255) NOT NULL,
  `initial_quantity`  INT(11) NOT NULL DEFAULT 0,
  `quantity`          INT(11) NOT NULL DEFAULT 0,
  `unit_cost`         DECIMAL(19, 4) UNSIGNED NOT NULL,
  `expiration_date`   DATE NOT NULL,
  `inventory_uuid`    BINARY(16) NOT NULL,
  `origin_uuid`       BINARY(16) NOT NULL,
  `delay`             INT(11) NOT NULL DEFAULT 0,
  `entry_date`        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`uuid`),
  KEY `inventory_uuid` (`inventory_uuid`),
  FOREIGN KEY (`inventory_uuid`) REFERENCES `inventory` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `stock_movement`;
CREATE TABLE `stock_movement` (
  `uuid`            BINARY(16) NOT NULL,
  `document_uuid`   BINARY(16) NOT NULL,
  `depot_uuid`      BINARY(16) NOT NULL,
  `lot_uuid`        BINARY(16) NOT NULL,
  `entity_uuid`     BINARY(16) NULL,
  `description`     TEXT NULL,
  `flux_id`         INT(11) NOT NULL,
  `date`            DATETIME NOT NULL,
  `quantity`        int(11) NOT NULL DEFAULT 0,
  `unit_cost`       DECIMAL(19, 4) UNSIGNED NOT NULL,
  `is_exit`         TINYINT(1) NOT NULL,
  `user_id`         SMALLINT(5) UNSIGNED NOT NULL,
  `reference`       INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`reference`),
  UNIQUE KEY `stock_movement_uuid` (`uuid`),
  KEY `depot_uuid` (`depot_uuid`),
  KEY `lot_uuid` (`lot_uuid`),
  KEY `flux_id` (`flux_id`),
  KEY `user_id` (`user_id`),
  FOREIGN KEY (`depot_uuid`) REFERENCES `depot` (`uuid`),
  FOREIGN KEY (`lot_uuid`) REFERENCES `lot` (`uuid`),
  FOREIGN KEY (`flux_id`) REFERENCES `flux` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- donor
DROP TABLE IF EXISTS `donor`;
CREATE TABLE `donor` (
  `id`           INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `display_name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- donation
DROP TABLE IF EXISTS `donation`;
CREATE TABLE `donation` (
  `uuid`            BINARY(16) NOT NULL,
  `reference`       INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id`      SMALLINT(5) UNSIGNED NOT NULL,
  `description`     TEXT NULL,
  `date`            DATE NOT NULL,
  `donor_id`        INT(11) NOT NULL,
  PRIMARY KEY (`reference`),
  UNIQUE KEY `donation_uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- integration
DROP TABLE IF EXISTS `integration`;
CREATE TABLE `integration` (
  `uuid`            BINARY(16) NOT NULL,
  `reference`       INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id`      SMALLINT(5) UNSIGNED NOT NULL,
  `description`     TEXT NULL,
  `date`            DATE NOT NULL,
  PRIMARY KEY (`reference`),
  UNIQUE KEY `integration_uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
