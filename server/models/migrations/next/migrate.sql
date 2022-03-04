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