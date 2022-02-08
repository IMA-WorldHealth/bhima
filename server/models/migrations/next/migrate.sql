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
 * @author: mbayopanda
 * @description: Shipment tables
 * @date: 2022-02-07
 */
DROP TABLE IF EXISTS `shipper`;
CREATE TABLE `shipper` (
  `id` SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
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
  `shipper_id`                SMALLINT(5) UNSIGNED NOT NULL,
  `requisition_uuid`          BINARY(16),
  `origin_depot_uuid`         BINARY(16),
  `current_depot_uuid`        BINARY(16),
  `destination_depot_uuid`    BINARY(16),
  `anticipated_delivery_date` DATE,
  `date_sent`                 DATE,
  `date_delivered`            DATE,
  `receiver`                  VARCHAR(100),
  `status_id`                 SMALLINT(5) UNSIGNED NOT NULL,
  `created_by`                SMALLINT(5) UNSIGNED NOT NULL,
  `created_at`                TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by`                SMALLINT(5) UNSIGNED NULL,
  `updated_at`                TIMESTAMP NULL,
  PRIMARY KEY (`uuid`),
  CONSTRAINT `shipment__project` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `shipment__shipper` FOREIGN KEY (`shipper_id`) REFERENCES `shipper` (`id`),
  CONSTRAINT `shipment__requisition` FOREIGN KEY (`requisition_uuid`) REFERENCES `requisition` (`uuid`),
  CONSTRAINT `shipment__origin_depot` FOREIGN KEY (`origin_depot_uuid`) REFERENCES `depot` (`uuid`),
  CONSTRAINT `shipment__current_depot` FOREIGN KEY (`current_depot_uuid`) REFERENCES `depot` (`uuid`),
  CONSTRAINT `shipment__destination_depot` FOREIGN KEY (`destination_depot_uuid`) REFERENCES `depot` (`uuid`),
  CONSTRAINT `shipment__status` FOREIGN KEY (`status_id`) REFERENCES `shipment_status` (`id`),
  CONSTRAINT `shipment__created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`),
  CONSTRAINT `shipment__updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `shipment_item`;
CREATE TABLE `shipment_item` (
  `uuid` BINARY(16) NOT NULL,
  `shipment_uuid` BINARY(16) NOT NULL,
  `lot_uuid` BINARY(16) NOT NULL,
  `date_packed` DATE,
  `date_sent` DATE,
  `date_delivered` DATE,
  `quantity_sent` INT(11) UNSIGNED DEFAULT 0,
  `quantity_delivered` INT(11) UNSIGNED DEFAULT 0,
  `note` TEXT NULL,
  PRIMARY KEY (`uuid`),
  CONSTRAINT `shipment_item__shipment` FOREIGN KEY (`shipment_uuid`) REFERENCES `shipment` (`uuid`),
  CONSTRAINT `shipment_item__lot` FOREIGN KEY (`lot_uuid`) REFERENCES `lot` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

/** ADD DEFAULT SHIPMENT STATUS */
INSERT INTO `shipment_status` (`id`, `name`, `translation_key`) VALUES 
  (1, 'empty', 'ASSET.STATUS.EMPTY'),
  (2, 'partial', 'ASSET.STATUS.PARTIAL'),
  (3, 'complete', 'ASSET.STATUS.COMPLETE'),
  (4, 'in_transit', 'ASSET.STATUS.IN_TRANSIT'),
  (5, 'at_depot', 'ASSET.STATUS.AT_DEPOT'),
  (6, 'delivered', 'ASSET.STATUS.DELIVERED'),
  (7, 'lost', 'ASSET.STATUS.LOST');

/** ADD DEFAULT SHIPPER */
INSERT INTO `shipper` (`id`, `name`) VALUES 
  (1, 'Transit');
