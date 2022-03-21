/* migration file for next release */

CREATE TABLE IF NOT EXISTS `odk_central_integration` (
  `enterprise_id` SMALLINT(5) UNSIGNED NOT NULL,
  `odk_central_url` TEXT NOT NULL,
  `odk_admin_user` TEXT NOT NULL,
  `odk_admin_password` TEXT NOT NULL,
  `odk_project_id` INTEGER UNSIGNED NULL,
  KEY `enterprise_id` (`enterprise_id`),
  CONSTRAINT `odk_central__enterprise` FOREIGN KEY (`enterprise_id`) REFERENCES `enterprise` (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

-- @jniles
CREATE TABLE IF NOT EXISTS `odk_user` (
  `odk_user_id` INT UNSIGNED NOT NULL,
  `odk_user_password` TEXT NOT NULL,
  `bhima_user_id` SMALLINT(5) UNSIGNED NOT NULL,
  CONSTRAINT `odk_user__user` FOREIGN KEY (`bhima_user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

-- @mbayopanda
CREATE TABLE IF NOT EXISTS `odk_app_user` (
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
 * Issue: Asset Management - Asset Inventory management
 * @author: jmcameron
 * @date: 2022-03-09
 */
CREATE TABLE IF NOT EXISTS `asset_condition` (
  `id`               SMALLINT(5) NOT NULL AUTO_INCREMENT,
  `condition`        VARCHAR(100) NOT NULL,  -- Will be treated as a translation token (if predefined)
  `predefined`       BOOLEAN NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

INSERT IGNORE INTO `asset_condition` VALUES -- (id, comdition, predefined)
  (1, 'ASSET.CONDITION.NEW', 1),
  (2, 'ASSET.CONDITION.GOOD', 1),
  (3, 'ASSET.CONDITION.FAIR', 1),
  (4, 'ASSET.CONDITION.POOR', 1),
  (5, 'ASSET.CONDITION.BROKEN', 1),
  (6, 'ASSET.CONDITION.OBSOLETE', 1),
  (7, 'ASSET.CONDITION.DISCARDED', 1),
  (8, 'ASSET.CONDITION.SOLD', 1),
  (9, 'ASSET.CONDITION.LOST', 1);

CREATE TABLE IF NOT EXISTS `asset_scan` (
  `uuid`              BINARY(16) NOT NULL,
  `asset_uuid`        BINARY(16) NOT NULL,
  `location_uuid`     BINARY(16),
  `depot_uuid`        BINARY(16),           -- NULL if not assigned to a depot
  `scanned_by`        SMALLINT(5) UNSIGNED NOT NULL,
  `condition_id`      SMALLINT(5) NOT NULL,
  `notes`             TEXT DEFAULT NULL,
  `created_at`        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`uuid`),
  KEY `asset_uuid` (`asset_uuid`),
  KEY `location_uuid` (`location_uuid`),
  CONSTRAINT `asset_scan__asset`     FOREIGN KEY (`asset_uuid`) REFERENCES `lot` (`uuid`),
  CONSTRAINT `asset_scan__location`  FOREIGN KEY (`location_uuid`) REFERENCES `village` (`uuid`),
  CONSTRAINT `asset_scan__user`      FOREIGN KEY (`scanned_by`) REFERENCES `user` (`id`),
  CONSTRAINT `asset_scan__condition` FOREIGN KEY (`condition_id`) REFERENCES `asset_condition` (`id`),
  CONSTRAINT `asset_scan__depot`     FOREIGN KEY (`depot_uuid`) REFERENCES `depot` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

INSERT IGNORE INTO unit VALUES
  (309, 'Asset Scan Management', 'TREE.ASSETS_SCANS_REGISTRY', 'Asset Scan Management', 307, '/assets/scans');