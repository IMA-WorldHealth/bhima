-- Reset employee state
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
