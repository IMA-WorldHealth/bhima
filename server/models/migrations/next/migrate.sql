-- change the pavillion table to ward table
RENAME TABLE pavillion TO ward;

-- insert unit
INSERT INTO unit VALUES 
  (228, 'Ward Configurations', 'TREE.WARD_CONFIGURATION', 'Ward configuration module', 227, '/modules/ward/configuration', '/ward/configuration');

-- patient management tables
DROP TABLE IF EXISTS `room_type`;
CREATE TABLE `room_type`(
 `id` SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT,
 `label` VARCHAR(120) NOT NULL,
  PRIMARY KEY(`id`)
)ENGINE=InnoDB  DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `room`;
CREATE TABLE `room`(
 `uuid` BINARY(16) NOT NULL,
 `label` VARCHAR(120) NOT NULL,
 `description` text NULL,
 `ward_uuid` BINARY(16) NOT NULL,
 `room_type_id` SMALLINT(5) UNSIGNED NULL,
  PRIMARY KEY(`uuid`),
  UNIQUE KEY `room_label_0` (`label`, `ward_uuid`),
  FOREIGN KEY (`ward_uuid`) REFERENCES ward (`uuid`),
  FOREIGN KEY (`room_type_id`) REFERENCES room_type (`id`)
)ENGINE=InnoDB  DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `bed`;
CREATE TABLE `bed`(
 `id` SMALLINT(5) UNSIGNED NOT NULL AUTO_INCREMENT,
 `label` VARCHAR(120) NOT NULL,
 `room_uuid` BINARY(16) NOT NULL,
 `is_occupied` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY(`id`),
  UNIQUE KEY `bed_label_0` (`label`, `room_uuid`),
  FOREIGN KEY (`room_uuid`) REFERENCES room (`uuid`)
)ENGINE=InnoDB  DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;
