-- By: Dedrick Kitamuka
-- Date: 2015-11-27

INSERT INTO unit (`id`, `name`, `key`, `description`, `parent`, `url`, `path`) VALUES
(138, 'Employee State Pdf', 'TREE.EMPLOYEE_STATE', 'Situation Financiere employee' , 128, 'partials/reports_proposed/employee_state/', '/reports/employee_state/');


-- Deleting
-- By Chris LOMAME
-- Date : 2015-12-16
-- No way to view this report because it is necessary to have a store in parameter
-- /reports/stock_store/:depotId

delete from unit where id = 134;

--
-- General upgrades to the entire database
--

--
-- BEGIN PRICE LIST UPDATES
--

-- This should eventually be in a schema migration script, but it is fine for the moment.
-- jniles

-- DANGER
set foreign_key_checks = 0;

-- make sure all FK links have been removed
UPDATE debitor_group SET price_list_uuid = NULL;
UPDATE patient_group SET price_list_uuid = NULL;

DROP TABLE IF EXISTS price_list_item;
DROP TABLE IF EXISTS price_list;

CREATE TABLE price_list (
  `enterprise_id`       SMALLINT(5) UNSIGNED NOT NULL,
  `uuid`                CHAR(36) NOT NULL,
  `label`               VARCHAR(250) NOT NULL,
  `description`         TEXT,
  `created_at`          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`uuid`),
  KEY `enterprise_id` (`enterprise_id`),
  FOREIGN KEY (`enterprise_id`) REFERENCES `enterprise` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE price_list_item (
  `uuid`                CHAR(36) NOT NULL,
  `inventory_uuid`      CHAR(36) NOT NULL,
  `price_list_uuid`     CHAR(36) NOT NULL,
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

set foreign_key_checks = 1;

--
-- END PRICE LIST UPDATES
--


--
-- PREAMBLE
--

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
  `amount`          decimal(19,2) unsigned NOT NULL DEFAULT 0.00,
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

-- new triggers to manage creation of references
CREATE TRIGGER cash_calculate_reference BEFORE INSERT ON cash
FOR EACH ROW SET NEW.reference = (SELECT IFNULL(MAX(reference) + 1, 1) FROM cash WHERE cash.project_id = new.project_id);

-- migrate data for cash
INSERT INTO `cash` (uuid, project_id, reference, `date`, debtor_uuid, currency_id, amount, user_id, cashbox_id, description, is_caution)
  SELECT uuid, project_id, reference, `date`, `deb_cred_uuid`, currency_id, cost, user_id, cashbox_id, description, is_caution
  FROM `cash_migrate`;

INSERT INTO `cash_item` (uuid, cash_uuid, amount, invoice_uuid)
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

-- Creating a flag for title account
-- By Dedrick Kitamuka
-- 22-12-2015

ALTER TABLE account ADD COLUMN is_title BOOLEAN DEFAULT 0;

-- Removing constraint in account
-- By Dedrick Kitamuka
-- 22-12-2015
-- ALTER TABLE account DROP FOREIGN KEY account_type_id;

UPDATE account SET is_title = 1 WHERE account_type_id = 3;

-- Updating the account type
-- By Dedrick Kitamuka
-- 22-12-2015

UPDATE account SET account_type_id = 1 where classe > 5 AND account_type_id = 3;
UPDATE account SET account_type_id = 2 where classe < 5 AND account_type_id = 3;

-- Removing title account type
-- By Dedrick Kitamuka
-- 22-12-2015

DELETE FROM account_type WHERE id = 3;

-- SET locked to false for OHADA account
-- By Dedrick Kitamuka
-- 26-12-2015

UPDATE account SET locked = 0 WHERE is_ohada = 1;

-- SET locked to true for PCGC account
-- By Dedrick Kitamuka
-- 26-12-2015

UPDATE account SET locked = 1 WHERE is_ohada = 0;

-- Removing is_ohada column
-- By Dedrick Kitamuka
-- 26-12-2015

ALTER TABLE account DROP COLUMN is_ohada;
