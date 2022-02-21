/* migration file for next release */

DROP TABLE IF EXISTS `odk_central_integration`;
CREATE TABLE `odk_central_integration` (
  `enterprise_id` SMALLINT(5) UNSIGNED NOT NULL,
  `odk_central_url` TEXT NOT NULL,
  `odk_admin_user` TEXT NOT NULL,
  `odk_admin_password` TEXT NOT NULL,
  `odk_project_id` INTEGER UNSIGNED NULL,
  KEY `enterprise_id` (`enterprise_id`),
  CONSTRAINT `odk_central__enterprise` FOREIGN KEY (`enterprise_id`) REFERENCES `enterprise` (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;


-- @jniles
DROP TABLE IF EXISTS `odk_user`;
CREATE TABLE `odk_user` (
  `odk_user_id` INT UNSIGNED NOT NULL,
  `odk_user_password` TEXT NOT NULL,
  `bhima_user_id` SMALLINT(5) UNSIGNED NOT NULL,
  CONSTRAINT `odk_user__user` FOREIGN KEY (`bhima_user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

-- @mbayopanda
DROP TABLE IF EXISTS `odk_app_user`;
CREATE TABLE `odk_app_user` (
  `odk_app_user_id` INT UNSIGNED NOT NULL,
  `odk_app_user_token` TEXT NOT NULL,
  `display_name` TEXT NOT NULL,
  `bhima_user_id` SMALLINT(5) UNSIGNED NOT NULL,
  CONSTRAINT `odk_app_user__user` FOREIGN KEY (`bhima_user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

INSERT IGNORE INTO unit VALUES
  (306, 'ODK Settings', 'TREE.ODK_SETTINGS', 'ODK Settings', 1, '/admin/odk-settings');

UPDATE report SET `report_key` = 'analysis_auxiliary_cashbox', `title_key` = 'REPORT.ANALYSIS_AUX_CASHBOX.TITLE'
 WHERE report_key = 'analysis_auxiliary_cashboxes';

UPDATE unit SET `name` = 'Analysis of Cashbox', `key` = 'REPORT.ANALYSIS_AUX_CASHBOX.TITLE', `description` = 'Analysis of auxiliary cashbox', `path` = '/reports/analysis_auxiliary_cashbox'
  WHERE path = '/reports/analysis_auxiliary_cashboxes';

/*
 * @author: jmcameron
 * @description: Add new menu item for Assets Management
 * @date: 2022-01-28
 */
INSERT IGNORE INTO unit VALUES
  (307, 'Asset Management', 'TREE.ASSET_MANAGEMENT.TITLE', 'Asset Management', 0, '/ASSET_MANAGEMENT_FOLDER');

 /*
  * Issue: Asset Management - Inventory Changes #6348
  * @author: lomamech
  * @date: 2022-02-07
  */
CALL add_column_if_missing('inventory', 'is_asset', 'TINYINT(1) NOT NULL DEFAULT 0 AFTER `importance`');
CALL add_column_if_missing('inventory', 'reference_number', 'TEXT NULL');
CALL add_column_if_missing('inventory', 'manufacturer_brand', 'TEXT NULL');
CALL add_column_if_missing('inventory', 'manufacturer_model', 'TEXT NULL');

CALL add_column_if_missing('inventory_type', 'description', 'TEXT NULL');
CALL add_column_if_missing('inventory_type', 'is_predefined', 'TINYINT(1) NOT NULL DEFAULT 0');

ALTER TABLE `inventory_type` CHANGE COLUMN `text` `text` VARCHAR(200) NOT NULL;

/*
 * Issue: Asset Management - Stock Lot changes #6349
 * @author: lomamech
 * @date: 2022-02-10
 */
CALL add_column_if_missing('lot', 'serial_number', 'VARCHAR(40) NULL');

/*
 * Issue: Asset Management - Move reference_number to lot
 * @author: jmcameron
 * @date: 2022-03-04
 */
CALL drop_column_if_exists('inventory', 'reference_number');
CALL add_column_if_missing('lot', 'reference_number', 'TEXT NULL');

/*
 * Issue: Asset Management - Asset registry
 *   - Add new assets registry page menu item
 *   - Delete old assignments page
 * @author: jmcameron
 * @date: 2022-03-01
 */
INSERT IGNORE INTO unit VALUES
  (308, 'Assets Registry', 'TREE.ASSETS_REGISTRY', 'Assets Registry', 307, '/assets');
DELETE FROM role_unit WHERE unit_id = 225;
DELETE FROM unit WHERE id = 225;
INSERT IGNORE INTO `entity_type` (`label`, `translation_key`) VALUES
  ('person', 'ENTITY.TYPE.PERSON'),
  ('service', 'ENTITY.TYPE.SERVICE'),
  ('office', 'ENTITY.TYPE.OFFICE'),
  ('enterprise', 'ENTITY.TYPE.ENTERPRISE');

/*
 * @author: mbayopanda
 * @description: Shipment tables
 * @date: 2022-02-07
 */
DROP TABLE IF EXISTS `asset_condition`;
CREATE TABLE `asset_condition` (
  `id` SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `translation_key` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `shipment_status`;
CREATE TABLE `shipment_status` (
  `id` SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `translation_key` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `shipment`;
CREATE TABLE `shipment` (
  `uuid`                      BINARY(16) NOT NULL,
  `project_id`                SMALLINT(5) UNSIGNED NOT NULL,
  `reference`                 INT(11) UNSIGNED NOT NULL,
  `name`                      VARCHAR(100) NOT NULL,
  `description`               TEXT NULL,
  `note`                      TEXT NULL,
  `requisition_uuid`          BINARY(16),
  `origin_depot_uuid`         BINARY(16),
  `destination_depot_uuid`    BINARY(16),
  `anticipated_delivery_date` DATETIME,
  `date_sent`                 DATETIME,
  `date_delivered`            DATETIME,
  `date_ready_for_shipment`   DATETIME,
  `receiver`                  VARCHAR(100),
  `status_id`                 SMALLINT(5) UNSIGNED NOT NULL,
  `ready_for_shipment`        TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
  `created_by`                SMALLINT(5) UNSIGNED NOT NULL,
  `created_at`                TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by`                SMALLINT(5) UNSIGNED NULL,
  `updated_at`                TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `document_uuid`             BINARY(16) NULL, /* stock exit document_uuid */
  PRIMARY KEY (`uuid`),
  CONSTRAINT `shipment__project` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `shipment__requisition` FOREIGN KEY (`requisition_uuid`) REFERENCES `requisition` (`uuid`),
  CONSTRAINT `shipment__origin_depot` FOREIGN KEY (`origin_depot_uuid`) REFERENCES `depot` (`uuid`),
  CONSTRAINT `shipment__destination_depot` FOREIGN KEY (`destination_depot_uuid`) REFERENCES `depot` (`uuid`),
  CONSTRAINT `shipment__status` FOREIGN KEY (`status_id`) REFERENCES `shipment_status` (`id`),
  CONSTRAINT `shipment__created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`),
  CONSTRAINT `shipment__updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `shipment_item`;
CREATE TABLE `shipment_item` (
  `uuid`               BINARY(16) NOT NULL,
  `shipment_uuid`      BINARY(16) NOT NULL,
  `lot_uuid`           BINARY(16) NOT NULL,
  `date_packed`        DATETIME,
  `date_sent`          DATETIME,
  `date_delivered`     DATETIME,
  `quantity_sent`      INT(11) UNSIGNED DEFAULT 0,
  `quantity_delivered` INT(11) UNSIGNED DEFAULT 0,
  `condition_id`       SMALLINT(5) UNSIGNED NULL,
  PRIMARY KEY (`uuid`),
  CONSTRAINT `shipment_item__shipment` FOREIGN KEY (`shipment_uuid`) REFERENCES `shipment` (`uuid`),
  CONSTRAINT `shipment_item__lot` FOREIGN KEY (`lot_uuid`) REFERENCES `lot` (`uuid`),
  CONSTRAINT `shipment_item__condition` FOREIGN KEY (`condition_id`) REFERENCES `asset_condition` (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

/** ADD DEFAULT SHIPMENT STATUS */
INSERT INTO `shipment_status` (`id`, `name`, `translation_key`) VALUES 
  (1, 'empty', 'ASSET.STATUS.EMPTY'),
  (2, 'at_depot', 'ASSET.STATUS.AT_DEPOT'),
  (3, 'ready', 'ASSET.STATUS.READY_FOR_SHIPMENT'),
  (4, 'in_transit', 'ASSET.STATUS.IN_TRANSIT'),
  (5, 'partial', 'ASSET.STATUS.PARTIAL'),
  (6, 'complete', 'ASSET.STATUS.COMPLETE'),
  (7, 'delivered', 'ASSET.STATUS.DELIVERED'),
  (8, 'lost', 'ASSET.STATUS.LOST');

/** ADD DEFAULT ASSET CONDITION */
INSERT INTO `asset_condition` (`id`, `name`, `translation_key`) VALUES 
  (1, 'empty', 'ASSET.STATUS.EMPTY'),
  (2, 'new', 'ASSET.CONDITION.NEW'),
  (3, 'good', 'ASSET.CONDITION.GOOD'),
  (4, 'broken', 'ASSET.CONDITION.BROKEN');

/** Add shipment in unit */
INSERT INTO `unit` VALUES 
  (308, 'Asset Shipment', 'SHIPMENT.SHIPMENTS', 'Asset Shipment', 307, '/SHIPMENT_FOLDER'),
  (309, 'New Shipment', 'SHIPMENT.NEW_SHIPMENT', 'New Shipment', 308, '/shipments/create'),
  (310, 'Shipment Registry', 'SHIPMENT.SHIPMENT_REGISTRY', 'Shipment Registry', 308, '/shipments');

/** Shipment location logs */
DROP TABLE IF EXISTS `shipment_tracking`;
CREATE TABLE `shipment_tracking` (
  `uuid`               BINARY(16) NOT NULL,
  `shipment_uuid`      BINARY(16) NOT NULL,
  `note`               TEXT NOT NULL,
  `date`               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id`            SMALLINT(5) UNSIGNED NULL,
  PRIMARY KEY (`uuid`),
  CONSTRAINT `shipment_location__shipment` FOREIGN KEY (`shipment_uuid`) REFERENCES `shipment` (`uuid`),
  CONSTRAINT `shipment_location__user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;
