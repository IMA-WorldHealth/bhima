/**
 * Inventory tags table
 */
DROP TABLE IF EXISTS `inventory_tag`;
CREATE TABLE `inventory_tag` (
  `inventory_uuid`          BINARY(16) NOT NULL,
  `tag_uuid`          BINARY(16) NOT NULL,
  FOREIGN KEY (`inventory_uuid`) REFERENCES `inventory` (`uuid`),
  FOREIGN KEY (`tag_uuid`) REFERENCES `tags` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARACTER SET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;

INSERT INTO `actions`(`id`, `description`) VALUES
  (8, 'USERS.ACTIONS.EDIT_LOT');
