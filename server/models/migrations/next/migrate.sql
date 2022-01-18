/* migration file for next release */

ALTER TABLE `enterprise_setting` ADD COLUMN `enable_odk_central_integration` BOOLEAN NOT NULL DEFAULT FALSE;


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

 /*
  * Hack: Assets as Lots #6287
  * @author: lomamech
  * @date: 2022-01-18
  */
CALL add_column_if_missing('inventory', 'is_asset', 'TINYINT(1) NOT NULL DEFAULT 0 AFTER `importance`');
