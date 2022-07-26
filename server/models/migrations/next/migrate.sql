/**
 * @author: jmcameron
 * @description: Add containers to shipments
 * @date: 2021-07-22
 */

DROP TABLE IF EXISTS `shipment_container_types`;
CREATE TABLE `shipment_container_types` (
  `id` TINYINT(3) UNSIGNED NOT NULL AUTO_INCREMENT,
  `text` VARCHAR(200) NOT NULL,
  `predefined` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `shipment_container_type__text` (`text`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `shipment_container`;
CREATE TABLE `shipment_container` (
  `uuid`               BINARY(16) NOT NULL,
  `label`              VARCHAR(100) NOT NULL,
  `shipment_uuid`      BINARY(16) NOT NULL,
  `container_type_id`  TINYINT(3) UNSIGNED NOT NULL,
  `weight`             FLOAT NOT NULL DEFAULT 0,
  `date_sent`          DATETIME,
  `date_received`      DATETIME,
  PRIMARY KEY (`uuid`),
  CONSTRAINT `shipment_container__type` FOREIGN KEY (`container_type_id`) REFERENCES `shipment_container_types` (`id`),
  CONSTRAINT `shipment_container__shipment` FOREIGN KEY (`shipment_uuid`) REFERENCES `shipment` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

CALL add_column_if_missing('shipment_item', 'container_uuid', 'BINARY(16) NULL');

INSERT IGNORE INTO `shipment_container_types`
    (`id`, `text`, `predefined`)
 VALUES
    (1, 'BALE', 1),
    (2, 'BOTTLE', 1),
    (3, 'BOX', 1),
    (4, 'BUNDLE', 1),
    (5, 'CAN', 1),
    (6, 'CARTON', 1),
    (7, 'CONTAINER', 1),
    (8, 'CRATE', 1),
    (9, 'KIT', 1),
    (10, 'PACKAGE', 1),
    (11, 'PACKET', 1),
    (12, 'PAIR', 1),
    (13, 'PALLET', 1),
    (14, 'PIECES', 1),
    (15, 'REAM', 1),
    (16, 'SACK', 1),
    (17, 'SET', 1);
