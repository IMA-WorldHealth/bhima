--
-- General upgrades to the entire database
--

--
-- PREAMBLE
--

USE bhima;

-- Foreign key checks will affect the character set upgrade
SET foreign_key_checks = 0;

-- make sure server/client communication happens in UTF-8 charset (runtime only)
SET NAMES 'utf8';
SET character_set_database = 'utf8';
SET collation_database = 'utf8_unicode_ci';

-- upgrade the database schema default (permanent upgrade)
ALTER DATABASE bhima CHARACTER SET utf8 COLLATE utf8_unicode_ci;

--
-- BEGIN UPGRADING
--

--
-- BEGIN Cash Table Upgrades
--

-- The following scripts upgrade the cash table by reducing the number of columns stored
-- in the cash table.  The cash_discard table actually stores useful information now.

CREATE TEMPORARY TABLE IF NOT EXISTS cash_migrate AS (SELECT * FROM cash);
CREATE TEMPORARY TABLE IF NOT EXISTS cash_item_migrate AS (SELECT * FROM cash_item);
CREATE TEMPORARY TABLE IF NOT EXISTS cash_discard_migrate AS (SELECT * FROM cash_discard);

DROP TABLE cash_item;
DROP TABLE cash_discard;
DROP TABLE cash;

-- schema for cash table
CREATE TABLE `cash` (
  `uuid`            char(36) NOT NULL,
  `project_id`      smallint(5) unsigned NOT NULL,
  `reference`       int(10) unsigned NOT NULL,
  `date`            date NOT NULL,
  `debtor_uuid`     char(36) NOT NULL,
  `currency_id`     tinyint(3) unsigned NOT NULL,
  `amount`          decimal(19,2) unsigned NOT NULL DEFAULT 0.00,
  `user_id`         smallint(5) unsigned NOT NULL,
  `cashbox_id`      mediumint(8) unsigned NOT NULL,
  `description`     text,
  `is_caution`      BOOLEAN NOT NULL DEFAULT 0,
  PRIMARY KEY (`uuid`),
  KEY `project_id` (`project_id`),
  KEY `reference` (`reference`),
  KEY `debtor_uuid` (`debtor_uuid`),
  KEY `user_id` (`user_id`),
  KEY `cashbox_id` (`cashbox_id`),
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`),
  FOREIGN KEY (`debtor_uuid`) REFERENCES `debitor` (`uuid`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  FOREIGN KEY (`cashbox_id`) REFERENCES `cash_box` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- schema for cash_item table
CREATE TABLE `cash_item` (
  `uuid`            char(36) NOT NULL,
  `cash_uuid`       char(36) NOT NULL,
  `allocated_cost`  decimal(19,2) unsigned NOT NULL DEFAULT 0.00,
  `invoice_uuid`    char(36) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `cash_uuid` (`cash_uuid`),
  FOREIGN KEY (`cash_uuid`) REFERENCES `cash` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- schema for cash_discard table
CREATE TABLE `cash_discard` (
  `uuid`              char(36) NOT NULL,
  `project_id`        smallint(5) unsigned NOT NULL,
  `reference`         int(10) unsigned NOT NULL,
  `cash_uuid`         char(36) NOT NULL,
  `date`              date NOT NULL,
  `description`       text,
  `user_id`           smallint(5) unsigned NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `reference` (`reference`),
  KEY `project_id` (`project_id`),
  KEY `user_id` (`user_id`),
  KEY `cash_uuid` (`cash_uuid`),
  FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  FOREIGN KEY (`cash_uuid`) REFERENCES `cash` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- migrate data for cash
INSERT INTO `cash` (uuid, project_id, reference, `date`, debtor_uuid, currency_id, amount, user_id, cashbox_id, description, is_caution)
  SELECT uuid, project_id, reference, `date`, deb_cred_uuid, currency_id, cost, user_id, cashbox_id, description, is_caution
  FROM `cash_migrate`;

INSERT INTO `cash_item` (uuid, cash_uuid, allocated_cost, invoice_uuid)
  SELECT uuid, cash_uuid, allocated_cost, invoice_uuid
  FROM `cash_item_migrate`;

INSERT INTO `cash_discard` (uuid, project_id, reference, cash_uuid, `date`, description, user_id)
  SELECT uuid, project_id, reference, cash_uuid, `date`, description, 1
  FROM `cash_discard_migrate`;

--
-- END Cash Table Upgrades
--

--
-- CLEAN UP
--

DROP TABLE cash_discard_migrate;
DROP TABLE cash_item_migrate;
DROP TABLE cash_migrate;

-- restore foreign keys
SET foreign_key_checks = 1;
