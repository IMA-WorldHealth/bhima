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

INSERT INTO unit VALUES
  (306, '[SETTINGS] ODK Settings', 'TREE.ODK_SETTINGS', 'ODK Settings', 1, '/admin/odk-settings');
