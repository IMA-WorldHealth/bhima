/* migration file for next release */

ALTER TABLE `enterprise_setting` ADD COLUMN `enable_odk_central_integration` BOOLEAN NOT NULL DEFAULT FALSE;


DROP TABLE IF EXISTS `odk_central_integration`;
CREATE TABLE `odk_central_integration` (
  `enterprise_id` SMALLINT(5) UNSIGNED NOT NULL,
  `odk_central_url` TEXT NOT NULL,
  `odk_admin_user` TEXT NOT NULL,
  `odk_admin_password` TEXT NOT NULL,
  `odk_project_id` INTEGER UNSIGNED NOT NULL,
  KEY `enterprise_id` (`enterprise_id`),
  CONSTRAINT `odk_central__enterprise` FOREIGN KEY (`enterprise_id`) REFERENCES `enterprise` (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;
