/*
 * next version from 1.27.0
 */

/**
 * @author: lomamech
 * @description: Problems of the management and supervision of deposits #6877
 * @date: 2023-01-09
 */
DROP TABLE IF EXISTS `depot_supervision`;

CREATE TABLE `depot_supervision` (
  `id` SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` SMALLINT(5) UNSIGNED NOT NULL,
  `depot_uuid`  BINARY(16) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `depot_supervision_1` (`user_id`,`depot_uuid`),
  KEY `user_id` (`user_id`),
  KEY `depot_uuid` (`depot_uuid`),
  CONSTRAINT `depot_supervision__depot` FOREIGN KEY (`depot_uuid`) REFERENCES `depot` (`uuid`),
  CONSTRAINT `depot_supervision__user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;
