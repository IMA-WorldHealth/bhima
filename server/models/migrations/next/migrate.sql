/* migration file for next release */

CALL add_column_if_missing('enterprise_setting', 'enable_odk_central_integration', 'BOOLEAN NOT NULL DEFAULT FALSE');

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

INSERT INTO unit VALUES
  (306, '[SETTINGS] ODK Settings', 'TREE.ODK_SETTINGS', 'ODK Settings', 1, '/admin/odk-settings');

 /*
  * Hack: Assets as Lots #6287
  * @author: lomamech
  * @date: 2022-01-18
  */
CALL add_column_if_missing('inventory', 'is_asset', 'TINYINT(1) NOT NULL DEFAULT 0 AFTER `importance`');

DROP TABLE IF EXISTS `lot_asset`;
CREATE TABLE `lot_asset` (
  `lot_uuid`           BINARY(16) NOT NULL,
  `abt_inventory_no`   VARCHAR(191) NOT NULL,
  `origin`             VARCHAR(191) NOT NULL,
  `purchase_order`     VARCHAR(191) NOT NULL,
  `vendor`             VARCHAR(191) NOT NULL,
  `condition`          VARCHAR(191) NOT NULL,
  KEY `lot_uuid` (`lot_uuid`),
  CONSTRAINT `lot_asset__lot` FOREIGN KEY (`lot_uuid`) REFERENCES `lot` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;
