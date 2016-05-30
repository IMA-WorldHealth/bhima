SET foreign_key_checks = 0;

SET names 'utf8';
SET character_set_database = 'utf8';
SET collation_database = 'utf8_unicode_ci';

DROP TABLE IF EXISTS `account`;

CREATE TABLE `account` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `type_id` MEDIUMINT(8) UNSIGNED NOT NULL,
  `enterprise_id` SMALLINT(5) UNSIGNED NOT NULL,
  `number` INT(11) NOT NULL,
  `label` TEXT,
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
  KEY `type_id` (`type_id`),
  KEY `enterprise_id` (`enterprise_id`),
  KEY `cc_id` (`cc_id`),
  KEY `reference_id` (`reference_id`),
  FOREIGN KEY (`type_id`) REFERENCES `account_type` (`id`),
  FOREIGN KEY (`enterprise_id`) REFERENCES `enterprise` (`id`),
  FOREIGN KEY (`cc_id`) REFERENCES `cost_center` (`id`),
  FOREIGN KEY (`reference_id`) REFERENCES `reference` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `account_type`;
CREATE TABLE `account_type` (
  `id` MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(35) NOT NULL,
  PRIMARY KEY (`id`)
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


DROP TABLE IF EXISTS `beneficiary`;
CREATE TABLE `beneficiary` (
  `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `text` TEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS billing_service;
CREATE TABLE billing_service (
  `id`              SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `account_id`      INT(10) UNSIGNED NOT NULL,
  `label`           VARCHAR(200) NOT NULL,
  `description`     TEXT,
  `value`           DECIMAL(10,4) UNSIGNED NOT NULL,
  `created_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
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
  PRIMARY KEY (`uuid`),
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

-- triggers to manage creation of references
CREATE TRIGGER cash_before_insert BEFORE INSERT ON cash
FOR EACH ROW SET NEW.reference = (SELECT IFNULL(MAX(reference) + 1, 1) FROM cash WHERE cash.project_id = new.project_id);

DROP TABLE IF EXISTS `cash_item`;
CREATE TABLE `cash_item` (
  `uuid`            BINARY(16) NOT NULL,
  `cash_uuid`       BINARY(16) NOT NULL,
  `amount`          DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0.00,
  `invoice_uuid`    BINARY(16) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `cash_uuid` (`cash_uuid`),
  FOREIGN KEY (`cash_uuid`) REFERENCES `cash` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `cash_discard`;
CREATE TABLE `cash_discard` (
  `uuid`              BINARY(16) NOT NULL,
  `project_id`        SMALLINT(5) UNSIGNED NOT NULL,
  `reference`         INT(10) UNSIGNED NOT NULL,
  `cash_uuid`         BINARY(16) NOT NULL,
  `date`              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `description`       text,
  `user_id`           SMALLINT(5) UNSIGNED NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `reference` (`reference`),
  KEY `project_id` (`project_id`),
  KEY `user_id` (`user_id`),
  KEY `cash_uuid` (`cash_uuid`),
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  FOREIGN KEY (`cash_uuid`) REFERENCES `cash` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `cash_box`;
CREATE TABLE `cash_box` (
  `id`            MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT,
  `label`         TEXT NOT NULL,
  `project_id`    SMALLINT(5) UNSIGNED NOT NULL,
  `is_auxiliary`  TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
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
  KEY `currency_id` (`currency_id`),
  KEY `cash_box_id` (`cash_box_id`),
  KEY `account_id` (`account_id`),
  KEY `transfer_account_id` (`transfer_account_id`),
  FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`),
  FOREIGN KEY (`cash_box_id`) REFERENCES `cash_box` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (`account_id`) REFERENCES `account` (`id`),
  FOREIGN KEY (`transfer_account_id`) REFERENCES `account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `client`;
CREATE TABLE `client` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `address` varchar(100) DEFAULT NULL,
  `debtor_uuid` BINARY(16) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `debtor_uuid` (`debtor_uuid`),
  FOREIGN KEY (`debtor_uuid`) REFERENCES `debtor` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `config_accounting`;
CREATE TABLE `config_accounting` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `label` text,
  `account_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `account_id` (`account_id`),
  FOREIGN KEY (`account_id`) REFERENCES `account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `config_cotisation`;
CREATE TABLE `config_cotisation` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `label` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `config_cotisation_item`;
CREATE TABLE `config_cotisation_item` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `config_cotisation_id` int(10) unsigned NOT NULL,
  `cotisation_id` int(10) unsigned NOT NULL,
  `payable` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
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
  KEY `paiement_period_id` (`paiement_period_id`),
  FOREIGN KEY (`paiement_period_id`) REFERENCES `paiement_period` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `config_rubric`;

CREATE TABLE `config_rubric` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `label` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `config_rubric_item`;

CREATE TABLE `config_rubric_item` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `config_rubric_id` int(10) unsigned NOT NULL,
  `rubric_id` int(10) unsigned NOT NULL,
  `payable` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `config_rubric_id` (`config_rubric_id`),
  KEY `rubric_id` (`rubric_id`),
  FOREIGN KEY (`config_rubric_id`) REFERENCES `config_rubric` (`id`),
  FOREIGN KEY (`rubric_id`) REFERENCES `rubric` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `config_tax`;

CREATE TABLE `config_tax` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `label` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `config_tax_item`;

CREATE TABLE `config_tax_item` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `config_tax_id` int(10) unsigned NOT NULL,
  `tax_id` int(10) unsigned NOT NULL,
  `payable` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
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
  KEY `depot_uuid` (`depot_uuid`),
  FOREIGN KEY (`depot_uuid`) REFERENCES `depot` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
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
  `sale_uuid`           BINARY(16) NOT NULL,
  `patient_uuid`        BINARY(16) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `consumption_uuid` (`consumption_uuid`),
  KEY `sale_uuid` (`sale_uuid`),
  KEY `patient_uuid` (`patient_uuid`),
  FOREIGN KEY (`consumption_uuid`) REFERENCES `consumption` (`uuid`),
  FOREIGN KEY (`sale_uuid`) REFERENCES `sale` (`uuid`),
  FOREIGN KEY (`patient_uuid`) REFERENCES `patient` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `consumption_rummage`;

CREATE TABLE `consumption_rummage` (
  `uuid` BINARY(16) NOT NULL,
  `consumption_uuid` BINARY(16) NOT NULL,
  `document_uuid` BINARY(16) NOT NULL,
  PRIMARY KEY (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `consumption_service`;

CREATE TABLE `consumption_service` (
  `uuid` BINARY(16) NOT NULL,
  `consumption_uuid` BINARY(16) NOT NULL,
  `service_id` smallint(5) unsigned NOT NULL,
  PRIMARY KEY (`uuid`),
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
  KEY `project_id` (`project_id`)
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
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`auxi_cc_id`) REFERENCES `cost_center` (`id`) ON DELETE CASCADE
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
  `label` text,
  `abbr` varchar(4) DEFAULT NULL,
  `is_employee` tinyint(1) DEFAULT 0,
  `is_percent` tinyint(1) DEFAULT 0,
  `four_account_id` int(10) unsigned DEFAULT NULL,
  `six_account_id` int(10) unsigned DEFAULT NULL,
  `value` float DEFAULT 0,
  PRIMARY KEY (`id`),
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
  KEY `paiement_uuid` (`paiement_uuid`),
  KEY `cotisation_id` (`cotisation_id`),
  FOREIGN KEY (`paiement_uuid`) REFERENCES `paiement` (`uuid`),
  FOREIGN KEY (`cotisation_id`) REFERENCES `cotisation` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `country`;

CREATE TABLE `country` (
  `uuid` BINARY(16) NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `credit_note`;

CREATE TABLE `credit_note` (
  `uuid`            BINARY(16) NOT NULL,
  `project_id`      SMALLINT(5) UNSIGNED NOT NULL,
  `reference`       INT(10) UNSIGNED NOT NULL DEFAULT 0,
  `cost`            DECIMAL(19,4) UNSIGNED NOT NULL,
  `debtor_uuid`    BINARY(16) NOT NULL,
  `seller_id`       SMALLINT(5) UNSIGNED NOT NULL DEFAULT 0,
  `sale_uuid`       BINARY(36) NOT NULL,
  `note_date`       DATE NOT NULL,
  `description` text,
  `posted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`uuid`),
  KEY `reference` (`reference`),
  KEY `project_id` (`project_id`),
  KEY `debtor_uuid` (`debtor_uuid`),
  KEY `sale_uuid` (`sale_uuid`),
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  FOREIGN KEY (`debtor_uuid`) REFERENCES `debtor` (`uuid`),
  FOREIGN KEY (`sale_uuid`) REFERENCES `sale` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `creditor`;

CREATE TABLE `creditor` (
  `uuid` BINARY(16) NOT NULL,
  `group_uuid` BINARY(16) NOT NULL,
  `text` text,
  PRIMARY KEY (`uuid`),
  KEY `group_uuid` (`group_uuid`),
  FOREIGN KEY (`group_uuid`) REFERENCES `creditor_group` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `creditor_group`;

CREATE TABLE `creditor_group` (
  `enterprise_id` smallint(5) unsigned NOT NULL,
  `uuid` BINARY(16) NOT NULL,
  `name` varchar(80) DEFAULT NULL,
  `account_id` int(10) unsigned NOT NULL,
  `locked` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`uuid`),
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
  `name` text NOT NULL,
  `format_key` varchar(20) NOT NULL,
  `symbol` varchar(15) NOT NULL,
  `note` text,
  `min_monentary_unit` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `debtor`;
CREATE TABLE `debtor` (
  `uuid` BINARY(16) NOT NULL,
  `group_uuid` BINARY(16) NOT NULL,
  `text` text,
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
  `created_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`uuid`),
  KEY `enterprise_id` (`enterprise_id`),
  KEY `account_id` (`account_id`),
  KEY `location_id` (`location_id`),
  KEY `price_list_uuid` (`price_list_uuid`),
  FOREIGN KEY (`enterprise_id`) REFERENCES `enterprise` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`account_id`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`location_id`) REFERENCES `village` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`price_list_uuid`) REFERENCES `price_list` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
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
  KEY `debtor_group_uuid` (`debtor_group_uuid`),
  KEY `subsidy_id` (`subsidy_id`),
  FOREIGN KEY (`subsidy_id`) REFERENCES `subsidy` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`debtor_group_uuid`) REFERENCES `debtor_group` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `depot`;
CREATE TABLE `depot` (
  `uuid` BINARY(16) NOT NULL,
  `text` text,
  `enterprise_id` smallint(5) unsigned NOT NULL,
  `is_warehouse` smallint(5) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS discount;

CREATE TABLE discount (
  `id`                  SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `label`               VARCHAR(200) NOT NULL,
  `description`         TEXT,
  `inventory_uuid`      BINARY(16) NOT NULL,
  `account_id`          INT(10) UNSIGNED NOT NULL,
  `value`               DECIMAL(10,4) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_uuid` (`inventory_uuid`),
  KEY `account_id` (`account_id`),
  FOREIGN KEY (`inventory_uuid`) REFERENCES `inventory` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`account_id`) REFERENCES `account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `donation_item`;
CREATE TABLE `donation_item` (
  `uuid` BINARY(16) NOT NULL,
  `donation_uuid` BINARY(16) NOT NULL,
  `tracking_number` BINARY(16) NOT NULL,
  PRIMARY KEY (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `donations`;
CREATE TABLE `donations` (
  `uuid`         BINARY(16) NOT NULL,
  `donor_id`     INT(11) NOT NULL,
  `employee_id`  INT(11) NOT NULL,
  `date`         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_received`  TINYINT(1) NOT NULL DEFAULT 0,
  `is_confirmed` TINYINT(1) NOT NULL DEFAULT 0,
  `confirmed_by` INT(10) UNSIGNED NOT NULL,
  PRIMARY KEY (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `donor`;
CREATE TABLE `donor` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `employee`;
CREATE TABLE `employee` (
  `id`            INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `code`          VARCHAR(20) NOT NULL,
  `prenom`        TEXT,
  `name`          TEXT NOT NULL,
  `postnom`       TEXT,
  `sexe`          VARCHAR(10) NOT NULL,
  `dob`           DATETIME NOT NULL,
  `date_embauche` DATETIME DEFAULT NULL,
  `nb_spouse`     INT(11) DEFAULT 0,
  `nb_enfant`     INT(11) DEFAULT 0,
  `grade_id`      BINARY(16) NOT NULL,
  `daily_salary`  FLOAT DEFAULT 0,
  `bank`          VARCHAR(30) DEFAULT NULL,
  `bank_account`  VARCHAR(30) DEFAULT NULL,
  `adresse`       VARCHAR(50) DEFAULT NULL,
  `phone`         VARCHAR(20) DEFAULT NULL,
  `email`         VARCHAR(70) DEFAULT NULL,
  `fonction_id`   TINYINT(3) UNSIGNED DEFAULT NULL,
  `service_id`    SMALLINT(5) UNSIGNED DEFAULT NULL,
  `location_id`   BINARY(16) NOT NULL,
  `creditor_uuid` BINARY(16) DEFAULT NULL,
  `debtor_uuid`  BINARY(16) DEFAULT NULL,
  `locked`        TINYINT(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fonction_id` (`fonction_id`),
  KEY `service_id` (`service_id`),
  KEY `location_id` (`location_id`),
  KEY `creditor_uuid` (`creditor_uuid`),
  KEY `debtor_uuid` (`debtor_uuid`),
  KEY `grade_id` (`grade_id`),
  FOREIGN KEY (`fonction_id`) REFERENCES `fonction` (`id`),
  FOREIGN KEY (`service_id`) REFERENCES `service` (`id`),
  FOREIGN KEY (`location_id`) REFERENCES `village` (`uuid`),
  FOREIGN KEY (`creditor_uuid`) REFERENCES `creditor` (`uuid`),
  FOREIGN KEY (`debtor_uuid`) REFERENCES `debtor` (`uuid`),
  FOREIGN KEY (`grade_id`) REFERENCES `grade` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `employee_invoice`;
CREATE TABLE `employee_invoice` (
  `uuid` BINARY(16) NOT NULL,
  `project_id` smallint(5) unsigned NOT NULL,
  `debtor_uuid` BINARY(16) NOT NULL,
  `creditor_uuid` BINARY(16) NOT NULL,
  `note` text,
  `authorized_by` varchar(80) NOT NULL,
  `date` date NOT NULL,
  `total` decimal(14,4) NOT NULL DEFAULT 0.0,
  PRIMARY KEY (`uuid`),
  KEY `debtor_uuid` (`debtor_uuid`),
  KEY `project_id` (`project_id`),
  KEY `creditor_uuid` (`creditor_uuid`),
  FOREIGN KEY (`debtor_uuid`) REFERENCES `debtor` (`uuid`),
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  FOREIGN KEY (`creditor_uuid`) REFERENCES `creditor` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `employee_invoice_item`;
CREATE TABLE `employee_invoice_item` (
  `uuid` BINARY(16) NOT NULL,
  `payment_uuid` BINARY(16) NOT NULL,
  `invoice_uuid` BINARY(16) NOT NULL,
  `cost` decimal(16,4) unsigned NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `payment_uuid` (`payment_uuid`),
  KEY `invoice_uuid` (`invoice_uuid`),
  FOREIGN KEY (`payment_uuid`) REFERENCES `employee_invoice` (`uuid`) ON DELETE CASCADE,
  FOREIGN KEY (`invoice_uuid`) REFERENCES `sale` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `enterprise`;
CREATE TABLE `enterprise` (
  `id`              SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`            TEXT NOT NULL,
  `abbr`            VARCHAR(50) DEFAULT NULL,
  `phone`           VARCHAR(20) DEFAULT NULL,
  `email`           VARCHAR(100) DEFAULT NULL,
  `location_id`     BINARY(16) DEFAULT NULL,
  `logo`            VARCHAR(100) DEFAULT NULL,
  `currency_id`     TINYINT(3) UNSIGNED NOT NULL,
  `po_box`          VARCHAR(30) DEFAULT NULL,
  `gain_account_id` INT UNSIGNED NULL,
  `loss_account_id` INT UNSIGNED NULL,
  PRIMARY KEY (`id`),
  KEY `location_id` (`location_id`),
  KEY `currency_id` (`currency_id`),
  KEY `gain_account_id` (`gain_account_id`),
  KEY `loss_account_id` (`loss_account_id`),
  FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`),
  FOREIGN KEY (`location_id`) REFERENCES `village` (`uuid`),
  FOREIGN KEY (`gain_account_id`) REFERENCES `account` (`id`),
  FOREIGN KEY (`loss_account_id`) REFERENCES `account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `event`;
CREATE TABLE `event` (
  `timestamp`   TIMESTAMP NOT NULL,
  `user_id`     SMALLINT(5) UNSIGNED NOT NULL,
  `channel`     TEXT NOT NULL,
  `type`        TEXT NOT NULL,
  `data`        TEXT NOT NULL, -- TODO, this should be JSON in newer MySQL
  KEY `user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `exchange_rate`;
CREATE TABLE `exchange_rate` (
  `id`    MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT,
  `enterprise_id`   smallint(5) UNSIGNED NOT NULL,
  `currency_id`   TINYINT(3) UNSIGNED NOT NULL,
  `rate`    DECIMAL(19,4) UNSIGNED NOT NULL,
  `date`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `enterprise_id` (`enterprise_id`),
  KEY `currency_id` (`currency_id`),
  FOREIGN KEY (`enterprise_id`) REFERENCES `enterprise` (`id`),
  FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `fiscal_year`;
CREATE TABLE `fiscal_year` (
  `enterprise_id`             SMALLINT(5) UNSIGNED NOT NULL,
  `id`                        MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT,
  `number_of_months`          MEDIUMINT(8) UNSIGNED NOT NULL,
  `label`                     TEXT NOT NULL,
  `start_date`                DATE NOT NULL,
  `previous_fiscal_year_id`   MEDIUMINT(8) UNSIGNED DEFAULT NULL,
  `locked`                    TINYINT(1) NOT NULL DEFAULT 0,
  `created_at`                TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`                TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `enterprise_id` (`enterprise_id`),
  FOREIGN KEY (`enterprise_id`) REFERENCES `enterprise` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `fonction`;
CREATE TABLE `fonction` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `fonction_txt` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `general_ledger`;
CREATE TABLE `general_ledger` (
  `uuid`              BINARY(16) NOT NULL,
  `project_id`        SMALLINT(5) UNSIGNED NOT NULL,
  `fiscal_year_id`    MEDIUMINT(8) UNSIGNED DEFAULT NULL,
  `period_id`         MEDIUMINT(8) UNSIGNED DEFAULT NULL,
  `trans_id`          TEXT NOT NULL,
  `trans_date`        DATETIME NOT NULL,
  `record_uuid`       BINARY(16) NOT NULL, -- previously doc_num
  `description`       TEXT,
  `account_id`        INT(10) UNSIGNED NOT NULL,
  `debit`             DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0.00,
  `credit`            DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0.00,
  `debit_equiv`       DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0.00,
  `credit_equiv`      DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0.00,
  `currency_id`       TINYINT(3) UNSIGNED NOT NULL,
  `entity_uuid`       BINARY(16),    -- previously deb_cred_uuid
  `entity_type`       CHAR(1),     -- previously deb_cred_type
  `reference_uuid`    BINARY(16),  -- previously inv_po_id
  `comment`           TEXT,
  `origin_id`         TINYINT(3) UNSIGNED NOT NULL,
  `user_id`           SMALLINT(5) UNSIGNED NOT NULL,
  `cc_id`             SMALLINT(6),
  `pc_id`             SMALLINT(6),
  PRIMARY KEY (`uuid`),
  KEY `project_id` (`project_id`),
  KEY `fiscal_year_id` (`fiscal_year_id`),
  KEY `period_id` (`period_id`),
  KEY `origin_id` (`origin_id`),
  KEY `currency_id` (`currency_id`),
  KEY `user_id` (`user_id`),
  KEY `cc_id` (`cc_id`),
  KEY `pc_id` (`pc_id`),
  FOREIGN KEY (`fiscal_year_id`) REFERENCES `fiscal_year` (`id`),
  FOREIGN KEY (`period_id`) REFERENCES `period` (`id`),
  FOREIGN KEY (`origin_id`) REFERENCES `transaction_type` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`cc_id`) REFERENCES `cost_center` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`pc_id`) REFERENCES `profit_center` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `grade`;
CREATE TABLE `grade` (
  `uuid` BINARY(16) NOT NULL,
  `code` varchar(30) DEFAULT NULL,
  `text` text,
  `basic_salary` decimal(19,4) unsigned DEFAULT NULL,
  PRIMARY KEY (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `group_invoice`;
CREATE TABLE `group_invoice` (
  `uuid` BINARY(16) NOT NULL,
  `project_id` smallint(5) unsigned NOT NULL,
  `debtor_uuid` BINARY(16) NOT NULL,
  `group_uuid` BINARY(16) NOT NULL,
  `note` text,
  `authorized_by` varchar(80) NOT NULL,
  `date` date NOT NULL,
  `total` decimal(14,4) NOT NULL DEFAULT 0.0,
  PRIMARY KEY (`uuid`),
  KEY `debtor_uuid` (`debtor_uuid`),
  KEY `project_id` (`project_id`),
  KEY `group_uuid` (`group_uuid`),
  FOREIGN KEY (`debtor_uuid`) REFERENCES `debtor` (`uuid`),
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  FOREIGN KEY (`group_uuid`) REFERENCES `debtor_group` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `group_invoice_item`;

CREATE TABLE `group_invoice_item` (
  `uuid` BINARY(16) NOT NULL,
  `payment_uuid` BINARY(16) NOT NULL,
  `invoice_uuid` BINARY(16) NOT NULL,
  `cost` decimal(16,4) unsigned NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `payment_uuid` (`payment_uuid`),
  KEY `invoice_uuid` (`invoice_uuid`),
  FOREIGN KEY (`payment_uuid`) REFERENCES `group_invoice` (`uuid`) ON DELETE CASCADE,
  FOREIGN KEY (`invoice_uuid`) REFERENCES `sale` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `holiday`;

CREATE TABLE `holiday` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `employee_id` int(10) unsigned NOT NULL,
  `percentage` float DEFAULT 0,
  `label` text,
  `dateFrom` date DEFAULT NULL,
  `dateTo` date DEFAULT NULL,
  PRIMARY KEY (`id`),
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


DROP TABLE IF EXISTS `inventory`;

CREATE TABLE `inventory` (
  `enterprise_id` SMALLINT(5) UNSIGNED NOT NULL,
  `uuid` BINARY(16) NOT NULL,
  `code` varchar(30) NOT NULL,
  `text` text,
  `price` decimal(10,4) unsigned NOT NULL DEFAULT 0.0,
  `purchase_price` DECIMAL(10,4) UNSIGNED NOT NULL DEFAULT 0.0,
  `group_uuid` BINARY(16) NOT NULL,
  `unit_id` smallint(5) unsigned DEFAULT NULL,
  `unit_weight` mediumint(9) DEFAULT 0,
  `unit_volume` mediumint(9) DEFAULT 0,
  `stock` int(10) unsigned NOT NULL DEFAULT 0,
  `stock_max` int(10) unsigned NOT NULL DEFAULT 0,
  `stock_min` int(10) unsigned NOT NULL DEFAULT 0,
  `type_id` TINYINT(3) UNSIGNED NOT NULL DEFAULT 0,
  `consumable` TINYINT(1) NOT NULL DEFAULT 0,
  `origin_stamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `code` (`code`),
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
  `sales_account` mediumint(8) unsigned NOT NULL,
  `cogs_account` mediumint(8) unsigned DEFAULT NULL,
  `stock_account` mediumint(8) unsigned DEFAULT NULL,
  `donation_account` mediumint(8) unsigned DEFAULT NULL,
  PRIMARY KEY (`uuid`),
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `inventory_unit`;

CREATE TABLE `inventory_unit` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `text` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
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
  `name` TEXT NOT NULL,
  `key` VARCHAR(5) NOT NULL,
  `locale_key` VARCHAR(5) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `mod_snis_zs`;

CREATE TABLE `mod_snis_zs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `zone` varchar(100) NOT NULL,
  `territoire` varchar(100) NOT NULL,
  `province` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `movement`;

CREATE TABLE `movement` (
  `uuid` BINARY(16) NOT NULL,
  `document_id` BINARY(16) NOT NULL,
  `depot_entry` BINARY(16) DEFAULT NULL,
  `depot_exit` BINARY(16) DEFAULT NULL,
  `tracking_number` char(50) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `date` date DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `tracking_number` (`tracking_number`),
  KEY `depot_exit` (`depot_exit`),
  KEY `depot_entry` (`depot_entry`),
  FOREIGN KEY (`tracking_number`) REFERENCES `stock` (`tracking_number`),
  FOREIGN KEY (`depot_exit`) REFERENCES `depot` (`uuid`),
  FOREIGN KEY (`depot_entry`) REFERENCES `depot` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `offday`;

CREATE TABLE `offday` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `label` text,
  `date` date NOT NULL,
  `percent_pay` float DEFAULT '100',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `paiement`;

CREATE TABLE `paiement` (
  `uuid` BINARY(16) NOT NULL,
  `employee_id` int(10) unsigned NOT NULL,
  `paiement_period_id` int(10) unsigned NOT NULL,
  `currency_id` tinyint(3) unsigned DEFAULT NULL,
  `paiement_date` date DEFAULT NULL,
  `working_day` int(10) unsigned NOT NULL,
  `net_before_tax` float DEFAULT 0,
  `net_after_tax` float DEFAULT 0,
  `net_salary` float DEFAULT 0,
  `is_paid` tinyint(4) DEFAULT 0,
  PRIMARY KEY (`uuid`),
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
  `label` text,
  `dateFrom` date NOT NULL,
  `dateTo` date NOT NULL,
  PRIMARY KEY (`id`),
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
  KEY `enterprise_id` (`enterprise_id`),
  FOREIGN KEY (`enterprise_id`) REFERENCES `enterprise` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `price_list_item`;

CREATE TABLE `price_list_item` (
  `uuid`                BINARY(16) NOT NULL,
  `inventory_uuid`      BINARY(16) NOT NULL,
  `price_list_uuid`     BINARY(16) NOT NULL,
  `label`               VARCHAR(250) NOT NULL,
  `value`               INTEGER NOT NULL,
  `is_percentage`       BOOLEAN NOT NULL DEFAULT 0,
  `created_at`          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`uuid`),
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
  `debtor_uuid`         BINARY(16) NOT NULL,
  `first_name`           VARCHAR(150) NOT NULL,
  `last_name`            VARCHAR(150) NOT NULL,
  `dob`                  DATETIME NOT NULL,
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
  `renewal`              TINYINT(1) NOT NULL DEFAULT 0,
  `origin_location_id`   BINARY(16) NOT NULL,
  `current_location_id`  BINARY(16) NOT NULL,
  `registration_date`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `title`                VARCHAR(30),
  `notes`                TEXT,
  `middle_name`          VARCHAR(150),
  `hospital_no`          VARCHAR(150),
  PRIMARY KEY (`uuid`),
  KEY `reference` (`reference`),
  KEY `project_id` (`project_id`),
  KEY `debtor_uuid` (`debtor_uuid`),
  KEY `origin_location_id` (`origin_location_id`),
  KEY `current_location_id` (`current_location_id`),
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  FOREIGN KEY (`debtor_uuid`) REFERENCES `debtor` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`current_location_id`) REFERENCES `village` (`uuid`) ON UPDATE CASCADE,
  FOREIGN KEY (`origin_location_id`) REFERENCES `village` (`uuid`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TRIGGER patient_reference BEFORE INSERT ON patient
FOR EACH ROW SET NEW.reference = (SELECT IFNULL(MAX(reference) + 1, 1) FROM patient WHERE patient.project_id = new.project_id);

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
  `note`              TEXT,
  `created_at`        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (`uuid`),
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
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `registered_by` smallint(5) unsigned NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `patient_uuid` (`patient_uuid`),
  KEY `registered_by` (`registered_by`),
  FOREIGN KEY (`patient_uuid`) REFERENCES `patient` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`registered_by`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `payment`;

CREATE TABLE `payment` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `days` smallint(5) unsigned DEFAULT 0,
  `months` mediumint(8) unsigned DEFAULT 0,
  `text` varchar(50) NOT NULL,
  `note` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `period`;

CREATE TABLE `period` (
  `id`                  MEDIUMINT(8) UNSIGNED NOT NULL AUTO_INCREMENT,
  `fiscal_year_id`      MEDIUMINT(8) UNSIGNED NOT NULL,
  `number`              SMALLINT(5) UNSIGNED NOT NULL,
  `start_date`          DATE NOT NULL,
  `end_date`            DATE NOT NULL,
  `locked`              TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
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
  UNIQUE KEY `unit_id_2` (`unit_id`,`user_id`),
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
  `trans_id`          TEXT NOT NULL,
  `trans_date`        DATETIME NOT NULL,
  `record_uuid`       BINARY(16) NOT NULL, -- previously doc_num
  `description`       TEXT,
  `account_id`        INT(10) UNSIGNED NOT NULL,
  `debit`             DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0.00,
  `credit`            DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0.00,
  `debit_equiv`       DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0.00,
  `credit_equiv`      DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0.00,
  `currency_id`       TINYINT(3) UNSIGNED NOT NULL,
  `entity_uuid`       BINARY(16),    -- previously deb_cred_uuid
  `entity_type`       CHAR(1),     -- previously deb_cred_type
  `reference_uuid`    BINARY(16),  -- previously inv_po_id
  `comment`           TEXT,
  `origin_id`         TINYINT(3) UNSIGNED NOT NULL,
  `user_id`           SMALLINT(5) UNSIGNED NOT NULL,
  `cc_id`             SMALLINT(6),
  `pc_id`             SMALLINT(6),
  PRIMARY KEY (`uuid`),
  KEY `project_id` (`project_id`),
  KEY `fiscal_year_id` (`fiscal_year_id`),
  KEY `period_id` (`period_id`),
  KEY `origin_id` (`origin_id`),
  KEY `currency_id` (`currency_id`),
  KEY `user_id` (`user_id`),
  KEY `cc_id` (`cc_id`),
  KEY `pc_id` (`pc_id`),
  FOREIGN KEY (`fiscal_year_id`) REFERENCES `fiscal_year` (`id`),
  FOREIGN KEY (`period_id`) REFERENCES `period` (`id`),
  FOREIGN KEY (`origin_id`) REFERENCES `transaction_type` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`cc_id`) REFERENCES `cost_center` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`pc_id`) REFERENCES `profit_center` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `primary_cash`;

CREATE TABLE `primary_cash` (
  `reference` INT(10) UNSIGNED NOT NULL DEFAULT 0,
  `uuid` BINARY(16) NOT NULL,
  `project_id` smallint(5) unsigned NOT NULL,
  `type` char(1) NOT NULL,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deb_cred_uuid` BINARY(16) DEFAULT NULL,
  `deb_cred_type` varchar(1) DEFAULT NULL,
  `currency_id` tinyint(3) unsigned NOT NULL,
  `account_id` int(10) unsigned NOT NULL,
  `cost` decimal(19,4) unsigned NOT NULL DEFAULT 0.0,
  `user_id` smallint(5) unsigned NOT NULL,
  `description` text,
  `cash_box_id` mediumint(8) unsigned NOT NULL,
  `origin_id` tinyint(3) unsigned NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `project_id` (`project_id`),
  KEY `reference` (`reference`),
  KEY `currency_id` (`currency_id`),
  KEY `user_id` (`user_id`),
  KEY `cash_box_id` (`cash_box_id`),
  KEY `account_id` (`account_id`),
  KEY `origin_id` (`origin_id`),
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  FOREIGN KEY (`cash_box_id`) REFERENCES `cash_box` (`id`),
  FOREIGN KEY (`account_id`) REFERENCES `account` (`id`),
  FOREIGN KEY (`origin_id`) REFERENCES `primary_cash_module` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `primary_cash_item`;

CREATE TABLE `primary_cash_item` (
  `uuid` varBINARY(16) NOT NULL,
  `primary_cash_uuid` varBINARY(16) NOT NULL,
  `debit` decimal(19,4) unsigned NOT NULL DEFAULT 0.0,
  `credit` decimal(19,4) unsigned NOT NULL DEFAULT 0.0,
  `inv_po_id` varBINARY(16) DEFAULT NULL,
  `document_uuid` varBINARY(16) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `primary_cash_uuid` (`primary_cash_uuid`),
  FOREIGN KEY (`primary_cash_uuid`) REFERENCES `primary_cash` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `primary_cash_module`;

CREATE TABLE `primary_cash_module` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `text` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `profit_center`;

CREATE TABLE `profit_center` (
  `project_id` smallint(5) unsigned NOT NULL,
  `id` smallint(6) NOT NULL AUTO_INCREMENT,
  `text` varchar(100) NOT NULL,
  `note` text,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `project`;

CREATE TABLE `project` (
  `id` SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` TEXT,
  `abbr` CHAR(3) DEFAULT NULL,
  `enterprise_id` SMALLINT(5) UNSIGNED NOT NULL,
  `zs_id` INT(11) NOT NULL DEFAULT 0,
  `locked` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `abbr` (`abbr`),
  KEY `enterprise_id` (`enterprise_id`),
  FOREIGN KEY (`enterprise_id`) REFERENCES `enterprise` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `project_permission`;

CREATE TABLE `project_permission` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` smallint(5) unsigned NOT NULL,
  `project_id` smallint(5) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id_2` (`user_id`,`project_id`),
  KEY `user_id` (`user_id`),
  KEY `project_id` (`project_id`),
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `province`;

CREATE TABLE `province` (
  `uuid` BINARY(16) NOT NULL,
  `name` text,
  `country_uuid` BINARY(16) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `country_uuid` (`country_uuid`),
  FOREIGN KEY (`country_uuid`) REFERENCES `country` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `purchase`;

CREATE TABLE `purchase` (
  `project_id` smallint(5) unsigned NOT NULL,
  `reference` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `uuid` BINARY(16) NOT NULL,
  `cost` decimal(19,4) unsigned NOT NULL DEFAULT 0.0,
  `currency_id` tinyint(3) unsigned NOT NULL,
  `creditor_uuid` BINARY(16) DEFAULT NULL,
  `discount` mediumint(8) unsigned DEFAULT 0,
  `purchase_date` date NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `note` text,
  `paid` tinyint(1) DEFAULT 0,
  `paid_uuid` BINARY(16) DEFAULT NULL,
  `confirmed` tinyint(1) NOT NULL DEFAULT 0,
  `closed` tinyint(1) DEFAULT 0,
  `is_direct` tinyint(1) DEFAULT 0,
  `is_donation` tinyint(1) DEFAULT 0,
  `emitter_id` smallint(5) unsigned NOT NULL,
  `is_authorized` tinyint(1) DEFAULT 0,
  `is_validate` tinyint(1) DEFAULT 0,
  `confirmed_by` int(10) unsigned DEFAULT NULL,
  `is_integration` tinyint(1) DEFAULT NULL,
  `purchaser_id` int(10) unsigned DEFAULT NULL,
  `receiver_id` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `project_id` (`project_id`),
  KEY `reference` (`reference`),
  KEY `creditor_uuid` (`creditor_uuid`),
  KEY `paid_uuid` (`paid_uuid`),
  KEY `receiver_id` (`receiver_id`),
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  FOREIGN KEY (`creditor_uuid`) REFERENCES `creditor` (`uuid`),
  FOREIGN KEY (`paid_uuid`) REFERENCES `primary_cash` (`uuid`),
  FOREIGN KEY (`receiver_id`) REFERENCES `employee` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `purchase_item`;

CREATE TABLE `purchase_item` (
  `purchase_uuid` BINARY(16) NOT NULL,
  `uuid` BINARY(16) NOT NULL,
  `inventory_uuid` BINARY(16) NOT NULL,
  `quantity` int(10) unsigned DEFAULT 0,
  `unit_price` decimal(10,4) unsigned NOT NULL,
  `total` decimal(10,4) unsigned DEFAULT NULL,
  PRIMARY KEY (`uuid`),
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

DROP TABLE IF EXISTS `sale`;

CREATE TABLE `sale` (
  `project_id`    SMALLINT(5) UNSIGNED NOT NULL,
  `reference`     INT(10) UNSIGNED NOT NULL DEFAULT 0,
  `uuid`          BINARY(16) NOT NULL,
  `cost`          DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0,
  `debtor_uuid`   BINARY(16) NOT NULL,
  `service_id`    SMALLINT(5) UNSIGNED DEFAULT NULL,
  `user_id`       SMALLINT(5) UNSIGNED NOT NULL,
  `discount`      MEDIUMINT(8) UNSIGNED DEFAULT 0,
  `date`          DATETIME NOT NULL,
  `description`   TEXT NOT NULL,
  `timestamp`     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_distributable` TINYINT(1) NOT NULL ,
  PRIMARY KEY (`uuid`),
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

CREATE TRIGGER sale_reference BEFORE INSERT ON sale
FOR EACH ROW SET NEW.reference = (SELECT IFNULL(MAX(reference) + 1, 1) FROM sale WHERE sale.project_id = new.project_id);

DROP TABLE IF EXISTS sale_billing_service;
CREATE TABLE sale_billing_service (
  `sale_uuid`               BINARY(16) NOT NULL,
  `value`                   DECIMAL(10,4) NOT NULL,
  `billing_service_id`      SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (`sale_uuid`, `value`),
  KEY `sale_uuid` (`sale_uuid`),
  KEY `billing_service_id` (`billing_service_id`),
  FOREIGN KEY (`sale_uuid`) REFERENCES `sale` (`uuid`),
  FOREIGN KEY (`billing_service_id`) REFERENCES `billing_service` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `sale_item`;

CREATE TABLE `sale_item` (
  `sale_uuid` BINARY(16) NOT NULL,
  `uuid` BINARY(16) NOT NULL,
  `inventory_uuid` BINARY(16) NOT NULL,
  `quantity` INT(10) UNSIGNED NOT NULL,
  `inventory_price` decimal(19,4) DEFAULT NULL,
  `transaction_price` decimal(19,4) NOT NULL,
  `debit` decimal(19,4) NOT NULL DEFAULT 0.0,
  `credit` decimal(19,4) NOT NULL DEFAULT 0.0,
  PRIMARY KEY (`uuid`),
  KEY `sale_uuid` (`sale_uuid`),
  KEY `inventory_uuid` (`inventory_uuid`),
  FOREIGN KEY (`sale_uuid`) REFERENCES `sale` (`uuid`) ON DELETE CASCADE,
  FOREIGN KEY (`inventory_uuid`) REFERENCES `inventory` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS sale_subsidy;

CREATE TABLE `sale_subsidy` (
  `sale_uuid`       BINARY(16) NOT NULL,
  `value`           DECIMAL(10,4) NOT NULL,
  `subsidy_id`      SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (`sale_uuid`, `value`),
  KEY `sale_uuid` (`sale_uuid`),
  KEY `subsidy_id` (`subsidy_id`),
  FOREIGN KEY (`sale_uuid`) REFERENCES `sale` (`uuid`),
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
  `name` text,
  `province_uuid` BINARY(16) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `province_id` (`province_uuid`),
  FOREIGN KEY (`province_uuid`) REFERENCES `province` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `service`;
CREATE TABLE `service` (
  `id` smallint(5) unsigned not null auto_increment,
  `enterprise_id` SMALLINT(5) UNSIGNED NOT NULL,
  `name` TEXT NOT NULL,
  `cost_center_id` SMALLINT(6) DEFAULT NULL,
  `profit_center_id` SMALLINT(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `enterprise_id` (`enterprise_id`),
  KEY `cost_center_id` (`cost_center_id`),
  KEY `profit_center_id` (`profit_center_id`),
  FOREIGN KEY (`enterprise_id`) REFERENCES enterprise (`id`),
  FOREIGN KEY (`cost_center_id`) REFERENCES `cost_center` (`id`) ON UPDATE CASCADE,
  FOREIGN KEY (`profit_center_id`) REFERENCES `profit_center` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `stock`;
CREATE TABLE `stock` (
  `inventory_uuid` BINARY(16) NOT NULL,
  `tracking_number` char(50) NOT NULL,
  `expiration_date` date NOT NULL,
  `entry_date` date NOT NULL,
  `lot_number` varchar(70) NOT NULL,
  `purchase_order_uuid` BINARY(16) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`tracking_number`),
  KEY `inventory_uuid` (`inventory_uuid`),
  KEY `purchase_order_uuid` (`purchase_order_uuid`),
  FOREIGN KEY (`inventory_uuid`) REFERENCES `inventory` (`uuid`),
  FOREIGN KEY (`purchase_order_uuid`) REFERENCES `purchase` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `subsidy`;
CREATE TABLE subsidy (
  `id`              SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `account_id`      INT UNSIGNED NOT NULL,
  `label`           VARCHAR(200) NOT NULL,
  `description`     TEXT,
  `value`           DECIMAL(10,4) NOT NULL,
  `created_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `account_id` (`account_id`),
  FOREIGN KEY (`account_id`) REFERENCES `account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `supplier`;
CREATE TABLE `supplier` (
  `uuid` BINARY(16) NOT NULL DEFAULT '',
  `creditor_uuid` BINARY(16) NOT NULL,
  `name` varchar(45) NOT NULL,
  `address_1` text,
  `address_2` text,
  `email` varchar(45) DEFAULT NULL,
  `fax` varchar(45) DEFAULT NULL,
  `note` text,
  `phone` varchar(15) DEFAULT NULL,
  `international` tinyint(1) NOT NULL DEFAULT 0,
  `locked` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`uuid`),
  KEY `creditor_uuid` (`creditor_uuid`),
  FOREIGN KEY (`creditor_uuid`) REFERENCES `creditor` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `tax`;
CREATE TABLE `tax` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `label` text,
  `abbr` varchar(4) DEFAULT NULL,
  `is_employee` tinyint(1) DEFAULT 0,
  `is_percent` tinyint(1) DEFAULT 0,
  `four_account_id` int(10) unsigned DEFAULT NULL,
  `six_account_id` int(10) unsigned DEFAULT NULL,
  `value` float DEFAULT 0,
  `is_ipr` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
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
  `service_txt` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id`          SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT,
  `username`    VARCHAR(80) NOT NULL,
  `password`    VARCHAR(100) NOT NULL,
  `first`       TEXT NOT NULL,
  `last`        TEXT NOT NULL,
  `email`       VARCHAR(100) DEFAULT NULL,
  `active`      TINYINT(4) NOT NULL DEFAULT 0,
  `pin`         CHAR(4) NOT NULL DEFAULT 0,
  `last_login`  TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `village`;

CREATE TABLE `village` (
  `uuid`        BINARY(16) NOT NULL,
  `name`        text,
  `sector_uuid` BINARY(16) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `sector_id` (`sector_uuid`),
  FOREIGN KEY (`sector_uuid`) REFERENCES `sector` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
  KEY `project_id` (`project_id`),
  KEY `currency_id` (`currency_id`),
  KEY `user_id` (`user_id`),
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  PRIMARY KEY (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TRIGGER voucher_before_insert BEFORE INSERT ON voucher
FOR EACH ROW SET NEW.reference = (SELECT IFNULL(MAX(reference) + 1, 1) FROM voucher WHERE voucher.project_id = NEW.project_id);

DROP TABLE IF EXISTS `voucher_item`;
CREATE TABLE IF NOT EXISTS `voucher_item` (
  `uuid`            BINARY(16) NOT NULL,
  `account_id`      INT UNSIGNED NOT NULL,
  `debit`           DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0.0000,
  `credit`          DECIMAL(19,4) UNSIGNED NOT NULL DEFAULT 0.0000,
  `voucher_uuid`    BINARY(16) NOT NULL,
  `document_uuid`   BINARY(16) DEFAULT NULL,
  `entity_uuid`     BINARY(16) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `account_id` (`account_id`),
  KEY `voucher_uuid` (`voucher_uuid`),
  FOREIGN KEY (`account_id`) REFERENCES `account` (`id`),
  FOREIGN KEY (`voucher_uuid`) REFERENCES `voucher` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- a view to make SQL statements look nicer.
CREATE VIEW combined_ledger AS
  SELECT record_uuid, trans_id, trans_date AS date, account_id, credit_equiv AS credit, debit_equiv as debit,
    reference_uuid, description, entity_uuid
  FROM posting_journal
  UNION ALL
  SELECT record_uuid, trans_id, trans_date AS date, account_id, credit_equiv AS credit, debit_equiv as debit,
    reference_uuid, description, entity_uuid
  FROM general_ledger;

SET foreign_key_checks = 1;
